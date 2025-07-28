// File: src/pages/Admin/types/common.ts
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  tenant?: {
    id: number;
    room_id: number;
    room: {
      id: number;
      room_number: string;
      room_name: string;
    };
  };
}

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiListResponse<T> extends ApiResponse<{
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}> {
  summary?: any;
}

// Forward declaration for Room - this will be re-exported from room.ts
export interface Room {
  id: number;
  room_number: string;
  room_name: string;
  monthly_price: string;
  status: 'available' | 'occupied' | 'maintenance';
  created_at: string;
  updated_at: string;
}