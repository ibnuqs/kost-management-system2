// File: src/pages/Admin/services/dashboardService.ts
import api from '../../../utils/api';
import type { DashboardStats, ActivityItem, RevenueData } from '../types';

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
      
      // Get device data separately with fresh variable name
      let deviceApiResponse = null;
      try {
        deviceApiResponse = await api.get('/admin/iot-devices');
        console.log('🔥 FRESH API Response:', deviceApiResponse);
        console.log('🔥 Response Data:', deviceApiResponse?.data);
      } catch (error) {
        console.log('Failed to fetch device data:', error);
        deviceApiResponse = { data: { success: false } };
      }

      if (!statsRes.data.success) {
        throw new Error(statsRes.data.message || 'Failed to load dashboard stats');
      }

      // Map backend nested structure to frontend flat structure
      const backendData = statsRes.data.data;
      
      // Calculate device stats from fresh API response
      let deviceStats = { total: 0, online: 0, offline: 0, door_locks: 0, card_scanners: 0 };
      
      if (deviceApiResponse?.data?.success && deviceApiResponse.data.data) {
        const devices = deviceApiResponse.data.data;
        console.log('🔥 Devices array:', devices);
        deviceStats = {
          total: devices.length,
          online: devices.filter((d: any) => d.status === 'online').length,
          offline: devices.filter((d: any) => d.status === 'offline').length,
          door_locks: devices.filter((d: any) => d.device_type === 'door_lock').length,
          card_scanners: devices.filter((d: any) => d.device_type === 'card_scanner').length
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
        device_uptime_percentage: (deviceStats?.total || backendData.devices?.total || backendData.iot?.total_devices || 0) > 0
          ? Math.round(((deviceStats?.online || backendData.devices?.online || backendData.iot?.online_devices || 0) / (deviceStats?.total || backendData.devices?.total || backendData.iot?.total_devices || 1)) * 100)
          : 0
      };

      return {
        stats,
        activities: activitiesRes.data.success ? activitiesRes.data.data || [] : []
      };
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error;
    }
  },

  async getRevenueData(period: 'monthly' | 'yearly'): Promise<RevenueData[]> {
    try {
      const response = await api.get('/admin/dashboard/analytics', {
        params: { period }
      });

      if (!response.data.success) {
        console.warn('No revenue data available from API');
        return []; // Return empty array instead of throwing error
      }

      const rawData = response.data.data || [];
      
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
      return processedData.map((item: any) => ({
        month: item.month || item.period || item.year?.toString() || 'Unknown',
        year: item.year?.toString() || new Date().getFullYear().toString(),
        revenue: typeof item.revenue === 'number' ? item.revenue : 
                typeof item.total_revenue === 'number' ? item.total_revenue :
                parseFloat(item.revenue || item.total_revenue) || 0,
        payments: typeof item.payments === 'number' ? item.payments : 
                 typeof item.payment_count === 'number' ? item.payment_count :
                 parseInt(item.payments || item.payment_count) || 0,
        avg_payment: typeof item.avg_payment === 'number' ? item.avg_payment : 
                    typeof item.average_payment === 'number' ? item.average_payment :
                    parseFloat(item.avg_payment || item.average_payment) || 0,
      })).filter(item => item.revenue >= 0); // Filter out invalid entries
    } catch (error) {
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

      if (!response.data.success) {
        console.warn('Activities data not available');
        return [];
      }

      const activities = response.data.data || [];
      
      // Validate activity data structure
      return activities.filter((activity: any) => 
        activity && 
        typeof activity === 'object' && 
        activity.id &&
        activity.title
      );
    } catch (error) {
      console.error('Activities service error:', error);
      // Return empty array instead of throwing
      return [];
    }
  },

  async refreshDashboard(): Promise<void> {
    try {
      // Just refresh the data without throwing errors
      await this.getDashboardData();
    } catch (error) {
      console.error('Dashboard refresh error:', error);
      // Don't throw error to prevent UI crashes
    }
  },

  async getAccessHistoryData(): Promise<any[]> {
    try {
      const response = await api.get('/admin/dashboard/access-history');
      
      if (!response.data.success) {
        console.warn('Access history data not available');
        return []; // Return empty array instead of fake data
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Access history service error:', error);
      // Return empty array instead of fake data
      return [];
    }
  },

  async getPaymentTrendsData(): Promise<any[]> {
    try {
      const response = await api.get('/admin/dashboard/payment-trends');
      
      if (!response.data.success) {
        console.warn('Payment trends data not available');
        return []; // Return empty array instead of fake data
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Payment trends service error:', error);
      // Return empty array instead of fake data
      return [];
    }
  }
};