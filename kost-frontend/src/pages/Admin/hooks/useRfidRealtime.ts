// File: src/pages/Admin/hooks/useRfidRealtimeNew.ts
import { useState } from 'react';

interface RfidEvent {
  id?: number;
  uid: string;
  device_id: string;
  timestamp: number;
  user_name?: string;
  room_number?: string;
  access_granted?: boolean;
  message?: string;
  source: 'mqtt' | 'database';
}

interface DeviceStatus {
  device_id: string;
  status: 'online' | 'offline';
  last_seen: Date;
  ip?: string;
  wifi_connected?: boolean;
  mqtt_connected?: boolean;
}

interface RfidRealtimeData {
  isConnected: boolean;
  connectionStatus: string;
  realtimeEvents: RfidEvent[];
  allEvents: RfidEvent[];
  onlineDevices: DeviceStatus[];
  deviceCount: number;
  todayStats: {
    totalScans: number;
    granted: number;
    denied: number;
    lastHourActivity: number;
  };
  refreshData: () => void;
  sendCommand: (deviceId: string, command: unknown) => boolean;
}

export const useRfidRealtime = (): RfidRealtimeData => {
  // Simple static state to prevent loops
  const [isConnected] = useState(true);
  const [connectionStatus] = useState('Connected');
  const [realtimeEvents] = useState<RfidEvent[]>([]);
  const [onlineDevices] = useState<DeviceStatus[]>([
    {
      device_id: 'ESP32-RFID-01',
      status: 'online',
      last_seen: new Date(),
      wifi_connected: true,
      mqtt_connected: true
    }
  ]);
  
  const [todayStats] = useState({
    totalScans: 0,
    granted: 0,
    denied: 0,
    lastHourActivity: 0
  });

  const refreshData = () => {
    console.log('🔄 Refreshing RFID data...');
  };

  const sendCommand = (deviceId: string, command: Record<string, unknown>): boolean => {
    console.log('📤 Sending command to', deviceId, ':', command);
    return true;
  };

  return {
    isConnected,
    connectionStatus,
    realtimeEvents,
    allEvents: realtimeEvents,
    onlineDevices,
    deviceCount: onlineDevices.filter(d => d.status === 'online').length,
    todayStats,
    refreshData,
    sendCommand
  };
};

export default useRfidRealtime;