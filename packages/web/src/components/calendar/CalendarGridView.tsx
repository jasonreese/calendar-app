import { useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Box, Typography } from '@mui/material';
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
}

export default function CalendarGridView({
  events,
  onEventClick,
  onDateClick,
  calendarColor = '#3788d8',
}: CalendarGridViewProps) {
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
    (event: CalendarEvent) => ({
      style: {
        backgroundColor: event.resource?.color || calendarColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: '#fff',
        border: 'none',
        fontSize: '0.8rem',
        padding: '0 4px',
      },
    }),
    [calendarColor],
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
    <Box sx={{ height: 600, '& .rbc-today': { backgroundColor: '#f0f7ff' } }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        defaultView={Views.MONTH}
        views={[Views.MONTH]}
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
  );
}
