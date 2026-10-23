
export type NotificationType =
  | 'order'
  | 'payment'
  | 'review'
  | 'chat'
  | 'account'
  | 'stock'
  | 'promotion';

export interface AdminNotification {
  id: number;
  user_id: number;
  sender_id: number | null;
  type: NotificationType;
  title: string;
  content: string | null;
  reference_type: string | null;
  reference_id: number | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Dữ liệu mở rộng phục vụ hiển thị giao diện. */
export interface NotificationView extends AdminNotification {
  sender_name?: string | null;
}

export interface NotificationFormValues {
  user_id: number;
  sender_id: number | null;
  type: NotificationType;
  title: string;
  content: string;
  reference_type: string | null;
  reference_id: number | null;
  action_url: string | null;
}
