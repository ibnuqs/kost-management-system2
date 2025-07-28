// File: src/pages/Admin/services/dashboardServiceNew.ts
import api from '../../../utils/api';
import type { DashboardStats, ActivityItem, RevenueData } from '../types';

export const dashboardServiceNew = {
  async getDashboardData(): Promise<{
    stats: DashboardStats;
    activities: ActivityItem[];
  }> {
    try {
      
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/activities')
      ]);

      if (!statsRes.data.success) {
        throw new Error(statsRes.data.message || 'Failed to load dashboard stats');
      }

      // Map backend nested structure to frontend flat structure
      const backendData = statsRes.data.data;
      
      // Get device data
      let deviceApiResponse = null;
      try {
        deviceApiResponse = await api.get('/admin/iot-devices');
      } catch (error) {
        deviceApiResponse = { data: { success: false } };
      }

      // Calculate device stats from fresh API response
      let deviceStats = { total: 0, online: 0, offline: 0, door_locks: 0, card_scanners: 0 };
      
      if (deviceApiResponse?.data?.success && deviceApiResponse.data.data) {
        const devices = deviceApiResponse.data.data;
        
        // Helper function to check if device is really online based on last_seen
        const isDeviceReallyOnline = (device: any) => {
          if (!device.last_seen) return false;
          const lastSeen = new Date(device.last_seen);
          const now = new Date();
          const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
          return diffMinutes <= 5; // Consider online if last seen within 5 minutes
        };
        
        const reallyOnlineDevices = devices.filter(isDeviceReallyOnline);
        
        deviceStats = {
          total: devices.length,
          online: reallyOnlineDevices.length,
          offline: devices.length - reallyOnlineDevices.length,
          door_locks: devices.filter((d: any) => d.device_type === 'door_lock').length,
          card_scanners: devices.filter((d: any) => d.device_type === 'card_scanner' || d.device_type === 'rfid_reader').length
        };
      }
      
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
        total_access_all_time: backendData.access?.total_all_time || 0,
        unique_users_today: backendData.access?.unique_users_today || 0,
        peak_hour: backendData.access?.peak_hour || '00:00',
        
        // Device stats (calculated from real API data)
        online_devices: deviceStats.online,
        total_devices: deviceStats.total,
        device_uptime_percentage: deviceStats.total > 0
          ? Math.round((deviceStats.online / deviceStats.total) * 100)
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

  // Keep other methods from original service
  async getRevenueData(period: 'monthly' | 'yearly'): Promise<RevenueData[]> {
    try {
      const response = await api.get('/admin/dashboard/analytics', {
        params: { period }
      });

      if (!response.data.success) {
        console.warn('No revenue data available from API');
        return [];
      }

      const rawData = response.data.data || [];
      
      let processedData = rawData;
      if (rawData.revenue_analytics) {
        processedData = rawData.revenue_analytics;
      } else if (rawData.analytics) {
        processedData = rawData.analytics;
      }

      if (!Array.isArray(processedData)) {
        console.warn('Revenue data is not in expected array format');
        return [];
      }
      
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
      })).filter(item => item.revenue >= 0);
    } catch (error) {
      console.error('Revenue data service error:', error);
      return [];
    }
  },

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
      
      return activities.filter((activity: any) => 
        activity && 
        typeof activity === 'object' && 
        activity.id &&
        activity.title
      );
    } catch (error) {
      console.error('Activities service error:', error);
      return [];
    }
  },

  async refreshDashboard(): Promise<void> {
    try {
      await this.getDashboardData();
    } catch (error) {
      console.error('Dashboard refresh error:', error);
    }
  },

  async getAccessHistoryData(): Promise<any[]> {
    try {
      const response = await api.get('/admin/dashboard/access-history');
      
      if (!response.data.success) {
        console.warn('Access history data not available');
        return [];
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Access history service error:', error);
      return [];
    }
  },

  async getPaymentTrendsData(): Promise<any[]> {
    try {
      const response = await api.get('/admin/dashboard/payment-trends');
      
      if (!response.data.success) {
        console.warn('Payment trends data not available');
        return [];
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Payment trends service error:', error);
      return [];
    }
  }
};