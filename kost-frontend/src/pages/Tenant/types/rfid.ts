// File: src/pages/Tenant/types/rfid.ts
import { BaseEntity, Room } from './common';

// Updated to match database schema: active, inactive, lost, expired, suspended
export type RfidStatus = 'active' | 'inactive' | 'lost' | 'expired' | 'suspended';

// Updated to match database schema from rfid_cards table
export interface RfidCard extends BaseEntity {
  uid: string;
  tenant_id: number;
  status: RfidStatus;
  assigned_at?: string;
  last_used_at?: string;
  device_id?: string;
  // Legacy fields removed - not in database
  // room_id, room_number, deactivated_at, expiry_date, card_type, access_level, notes
  // Relations
  tenant?: {
    id: number;
    room?: Room;
  };
}

export interface RfidCardRequest extends BaseEntity {
  tenant_id: number;
  request_type: 'new' | 'replacement' | 'additional';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  processed_at?: string;
  processed_by?: number;
  rejection_reason?: string;
  notes?: string;
}

export interface RfidCardReport extends BaseEntity {
  rfid_card_id: number;
  tenant_id: number;
  report_type: 'lost' | 'stolen' | 'damaged' | 'not_working';
  reason: string;
  status: 'pending' | 'processed' | 'completed';
  reported_at: string;
  processed_at?: string;
  processed_by?: number;
  notes?: string;
  card?: RfidCard;
}

export interface RfidStats {
  total_cards: number;
  active_cards: number;
  inactive_cards: number;
  lost_cards: number;
  expired_cards: number;
  pending_requests: number;
  pending_reports: number;
  last_used: string;
  usage_frequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
}

export interface CardUsageStats {
  daily_usage: {
    date: string;
    count: number;
  }[];
  hourly_pattern: {
    hour: number;
    count: number;
  }[];
  location_usage: {
    location: string;
    count: number;
  }[];
  total_usages: number;
  last_30_days: number;
}

// Updated to include suspended status
export const getRfidStatusColor = (status: RfidStatus): string => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'inactive':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'lost':
    case 'expired':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'suspended':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

// Updated to Indonesian language and include suspended status
export const getRfidStatusLabel = (status: RfidStatus): string => {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'inactive':
      return 'Tidak Aktif';
    case 'lost':
      return 'Hilang';
    case 'expired':
      return 'Kedaluwarsa';
    case 'suspended':
      return 'Ditangguhkan';
    default:
      return 'Tidak Diketahui';
  }
};

// Updated to Indonesian language 
export const getRfidTypeLabel = (type: string): string => {
  switch (type) {
    case 'primary':
      return 'Kartu Utama';
    case 'backup':
      return 'Kartu Cadangan';
    case 'temporary':
      return 'Kartu Sementara';
    default:
      return 'Tipe Tidak Diketahui';
  }
};

export const getAccessLevelLabel = (level: string): string => {
  switch (level) {
    case 'room_only':
      return 'Hanya Kamar';
    case 'building':
      return 'Akses Gedung';
    case 'full':
      return 'Akses Penuh';
    default:
      return 'Level Tidak Diketahui';
  }
};