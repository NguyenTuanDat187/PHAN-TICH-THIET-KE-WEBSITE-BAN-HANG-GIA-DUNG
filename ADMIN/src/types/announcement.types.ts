
export type AnnouncementType =
  | 'promotion'
  | 'policy'
  | 'maintenance'
  | 'general'
  | 'system'
  | 'new_arrival';

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export type AnnouncementTargetType = 'category' | 'product' | 'coupon';

export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'expired';

/** Dữ liệu bảng announcements. */
export interface Announcement {
  id: number;
  created_by: number;
  title: string;
  content: string;
  action_url: string | null;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  starts_at: string | null;
  expires_at: string | null;
  published_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Dữ liệu bảng announcement_targets. */
export interface AnnouncementTarget {
  id: number;
  announcement_id: number;
  target_type: AnnouncementTargetType;
  target_id: number;
  created_at: string;
}

/** Dữ liệu bảng announcement_reads. */
export interface AnnouncementRead {
  id: number;
  announcement_id: number;
  user_id: number;
  read_at: string;
}

/** Dữ liệu mở rộng được tổng hợp để hiển thị trang quản trị. */
export interface AnnouncementView extends Announcement {
  created_by_name: string;
  targets: AnnouncementTargetView[];
  total_recipients: number;
  total_read: number;
  status: AnnouncementStatus;
}

export interface AnnouncementTargetView extends AnnouncementTarget {
  target_name: string;
}

export interface AnnouncementReadView extends AnnouncementRead {
  user_name: string;
}

export interface AnnouncementTargetFormValue {
  target_type: AnnouncementTargetType;
  target_id: number;
  target_name: string;
}

export interface AnnouncementFormValues {
  title: string;
  content: string;
  action_url: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  targets: AnnouncementTargetFormValue[];
}
