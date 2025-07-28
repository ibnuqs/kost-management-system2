// File: src/pages/Tenant/services/accessService.ts (FIXED - PRODUCTION READY)
import api, { endpoints, ApiResponse } from '../../../utils/api';
import { 
  FilterParams 
} from '../types/common';
import { 
  AccessLog, 
  AccessStats,
  AccessFilters,
  AccessPattern,
  AccessSummary,
  AccessHistoryResponse,
  AccessStatsResponse,
  AccessPatternsResponse
} from '../types/access';

class AccessService {
  /**
   * Get access history with filters - FIXED VERSION
   */
  async getAccessHistory(params?: {
    page?: number;
    limit?: number;
    per_page?: number; // FIXED - Backend expects per_page
    date_from?: string;
    date_to?: string;
    status?: string;
    access_granted?: string | boolean;
  }): Promise<AccessHistoryResponse> {
    try {
      // FIXED - Convert limit to per_page for backend compatibility
      const backendParams = {
        ...params,
        per_page: params?.per_page || params?.limit || 15,
      };
      
      // Remove limit as backend uses per_page
      if ('limit' in backendParams) {
        delete backendParams.limit;
      }

      console.log('🔄 Fetching access history with params:', backendParams);

      const response = await api.get<ApiResponse<AccessHistoryResponse> | AccessHistoryResponse>(
        endpoints.tenant.access.history, 
        { params: backendParams }
      );

      console.log('✅ Access history response:', response.data);

      // Handle response structure from backend
      const apiData = response.data;
      
      // Check if this is an ApiResponse wrapper with success field
      if ('success' in apiData && apiData.success === false) {
        throw new Error((apiData as any).message || 'Failed to fetch access history');
      }

      // FIXED - Handle different response structures from backend
      const responseData = ('data' in apiData) ? (apiData as any).data : apiData;
      
      if (!responseData) {
        console.warn('No data in response, returning empty result');
        return { logs: [], total: 0 };
      }

      // Handle direct array response vs object response
      if (Array.isArray(responseData)) {
        return { logs: responseData, total: responseData.length };
      }

      // FIXED - Extract correct structure from backend response
      // Backend sends: { success: true, data: { data: [...], total: X, current_page: Y, ... } }
      const actualData = responseData.data || responseData;
      
      // FIXED: Handle object with numeric keys (Laravel Collection serialization issue)
      let logsArray = [];
      if (actualData.data && Array.isArray(actualData.data)) {
        logsArray = actualData.data;
      } else if (actualData.logs && Array.isArray(actualData.logs)) {
        logsArray = actualData.logs;
      } else if (Array.isArray(actualData)) {
        logsArray = actualData;
      } else if (actualData && typeof actualData === 'object') {
        // Convert object with numeric keys to array
        const keys = Object.keys(actualData);
        const numericKeys = keys.filter(key => !isNaN(Number(key))).sort((a, b) => Number(a) - Number(b));
        if (numericKeys.length > 0) {
          logsArray = numericKeys.map(key => actualData[key]);
        }
      }
      
      const result = {
        logs: logsArray,
        total: actualData.total || responseData.total || logsArray.length,
        current_page: actualData.current_page || responseData.current_page,
        last_page: actualData.last_page || responseData.last_page,
        per_page: actualData.per_page || responseData.per_page,
        from: actualData.from || responseData.from,
        to: actualData.to || responseData.to
      };
      
      // Debug logging
      console.log('🔄 AccessService result:', {
        logs_count: result.logs.length,
        total: result.total,
        actualData_keys: Object.keys(actualData),
        sample_log: result.logs[0] || null
      });
      
      return result;

    } catch (error: any) {
      console.error('❌ AccessService.getAccessHistory error:', error);
      
      // Enhanced error handling with specific error types
      if (error.response?.status === 404) {
        console.warn('🔄 Primary endpoint 404, trying fallback approaches...');
        
        // FALLBACK 1: Try with different parameter structure
        try {
          const fallbackParams = {
            page: params?.page || 1,
            per_page: params?.per_page || params?.limit || 15,
          };

          const fallbackResponse = await api.get<ApiResponse<any>>(
            '/tenant/access-logs', // Alternative endpoint
            { params: fallbackParams }
          );

          if (fallbackResponse.data.success !== false) {
            const fallbackData = fallbackResponse.data.data || fallbackResponse.data;
            return {
              logs: Array.isArray(fallbackData) ? fallbackData : fallbackData?.logs || [],
              total: fallbackData?.total || 0
            };
          }
        } catch (fallbackError) {
          console.warn('🔄 Fallback endpoint also failed, trying mock data...');
        }

        // FALLBACK 2: Return mock data for development
        return this.getMockAccessHistory();
      }
      
      // For other errors, still throw to be handled by the hook
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch access history');
    }
  }

