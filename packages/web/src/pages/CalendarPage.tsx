import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  Divider,
  CircularProgress,
  Paper,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { useCalendarStore } from '../store/calendarStore';
import { useEventStore } from '../store/eventStore';
import { calendarService } from '../services/calendarService';
import { eventService } from '../services/eventService';
import CalendarGridView from '../components/calendar/CalendarGridView';
import CalendarDialog from '../components/calendar/CalendarDialog';
import MemberDialog from '../components/calendar/MemberDialog';
import EventDialog from '../components/event/EventDialog';
import {
  connectSocket,
  disconnectSocket,
  joinCalendar,
  leaveCalendar,
  emitEventDelete,
} from '../services/socket';
import type { Calendar, Event } from '@calendar-app/shared';

const DRAWER_WIDTH = 260;

export default function CalendarPage() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { calendars, selectedCalendarId, selectedCalendarIds, setCalendars, setSelectedCalendar, toggleCalendar } = useCalendarStore();
  const { events, setEvents } = useEventStore();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [eventDialogDate, setEventDialogDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null);
  const [memberDialogCalendar, setMemberDialogCalendar] = useState<Calendar | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadCalendars();
  }, []);

  useEffect(() => {
    if (selectedCalendarIds.length > 0) {
      loadEvents();
    } else {
      setEvents([]);
    }
  }, [selectedCalendarIds]);

  const loadCalendars = async () => {
    try {
      const data = await calendarService.getCalendars();
      setCalendars(data);
    } catch (error) {
      console.error('Failed to load calendars:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const ids = selectedCalendarIds.join(',');
      const data = await eventService.getEvents({ calendarIds: ids });
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const joinedRoomsRef = useRef<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    connectSocket(token);

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const prev = joinedRoomsRef.current;
    const next = selectedCalendarIds;

    prev.forEach((id) => {
      if (!next.includes(id)) {
        leaveCalendar(id);
      }
    });

    next.forEach((id) => {
      if (!prev.includes(id)) {
        joinCalendar(id);
      }
    });

    joinedRoomsRef.current = [...next];
  }, [selectedCalendarIds]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedEvent(null);
    setEventDialogDate(date);
    setEventDialogOpen(true);
  }, []);

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null);
    setSelectedEvent(null);
    setEventDialogDate(null);
    setEventDialogOpen(true);
  }, []);

  const handleEditEvent = useCallback((event: Event) => {
    setEditingEvent(event);
    setEventDialogOpen(true);
  }, []);

  const handleDeleteEvent = useCallback(async (event: Event) => {
    try {
      await eventService.deleteEvent(event.id);
      useEventStore.getState().removeEvent(event.id);
      emitEventDelete({ id: event.id, calendarId: event.calendarId });
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }, []);

  const primaryCalendar = calendars.find((c) => c.id === selectedCalendarId);
  const isOwnCalendar = primaryCalendar ? primaryCalendar.ownerId === user?.id : true;
  const myCalendars = calendars.filter((c) => c.ownerId === user?.id);
  const sharedCalendars = calendars.filter((c) => c.ownerId !== user?.id);
  const sharedCalendarIds = new Set(sharedCalendars.map((c) => c.id));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedCalendarIds.length === 1 && primaryCalendar
              ? primaryCalendar.name
              : selectedCalendarIds.length > 1
                ? `多日历视图 (${selectedCalendarIds.length})`
                : '日历'}
            {selectedCalendarIds.length === 1 && primaryCalendar && !isOwnCalendar && (
              <Chip
                label={`共享自 ${primaryCalendar.owner?.displayName || primaryCalendar.owner?.username || '未知'}`}
                size="small"
                variant="outlined"
                sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', height: 22 }}
              />
            )}
          </Typography>
          {primaryCalendar && (
            <IconButton
              color="inherit"
              onClick={() => setMemberDialogCalendar(primaryCalendar)}
              title="管理成员"
              sx={{ mr: 1 }}
            >
              <PeopleIcon />
            </IconButton>
          )}
          <Typography variant="body2" sx={{ mr: 2 }}>{user?.displayName || user?.username}</Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => { setEditingCalendar(null); setCalendarDialogOpen(true); }}
          >
            新建日历
          </Button>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
            <Typography variant="subtitle2">我的日历</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={handleNewEvent}>
              事件
            </Button>
          </Box>
          <List dense>
            {myCalendars.map((calendar) => {
              const isChecked = selectedCalendarIds.includes(calendar.id);
              const isPrimary = calendar.id === selectedCalendarId;
              return (
                <ListItem
                  key={calendar.id}
                  disablePadding
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        title="管理成员"
                        onClick={(e) => { e.stopPropagation(); setMemberDialogCalendar(calendar); }}
                      >
                        <PeopleIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="编辑日历"
                        onClick={(e) => { e.stopPropagation(); setEditingCalendar(calendar); }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <Checkbox
                        edge="end"
                        checked={isChecked}
                        onChange={() => toggleCalendar(calendar.id)}
                      />
                    </Box>
                  }
                >
                  <ListItemButton
                    dense
                    selected={isPrimary}
                    onClick={() => {
                      setSelectedCalendar(calendar.id);
                      if (!isChecked) {
                        toggleCalendar(calendar.id);
                      }
                    }}
                    sx={{ borderRadius: 1 }}
                  >
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: calendar.color, mr: 1.5, flexShrink: 0 }} />
                    <ListItemText
                      primary={calendar.name}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: isPrimary ? 600 : 400 }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {myCalendars.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                暂无日历，点击上方按钮创建
              </Typography>
            )}
          </List>

          {sharedCalendars.length > 0 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" sx={{ px: 1, mb: 1, color: 'text.secondary' }}>共享日历</Typography>
              <List dense>
                {sharedCalendars.map((calendar) => {
                  const isChecked = selectedCalendarIds.includes(calendar.id);
                  const isPrimary = calendar.id === selectedCalendarId;
                  return (
                    <ListItem
                      key={calendar.id}
                      disablePadding
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            title="查看成员"
                            onClick={(e) => { e.stopPropagation(); setMemberDialogCalendar(calendar); }}
                          >
                            <PeopleIcon fontSize="small" />
                          </IconButton>
                          <Checkbox
                            edge="end"
                            checked={isChecked}
                            onChange={() => toggleCalendar(calendar.id)}
                          />
                        </Box>
                      }
                    >
                      <ListItemButton
                        dense
                        selected={isPrimary}
                        onClick={() => {
                          setSelectedCalendar(calendar.id);
                          if (!isChecked) {
                            toggleCalendar(calendar.id);
                          }
                        }}
                        sx={{ borderRadius: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: calendar.color,
                            mr: 1.5,
                            flexShrink: 0,
                            border: '2px dashed rgba(0,0,0,0.3)',
                          }}
                        />
                        <ListItemText
                          primary={calendar.name}
                          secondary={calendar.owner?.displayName || calendar.owner?.username || '共享'}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: isPrimary ? 600 : 400 }}
                          secondaryTypographyProps={{ variant: 'caption', fontSize: '0.65rem' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}

          {calendars.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
              暂无日历，点击上方按钮创建
            </Typography>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <CalendarGridView
          events={events}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          calendarColor={primaryCalendar?.color}
          sharedCalendarIds={sharedCalendarIds}
          calendars={calendars}
        />

        {selectedEvent && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: selectedEvent.color || '#3788d8', flexShrink: 0 }} />
                  <Typography variant="h6">{selectedEvent.title}</Typography>
                </Box>
                {(() => {
                  const cal = calendars.find((c) => c.id === selectedEvent.calendarId);
                  return cal ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: cal.ownerId !== user?.id ? '2px' : '50%',
                          bgcolor: cal.color,
                          flexShrink: 0,
                          ...(cal.ownerId !== user?.id ? { border: '1px dashed rgba(0,0,0,0.4)' } : {}),
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {cal.name}
                        {cal.ownerId !== user?.id && (
                          <Typography component="span" variant="caption" sx={{ fontSize: '0.6rem', ml: 0.5, color: 'text.disabled' }}>
                            ({cal.owner?.displayName || cal.owner?.username})
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  ) : null;
                })()}
                {selectedEvent.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {selectedEvent.description}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {format(new Date(selectedEvent.startTime), 'yyyy-MM-dd HH:mm')} — {format(new Date(selectedEvent.endTime), 'HH:mm')}
                </Typography>
                {selectedEvent.location && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    📍 {selectedEvent.location}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" onClick={() => handleEditEvent(selectedEvent)} title="编辑">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteEvent(selectedEvent)} title="删除">
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setSelectedEvent(null)} title="关闭">
                  ✕
                </IconButton>
              </Box>
            </Box>
          </Paper>
        )}

        {selectedCalendarId && (
          <EventDialog
            open={eventDialogOpen}
            onClose={() => { setEventDialogOpen(false); setEditingEvent(null); }}
            calendarId={selectedCalendarId}
            calendars={calendars}
            defaultDate={eventDialogDate ?? undefined}
            event={editingEvent}
            userId={user?.id}
          />
        )}

        <CalendarDialog
          open={calendarDialogOpen || !!editingCalendar}
          onClose={() => { setCalendarDialogOpen(false); setEditingCalendar(null); }}
          calendar={editingCalendar}
        />

        <MemberDialog
          open={!!memberDialogCalendar}
          onClose={() => setMemberDialogCalendar(null)}
          calendarId={memberDialogCalendar?.id || ''}
          calendarName={memberDialogCalendar?.name || ''}
          members={memberDialogCalendar?.members || []}
          ownerId={memberDialogCalendar?.ownerId || ''}
          onMembersChanged={loadCalendars}
        />
      </Box>
    </Box>
  );
}
