// File: src/pages/Tenant/types/device.ts
import { BaseEntity } from './common';

export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'error';
export type DeviceType = 'door_lock' | 'sensor' | 'camera' | 'thermostat' | 'light' | 'speaker' | 'other';

export interface Device extends BaseEntity {
  device_id: string;
  device_name: string;
  device_type: DeviceType;
  room_id: number;
  room_number?: string;
  status: DeviceStatus;
  last_seen?: string;
  battery_level?: number;
  signal_strength?: number;
  firmware_version?: string;
  model?: string;
  manufacturer?: string;
  ip_address?: string;
  mac_address?: string;
  location_description?: string;
  configuration?: Record<string, unknown>;
  capabilities?: string[];
  error_message?: string;
  maintenance_notes?: string;
}

export interface DeviceStats {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  maintenance_devices: number;
  error_devices: number;
  battery_low_count: number;
  signal_weak_count: number;
  last_updated: string;
}

export interface DeviceLog extends BaseEntity {
  device_id: string;
  event_type: 'status_change' | 'error' | 'maintenance' | 'battery_low' | 'signal_weak';
  event_data: Record<string, unknown>;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: number;
}

export interface DeviceHealth {
  device_id: string;
  overall_health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  uptime_percentage: number;
  response_time: number;
  error_rate: number;
  last_maintenance: string;
  next_maintenance?: string;
  health_score: number;
  recommendations: string[];
}

export interface DeviceAlert {
  id: string;
  device_id: string;
  device_name: string;
  alert_type: 'offline' | 'battery_low' | 'error' | 'maintenance_due';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface DeviceControl {
  device_id: string;
  available_actions: string[];
  current_state: Record<string, unknown>;
  can_control: boolean;
  control_restrictions?: string[];
}

export const getDeviceStatusColor = (status: DeviceStatus): string => {
  switch (status) {
    case 'online':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'offline':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'maintenance':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'error':
      return 'text-red-600 bg-red-100 border-red-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

export const getDeviceStatusLabel = (status: DeviceStatus): string => {
  switch (status) {
    case 'online':
      return 'Online';
    case 'offline':
      return 'Offline';
    case 'maintenance':
      return 'Maintenance';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
};

export const getDeviceTypeLabel = (type: DeviceType): string => {
  switch (type) {
    case 'door_lock':
      return 'Door Lock';
    case 'sensor':
      return 'Sensor';
    case 'camera':
      return 'Camera';
    case 'thermostat':
      return 'Thermostat';
    case 'light':
      return 'Light';
    case 'speaker':
      return 'Speaker';
    case 'other':
      return 'Other Device';
    default:
      return 'Unknown Device';
  }
};

export const getDeviceTypeIcon = (type: DeviceType): string => {
  switch (type) {
    case 'door_lock':
      return 'Lock';
    case 'sensor':
      return 'Activity';
    case 'camera':
      return 'Camera';
    case 'thermostat':
      return 'Thermometer';
    case 'light':
      return 'Lightbulb';
    case 'speaker':
      return 'Volume2';
    case 'other':
      return 'Cpu';
    default:
      return 'HelpCircle';
  }
};

export const getBatteryLevelColor = (level?: number): string => {
  if (!level) return 'text-gray-400';
  if (level > 60) return 'text-green-600';
  if (level > 30) return 'text-yellow-600';
  return 'text-red-600';
};

export const getSignalStrengthColor = (strength?: number): string => {
  if (!strength) return 'text-gray-400';
  if (strength > 70) return 'text-green-600';
  if (strength > 40) return 'text-yellow-600';
  return 'text-red-600';
};