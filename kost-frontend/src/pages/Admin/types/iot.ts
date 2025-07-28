// File: src/pages/Admin/types/iot.ts
import type { BaseEntity, Room } from './common';

export interface IoTDevice extends BaseEntity {
  device_id: string;
  device_name: string;
  device_type: 'door_lock' | 'card_scanner' | 'rfid_reader';
  device_type_label: string;
  room: Room | null;
  room_id?: number | null;
  status: 'online' | 'offline';
  status_label: string;
  last_seen?: string | null;
  last_seen_human: string;
  is_online: boolean;
}

export interface DeviceStats {
  total: number;
  online: number;
  offline: number;
  door_locks: number;
  card_scanners: number;
}

export interface DeviceFormData {
  device_id: string;
  device_name: string;
  device_type: 'door_lock' | 'card_scanner' | 'rfid_reader';
  room_id?: string;
  status: 'online' | 'offline';
}

export interface DeviceFilters {
  search?: string;
  status?: string;
  device_type?: string;
  room_id?: string;
  page?: number;
  per_page?: number;
}

export interface IoTStats {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  door_locks: number;
  card_scanners: number;
}

export interface IoTFilters {
  search?: string;
  status?: string;
  device_type?: string;
  room_id?: string;
  page?: number;
  per_page?: number;
}

export interface IoTFormData {
  device_id: string;
  device_name: string;
  device_type: 'door_lock' | 'card_scanner' | 'rfid_reader';
  room_id?: string;
  status: 'online' | 'offline';
}

export interface IoTDevicesResponse {
  success: boolean;
  data: IoTDevice[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}

export interface IoTDeviceResponse {
  success: boolean;
  data: IoTDevice;
  message?: string;
}