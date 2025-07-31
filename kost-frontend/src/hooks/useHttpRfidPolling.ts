// File: src/hooks/useHttpRfidPolling.ts
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

interface RfidScanEvent {
  uid: string;
  device_id: string;
  signal_strength?: number;
  timestamp: number;
  response?: {
    status: string;
    user: string;
    message: string;
    access_granted: boolean;
  };
}

interface DeviceStatus {
  device_id: string;
  wifi_connected: boolean;
  mqtt_connected: boolean;
  rfid_ready: boolean;
  device_ip?: string;
  uptime?: string;
  firmware_version?: string;
  last_seen: Date;
}

export const useHttpRfidPolling = () => {
  const [recentScans, setRecentScans] = useState<RfidScanEvent[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<Map<string, DeviceStatus>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRecentScans = async () => {
    try {
      // Try to get recent access logs
      const response = await api.get('/admin/access-logs', {
        params: { per_page: 10, sort_by: 'accessed_at', sort_order: 'desc' }
      });

      if (response.data?.success && response.data?.data?.data) {
        const logs = response.data.data.data;
        const scans: RfidScanEvent[] = logs.map((log: any) => ({
          uid: log.rfid_uid || log.uid || 'UNKNOWN',
          device_id: log.device_id || 'ESP32-UNKNOWN',
          timestamp: new Date(log.accessed_at).getTime(),
          response: {
            status: log.access_granted ? 'granted' : 'denied',
            user: log.user?.name || 'Unknown User',
            message: log.reason || log.notes || (log.access_granted ? 'Access granted' : 'Access denied'),
            access_granted: log.access_granted
          }
        }));

        setRecentScans(scans);
        setIsConnected(true);
      }
    } catch (error) {
      console.warn('📡 HTTP polling: Failed to fetch recent scans', error);
      setIsConnected(false);
    }
  };

  const fetchDeviceStatuses = async () => {
    try {
      // Try to get IoT devices
      const response = await api.get('/admin/iot-devices');

      if (response.data?.success && response.data?.data) {
        const devices = response.data.data;
        const statusMap = new Map<string, DeviceStatus>();

        devices.forEach((device: any) => {
          statusMap.set(device.device_id || device.id, {
            device_id: device.device_id || device.id,
            wifi_connected: device.status === 'online' || device.wifi_connected !== false,
            mqtt_connected: device.status === 'online' || device.mqtt_connected !== false,
            rfid_ready: device.device_type === 'rfid_reader' || device.rfid_ready !== false,
            device_ip: device.device_ip || device.ip_address,
            uptime: device.uptime || 'Unknown',
            firmware_version: device.firmware_version || device.version || 'v1.0.0',
            last_seen: new Date(device.last_seen || device.updated_at || Date.now())
          });
        });

        setDeviceStatuses(statusMap);
        setIsConnected(true);
      }
    } catch (error) {
      console.warn('📡 HTTP polling: Failed to fetch device statuses', error);
      setIsConnected(false);
    }
  };

  const startPolling = () => {
    // Initial fetch
    fetchRecentScans();
    fetchDeviceStatuses();

    // Start polling every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchRecentScans();
      fetchDeviceStatuses();
    }, 5000);

    console.log('📡 HTTP polling started (5s interval)');
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    console.log('📡 HTTP polling stopped');
  };

  useEffect(() => {
    // Only start if MQTT is disabled
    if (import.meta.env.VITE_MQTT_ENABLED === 'false') {
      console.log('🔄 Starting HTTP polling as MQTT alternative');
      startPolling();
    } else {
      console.log('🔧 HTTP polling skipped - MQTT is enabled');
    }

    return () => {
      stopPolling();
    };
  }, []);

  return {
    recentScans,
    deviceStatuses,
    isConnected,
    refresh: () => {
      fetchRecentScans();
      fetchDeviceStatuses();
    }
  };
};