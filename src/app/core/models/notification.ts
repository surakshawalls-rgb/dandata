export type NotificationType =
  | 'donation'
  | 'campaign'
  | 'payment'
  | 'system'
  | 'reminder'
  | 'announcement';

export type NotificationChannel =
  | 'in_app'
  | 'email'
  | 'whatsapp'
  | 'sms';

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string | null;

  type: NotificationType;
  channel: NotificationChannel;

  title: string;
  message: string;

  data: Record<string, unknown> | null;

  is_read: boolean;
  read_at: string | null;

  sent_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface CreateNotificationInput {
  organization_id: string;
  user_id?: string | null;

  type: NotificationType;
  channel?: NotificationChannel;

  title: string;
  message: string;

  data?: Record<string, unknown> | null;

  is_read?: boolean;
  sent_at?: string | null;
}

export interface UpdateNotificationInput {
  title?: string;
  message?: string;

  data?: Record<string, unknown> | null;

  is_read?: boolean;
  read_at?: string | null;

  sent_at?: string | null;
}

export interface NotificationFilters {
  organizationId?: string;
  userId?: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  isRead?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  totalCount: number;
  unreadCount: number;
  readCount: number;
}