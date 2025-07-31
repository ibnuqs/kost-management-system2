// File: src/pages/Admin/services/dashboardService.ts
import api from '../../../utils/api';
import type { DashboardStats, ActivityItem, RevenueData } from '../types';
import type { IoTDevice, DeviceStats } from '../types/iot';

// API Response interfaces
interface DashboardApiResponse {
  success: boolean;
  data: {
    rooms?: {
      total?: number;
      occupied?: number;
      available?: number;
      maintenance?: number;
      occupancy_rate?: number;
    };
    finance?: {
      monthly_revenue?: number;
      yearly_revenue?: number;
      pending_amount?: number;
      overdue_amount?: number;
      collection_rate?: number;
      revenue_growth?: number;
    };
    tenants?: {
      total_active?: number;
      total_users?: number;
      new_this_month?: number;
      moved_out_this_month?: number;
    };
    payments?: {
      pending_count?: number;
      overdue_count?: number;
      paid_this_month?: number;
      total_this_month?: number;
    };
    rfid?: {
      total_cards?: number;
      active_cards?: number;
      assigned_cards?: number;
      unassigned_cards?: number;
    };
    access?: {
      total_today?: number;
      total_this_week?: number;
      unique_users_today?: number;
      peak_hour?: string;
    };
    devices?: {
      total?: number;
      online?: number;
    };
    iot?: {
      total_devices?: number;
      online_devices?: number;
    };
  };
  message?: string;
}

interface DevicesApiResponse {
  success: boolean;
  data: IoTDevice[];
  message?: string;
}


interface RevenueAnalyticsResponse {
  success: boolean;
  data: unknown[] | {
    revenue_analytics?: unknown[];
    analytics?: unknown[];
  };
  message?: string;
}

interface RevenueDataItem {
  month?: string;
  period?: string;
  year?: number;
  revenue?: number | string;
  total_revenue?: number | string;
  payments?: number | string;
  payment_count?: number | string;
  avg_payment?: number | string;
  average_payment?: number | string;
}

