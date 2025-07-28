// File: src/pages/Tenant/types/dashboard.ts
import { User, Room } from './common';
import { Payment } from './payment';
import { RfidCard } from './rfid';
import { AccessLog, AccessStats } from './access';
import { Device } from './device';
import { Notification } from './notification';

export interface TenantInfo {
  id: number;
  tenant_code?: string;
  user_id: number;
  room_id: number;
  monthly_rent: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'moved_out' | 'suspended';
  created_at: string;
  updated_at: string;
  room?: {
    id: number;
    room_number: string;
    room_name: string;
    monthly_price: number;
    status: 'available' | 'occupied' | 'maintenance' | 'archived';
  };
}

export interface PaymentInfo {
  current: Payment | null;
  next: Payment | null;
  recent: Payment[];
  overdue: Payment[];
  total_unpaid: number;
  payment_history_summary: {
    total_payments: number;
    total_paid: number;
    success_rate: number;
  };
}

export interface QuickStats {
  days_since_move_in: number;
  total_payments_made: number;
  total_amount_paid: number;
  current_streak: number;
  access_count_today: number;
  access_count_week: number;
  access_count_month: number;
  devices_online: number;
  devices_total: number;
  unread_notifications: number;
}

// ✅ FIXED: Flexible types for loading states
export interface DashboardData {
  user: User | null;              // ✅ Allow null for loading
  tenant_info: TenantInfo | null; // ✅ Allow null for loading
  payment_info: PaymentInfo;      // ✅ Always has structure
  access_stats: AccessStats | null; // ✅ Allow null for loading
  rfid_cards: RfidCard[];
  room_devices: Device[];
  notifications: Notification[];
  quick_stats: QuickStats;
  last_updated: string;
}

// ✅ NEW: Loaded state - when all data is available
export interface LoadedDashboardData {
  user: User;              // ✅ Guaranteed to exist
  tenant_info: TenantInfo; // ✅ Guaranteed to exist
  payment_info: PaymentInfo;
  access_stats: AccessStats; // ✅ Guaranteed to exist
  rfid_cards: RfidCard[];
  room_devices: Device[];
  notifications: Notification[];
  quick_stats: QuickStats;
  last_updated: string;
}

// ✅ NEW: Type guards for better type safety
export const isDashboardDataLoaded = (data: DashboardData): data is LoadedDashboardData => {
  return !!(data.user && data.tenant_info && data.access_stats);
};

export const isUserDataAvailable = (data: DashboardData): data is DashboardData & { user: User } => {
  return !!data.user;
};

export const isTenantInfoAvailable = (data: DashboardData): data is DashboardData & { tenant_info: TenantInfo } => {
  return !!data.tenant_info;
};

export const isAccessStatsAvailable = (data: DashboardData): data is DashboardData & { access_stats: AccessStats } => {
  return !!data.access_stats;
};

export interface DashboardStats {
  today: {
    access_count: number;
    payments_due: number;
    notifications: number;
  };
  week: {
    access_count: number;
    payments_made: number;
    device_issues: number;
  };
  month: {
    access_count: number;
    rent_paid: boolean;
    total_amount: number;
  };
  overall: {
    tenancy_days: number;
    total_payments: number;
    success_rate: number;
    active_cards: number;
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'list' | 'table' | 'info';
  size: 'small' | 'medium' | 'large' | 'full';
  priority: number;
  visible: boolean;
  data?: any;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number;
  mobile_columns: number;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'access' | 'rfid' | 'device' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  icon?: string;
  data?: any;
}

export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  services: {
    payment_gateway: 'online' | 'offline' | 'degraded';
    access_control: 'online' | 'offline' | 'degraded';
    notifications: 'online' | 'offline' | 'degraded';
  };
  last_check: string;
}