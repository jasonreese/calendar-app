export interface Event {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location: string | null;
  color: string | null;
  calendarId: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventWithCreator extends Event {
  creator: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
}

export interface CreateEventDto {
  title: string;
  description?: string;
  startTime: string | Date;
  endTime: string | Date;
  isAllDay?: boolean;
  location?: string;
  color?: string;
  calendarId: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  isAllDay?: boolean;
  location?: string;
  color?: string;
}

export interface EventQueryParams {
  calendarId?: string;
  calendarIds?: string;
  start?: string;
  end?: string;
}
