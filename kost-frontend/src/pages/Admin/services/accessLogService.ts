// File: src/pages/Admin/services/accessLogService.ts
import api, { endpoints } from '../../../utils/api';
import type { 
  AccessLog, 
  AccessLogStats, 
  AccessLogFilters, 
  AccessLogStatistics,
  DailyAccessStat,
  HourlyAccessStat
} from '../types/accessLog';

// Error handling interfaces
interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
    statusText?: string;
  };
  config?: {
    url?: string;
    method?: string;
  };
  message?: string;
}


interface GetLogsResponse {
  logs: AccessLog[];
  summary: AccessLogStats;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const accessLogService = {
  async getLogs(filters?: AccessLogFilters): Promise<GetLogsResponse> {
    try {
      const params: Record<string, string> = {};
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && value !== null) {
            // Handle boolean values properly
            if (typeof value === 'boolean') {
              params[key] = value.toString();
            } else if (value !== false) {
              params[key] = value.toString();
            }
          }
        });
      }

      const response = await api.get(endpoints.admin.accessLogs.index, { params });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch access logs');
      }

      // Debug response structure
      const responseData = response.data.data as unknown;
      console.log('🔍 Access logs response structure:', {
        hasData: !!responseData,
        dataType: typeof responseData,
        dataKeys: responseData && typeof responseData === 'object' ? Object.keys(responseData) : 'no data',
        hasPagination: !!response.data.pagination,
        firstItem: Array.isArray(responseData) ? responseData[0] : 'not array'
      });

      return {
        logs: (response.data.data as AccessLog[]) || [],
        summary: response.data.summary || {
          total_today: 0,
          granted_today: 0,
          denied_today: 0,
          total_week: 0
        },
        pagination: response.data.pagination || {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 0
        }
      };
    } catch (error: unknown) {
      console.error('Error fetching access logs:', error);
      const apiError = error as ApiError;
      throw new Error(
        apiError.response?.data?.message || 
        apiError.message || 
        'Failed to fetch access logs'
      );
    }
  },

  async getStatistics(days: number = 7): Promise<AccessLogStatistics> {
    try {
      // Add timestamp to prevent caching issues
      const timestamp = Date.now();
      const response = await api.get(endpoints.admin.accessLogs.statistics, {
        params: { days, _t: timestamp }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch access log statistics');
      }

      // Ensure data structure is valid
      const data = response.data.data as {
        daily_stats?: DailyAccessStat[];
        hourly_stats?: HourlyAccessStat[];
        summary?: AccessLogStatistics;
      };
      return {
        daily_stats: data.daily_stats || [],
        hourly_stats: data.hourly_stats || [],
        summary: data.summary || {
          total_period: 0,
          average_daily: 0,
          busiest_hour: 0
        }
      };
    } catch (error: unknown) {
      console.error('Error fetching access log statistics:', error);
      
      const apiError = error as ApiError;
      
      // Check if it's a 404 error (endpoint not found)
      if (apiError.response?.status === 404) {
        console.warn('Statistics endpoint not found. Please check if the route is registered.');
        console.warn('Expected route: GET /api/admin/access-logs/statistics');
        console.warn('Current endpoint:', endpoints.admin.accessLogs.statistics);
        return this.getMockStatistics(days);
      }
      
      // Check if it's a 500 error (server error - possibly SQL issue)
      if (apiError.response?.status === 500) {
        console.warn('Server error occurred, likely SQL issue. Using mock data.');
        console.warn('Error details:', apiError.response?.data);
        return this.getMockStatistics(days);
      }
      
      // For development, show more detailed error
      if (process.env.NODE_ENV === 'development') {
        console.error('Full error details:', {
          url: apiError.config?.url,
          method: apiError.config?.method,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data
        });
      }
      
      throw new Error(
        apiError.response?.data?.message || 
        apiError.message || 
        'Failed to fetch access log statistics'
      );
    }
  },

  // Mock data generator for when endpoint is not available
  getMockStatistics(days: number = 7): AccessLogStatistics {
    const daily_stats: DailyAccessStat[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      daily_stats.push({
        date: date.toISOString().split('T')[0],
        day_name: date.toLocaleDateString('en-US', { weekday: 'long' }),
        total_access: Math.floor(Math.random() * 50) + 10,
        granted_access: Math.floor(Math.random() * 40) + 5,
        denied_access: Math.floor(Math.random() * 10) + 1,
      });
    }

    const hourly_stats: HourlyAccessStat[] = [];
    for (let hour = 0; hour < 24; hour++) {
      hourly_stats.push({
        hour,
        count: Math.floor(Math.random() * 20)
      });
    }

    const total_period = daily_stats.reduce((sum, day) => sum + day.total_access, 0);

    return {
      daily_stats,
      hourly_stats,
      summary: {
        total_period,
        average_daily: Number((total_period / days).toFixed(1)),
        busiest_hour: Math.floor(Math.random() * 24)
      }
    };
  },

  async exportLogs(filters?: AccessLogFilters): Promise<void> {
    try {
      const params: Record<string, string> = {};
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && value !== null) {
            if (typeof value === 'boolean') {
              params[key] = value.toString();
            } else if (value !== false) {
              params[key] = value.toString();
            }
          }
        });
      }

      const response = await api.get(endpoints.admin.accessLogs.export, { params });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to export access logs');
      }

      // Handle export data
      if (response.data.data && response.data.filename) {
        const csvContent = this.convertToCSV(response.data.data as Record<string, unknown>[]);
        this.downloadCSV(csvContent, response.data.filename);
      } else {
        throw new Error('No export data received');
      }
    } catch (error: unknown) {
      console.error('Error exporting access logs:', error);
      const apiError = error as ApiError;
      throw new Error(
        apiError.response?.data?.message || 
        apiError.message || 
        'Failed to export access logs'
      );
    }
  },

  convertToCSV(data: Record<string, unknown>[]): string {
    if (!data || !data.length) return '';
    
    try {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            
            // Handle strings with commas, quotes, or newlines
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',')
        )
      ].join('\n');
      
      return csvContent;
    } catch (error: unknown) {
      console.error('Error converting to CSV:', error);
      throw new Error('Failed to convert data to CSV format');
    }
  },

  downloadCSV(csvContent: string, filename: string): void {
    try {
      // Add BOM for Excel UTF-8 support
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error('Error downloading CSV:', error);
      throw new Error('Failed to download CSV file');
    }
  }
};