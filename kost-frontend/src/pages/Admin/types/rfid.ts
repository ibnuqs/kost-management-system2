// File: src/pages/Admin/types/rfid.ts
import type { BaseEntity, User, Room } from './common';

export interface RfidCard extends BaseEntity {
  uid: string;
  status: 'active' | 'inactive';
  user_id?: number | null;
  tenant_id?: number | null;
  device_id?: string | null;
  card_type: 'primary' | 'backup' | 'temporary';
  access_type?: 'room_only' | 'building' | 'master';
  expires_at?: string;
  user?: User;
  room?: Room;
  tenant?: {
    id: number;
    tenant_code: string;
    room?: Room;
  };
  last_used_at?: string;
  access_count?: number;
}

export interface RfidStats {
  total_cards: number;
  active_cards: number;
  assigned_cards: number;
  unassigned_cards: number;
}

export interface RfidFormData {
  uid: string;
  tenant_id?: number;
  user_id?: number;
  room_id?: number;
  device_id?: string;
  card_type: 'primary' | 'backup' | 'temporary';
  status?: 'active' | 'inactive';
  access_type?: 'room_only' | 'building' | 'master';
}

export interface RfidAssignmentData {
  tenant_id?: number | null;
  card_type?: 'primary' | 'backup' | 'temporary';
}

export interface RfidFilters {
  search?: string;
  status?: string;
  assigned?: boolean;
  user_id?: number;
  room_id?: number;
  page?: number;
  per_page?: number;
}

export interface RfidCardsResponse {
  success: boolean;
  data: RfidCard[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}

export interface RfidCardResponse {
  success: boolean;
  data: RfidCard;
  message?: string;
}

export interface RfidScanData {
  uid: string;
  room_id?: number;
  timestamp?: string;
}

export interface DoorControlData {
  device_id: string;
  room_id?: number;
  action: 'open_door' | 'close_door';
  timestamp?: number;
  reason?: string;
  admin_user?: string;
}

export interface AdminDoorControlRequest {
  room_id: number;
  action: 'open_door' | 'close_door';
  reason?: string;
}

export interface RfidScanEvent {
  uid: string;
  device_id: string;
  room_id?: number;
  timestamp: number;
  signal_strength?: number;
  access_granted?: boolean;
  user_name?: string;
  message?: string;
}
