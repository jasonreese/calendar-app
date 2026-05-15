export enum MemberRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export interface Calendar {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isDefault: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    username: string;
    displayName: string | null;
  };
  members?: CalendarMember[];
}

export interface CalendarMember {
  id: string;
  calendarId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  user?: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
}

export interface CalendarWithMembers extends Calendar {
  members: CalendarMember[];
}

export interface CreateCalendarDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCalendarDto {
  name?: string;
  description?: string;
  color?: string;
}

export interface AddMemberDto {
  userId: string;
  role: MemberRole;
}

export interface UpdateMemberRoleDto {
  role: MemberRole;
}
