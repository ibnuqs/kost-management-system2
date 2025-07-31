// File: src/pages/Admin/types/accessLog.ts

// Base interfaces - define locally to avoid import issues
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface Room {
  id: number;
  room_number: string;
  room_name?: string;
  floor?: number;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccessLog extends BaseEntity {
  user_id?: number;
  room_id?: number;
  rfid_uid: string;
  device_id: string;
  access_granted: boolean;
  accessed_at: string;
  access_time?: string; // Alias for accessed_at
  reason?: string;
  status?: 'granted' | 'denied';
  access_type?: 'door' | 'gate' | 'room';
  user?: User;
  room?: Room;
}

export interface AccessLogStats {
  total_today: number;
  granted_today: number;
  denied_today: number;
  total_week: number;
}

export interface DailyAccessStat {
  date: string;
  day_name: string;
  total_access: number;
  granted_access: number;
  denied_access: number;
}

export interface HourlyAccessStat {
  hour: number;
  count: number;
}

export interface AccessLogStatisticsSummary {
  total_period: number;
  average_daily: number;
  busiest_hour: number;
}

export interface AccessLogStatistics {
  daily_stats: DailyAccessStat[];
  hourly_stats: HourlyAccessStat[];
  summary: AccessLogStatisticsSummary;
}

export interface AccessLogFilters {
  search?: string;
  user_id?: number;
  room_id?: number;
  access_granted?: boolean;
  start_date?: string;
  end_date?: string;
  today?: boolean;
  page?: number;
  per_page?: number;
}

export interface AccessLogsResponse {
  success: boolean;
  data: AccessLog[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}