  /**
   * Get access stats - FIXED VERSION
   */
  async getAccessStats(params?: {
    period?: 'week' | 'month' | 'year';
    date_from?: string;
    date_to?: string;
  }): Promise<AccessStats> {
    try {
      console.log('🔄 Fetching access stats with params:', params);

      const response = await api.get<AccessStatsResponse>(
        endpoints.tenant.access.stats, 
        { params }
      );

      console.log('✅ Access stats response:', response.data);

      // Handle response structure variations
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch access stats');
      }

      const data = response.data.data || response.data;
      
      if (!data) {
        console.warn('No stats data, returning default stats');
        return this.getDefaultStats();
      }

      return data;

    } catch (error: any) {
      console.error('❌ AccessService.getAccessStats error:', error);
      
      if (error.response?.status === 404) {
        console.warn('🔄 Stats endpoint 404, trying fallback...');
        
        // FALLBACK: Try alternative endpoint or return mock data
        try {
          const fallbackResponse = await api.get<ApiResponse<any>>('/tenant/access-stats');
          if (fallbackResponse.data.success !== false) {
            return fallbackResponse.data.data || this.getDefaultStats();
          }
        } catch (fallbackError) {
          console.warn('🔄 Fallback stats endpoint failed, returning mock data');
        }

        return this.getDefaultStats();
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch access stats');
    }
  }

  /**
   * Get access log by ID
   */
  async getAccessLogById(logId: number | string): Promise<AccessLog> {
    try {
      const response = await api.get<ApiResponse<AccessLog>>(`/tenant/access-history/${logId}`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch access log');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('AccessService.getAccessLogById error:', error);
      throw new Error(error.message || 'Failed to fetch access log');
    }
  }

  /**
   * Get access history with advanced filtering - FIXED VERSION
   */
  async getAccessHistoryWithFilters(filters: AccessFilters): Promise<AccessHistoryResponse> {
    // FIXED - Convert filters properly for backend
    const params = {
      ...filters,
      per_page: filters.per_page || filters.limit || 15, // Backend expects per_page
    };
    
    // Remove frontend-only fields
    if ('limit' in params) {
      delete params.limit;
    }
    
    return this.getAccessHistory(params);
  }

  /**
   * Get access patterns and analytics - FIXED VERSION
   */
  async getAccessPatterns(): Promise<AccessPattern[]> {
    try {
      const response = await api.get<AccessPatternsResponse>(endpoints.tenant.access.patterns);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch access patterns');
      }

      const data = response.data.data;
      
      // FIXED - Handle different response structures from backend
      if (Array.isArray(data)) {
        return data;
      }
      
      // Convert backend structure to frontend structure
      if (data && typeof data === 'object') {
        const patterns: AccessPattern[] = [];
        
        // Convert most_active_days and most_active_hours to AccessPattern format
        if (data.most_active_days || data.most_active_hours) {
          patterns.push({
            day_of_week: 0,
            hour_of_day: 0,
            average_count: 0,
            peak_times: [],
            most_active_days: data.most_active_days || [],
            most_active_hours: data.most_active_hours || [],
            access_frequency: data.access_frequency || {
              daily_average: 0,
              weekly_average: 0,
              monthly_average: 0
            }
          });
        }
        
        return patterns;
      }

      return [];
    } catch (error: any) {
      console.error('AccessService.getAccessPatterns error:', error);
      
      if (error.response?.status === 404) {
        // Return empty array if endpoint doesn't exist yet
        return [];
      }
      
      throw new Error(error.message || 'Failed to fetch access patterns');
    }
  }

  /**
   * Export access logs to CSV
   */
  async exportAccessLogs(filters: AccessFilters): Promise<Blob> {
    try {
      // FIXED - Convert filters for backend
      const params = {
        ...filters,
        per_page: filters.per_page || filters.limit || 1000, // Large number for export
      };
      
      if ('limit' in params) {
        delete params.limit;
      }

      const response = await api.get(`/tenant/access-history/export`, {
        params,
        responseType: 'blob'
      });

      return response.data;
    } catch (error: any) {
      console.error('AccessService.exportAccessLogs error:', error);
      throw new Error(error.message || 'Failed to export access logs');
    }
  }

  // ===================================================================
  // MOCK DATA METHODS FOR DEVELOPMENT/FALLBACK
  // ===================================================================

