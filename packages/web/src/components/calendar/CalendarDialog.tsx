import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { calendarService } from '../../services/calendarService';
import { useCalendarStore } from '../../store/calendarStore';
import type { Calendar } from '@calendar-app/shared';

interface CalendarDialogProps {
  open: boolean;
  onClose: () => void;
  calendar?: Calendar | null;
}

export default function CalendarDialog({ open, onClose, calendar }: CalendarDialogProps) {
  const { addCalendar, updateCalendar } = useCalendarStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#3788d8',
  });

  const isEdit = !!calendar;

  useEffect(() => {
    if (open && calendar) {
      setForm({
        name: calendar.name,
        description: calendar.description || '',
        color: calendar.color || '#3788d8',
      });
    } else if (open && !calendar) {
      setForm({ name: '', description: '', color: '#3788d8' });
    }
  }, [open, calendar]);

  const handleClose = () => {
    setForm({ name: '', description: '', color: '#3788d8' });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (isEdit && calendar) {
        const updated = await calendarService.updateCalendar(calendar.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          color: form.color || undefined,
        });
        updateCalendar(calendar.id, updated);
      } else {
        const created = await calendarService.createCalendar({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          color: form.color || undefined,
        });
        addCalendar(created);
      }
      handleClose();
    } catch (error) {
      console.error(isEdit ? 'Failed to update calendar:' : 'Failed to create calendar:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? '编辑日历' : '新建日历'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="名称"
            required
            fullWidth
            size="small"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="描述"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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
          disabled={!form.name.trim() || saving}
        >
          {saving ? '保存中...' : isEdit ? '保存修改' : '创建'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
