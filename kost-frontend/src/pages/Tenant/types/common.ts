// ===== UPDATED types/common.ts =====
// File: src/pages/Tenant/types/common.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface FilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DateRange {
  start_date?: string;
  end_date?: string;
}

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'tenant' | 'admin';
  email_verified_at?: string;
  profile_photo?: string;
  created_at: string;
  updated_at: string;
}

// Updated to match database schema
export interface Room {
  id: number;
  room_number: string;
  room_name: string;
  floor: number;
  room_type: string;
  monthly_price: number;
  status: 'available' | 'occupied' | 'maintenance' | 'archived';
  description?: string;
  created_at: string;
  updated_at: string;
}

// Updated to match database schema from tenants table
export interface TenantInfo {
  id: number;
  tenant_code?: string;
  user_id: number;
  room_id: number;
  room_number?: string;
  monthly_rent: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'moved_out' | 'suspended';
  created_at: string;
  updated_at: string;
  // Relations
  room?: Room;
  user?: User;
}

export type StatusType = 'success' | 'pending' | 'failed' | 'info' | 'warning';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
  badge?: number | string | null;
  description?: string;
}