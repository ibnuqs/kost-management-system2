// ===================================================================
// tenantService.ts - Tenant API Service v3.2 (CLEAN)
// ===================================================================

import api, { endpoints, ApiResponse } from '../../../utils/api';
import { DashboardData } from '../types/dashboard';
import { tenantApiConfig } from '../config/apiConfig';

// ===================================================================
// TYPES & INTERFACES
// ===================================================================

export interface TenantProfileUpdateData {
  name: string;
  phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface PaymentHistoryParams {
  page?: number;
  per_page?: number;
  status?: string;
  month?: string;
}

export interface AccessHistoryParams {
  page?: number;
  per_page?: number;
  date_from?: string;
  date_to?: string;
}

export interface NotificationParams {
  page?: number;
  per_page?: number;
  unread_only?: boolean;
}

export interface CardRequestData {
  card_type?: string;
  reason?: string;
}

// ===================================================================
// TENANT SERVICE CLASS
// ===================================================================

class TenantService {
  
  // ===================================================================
  // DASHBOARD & PROFILE
  // ===================================================================

  /**
   * ✅ FIXED: Get dashboard data - main endpoint
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      // ✅ Use correct dashboard endpoint
      const response = await api.get<ApiResponse<DashboardData>>(endpoints.tenant.dashboard);
      
      return this.handleResponse(response, 'Failed to fetch dashboard data');
    } catch (error: any) {
      return this.handleError(error, 'getDashboardData');
    }
  }

  /**
   * Update tenant profile
   */
  async updateProfile(data: TenantProfileUpdateData): Promise<any> {
    try {
      const response = await api.put<ApiResponse>(endpoints.tenant.profile.update, data);
      return this.handleResponse(response, 'Failed to update profile');
    } catch (error: any) {
      return this.handleError(error, 'updateProfile');
    }
  }

  /**
   * Refresh dashboard data (alias)
   */
  async refreshDashboard(): Promise<DashboardData> {
    return this.getDashboardData();
  }

  // ===================================================================
  // PAYMENTS
  // ===================================================================

  /**
   * Get payment history
   */
  async getPaymentHistory(params?: PaymentHistoryParams): Promise<any> {
    try {
      const response = await api.get<ApiResponse>(endpoints.tenant.payments.index, { params });
      return this.handleResponse(response, 'Failed to fetch payment history');
    } catch (error: any) {
      return this.handleError(error, 'getPaymentHistory');
    }
  }

  /**
   * Get payments (alias for getPaymentHistory)
   */
  async getPayments(params?: PaymentHistoryParams): Promise<any> {
    return this.getPaymentHistory(params);
  }

  /**
   * Get payment summary
   */
  async getPaymentSummary(): Promise<any> {
    try {
      const response = await api.get<ApiResponse>(endpoints.tenant.payments.summary);
      return this.handleResponse(response, 'Failed to fetch payment summary');
    } catch (error: any) {
      return this.handleError(error, 'getPaymentSummary');
    }
  }

  /**
   * Get payment URL for specific payment
   */
  async getPaymentUrl(paymentId: string): Promise<{ payment_url: string }> {
    try {
      const response = await api.get<ApiResponse<{ payment_url: string }>>(
        endpoints.tenant.payments.paymentUrl(paymentId)
      );
      return this.handleResponse(response, 'Failed to get payment URL');
    } catch (error: any) {
      return this.handleError(error, 'getPaymentUrl');
    }
  }

  // ===================================================================
  // ACCESS LOGS
  // ===================================================================

  /**
   * Get access history
   */
  async getAccessHistory(params?: AccessHistoryParams): Promise<any> {
    try {
      const response = await api.get<ApiResponse>(endpoints.tenant.access.history, { params });
      return this.handleResponse(response, 'Failed to fetch access history');
    } catch (error: any) {
      return this.handleError(error, 'getAccessHistory');
    }
  }

  /**
   * Get access statistics
   */
  async getAccessStats(): Promise<any> {
    try {
      const response = await api.get<ApiResponse>(endpoints.tenant.access.stats);
      return this.handleResponse(response, 'Failed to fetch access stats');
    } catch (error: any) {
      return this.handleError(error, 'getAccessStats');
    }
  }

  // ===================================================================
  // RFID CARDS
  // ===================================================================

  /**
   * Get RFID cards
   */
  async getRfidCards(): Promise<any> {
    try {
      const response = await api.get<ApiResponse>(endpoints.tenant.rfid.cards);
      return this.handleResponse(response, 'Failed to fetch RFID cards');
    } catch (error: any) {
      return this.handleError(error, 'getRfidCards');
    }
  }

  /**
   * Request new RFID card
   */
  async requestNewCard(data: CardRequestData): Promise<any> {
    try {
      const response = await api.post<ApiResponse>(endpoints.tenant.rfid.requestCard, data);
      return this.handleResponse(response, 'Failed to request new card');
    } catch (error: any) {
      return this.handleError(error, 'requestNewCard');
    }
  }

  /**
   * Report lost RFID card
   */
  async reportLostCard(cardId: string, reason?: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse>(endpoints.tenant.rfid.reportLost, {
        card_id: cardId,
        reason
      });
      return this.handleResponse(response, 'Failed to report lost card');
    } catch (error: any) {
      return this.handleError(error, 'reportLostCard');
    }
  }

  /**
   * Toggle RFID card status (activate/deactivate)
   */
  async toggleCardStatus(cardId: number, status: 'active' | 'inactive'): Promise<any> {
    try {
      const response = await api.put<ApiResponse>(`${endpoints.tenant.rfid.cards}/${cardId}/status`, {
        status: status
      });
      return this.handleResponse(response, 'Failed to update card status');
    } catch (error: any) {
      return this.handleError(error, 'toggleCardStatus');
    }
  }

