import { create } from 'zustand';
import type { Calendar } from '@calendar-app/shared';

interface CalendarState {
  calendars: Calendar[];
  selectedCalendarId: string | null;
  selectedCalendarIds: string[];
  setCalendars: (calendars: Calendar[]) => void;
  addCalendar: (calendar: Calendar) => void;
  updateCalendar: (id: string, calendar: Calendar) => void;
  removeCalendar: (id: string) => void;
  setSelectedCalendar: (id: string | null) => void;
  toggleCalendar: (id: string) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  calendars: [],
  selectedCalendarId: null,
  selectedCalendarIds: [],
  setCalendars: (calendars) =>
    set((state) => {
      const ids = state.selectedCalendarIds.filter((id) =>
        calendars.some((c) => c.id === id),
      );
      return {
        calendars,
        selectedCalendarIds: ids.length > 0 ? ids : calendars.length > 0 ? [calendars[0].id] : [],
        selectedCalendarId: state.selectedCalendarId && calendars.some((c) => c.id === state.selectedCalendarId)
          ? state.selectedCalendarId
          : calendars.length > 0 ? calendars[0].id : null,
      };
    }),
  addCalendar: (calendar) =>
    set((state) => ({
      calendars: [...state.calendars, calendar],
      selectedCalendarIds: [...state.selectedCalendarIds, calendar.id],
      selectedCalendarId: state.selectedCalendarId || calendar.id,
    })),
  updateCalendar: (id, calendar) =>
    set((state) => ({
      calendars: state.calendars.map((c) => (c.id === id ? calendar : c)),
    })),
  removeCalendar: (id) =>
    set((state) => ({
      calendars: state.calendars.filter((c) => c.id !== id),
      selectedCalendarIds: state.selectedCalendarIds.filter((cid) => cid !== id),
      selectedCalendarId: state.selectedCalendarId === id
        ? state.calendars.filter((c) => c.id !== id)[0]?.id || null
        : state.selectedCalendarId,
    })),
  setSelectedCalendar: (id) => set({ selectedCalendarId: id }),
  toggleCalendar: (id) =>
    set((state) => {
      const exists = state.selectedCalendarIds.includes(id);
      const ids = exists
        ? state.selectedCalendarIds.filter((cid) => cid !== id)
        : [...state.selectedCalendarIds, id];
      return {
        selectedCalendarIds: ids.length > 0 ? ids : [id],
        selectedCalendarId: state.selectedCalendarId || id,
      };
    }),
}));
