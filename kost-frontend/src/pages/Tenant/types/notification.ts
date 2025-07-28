// File: src/pages/Tenant/types/notification.ts
import { BaseEntity } from './common';

export type NotificationType = 
  | 'payment'
  | 'access'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read';

// Updated to match database schema from notifications table
export interface Notification extends BaseEntity {
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
}

export interface NotificationFilters {
  type?: NotificationType | 'all';
  priority?: NotificationPriority | 'all';
  status?: NotificationStatus | 'all';
  date_from?: string;
  date_to?: string;
  category?: string;
  sort_by?: 'created_at' | 'priority' | 'type';
  sort_order?: 'asc' | 'desc';
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  by_type: Record<NotificationType, number>;
  by_priority: Record<NotificationPriority, number>;
  today: number;
  this_week: number;
  this_month: number;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
  type_preferences: Record<NotificationType, {
    enabled: boolean;
    channels: ('email' | 'sms' | 'push' | 'in_app')[];
    priority_override?: NotificationPriority;
  }>;
}

export interface NotificationTemplate {
  type: NotificationType;
  title_template: string;
  message_template: string;
  default_priority: NotificationPriority;
  default_channels: ('email' | 'sms' | 'push' | 'in_app')[];
  variables: string[];
  category: string;
}

export interface NotificationAction {
  id: string;
  text: string;
  url?: string;
  action_type: 'navigate' | 'api_call' | 'download' | 'external';
  data?: Record<string, any>;
  style: 'primary' | 'secondary' | 'danger' | 'success';
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  tag?: string;
  renotify?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export const getNotificationTypeColor = (type: NotificationType): string => {
  switch (type) {
    case 'payment':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'access':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'system':
      return 'text-purple-600 bg-purple-100 border-purple-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

export const getNotificationPriorityColor = (priority: NotificationPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'low':
      return 'text-gray-600 bg-gray-100 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

export const getNotificationTypeIcon = (type: NotificationType): string => {
  switch (type) {
    case 'payment':
      return 'CreditCard';
    case 'access':
      return 'Key';
    case 'system':
      return 'Settings';
    default:
      return 'Bell';
  }
};

// Updated to Indonesian language
export const getNotificationTypeLabel = (type: NotificationType): string => {
  switch (type) {
    case 'payment':
      return 'Pembayaran';
    case 'access':
      return 'Akses';
    case 'system':
      return 'Sistem';
    default:
      return 'Notifikasi';
  }
};