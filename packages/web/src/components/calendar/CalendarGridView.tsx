import { useCallback, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import {
  CalendarMonth as MonthIcon,
  CalendarViewWeek as WeekIcon,
  CalendarViewDay as DayIcon,
  ViewList as AgendaIcon,
} from '@mui/icons-material';
import type { Event } from '@calendar-app/shared';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'zh-CN': zhCN,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: Event;
}

interface CalendarGridViewProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onDateClick?: (date: Date) => void;
  calendarColor?: string;
  sharedCalendarIds?: Set<string>;
  calendars?: Calendar[];
}

const VIEW_OPTIONS = [
  { value: Views.MONTH, label: '月', icon: <MonthIcon /> },
  { value: Views.WEEK, label: '周', icon: <WeekIcon /> },
  { value: Views.DAY, label: '日', icon: <DayIcon /> },
  { value: Views.AGENDA, label: '列表', icon: <AgendaIcon /> },
] as const;

export default function CalendarGridView({
  events,
  onEventClick,
  onDateClick,
  calendarColor = '#3788d8',
  sharedCalendarIds,
}: CalendarGridViewProps) {
  const [view, setView] = useState<(typeof Views)[keyof typeof Views]>(Views.MONTH);

  const calendarEvents = useMemo<CalendarEvent[]>(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        allDay: event.isAllDay,
        resource: event,
      })),
    [events],
  );

  const handleSelectEvent = useCallback(
    (calEvent: CalendarEvent) => {
      if (calEvent.resource && onEventClick) {
        onEventClick(calEvent.resource);
      }
    },
    [onEventClick],
  );

  const handleSelectSlot = useCallback(
    ({ start }: { start: Date | string }) => {
      if (onDateClick) {
        onDateClick(new Date(start));
      }
    },
    [onDateClick],
  );

  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      const isShared = event.resource?.calendarId && sharedCalendarIds?.has(event.resource.calendarId);
      return {
        style: {
          backgroundColor: event.resource?.color || calendarColor,
          borderRadius: '4px',
          opacity: 0.9,
          color: '#fff',
          border: isShared ? '2px dashed rgba(255,255,255,0.8)' : 'none',
          fontSize: '0.8rem',
          padding: '0 4px',
        },
      };
    },
    [calendarColor, sharedCalendarIds],
  );

  const dayPropGetter = useCallback(
    (date: Date) => {
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      return {
        style: isToday
          ? { backgroundColor: '#f0f7ff' }
          : {},
      };
    },
    [],
  );

  const formats = useMemo(
    () => ({
      monthHeaderFormat: (date: Date) => format(date, 'yyyy年 M月'),
      dayHeaderFormat: (date: Date) => format(date, 'M月d日 EEEE', { locale: zhCN }),
      dayFormat: (date: Date) => format(date, 'd'),
    }),
    [],
  );

  return (
    <Box sx={{ height: 650, '& .rbc-today': { backgroundColor: '#f0f7ff' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <ToggleButtonGroup
          size="small"
          value={view}
          exclusive
          onChange={(_, v) => v && setView(v)}
        >
          {VIEW_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value} sx={{ px: 1.5, gap: 0.5 }}>
              {opt.icon}
              <Typography variant="caption">{opt.label}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ height: 580 }}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          view={view}
          onView={setView}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          formats={formats}
          popup
          culture="zh-CN"
        />
      </Box>
    </Box>
  );
}
