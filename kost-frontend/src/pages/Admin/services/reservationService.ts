// File: src/pages/Admin/services/reservationService.ts
import api from '../../../utils/api';
import type { 
  Room, 
  RoomReservationData, 
  TenantAssignmentEnhancedData 
} from '../types/room';
import type { ApiResponse } from '../types/common';

interface ReservationResponse {
  success: boolean;
  data: Room;
  reservation_info?: any;
  message: string;
}

interface SystemHealthResponse {
  success: boolean;
  data: {
    overall_status: 'healthy' | 'warning' | 'critical' | 'unhealthy';
    health_checks: {
      database: any;
      payments: any;
      tenants: any;
      commands: any;
      timestamp: string;
    };
  };
  message: string;
}

export const reservationService = {
  // Room Reservation Management
  async reserveRoom(roomId: number, data: RoomReservationData = {}): Promise<ReservationResponse> {
    const response = await api.post<ReservationResponse>(
      `/admin/rooms/${roomId}/reserve`,
      data
    );
    return response.data;
  },

  async cancelReservation(roomId: number): Promise<ReservationResponse> {
    const response = await api.delete<ReservationResponse>(
      `/admin/rooms/${roomId}/cancel-reservation`
    );
    return response.data;
  },

  async confirmReservation(roomId: number): Promise<ReservationResponse> {
    const response = await api.post<ReservationResponse>(
      `/admin/rooms/${roomId}/confirm-reservation`
    );
    return response.data;
  },

  // Enhanced Tenant Assignment with Optimistic Locking
  async assignTenantEnhanced(
    roomId: number, 
    data: TenantAssignmentEnhancedData
  ): Promise<ApiResponse<{ room: Room; tenant: any }>> {
    const response = await api.post<ApiResponse<{ room: Room; tenant: any }>>(
      `/admin/rooms/${roomId}/assign-tenant-enhanced`,
      data
    );
    return response.data;
  },

  // System Management
  async generateMonthlyPayments(data: { 
    date?: string; 
    dry_run?: boolean 
  } = {}): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>(
      '/admin/system/generate-monthly-payments',
      data
    );
    return response.data;
  },

  async processPaymentStatus(data: { 
    grace_days?: number; 
    dry_run?: boolean 
  } = {}): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>(
      '/admin/system/process-payment-status',
      data
    );
    return response.data;
  },

  async updateTenantAccess(tenantId: number): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>(
      `/admin/system/update-tenant-access/${tenantId}`
    );
    return response.data;
  },

  async updateAllTenantsAccess(): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>(
      '/admin/system/update-all-tenants-access'
    );
    return response.data;
  },

  async cleanupExpiredReservations(data: { 
    dry_run?: boolean 
  } = {}): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>(
      '/admin/system/cleanup-expired-reservations',
      data
    );
    return response.data;
  },

  async getSystemHealth(): Promise<SystemHealthResponse> {
    const response = await api.get<SystemHealthResponse>(
      '/admin/system/health'
    );
    return response.data;
  },

  // Utility functions for UI
  getReservationStatusColor(room: Room): string {
    if (!room.reservation_info) return '';
    
    const { expires_in_minutes, is_expired } = room.reservation_info;
    
    if (is_expired) return 'text-red-600';
    if (expires_in_minutes <= 60) return 'text-orange-600';
    return 'text-purple-600';
  },

  getReservationStatusText(room: Room): string {
    if (!room.reservation_info) return '';
    
    const { expires_in_minutes, is_expired } = room.reservation_info;
    
    if (is_expired) return 'Kedaluwarsa';
    if (expires_in_minutes <= 0) return 'Akan kedaluwarsa';
    if (expires_in_minutes <= 60) return `${expires_in_minutes} menit lagi`;
    
    const hours = Math.floor(expires_in_minutes / 60);
    const minutes = expires_in_minutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}j ${minutes}m lagi` : `${hours} jam lagi`;
    }
    
    return `${minutes} menit lagi`;
  },

  formatReservationTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timestamp;
    }
  }
};