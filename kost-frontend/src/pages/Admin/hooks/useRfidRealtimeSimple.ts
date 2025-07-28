// File: src/pages/Admin/hooks/useRfidRealtimeSimple.ts
import { useState, useCallback } from 'react';

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
  // Connection status
  isConnected: boolean;
  connectionStatus: string;
  
  // Events data
  realtimeEvents: RfidEvent[];
  allEvents: RfidEvent[];
  
  // Device data
  onlineDevices: DeviceStatus[];
  deviceCount: number;
  
  // Statistics
  todayStats: {
    totalScans: number;
    granted: number;
    denied: number;
    lastHourActivity: number;
  };
  
  // Control functions
  refreshData: () => void;
  sendCommand: (deviceId: string, command: any) => boolean;
}

export const useRfidRealtimeSimple = (): RfidRealtimeData => {
  // Simple state without complex dependencies
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

  // Simple refresh function
  const refreshData = useCallback(() => {
    console.log('🔄 Refreshing RFID data...');
  }, []);

  const sendCommand = useCallback((deviceId: string, command: any): boolean => {
    console.log('📤 Sending command to', deviceId, ':', command);
    return true;
  }, []);

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

export default useRfidRealtimeSimple;