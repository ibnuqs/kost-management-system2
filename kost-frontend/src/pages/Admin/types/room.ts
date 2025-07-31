// File: src/pages/Admin/types/room.ts
import type { BaseEntity, User } from './common';

export interface RoomTenant {
  id: number;
  user_id: number;
  room_id: number;
  monthly_rent: string;
  start_date: string;
  status: string;
  user?: User;
  user_name?: string;
  name?: string;
  tenant_code?: string;
}

export interface ArchiveInfo {
  archived_at: string;
  archived_reason: string;
  archived_ago: string;
}

export interface ReservationInfo {
  reserved_at: string;
  reserved_until: string;
  reserved_by: number;
  reserved_reason: string;
  expires_in_minutes: number;
  is_expired: boolean;
}

export interface Room extends BaseEntity {
  room_number: string;
  room_name: string;
  monthly_price: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'archived';
  is_archived: boolean;
  archive_info?: ArchiveInfo;
  reservation_info?: ReservationInfo;
  can_be_archived: boolean;
  can_be_unarchived: boolean;
  tenant?: RoomTenant;
  tenant_name?: string;
  tenants_count?: number;
}

export interface RoomStats {
  total_rooms: number;
  active_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  reserved_rooms: number;
  maintenance_rooms: number;
  archived_rooms: number;
  occupancy_rate: number;
  average_monthly_price: number;
  total_revenue: number;
  price_range: {
    min: number;
    max: number;
  };
}

export interface RoomFormData {
  room_number: string;
  room_name: string;
  monthly_price: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
}

export interface RoomReservationData {
  reason?: string;
  hours?: number;
}

export interface TenantAssignmentEnhancedData extends TenantAssignmentData {
  expected_status?: string;
}

export interface TenantAssignmentData {
  user_id: string;
  monthly_rent: string;
  start_date: string;
}

// Room filters interface
export interface RoomFilters {
  search?: string;
  status?: string;
  room_type?: string;
  price_min?: number;
  price_max?: number;
  include_archived?: boolean;
  show_archived_only?: boolean;
  sort_by?: 'room_number' | 'price' | 'created_at' | 'archived_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Archive actions
export interface ArchiveRoomData {
  reason?: string;
}

// Room creation/update response
export interface RoomResponse {
  success: boolean;
  data: Room;
  message?: string;
}

// Rooms list response
export interface RoomsResponse {
  success: boolean;
  data: {
    data: Room[];
    summary?: RoomStats;
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
  message?: string;
}