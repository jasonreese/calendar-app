export const DEFAULT_CALENDAR_COLOR = '#3788d8';

export const CALENDAR_COLORS = [
  '#3788d8', // 蓝色
  '#f44336', // 红色
  '#4caf50', // 绿色
  '#ff9800', // 橙色
  '#9c27b0', // 紫色
  '#00bcd4', // 青色
  '#ffeb3b', // 黄色
  '#795548', // 棕色
  '#607d8b', // 灰蓝色
  '#e91e63'  // 粉色
];

export const JWT_EXPIRES_IN = '15m';
export const REFRESH_TOKEN_EXPIRES_IN = '7d';

export const SOCKET_EVENTS = {
  // 客户端 -> 服务器
  JOIN_CALENDAR: 'join-calendar',
  LEAVE_CALENDAR: 'leave-calendar',
  EVENT_CREATE: 'event-create',
  EVENT_UPDATE: 'event-update',
  EVENT_DELETE: 'event-delete',

  // 服务器 -> 客户端
  EVENT_CREATED: 'event-created',
  EVENT_UPDATED: 'event-updated',
  EVENT_DELETED: 'event-deleted',
  MEMBER_JOINED: 'member-joined',
  MEMBER_LEFT: 'member-left',
  CALENDAR_UPDATED: 'calendar-updated',
  ERROR: 'error'
} as const;
