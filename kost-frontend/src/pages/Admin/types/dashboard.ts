// File: src/pages/Admin/types/dashboard.ts
export interface DashboardStats {
  // Room stats
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  maintenance_rooms: number;
  occupancy_percentage: number;
  
  // Finance stats
  monthly_revenue: number;
  yearly_revenue: number;
  pending_amount: number;
  overdue_amount: number;
  collection_rate: number;
  revenue_growth: number;
  
  // Tenant stats
  total_active_tenants: number;
  total_tenant_users: number;
  new_tenants_this_month: number;
  moved_out_this_month: number;
  
  // Payment stats
  pending_payments: number;
  overdue_payments: number;
  paid_this_month: number;
  total_payments_this_month: number;
  
  // RFID stats
  total_rfid_cards: number;
  active_rfid_cards: number;
  assigned_cards: number;
  unassigned_cards: number;
  
  // Access stats
  today_activities: number;
  total_access_week: number;
  total_access_all_time: number;
  unique_users_today: number;
  peak_hour: string;
  
  // Device stats
  online_devices: number;
  total_devices: number;
  device_uptime_percentage: number;
}

export interface ActivityItem {
  id: string | number;
  type: string;
  title: string;
  description: string;
  user?: {
    id: string | number;
    name: string;
    email?: string;
  };
  timestamp: string;
  icon: string;
  color: string;
  priority?: string;
}

export interface RevenueData {
  month: string;
  year?: string;
  revenue: number;
  payments?: number;
  avg_payment?: number;
}