  // ===================================================================
  // IOT DEVICES
  // ===================================================================

  /**
   * Get room IoT devices
   */
  async getRoomDevices(): Promise<any> {
    try {
      const response = await api.get<ApiResponse>(endpoints.tenant.iotDevices.roomDevices);
      return this.handleResponse(response, 'Failed to fetch room devices');
    } catch (error: any) {
      return this.handleError(error, 'getRoomDevices');
    }
  }

  /**
   * Get device status
   */
  async getDeviceStatus(deviceId: string): Promise<any> {
    try {
      const response = await api.get<ApiResponse>(endpoints.tenant.iotDevices.deviceStatus(deviceId));
      return this.handleResponse(response, 'Failed to fetch device status');
    } catch (error: any) {
      return this.handleError(error, 'getDeviceStatus');
    }
  }

  // ===================================================================
  // NOTIFICATIONS
  // ===================================================================

  /**
   * Get notifications
   */
  async getNotifications(params?: NotificationParams): Promise<any> {
    try {
      const response = await api.get<ApiResponse>(tenantApiConfig.notifications, { params });
      const data = this.handleResponse(response, 'Failed to fetch notifications');
      
      // Backend returns data.notifications, frontend expects just notifications
      return {
        notifications: data.notifications || [],
        total: data.total || 0
      };
    } catch (error: any) {
      console.error('TenantService.getNotifications error:', error);
      // Return empty array on error instead of throwing
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadNotificationsCount(): Promise<number> {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>(tenantApiConfig.unreadCount);
      const data = this.handleResponse<{ count: number }>(response, 'Failed to fetch unread count');
      return data.count;
    } catch (error: any) {
      console.error('TenantService.getUnreadNotificationsCount error:', error);
      return 0; // Return 0 on error instead of throwing
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: number): Promise<any> {
    try {
      const response = await api.put<ApiResponse>(tenantApiConfig.markAsRead(notificationId));
      return this.handleResponse(response, 'Failed to mark notification as read');
    } catch (error: any) {
      console.error('TenantService.markNotificationAsRead error:', error);
      return null; // Return null on error instead of throwing
    }
  }


  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<any> {
    try {
      const response = await api.post<ApiResponse>('/notifications/mark-all-read');
      return this.handleResponse(response, 'Failed to mark all notifications as read');
    } catch (error: any) {
      return this.handleError(error, 'markAllNotificationsAsRead');
    }
  }

  // ===================================================================
  // DOOR CONTROL
  // ===================================================================

  /**
   * Open room door for tenant
   */
  async openMyRoomDoor(reason?: string): Promise<any> {
    try {
      // Use the new working endpoint that follows the same pattern as debug-tenant-access
      console.log('🔍 Trying new working door control endpoint...');
      
      const response = await api.post<ApiResponse>('/tenant-door-open', {
        reason: reason || 'Tenant manual door open'
      });
      
      console.log('✅ Door control endpoint working:', response.data);
      return this.handleResponse(response, 'Failed to open door');
      
    } catch (error: any) {
      console.error('❌ Door control endpoint failed:', error);
      console.log('Error details:', error.response?.status, error.response?.data);
      return this.handleError(error, 'openMyRoomDoor');
    }
  }

  /**
   * Get my room door status
   */
  async getMyRoomDoorStatus(): Promise<any> {
    try {
      const response = await api.get<ApiResponse>(endpoints.tenant.door.status);
      return this.handleResponse(response, 'Failed to get door status');
    } catch (error: any) {
      return this.handleError(error, 'getMyRoomDoorStatus');
    }
  }

  // ===================================================================
  // UTILITY METHODS
  // ===================================================================

  /**
   * Health check - test if service is working
   */
  async healthCheck(): Promise<boolean> {
    try {
      await api.get(endpoints.realtime.status);
      return true;
    } catch (error) {
      console.error('TenantService.healthCheck failed:', error);
      return false;
    }
  }

  /**
   * Debug tenant access - for testing purposes
   */
  async debugTenantAccess(): Promise<any> {
    try {
      const response = await api.get<ApiResponse>('/debug-tenant-access');
      console.log('🔍 Debug tenant access response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Debug tenant access failed:', error);
      throw error;
    }
  }

  // ===================================================================
  // PRIVATE HELPER METHODS
  // ===================================================================

  /**
   * Handle API response consistently
   */
  private handleResponse<T = any>(response: any, defaultError: string): T {
    // Check for explicit failure
    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || defaultError);
    }

    // Return data if available
    if (response.data && response.data.data) {
      return response.data.data as T;
    }

    // Fallback for different response structures
    if (response.data && !response.data.success && !response.data.data) {
      return response.data as T;
    }

    throw new Error('Invalid response format');
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any, methodName: string): never {
    console.error(`TenantService.${methodName} error:`, error);
    
    // Map status codes to user-friendly messages
    const statusMessages: Record<number, string> = {
      401: 'Authentication required. Please login again.',
      403: 'Access denied. Tenant role required.',
      404: 'Active tenant record not found. Please contact administration.',
      422: `Validation failed: ${error.response?.data?.message || 'Invalid data'}`,
      500: 'Server error. Please try again later.',
    };

    const status = error.response?.status;
    const message = statusMessages[status] || error.message || 'Network error occurred';
    
    throw new Error(message);
  }
}

// ===================================================================
// EXPORTS
// ===================================================================

// Export singleton instance
export const tenantService = new TenantService();

// Export class for testing
export default TenantService;