export const dashboardService = {
  async getDashboardData(): Promise<{
    stats: DashboardStats;
    activities: ActivityItem[];
  }> {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/activities')
      ]);
      
      const statsResponse = statsRes.data as DashboardApiResponse;
      const activitiesResponse = activitiesRes.data as { success: boolean; data: ActivityItem[]; message?: string };
      
      // Get device data separately with fresh variable name
      let deviceApiResponse: DevicesApiResponse | null = null;
      try {
        const response = await api.get('/admin/iot-devices');
        deviceApiResponse = response.data as DevicesApiResponse;
        console.log('🔥 FRESH API Response:', deviceApiResponse);
        console.log('🔥 Response Data:', deviceApiResponse?.data);
      } catch (error: unknown) {
        console.log('Failed to fetch device data:', error);
        deviceApiResponse = { data: [], success: false };
      }

      if (!statsResponse.success) {
        throw new Error(statsResponse.message || 'Failed to load dashboard stats');
      }

      // Map backend nested structure to frontend flat structure
      const backendData = statsResponse.data;
      
      // Calculate device stats from fresh API response
      let deviceStats: DeviceStats = { total: 0, online: 0, offline: 0, door_locks: 0, card_scanners: 0 };
      
      if (deviceApiResponse?.success && deviceApiResponse.data) {
        const devices = deviceApiResponse.data;
        console.log('🔥 Devices array:', devices);
        deviceStats = {
          total: devices.length,
          online: devices.filter((device) => device.status === 'online').length,
          offline: devices.filter((device) => device.status === 'offline').length,
          door_locks: devices.filter((device) => device.device_type === 'door_lock').length,
          card_scanners: devices.filter((device) => device.device_type === 'card_scanner').length
        };
      }
      
      // Debug logging to see what data we're getting
      console.log('🔥 Dashboard Debug:');
      console.log('- statsRes.data:', statsRes.data);
      console.log('- deviceApiResponse:', deviceApiResponse);
      console.log('- calculated deviceStats:', deviceStats);
      
      const stats = {
        // Room stats
        total_rooms: backendData.rooms?.total || 0,
        occupied_rooms: backendData.rooms?.occupied || 0,
        available_rooms: backendData.rooms?.available || 0,
        maintenance_rooms: backendData.rooms?.maintenance || 0,
        occupancy_percentage: backendData.rooms?.occupancy_rate || 0,
        
        // Finance stats
        monthly_revenue: backendData.finance?.monthly_revenue || 0,
        yearly_revenue: backendData.finance?.yearly_revenue || 0,
        pending_amount: backendData.finance?.pending_amount || 0,
        overdue_amount: backendData.finance?.overdue_amount || 0,
        collection_rate: backendData.finance?.collection_rate || 0,
        revenue_growth: backendData.finance?.revenue_growth || 0,
        
        // Tenant stats
        total_active_tenants: backendData.tenants?.total_active || 0,
        total_tenant_users: backendData.tenants?.total_users || 0,
        new_tenants_this_month: backendData.tenants?.new_this_month || 0,
        moved_out_this_month: backendData.tenants?.moved_out_this_month || 0,
        
        // Payment stats
        pending_payments: backendData.payments?.pending_count || 0,
        overdue_payments: backendData.payments?.overdue_count || 0,
        paid_this_month: backendData.payments?.paid_this_month || 0,
        total_payments_this_month: backendData.payments?.total_this_month || 0,
        
        // RFID stats
        total_rfid_cards: backendData.rfid?.total_cards || 0,
        active_rfid_cards: backendData.rfid?.active_cards || 0,
        assigned_cards: backendData.rfid?.assigned_cards || 0,
        unassigned_cards: backendData.rfid?.unassigned_cards || 0,
        
        // Access stats
        today_activities: backendData.access?.total_today || 0,
        total_access_week: backendData.access?.total_this_week || 0,
        unique_users_today: backendData.access?.unique_users_today || 0,
        peak_hour: backendData.access?.peak_hour || '00:00',
        
        // Device stats (real data from IoT endpoint, consistent with IoT management page)
        online_devices: deviceStats?.online || backendData.devices?.online || backendData.iot?.online_devices || 0,
        total_devices: deviceStats?.total || backendData.devices?.total || backendData.iot?.total_devices || 0,
        device_uptime_percentage: (deviceStats?.total || backendData.devices?.total || backendData.iot?.total_devices || 0)
          ? Math.round(((deviceStats?.online || backendData.devices?.online || backendData.iot?.online_devices || 0) / (deviceStats?.total || backendData.devices?.total || backendData.iot?.total_devices || 1)) * 100)
          : 0
      };

      return {
        stats,
        activities: activitiesResponse.success ? activitiesResponse.data || [] : []
      };
    } catch (error: unknown) {
      console.error('Dashboard service error:', error);
      throw error;
    }
  },

  async getRevenueData(period: 'monthly' | 'yearly'): Promise<RevenueData[]> {
    try {
      const response = await api.get('/admin/dashboard/analytics', {
        params: { period }
      });
      
      const apiResponse = response.data as RevenueAnalyticsResponse;

      if (!apiResponse.success) {
        console.warn('No revenue data available from API');
        return []; // Return empty array instead of throwing error
      }

      const rawData = apiResponse.data || [];
      
      // Handle both nested and flat response structures
      let processedData = rawData;
      if (rawData.revenue_analytics) {
        processedData = rawData.revenue_analytics;
      } else if (rawData.analytics) {
        processedData = rawData.analytics;
      }

      // Ensure we have an array to work with
      if (!Array.isArray(processedData)) {
        console.warn('Revenue data is not in expected array format');
        return [];
      }
      
      // Validate and process data safely
      return processedData.map((item: unknown): RevenueData => {
        const revenueItem = item as RevenueDataItem;
        return {
          month: revenueItem.month || revenueItem.period || revenueItem.year?.toString() || 'Unknown',
          year: revenueItem.year?.toString() || new Date().getFullYear().toString(),
          revenue: typeof revenueItem.revenue === 'number' ? revenueItem.revenue : 
                  typeof revenueItem.total_revenue === 'number' ? revenueItem.total_revenue :
                  parseFloat(String(revenueItem.revenue || revenueItem.total_revenue || 0)) || 0,
          payments: typeof revenueItem.payments === 'number' ? revenueItem.payments : 
                   typeof revenueItem.payment_count === 'number' ? revenueItem.payment_count :
                   parseInt(String(revenueItem.payments || revenueItem.payment_count || 0), 10) || 0,
          avg_payment: typeof revenueItem.avg_payment === 'number' ? revenueItem.avg_payment : 
                      typeof revenueItem.average_payment === 'number' ? revenueItem.average_payment :
                      parseFloat(String(revenueItem.avg_payment || revenueItem.average_payment || 0)) || 0,
        };
      }).filter(item => item.revenue >= 0); // Filter out invalid entries
    } catch (error: unknown) {
      console.error('Revenue data service error:', error);
      // Return empty array instead of throwing error to prevent dashboard crashes
      return [];
    }
  },

  // Additional helper methods - no fake data, only real API calls

  async getRecentActivities(perPage: number = 15): Promise<ActivityItem[]> {
    try {
      const response = await api.get('/admin/dashboard/activities', {
        params: { per_page: perPage }
      });
      
      const apiResponse = response.data as { success: boolean; data: ActivityItem[]; message?: string };

      if (!apiResponse.success) {
        console.warn('Activities data not available');
        return [];
      }

      const activities = apiResponse.data || [];
      
      // Validate activity data structure
      return activities.filter((activity: unknown): activity is ActivityItem => {
        const item = activity as Partial<ActivityItem>;
        return !!(item && 
          typeof activity === 'object' && 
          item.id &&
          item.title);
      });
    } catch (error: unknown) {
      console.error('Activities service error:', error);
      // Return empty array instead of throwing
      return [];
    }
  },

  async refreshDashboard(): Promise<void> {
    try {
      // Just refresh the data without throwing errors
      await this.getDashboardData();
    } catch (error: unknown) {
      console.error('Dashboard refresh error:', error);
      // Don't throw error to prevent UI crashes
    }
  },

  async getAccessHistoryData(): Promise<Record<string, unknown>[]> {
    try {
      const response = await api.get('/admin/dashboard/access-history');
      const apiResponse = response.data as { success: boolean; data: Record<string, unknown>[]; message?: string };
      
      if (!apiResponse.success) {
        console.warn('Access history data not available');
        return []; // Return empty array instead of fake data
      }

      return apiResponse.data || [];
    } catch (error: unknown) {
      console.error('Access history service error:', error);
      // Return empty array instead of fake data
      return [];
    }
  },

  async getPaymentTrendsData(): Promise<Record<string, unknown>[]> {
    try {
      const response = await api.get('/admin/dashboard/payment-trends');
      const apiResponse = response.data as { success: boolean; data: Record<string, unknown>[]; message?: string };
      
      if (!apiResponse.success) {
        console.warn('Payment trends data not available');
        return []; // Return empty array instead of fake data
      }

      return apiResponse.data || [];
    } catch (error: unknown) {
      console.error('Payment trends service error:', error);
      // Return empty array instead of fake data
      return [];
    }
  }
};