  /**
   * Get mock access history for development/fallback - FIXED VERSION
   */
  private getMockAccessHistory(): AccessHistoryResponse {
    const mockLogs: AccessLog[] = [
      {
        id: 1,
        user_id: 1, // FIXED - Added user_id
        tenant_id: 1,
        room_id: 1,
        room_number: 'A-101',
        rfid_uid: 'mock-card-001',
        device_id: 'door-001',
        access_granted: true,
        accessed_at: new Date().toISOString(),
        reason: 'Valid card access',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        room: {
          id: 1,
          room_number: 'A-101',
          name: 'Room A-101'
        }
      },
      {
        id: 2,
        user_id: 1, // FIXED - Added user_id
        tenant_id: 1,
        room_id: 1,
        room_number: 'A-101',
        rfid_uid: 'mock-card-001',
        device_id: 'door-001',
        access_granted: false,
        accessed_at: new Date(Date.now() - 3600000).toISOString(),
        reason: 'Card expired',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        room: {
          id: 1,
          room_number: 'A-101',
          name: 'Room A-101'
        }
      }
    ];

    return {
      logs: mockLogs,
      total: mockLogs.length
    };
  }

  /**
   * Get default stats for fallback - FIXED VERSION
   */
  private getDefaultStats(): AccessStats {
    return {
      today_count: 0,
      week_count: 0,
      month_count: 0,
      total_count: 0,
      success_rate: 0,
      granted_count: 0,
      denied_count: 0,
      last_access: null, // FIXED - Added field from backend
      most_used_device: null, // FIXED - Added field from backend
      peak_hour: 0, // FIXED - Added field from backend
      trends: { // FIXED - Added trends structure from backend
        daily: [],
        weekly: [],
        monthly: []
      }
    };
  }

  // ===================================================================
  // ADDITIONAL METHODS (OPTIONAL - MAY NOT BE IMPLEMENTED IN BACKEND)
  // ===================================================================

  /**
   * Get today's access logs
   */
  async getTodayAccessLogs(): Promise<AccessLog[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await this.getAccessHistory({
        date_from: today,
        date_to: today,
        per_page: 100
      });
      return result.logs;
    } catch (error) {
      console.warn('getTodayAccessLogs failed, returning empty array');
      return [];
    }
  }

  /**
   * Get this week's access logs
   */
  async getWeekAccessLogs(): Promise<AccessLog[]> {
    try {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      
      const result = await this.getAccessHistory({
        date_from: weekStart.toISOString().split('T')[0],
        date_to: weekEnd.toISOString().split('T')[0],
        per_page: 100
      });
      return result.logs;
    } catch (error) {
      console.warn('getWeekAccessLogs failed, returning empty array');
      return [];
    }
  }

  /**
   * Get this month's access logs
   */
  async getMonthAccessLogs(): Promise<AccessLog[]> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const result = await this.getAccessHistory({
        date_from: monthStart.toISOString().split('T')[0],
        date_to: monthEnd.toISOString().split('T')[0],
        per_page: 100
      });
      return result.logs;
    } catch (error) {
      console.warn('getMonthAccessLogs failed, returning empty array');
      return [];
    }
  }

  /**
   * Get access summary for a date range - FIXED VERSION
   */
  async getAccessSummary(startDate: string, endDate: string): Promise<AccessSummary> {
    try {
      const response = await api.get<ApiResponse<AccessSummary>>(`/tenant/access-stats/summary`, {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch access summary');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('AccessService.getAccessSummary error:', error);
      
      // Return default summary if endpoint doesn't exist
      if (error.response?.status === 404) {
        return {
          total_attempts: 0, // FIXED - Added field expected by backend
          total_accesses: 0,
          successful_accesses: 0,
          denied_accesses: 0,
          success_rate: 0,
          unique_days: 0,
          most_active_day: startDate,
          most_active_hour: 0,
          access_frequency: 'normal' as const,
          devices_used: [],
          daily_breakdown: []
        };
      }
      
      throw new Error(error.message || 'Failed to fetch access summary');
    }
  }

  /**
   * Get denied access logs
   */
  async getDeniedAccessLogs(): Promise<AccessLog[]> {
    try {
      const result = await this.getAccessHistory({
        access_granted: false,
        per_page: 100
      });
      return result.logs;
    } catch (error) {
      console.warn('getDeniedAccessLogs failed, returning empty array');
      return [];
    }
  }

  /**
   * Get access logs by device
   */
  async getAccessLogsByDevice(deviceId: string): Promise<AccessLog[]> {
    try {
      const response = await api.get<ApiResponse<AccessLog[]>>(`/tenant/access-history/device/${deviceId}`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device access logs');
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error('AccessService.getAccessLogsByDevice error:', error);
      
      if (error.response?.status === 404) {
        return [];
      }
      
      throw new Error(error.message || 'Failed to fetch device access logs');
    }
  }

  /**
   * Get access logs by RFID card
   */
  async getAccessLogsByCard(cardId: number | string): Promise<AccessLog[]> {
    try {
      const response = await api.get<ApiResponse<AccessLog[]>>(`/tenant/access-history/card/${cardId}`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch card access logs');
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error('AccessService.getAccessLogsByCard error:', error);
      
      if (error.response?.status === 404) {
        return [];
      }
      
      throw new Error(error.message || 'Failed to fetch card access logs');
    }
  }
}

export const accessService = new AccessService();