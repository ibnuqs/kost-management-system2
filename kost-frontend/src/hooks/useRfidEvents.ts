// File: src/hooks/useRfidEvents.ts
import { useState, useEffect, useCallback } from 'react';
import { mqttService, MqttConnectionStatus } from '../services/mqttService';
import { parseTimestamp } from '../utils/dateUtils';

interface RfidEvent {
  id: string;
  uid: string;
  device_id: string;
  timestamp: number;
  user_name?: string;
  room_number?: string;
  access_granted?: boolean;
  message?: string;
  // Add other fields that might come from MQTT
  type?: 'access_log' | 'device_status';
  payload?: any;
}

interface DeviceStatus {
  device_id: string;
  status: 'online' | 'offline';
  last_seen: Date;
  // Add other relevant device status fields
  wifi_connected?: boolean;
  mqtt_connected?: boolean;
  firmware_version?: string;
  uptime?: string;
}

export const useRfidEvents = () => {
  const [recentScans, setRecentScans] = useState<RfidEvent[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<Map<string, DeviceStatus>>(new Map());
  const [isConnected, setIsConnected] = useState(mqttService.getConnectionStatus().connected);
  const [connectionStatus, setConnectionStatus] = useState<MqttConnectionStatus>(mqttService.getConnectionStatus());

  // Callback for MQTT message handling
  const handleMqttMessage = useCallback((topic: string, message: string) => {
    console.log(`📨 MQTT message on ${topic}:`, message.substring(0, 200));
    
    try {
      const parsedMessage = JSON.parse(message);

      if (topic === 'rfid/tags' || topic === 'rfid/access_log') {
        // Handle ESP32 RFID scans and access logs
        const newScan: RfidEvent = {
          id: parsedMessage.id || `rfid-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          uid: parsedMessage.uid || parsedMessage.rfid_uid || 'N/A',
          device_id: parsedMessage.device_id || 'Unknown Device',
          timestamp: parsedMessage.timestamp || Date.now(),
          user_name: parsedMessage.user_name || parsedMessage.user?.name || 'Unknown User',
          room_number: parsedMessage.room_number || parsedMessage.room?.room_number || 'N/A',
          access_granted: parsedMessage.access_granted !== undefined ? parsedMessage.access_granted : null,
          message: parsedMessage.message || parsedMessage.reason || (topic === 'rfid/tags' ? 'RFID tag detected' : 'Access log'),
          type: 'access_log',
          payload: parsedMessage,
        };
        
        console.log('✨ Adding new RFID scan to state:', newScan);
        setRecentScans((prevScans) => [newScan, ...prevScans.slice(0, 49)]); // Keep last 50
        
      } else if (topic === 'rfid/status' || topic.startsWith('kost_system/')) {
        // Handle device status updates
        const deviceId = parsedMessage.device_id || topic.split('/')[1]; // Extract from topic if needed
        
        // Handle different timestamp formats from MQTT messages using utility function
        let lastSeenDate: Date;
        if (parsedMessage.timestamp) {
          // parseTimestamp now always returns a Date (current time for invalid timestamps)
          lastSeenDate = parseTimestamp(parsedMessage.timestamp);
        } else {
          // Fallback to current time if no timestamp provided
          lastSeenDate = new Date();
        }

        const newStatus: DeviceStatus = {
          device_id: deviceId,
          status: parsedMessage.mqtt_connected !== false ? 'online' : 'offline',
          last_seen: lastSeenDate,
          wifi_connected: parsedMessage.wifi_connected,
          mqtt_connected: parsedMessage.mqtt_connected,
          firmware_version: parsedMessage.firmware_version,
          uptime: parsedMessage.uptime,
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Updating device status:', {
            device_id: deviceId,
            status: newStatus.status,
            last_seen: newStatus.last_seen,
            last_seen_type: typeof newStatus.last_seen,
            timestamp_input: parsedMessage.timestamp,
            wifi_connected: newStatus.wifi_connected,
            mqtt_connected: newStatus.mqtt_connected
          });
        }
        setDeviceStatuses((prevStatuses) => {
          const newMap = new Map(prevStatuses);
          newMap.set(newStatus.device_id, newStatus);
          return newMap;
        });
      }
    } catch (error) {
      console.error('❌ Error parsing MQTT message:', error);
      console.error('📄 Raw message:', message);
    }
  }, []);

  // Callback for MQTT connection status changes
  const handleConnectionStatusChange = useCallback((status: MqttConnectionStatus) => {
    setIsConnected(status.connected);
    setConnectionStatus(status);
  }, []);

  useEffect(() => {
    console.log('🔌 Setting up MQTT subscriptions...');
    
    // Subscribe to relevant MQTT topics - update to match backend
    mqttService.subscribe('rfid/tags', handleMqttMessage);           // ESP32 scans
    mqttService.subscribe('rfid/access_log', handleMqttMessage);     // Access logs
    mqttService.subscribe('rfid/status', handleMqttMessage);         // Device status
    mqttService.subscribe('kost_system/+/status', handleMqttMessage); // IoT device status
    mqttService.onConnectionStatusChange(handleConnectionStatusChange);

    console.log('✅ Subscribed to MQTT topics: rfid/tags, rfid/access_log, rfid/status, kost_system/+/status');

    // Initial connection attempt if not already connected
    if (!mqttService.getConnectionStatus().connected && !mqttService.getConnectionStatus().connecting) {
      console.log('🔗 Attempting MQTT connection...');
      mqttService.connect();
    }

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up MQTT subscriptions...');
      mqttService.unsubscribe('rfid/tags', handleMqttMessage);
      mqttService.unsubscribe('rfid/access_log', handleMqttMessage);
      mqttService.unsubscribe('rfid/status', handleMqttMessage);
      mqttService.unsubscribe('kost_system/+/status', handleMqttMessage);
      mqttService.removeConnectionStatusCallback(handleConnectionStatusChange);
    };
  }, [handleMqttMessage, handleConnectionStatusChange]);

  return {
    recentScans,
    deviceStatuses,
    isConnected,
    connectionStatus,
  };
};