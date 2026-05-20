import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Stack,
  Box,
  Typography,
  MenuItem,
} from '@mui/material';
import { eventService } from '../../services/eventService';
import { useEventStore } from '../../store/eventStore';
import { emitEventCreate, emitEventUpdate } from '../../services/socket';
import type { Calendar, Event } from '@calendar-app/shared';

function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toLocalDateString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  calendarId: string;
  calendars: Calendar[];
  defaultDate?: Date;
  event?: Event | null;
  userId?: string;
}

export default function EventDialog({ open, onClose, calendarId, calendars, defaultDate, event, userId }: EventDialogProps) {
  const { addEvent, updateEvent } = useEventStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    location: '',
    color: '#3788d8',
    calendarId: '',
  });

  const isEdit = !!event;
  const eventCalendar = event ? calendars.find((c) => c.id === event.calendarId) : null;

  useEffect(() => {
    if (open) {
      if (event) {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        setForm({
          title: event.title,
          description: event.description || '',
          startTime: event.isAllDay ? toLocalDateString(start) : toLocalDateTimeString(start),
          endTime: event.isAllDay ? toLocalDateString(end) : toLocalDateTimeString(end),
          isAllDay: event.isAllDay,
          location: event.location || '',
          color: event.color || calendars.find((c) => c.id === event.calendarId)?.color || '#3788d8',
          calendarId: event.calendarId,
        });
      } else {
        const now = new Date();
        const start = defaultDate
          ? new Date(
              defaultDate.getFullYear(),
              defaultDate.getMonth(),
              defaultDate.getDate(),
              now.getHours(),
              now.getMinutes(),
            )
          : now;
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const calColor = calendars.find((c) => c.id === calendarId)?.color || '#3788d8';
        setForm({
          title: '',
          description: '',
          startTime: toLocalDateTimeString(start),
          endTime: toLocalDateTimeString(end),
          isAllDay: false,
          location: '',
          color: calColor,
          calendarId,
        });
      }
      setSaving(false);
    }
  }, [open, calendarId, calendars, defaultDate, event]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (isEdit && event) {
        const updated = await eventService.updateEvent(event.id, {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          isAllDay: form.isAllDay,
          location: form.location.trim() || undefined,
          color: form.color || undefined,
        });
        updateEvent(event.id, updated);
        emitEventUpdate(updated);
      } else {
        const created = await eventService.createEvent({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          isAllDay: form.isAllDay,
          location: form.location.trim() || undefined,
          color: form.color || undefined,
          calendarId: form.calendarId,
        });
        addEvent(created);
        emitEventCreate(created);
      }
      handleClose();
    } catch (error) {
      console.error(isEdit ? 'Failed to update event:' : 'Failed to create event:', error);
    } finally {
      setSaving(false);
    }
  };

  const calForForm = calendars.find((c) => c.id === form.calendarId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? '编辑事件' : '新建事件'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {isEdit && eventCalendar && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: eventCalendar.ownerId !== userId ? '2px' : '50%',
                  bgcolor: eventCalendar.color,
                  flexShrink: 0,
                  ...(eventCalendar.ownerId !== userId ? { border: '1px dashed rgba(0,0,0,0.4)' } : {}),
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {eventCalendar.name}
                {eventCalendar.ownerId !== userId && (
                  <Typography component="span" variant="caption" sx={{ fontSize: '0.6rem', ml: 0.5, color: 'text.disabled' }}>
                    ({eventCalendar.owner?.displayName || eventCalendar.owner?.username})
                  </Typography>
                )}
              </Typography>
            </Box>
          )}

          {!isEdit && (
            <TextField
              select
              label="所属日历"
              fullWidth
              size="small"
              value={form.calendarId}
              onChange={(e) => setForm({ ...form, calendarId: e.target.value })}
            >
              {calendars.map((cal) => {
                const isShared = cal.ownerId !== userId;
                return (
                  <MenuItem key={cal.id} value={cal.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: isShared ? '2px' : '50%',
                          bgcolor: cal.color,
                          flexShrink: 0,
                          ...(isShared ? { border: '1px dashed rgba(0,0,0,0.4)' } : {}),
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>{cal.name}</Typography>
                      {isShared && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {cal.owner?.displayName || cal.owner?.username}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </TextField>
          )}

          <TextField
            label="标题"
            required
            fullWidth
            size="small"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="描述"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="开始时间"
              type={form.isAllDay ? 'date' : 'datetime-local'}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={form.startTime}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => {
                  const updates: Partial<typeof form> = { startTime: val };
                  if (!prev.endTime || new Date(val) >= new Date(prev.endTime)) {
                    const end = form.isAllDay
                      ? val
                      : toLocalDateTimeString(new Date(new Date(val).getTime() + 60 * 60 * 1000));
                    updates.endTime = end;
                  }
                  return { ...prev, ...updates };
                });
              }}
            />
            <TextField
              label="结束时间"
              type={form.isAllDay ? 'date' : 'datetime-local'}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </Stack>
          <FormControlLabel
            control={
              <Switch
                checked={form.isAllDay}
                onChange={(e) => {
                  const allDay = e.target.checked;
                  setForm((prev) => {
                    const start = allDay
                      ? toLocalDateString(new Date(prev.startTime))
                      : toLocalDateTimeString(new Date(prev.startTime));
                    const end = allDay
                      ? toLocalDateString(new Date(prev.endTime))
                      : toLocalDateTimeString(new Date(prev.endTime));
                    return { ...prev, isAllDay: allDay, startTime: start, endTime: end };
                  });
                }}
              />
            }
            label="全天事件"
          />
          <TextField
            label="地点"
            fullWidth
            size="small"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <TextField
            label="颜色"
            type="color"
            fullWidth
            size="small"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!form.title.trim() || saving}
        >
          {saving ? '保存中...' : isEdit ? '保存修改' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
