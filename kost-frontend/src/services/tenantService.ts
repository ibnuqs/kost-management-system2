// File: src/services/tenantService.ts (UPDATED FOR NEW API STRUCTURE)
import api, { endpoints, ApiResponse, PaginatedResponse } from '../utils/api';

// Types - Export all interfaces properly to match Laravel Controller response
export interface TenantDashboardData {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  tenant_info: {
    id: number;
    user_id: number;
    room_id?: number;
    user_name: string;
    user_email: string;
    room_number?: string;
    status: string;
    start_date?: string;
    end_date?: string;
    monthly_rent?: number;
    security_deposit?: number;
    created_at: string;
    updated_at: string;
  };
  payment_info: {
    current: {
      id: number;
      tenant_id: number;
      amount: number;
      payment_month: string;
      due_date: string;
      status: string;
      payment_url?: string;
      paid_at?: string;
      created_at: string;
    } | null;
    next: {
      id: number;
      tenant_id: number;
      amount: number;
      payment_month: string;
      due_date: string;
      status: string;
    } | null;
    recent: Array<{
      id: number;
      amount: number;
      payment_month: string;
      due_date: string;
      paid_at?: string;
      status: string;
    }>;
    overdue_count: number;
  };
  access_stats: {
    total_accesses: number;
    this_month: number;
    this_week: number;
    last_access?: string;
  };
  rfid_cards: Array<{
    id: number;
    uid: string;
    user_id: number;
    room_id?: number;
    status: 'active' | 'inactive' | 'lost' | 'blocked';
    issued_date?: string;
    created_at: string;
    updated_at: string;
    room_number?: string;
  }>;
  notifications: Array<{
    type: 'warning' | 'info' | 'success' | 'error';
    title: string;
    message: string;
    action: string;
  }>;
  recent_activities: Array<{
    type: 'access';
    description: string;
    timestamp: string;
    room_number?: string;
  }>;
  quick_stats: {
    days_since_move_in: number;
    total_payments_made: number;
    total_amount_paid: number;
  };
}

// Legacy alias for backward compatibility

export interface TenantDashboard {
  room: {
    room_number: string;
    type: string;
    monthly_rent: number;
    status: string;
  };
  current_payment: {
    id: number;
    amount: number;
    due_date: string;
    status: string;
    payment_url?: string;
  } | null;
  recent_payments: Array<{
    id: number;
    amount: number;
    due_date: string;
    paid_date?: string;
    status: string;
  }>;
  access_stats: {
    today_entries: number;
    week_entries: number;
    last_access?: string;
  };
  notifications_count: number;
  next_payment_due?: string;
}

export interface PaymentUrlResponse {
  payment_url: string;
}

export interface Payment {
  id: number;
  order_id: string;
  tenant_id: number;
  payment_month: string;
  amount: number;
  due_date?: string;
  paid_at?: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'success' | 'settlement' | 'capture' | 'authorize' | 'failure' | 'cancel' | 'deny' | 'expire';
  payment_method?: string;
  payment_url?: string;
  snap_token?: string;
  transaction_id?: string;
  failure_reason?: string;
  failed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AccessLog {
  id: number;
  access_time: string;
  access_type: 'entry' | 'exit';
  location: string;
  device_id?: string;
  status: 'success' | 'failed';
}

export interface RfidCard {
  id: number;
  uid: string;
  status: 'active' | 'inactive' | 'lost' | 'blocked';
  issued_date: string;
  created_at: string;
  last_used?: string;
  usage_count: number;
  room?: {
    room_number: string;
  };
}

export interface TenantProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  room: {
    room_number: string;
    monthly_rent: number;
    check_in_date: string;
  };
  tenant_code: string;
  status: string;
}

export interface IoTDevice {
  id: number;
  device_id: string;
  device_name: string;
  device_type: string;
  status: 'online' | 'offline' | 'error';
  last_seen?: string;
  location: string;
  battery_level?: number;
}

