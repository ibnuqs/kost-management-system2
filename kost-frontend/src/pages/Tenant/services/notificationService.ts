// File: src/pages/Tenant/services/notificationService.ts
import api, { endpoints, ApiResponse } from '../../../utils/api';
import { FilterParams } from '../types/common';
import { 
  Notification, 
  NotificationFilters,
  NotificationStats,
  NotificationPreferences,
  PushNotificationPayload
} from '../types/notification';

class NotificationService {
  /**
   * Get notifications
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    read?: boolean;
  }): Promise<{ notifications: Notification[]; total: number }> {
    const response = await api.get<ApiResponse<{ notifications: Notification[]; total: number }>>(
      endpoints.notifications.index, 
      { params }
    );
    return response.data.data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    await api.patch(endpoints.notifications.markAsRead(notificationId));
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.patch(endpoints.notifications.markAllAsRead);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>(endpoints.notifications.unreadCount);
      return response.data.data?.count || 0;
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      return 0;
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId: number | string): Promise<Notification> {
    const response = await api.get<ApiResponse<Notification>>(`/tenant/notifications/${notificationId}`);
    return response.data.data;
  }

  /**
   * Get notifications with advanced filtering
   */
  async getNotificationsWithFilters(filters: NotificationFilters): Promise<{ notifications: Notification[]; total: number }> {
    const response = await api.get<ApiResponse<{ notifications: Notification[]; total: number }>>(
      endpoints.notifications.index, 
      { params: filters }
    );
    return response.data.data;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    const response = await api.get<ApiResponse<NotificationStats>>(`/tenant/notifications/stats`);
    return response.data.data;
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: (number | string)[]): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/notifications/mark-read-bulk`, {
      notification_ids: notificationIds
    });
    return response.data.data;
  }

  /**
   * Archive notification
   */
  async archiveNotification(notificationId: number | string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/notifications/${notificationId}/archive`);
    return response.data.data;
  }

  /**
   * Archive multiple notifications
   */
  async archiveMultiple(notificationIds: (number | string)[]): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/notifications/archive-bulk`, {
      notification_ids: notificationIds
    });
    return response.data.data;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number | string): Promise<any> {
    const response = await api.delete<ApiResponse<any>>(`/tenant/notifications/${notificationId}`);
    return response.data.data;
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultiple(notificationIds: (number | string)[]): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/notifications/delete-bulk`, {
      notification_ids: notificationIds
    });
    return response.data.data;
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<ApiResponse<NotificationPreferences>>(`/tenant/notifications/preferences`);
    return response.data.data;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put<ApiResponse<NotificationPreferences>>(`/tenant/notifications/preferences`, preferences);
    return response.data.data;
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(limit?: number): Promise<Notification[]> {
    const response = await api.get<ApiResponse<Notification[]>>(`/tenant/notifications/unread`, {
      params: { limit }
    });
    return response.data.data;
  }

  /**
   * Get recent notifications
   */
  async getRecentNotifications(limit: number = 10): Promise<Notification[]> {
    const response = await api.get<ApiResponse<Notification[]>>(`/tenant/notifications/recent`, {
      params: { limit }
    });
    return response.data.data;
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(type: string): Promise<Notification[]> {
    const response = await api.get<ApiResponse<Notification[]>>(`/tenant/notifications/type/${type}`);
    return response.data.data;
  }

  /**
   * Get high priority notifications
   */
  async getHighPriorityNotifications(): Promise<Notification[]> {
    const response = await api.get<ApiResponse<Notification[]>>(`/tenant/notifications/high-priority`);
    return response.data.data;
  }

  /**
   * Snooze notification (hide temporarily)
   */
  async snoozeNotification(notificationId: number | string, snoozeUntil: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/notifications/${notificationId}/snooze`, {
      snooze_until: snoozeUntil
    });
    return response.data.data;
  }

  /**
   * Register device for push notifications
   */
  async registerPushDevice(registration: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
    user_agent: string;
    device_type: 'desktop' | 'mobile' | 'tablet';
  }): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/notifications/push/register`, registration);
    return response.data.data;
  }

  /**
   * Unregister device from push notifications
   */
  async unregisterPushDevice(endpoint: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/notifications/push/unregister`, {
      endpoint
    });
    return response.data.data;
  }

  /**
   * Send test push notification
   */
  async sendTestPushNotification(): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/notifications/push/test`);
    return response.data.data;
  }

  /**
   * Get notification delivery status
   */
  async getDeliveryStatus(notificationId: number | string): Promise<{
    email: boolean;
    sms: boolean;
    push: boolean;
    in_app: boolean;
    delivery_attempts: number;
    last_attempt: string;
  }> {
    const response = await api.get<ApiResponse<{
      email: boolean;
      sms: boolean;
      push: boolean;
      in_app: boolean;
      delivery_attempts: number;
      last_attempt: string;
    }>>(`/tenant/notifications/${notificationId}/delivery`);
    return response.data.data;
  }

  /**
   * Retry failed notification delivery
   */
  async retryDelivery(notificationId: number | string, channels: string[]): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`/tenant/notifications/${notificationId}/retry`, {
      channels
    });
    return response.data.data;
  }

  /**
   * Export notifications
   */
  async exportNotifications(filters?: NotificationFilters): Promise<Blob> {
    const response = await api.get(`/tenant/notifications/export`, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Get notification templates available
   */
  async getNotificationTemplates(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/tenant/notifications/templates`);
    return response.data.data;
  }

  /**
   * Subscribe to real-time notifications via WebSocket
   */
  async subscribeToRealTimeNotifications(): Promise<WebSocket | null> {
    try {
      const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://148.230.96.228:8080'}/notifications`;
      const ws = new WebSocket(wsUrl);
      return ws;
    } catch (error) {
      console.error('Failed to connect to notification WebSocket:', error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();