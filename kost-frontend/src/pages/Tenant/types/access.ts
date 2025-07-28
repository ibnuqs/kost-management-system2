// File: src/pages/Tenant/types/access.ts (FIXED)
import { BaseEntity } from './common';

export interface AccessLog extends BaseEntity {
  user_id: number; // ADDED - Backend includes this field
  tenant_id?: number; // Made optional since backend might not always include
  room_id: number;
  room_number?: string;
  rfid_uid?: string; // Made optional to match backend response
  rfid_card_id?: number;
  device_id?: string;
  access_granted: boolean;
  accessed_at: string;
  denial_reason?: string;
  reason?: string; // ADDED - Backend uses 'reason' field
  entry_method?: 'rfid' | 'manual' | 'mobile' | 'emergency';
  location?: string;
  ip_address?: string;
  user_agent?: string;
  // Relationship fields that backend might include
  room?: {
    id: number;
    room_number: string;
    name?: string;
  };
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface AccessStats {
  today_count: number;
  week_count: number;
  month_count: number;
  total_count: number;
  success_rate: number;
  granted_count: number;
  denied_count: number;
  last_access?: { // ADDED - Backend includes this structure
    date: string;
    device_id?: string;
    room?: string | null;
  } | null;
  most_used_device?: string | null; // ADDED - Backend includes this
  peak_hour: number; // ADDED - Backend includes this
  period?: string; // ADDED - Backend includes this
  trends?: { // ADDED - Backend includes trends
    daily: Array<{
      date: string;
      count: number;
      day_name: string;
    }>;
    weekly: Array<{
      week_start: string;
      week_end: string;
      count: number;
    }>;
    monthly: Array<{
      month: string;
      month_name: string;
      count: number;
    }>;
  };
  // Legacy fields for backward compatibility
  this_month?: number;
  last_month?: number;
  average_daily?: number;
  denial_count?: number;
  peak_hours?: {
    hour: number;
    count: number;
  }[];
  daily_pattern?: {
    date: string;
    count: number;
  }[];
  method_distribution?: {
    rfid: number;
    manual: number;
    mobile: number;
    emergency: number;
  };
}

export interface AccessFilters {
  // Pagination
  page?: number;
  per_page?: number; // ADDED - Backend expects per_page
  limit?: number; // Keep for frontend compatibility
  
  // Date filters
  date_from?: string;
  date_to?: string;
  
  // Status filters
  access_granted?: boolean | 'all';
  entry_method?: string | 'all';
  
  // Search filters
  room_number?: string;
  device_id?: string;
  
  // Sorting
  sort_by?: 'accessed_at' | 'room_number' | 'access_granted';
  sort_order?: 'asc' | 'desc';
  
  // Additional filters that backend might support
  user_id?: number;
  room_id?: number;
  start_date?: string; // Alternative naming
  end_date?: string; // Alternative naming
  status?: string; // Generic status filter
}

export interface AccessPattern {
  day_of_week: number;
  hour_of_day: number;
  average_count: number;
  peak_times: string[];
  // Additional fields from backend
  most_active_days?: Array<{
    day_name: string;
    count: number;
  }>;
  most_active_hours?: Array<{
    hour: number;
    count: number;
  }>;
  access_frequency?: {
    daily_average: number;
    weekly_average: number;
    monthly_average: number;
  };
}

export interface AccessSummary {
  // FIXED - Backend uses these field names
  total_attempts?: number; // ADDED - Backend includes this
  total_accesses: number;
  successful_accesses: number;
  successful_access?: number; // Alternative naming from backend
  denied_accesses: number;
  denied_access?: number; // Alternative naming from backend
  success_rate: number;
  unique_days: number;
  most_active_day: string;
  peak_day?: string; // Alternative naming from backend
  most_active_hour: number;
  peak_hour?: number; // Alternative naming from backend
  access_frequency: 'very_high' | 'high' | 'normal' | 'low' | 'very_low';
  devices_used?: string[]; // ADDED - Backend might include this
  daily_breakdown?: Array<{
    date: string;
    count: number;
  }>; // ADDED - Backend might include this
}

export interface DenialReason {
  code: string;
  message: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
}

// Response interfaces to match backend structure
export interface AccessHistoryResponse {
  logs: AccessLog[];
  total: number;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  from?: number;
  to?: number;
}

export interface AccessStatsResponse {
  success: boolean;
  data: AccessStats;
  message?: string;
}

export interface AccessPatternsResponse {
  success: boolean;
  data: AccessPattern | {
    most_active_days: Array<{
      day_name: string;
      count: number;
    }>;
    most_active_hours: Array<{
      hour: number;
      count: number;
    }>;
    access_frequency: {
      daily_average: number;
      weekly_average: number;
      monthly_average: number;
    };
  };
  message?: string;
}

// Utility functions
export const getAccessStatusColor = (granted: boolean): string => {
  return granted 
    ? 'text-green-600 bg-green-100 border-green-200'
    : 'text-red-600 bg-red-100 border-red-200';
};

// Updated to Indonesian language
export const getAccessStatusLabel = (granted: boolean): string => {
  return granted ? 'Diizinkan' : 'Ditolak';
};

export const getAccessMethodLabel = (method: string): string => {
  switch (method) {
    case 'rfid':
      return 'Kartu RFID';
    case 'manual':
      return 'Entri Manual';
    case 'mobile':
      return 'Aplikasi Mobile';
    case 'emergency':
      return 'Akses Darurat';
    default:
      return 'Tidak Diketahui';
  }
};

export const getAccessMethodIcon = (method: string): string => {
  switch (method) {
    case 'rfid':
      return 'CreditCard';
    case 'manual':
      return 'Key';
    case 'mobile':
      return 'Smartphone';
    case 'emergency':
      return 'AlertTriangle';
    default:
      return 'Lock';
  }
};

// Type guards for runtime type checking
export const isAccessLog = (obj: any): obj is AccessLog => {
  return obj && 
    typeof obj.id === 'number' &&
    typeof obj.user_id === 'number' &&
    typeof obj.access_granted === 'boolean' &&
    typeof obj.accessed_at === 'string';
};

export const isAccessStats = (obj: any): obj is AccessStats => {
  return obj &&
    typeof obj.today_count === 'number' &&
    typeof obj.week_count === 'number' &&
    typeof obj.month_count === 'number' &&
    typeof obj.total_count === 'number';
};