// Tenant Service Class
class TenantService {
  // ===================================================================
  // DASHBOARD
  // ===================================================================
  async getDashboard(): Promise<ApiResponse<TenantDashboardData>> {
    const response = await api.get<ApiResponse<TenantDashboardData>>(endpoints.tenant.dashboard);
    return response.data;
  }

  // ===================================================================
  // PAYMENTS
  // ===================================================================
  async getPayments(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    // Use the new tenant-specific endpoint
    const response = await api.get<ApiResponse<PaginatedResponse<Payment>>>(
      endpoints.tenant.payments.index,
      { params }
    );
    return response.data;
  }

  // Legacy method for backward compatibility
  async getPayment(paymentId: number | string): Promise<ApiResponse<Payment>> {
    const response = await api.get<ApiResponse<Payment>>(
      endpoints.payments.show(paymentId)
    );
    return response.data;
  }

  async checkPaymentStatus(paymentId: number | string): Promise<ApiResponse<{
    payment: Payment;
    midtrans_status?: string;
  }>> {
    const response = await api.get(endpoints.payments.status(paymentId));
    return response.data;
  }

  async getPaymentHistory(params?: {
    page?: number;
    per_page?: number;
    year?: number;
    month?: number;
  }): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Payment>>>(
      endpoints.tenant.payments.history,
      { params }
    );
    return response.data;
  }

  async getPaymentSummary(): Promise<ApiResponse<{
    total_paid: number;
    total_pending: number;
    total_overdue: number;
    payment_streak: number;
    average_payment_time: number;
  }>> {
    const response = await api.get(endpoints.tenant.payments.summary);
    return response.data;
  }

  async getPaymentUrl(paymentId: number | string): Promise<ApiResponse<PaymentUrlResponse>> {
    const response = await api.get<ApiResponse<PaymentUrlResponse>>(
      endpoints.tenant.payments.paymentUrl(paymentId)
    );
    return response.data;
  }

  // Legacy support for existing code
  async getTenantPayments(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    // This uses the legacy endpoint for backward compatibility
    const response = await api.get<ApiResponse<PaginatedResponse<Payment>>>(
      endpoints.payments.tenantPayments,
      { params }
    );
    return response.data;
  }

  // ===================================================================
  // ACCESS LOGS
  // ===================================================================
  async getAccessHistory(params?: {
    page?: number;
    per_page?: number;
    date_from?: string;
    date_to?: string;
    access_type?: 'entry' | 'exit';
  }): Promise<ApiResponse<PaginatedResponse<AccessLog>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<AccessLog>>>(
      endpoints.tenant.access.history,
      { params }
    );
    return response.data;
  }

  async getAccessStats(): Promise<ApiResponse<{
    today_count: number;
    week_count: number;
    month_count: number;
    total_count: number;
    average_daily: number;
    peak_hours: Array<{ hour: number; count: number }>;
  }>> {
    const response = await api.get(endpoints.tenant.access.stats);
    return response.data;
  }

  async getAccessPatterns(): Promise<ApiResponse<{
    weekly_pattern: Array<{ day: string; count: number }>;
    hourly_pattern: Array<{ hour: number; count: number }>;
    monthly_trend: Array<{ month: string; count: number }>;
  }>> {
    const response = await api.get(endpoints.tenant.access.patterns);
    return response.data;
  }

  // Legacy support for existing code
  async getAccessLogs(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedResponse<AccessLog>>> {
    // This uses the legacy endpoint for backward compatibility
    const response = await api.get<ApiResponse<PaginatedResponse<AccessLog>>>(
      '/tenant/access/history',
      { params }
    );
    return response.data;
  }

  // ===================================================================
  // RFID CARDS
  // ===================================================================
  async getRfidCards(): Promise<ApiResponse<RfidCard[]>> {
    const response = await api.get<ApiResponse<RfidCard[]>>(endpoints.tenant.rfid.cards);
    return response.data;
  }

  async requestNewCard(reason: string): Promise<ApiResponse<{ message: string; request_id: number }>> {
    const response = await api.post<ApiResponse<{ message: string; request_id: number }>>(
      endpoints.tenant.rfid.requestCard,
      { reason }
    );
    return response.data;
  }

  // Alias for backward compatibility
  async requestRfidCard(reason: string): Promise<ApiResponse<{ message: string; request_id: number }>> {
    return this.requestNewCard(reason);
  }

  async reportLostCard(cardId: number | string, reason: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      endpoints.tenant.rfid.reportLost,
      { card_id: cardId, reason }
    );
    return response.data;
  }

  // Legacy support for existing code
  async getTenantCards(): Promise<ApiResponse<RfidCard[]>> {
    // This uses the legacy endpoint for backward compatibility
    const response = await api.get<ApiResponse<RfidCard[]>>('/tenant/rfid/cards');
    return response.data;
  }

  // ===================================================================
  // IOT DEVICES
  // ===================================================================
  async getRoomDevices(): Promise<ApiResponse<IoTDevice[]>> {
    const response = await api.get<ApiResponse<IoTDevice[]>>(endpoints.tenant.iotDevices.roomDevices);
    return response.data;
  }

  async getDeviceStatus(deviceId: number | string): Promise<ApiResponse<{
    status: string;
    last_seen: string;
    battery_level?: number;
    signal_strength?: number;
    uptime?: number;
  }>> {
    const response = await api.get(endpoints.tenant.iotDevices.deviceStatus(deviceId));
    return response.data;
  }

  async getDeviceAccessLogs(params?: {
    page?: number;
    per_page?: number;
    device_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<PaginatedResponse<AccessLog>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<AccessLog>>>(
      endpoints.tenant.iotDevices.accessLogs,
      { params }
    );
    return response.data;
  }

  // ===================================================================
  // PROFILE MANAGEMENT
  // ===================================================================
  async getProfile(): Promise<ApiResponse<TenantProfile>> {
    const response = await api.get<ApiResponse<TenantProfile>>(endpoints.tenant.profile.index);
    return response.data;
  }

  async updateProfile(data: {
    name?: string;
    phone?: string;
    email?: string;
  }): Promise<ApiResponse<TenantProfile>> {
    const response = await api.put<ApiResponse<TenantProfile>>(
      endpoints.tenant.profile.update,
      data
    );
    return response.data;
  }

  async updateEmergencyContact(data: {
    name: string;
    phone: string;
    relationship: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      endpoints.tenant.profile.emergencyContact,
      data
    );
    return response.data;
  }

  // ===================================================================
  // SUPPORT TICKETS
  // ===================================================================
  async getSupportTickets(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Record<string, unknown>>>> {
    const response = await api.get(endpoints.tenant.support.tickets, { params });
    return response.data;
  }

  async createSupportTicket(data: {
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
  }): Promise<ApiResponse<{ message: string; ticket_id: number }>> {
    const response = await api.post(endpoints.tenant.support.createTicket, data);
    return response.data;
  }

  async updateSupportTicket(ticketId: number | string, data: {
    status?: string;
    comment?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await api.put(endpoints.tenant.support.updateTicket(ticketId), data);
    return response.data;
  }

  // ===================================================================
  // NOTIFICATIONS
  // ===================================================================
  async getNotifications(params?: {
    page?: number;
    per_page?: number;
    read?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Record<string, unknown>>>> {
    const response = await api.get(endpoints.notifications.index, { params });
    return response.data;
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await api.get<ApiResponse<{ count: number }>>(endpoints.notifications.unreadCount);
    return response.data;
  }

  // Legacy method for backward compatibility
  async getUnreadNotificationsCount(): Promise<ApiResponse<{ count: number }>> {
    return this.getUnreadCount();
  }

  async markNotificationAsRead(notificationId: number | string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.put<ApiResponse<{ message: string }>>(
      endpoints.notifications.markAsRead(notificationId)
    );
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      endpoints.notifications.markAllAsRead
    );
    return response.data;
  }
}

// Export singleton instance
export const tenantService = new TenantService();
export default tenantService;