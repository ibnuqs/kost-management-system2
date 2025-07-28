// File: src/pages/Admin/types/tenant.ts
import type { BaseEntity, User } from './common';
import type { Room } from './room';

export interface Tenant extends BaseEntity {
  user_id: number;
  room_id: number;
  tenant_code?: string; // ✅ TAMBAH: Tenant code
  monthly_rent: number; // Converted to number for calculations
  start_date: string;
  end_date?: string; // ✅ TAMBAH: End date for moved out tenants
  status: 'active' | 'moved_out' | 'suspended';
  
  // Calculated fields from API
  days_as_tenant?: number;
  total_overdue_amount?: number;
  total_pending_amount?: number;
  collection_rate?: number;
  
  // Relations
  user: User;
  room: Room;
  payments?: Payment[]; // For detail view
}

export interface Payment {
  id: number;
  tenant_id: number;
  amount: string;
  payment_month: string;
  status: 'paid' | 'pending' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TenantStats {
  total: number;
  active: number;
  moved_out: number;
  suspended?: number; // Added from API
  overdue_count: number;
  total_monthly_rent: number;
  average_rent: number;
  occupancy_rate?: number; // Added from API
}

export interface TenantFormData {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
  room_id: string;
  tenant_code?: string; // ✅ TAMBAH: Optional tenant code
  monthly_rent: string;
  start_date: string;
  status?: 'active' | 'moved_out' | 'suspended';
}

export interface TenantFilters {
  search?: string;
  status?: string;
  room_id?: string;
  overdue_only?: boolean;
  start_date_from?: string; // Added from API
  start_date_to?: string; // Added from API
  sort_by?: 'created_at' | 'start_date' | 'monthly_rent' | 'status';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  _t?: number; // timestamp for force refresh
}

export interface MoveOutData {
  move_out_date: string;
  reason: string; // ✅ UBAH: Required string (not optional) for type safety
}

export interface TenantResponse {
  success: boolean;
  data: Tenant;
  message?: string;
}

export interface TenantsResponse {
  success: boolean;
  data: {
    data: Tenant[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
  summary?: TenantStats;
  message?: string;
}

export interface TenantDetailResponse {
  success: boolean;
  data: Tenant;
  stats: {
    total_payments_made: number;
    total_amount_paid: number;
    pending_payments: number;
    overdue_payments: number;
    days_as_tenant: number;
    last_payment_date?: string;
    next_payment_due: string;
  };
  message?: string;
}

export interface DashboardData {
  overview: {
    total_tenants: number;
    active_tenants: number;
    moved_out_tenants: number;
    suspended_tenants: number;
  };
  financial: {
    total_monthly_rent: number;
    current_month_collected: number;
    current_month_pending: number;
    overdue_amount: number;
  };
  recent_activities: {
    new_tenants_this_month: number;
    payments_this_month: number;
  };
  top_stats: {
    occupancy_rate: number;
    average_rent: number;
    longest_tenant_days: number;
    collection_rate: number;
  };
}