/* ── Notification Module — Type Definitions ──────────────────── */

export interface NotificationFrom {
  id: string;
  name: string;
  email: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  name: string | null;
  event: string | null;
  process: string | null;
  link: string;
  created_at: string;
  is_read: boolean;
  from?: NotificationFrom;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  wsConnected: boolean;
}
