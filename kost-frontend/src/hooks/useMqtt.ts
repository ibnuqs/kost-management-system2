// File: src/hooks/useMqtt.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import mqttService, { MqttConnectionStatus, MqttMessageHandler } from '../services/mqttService';

// Define types to replace 'any'
type CommandPayload = Record<string, unknown>;

interface RfidScanEvent {
  uid: string;
  device_id: string;
  signal_strength?: number;
  timestamp: number;
  response?: {
    status: string;
    user?: string;
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
  uptime?: number;
  firmware_version?: string;
  free_heap?: number;
  last_seen: Date;
}


interface UseMqttOptions {
  autoConnect?: boolean;
  topics?: string[];
}

interface UseMqttReturn {
  connectionStatus: MqttConnectionStatus;
  isConnected: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  subscribe: (topic: string, handler: MqttMessageHandler) => void;
  unsubscribe: (topic: string, handler?: MqttMessageHandler) => void;
  publish: (topic: string, message: string, qos?: 0 | 1 | 2, retain?: boolean) => boolean;
  sendDeviceCommand: (deviceId: string, command: string, payload?: CommandPayload) => boolean;
  sendRfidResponse: (uid: string, response: CommandPayload) => boolean;
}

export const useMqtt = (options: UseMqttOptions = {}): UseMqttReturn => {
  const { autoConnect = true, topics = [] } = options;
  
  const [connectionStatus, setConnectionStatus] = useState<MqttConnectionStatus>(
    mqttService.getConnectionStatus()
  );
  
  const handlersRef = useRef<Map<string, MqttMessageHandler>>(new Map());

  // Update connection status when it changes
  useEffect(() => {
    const handleStatusChange = (status: MqttConnectionStatus) => {
      setConnectionStatus(status);
    };

    mqttService.onConnectionStatusChange(handleStatusChange);

    return () => {
      mqttService.removeConnectionStatusCallback(handleStatusChange);
    };
  }, []);

  const connect = useCallback(async (): Promise<boolean> => {
    return await mqttService.connect();
  }, []);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && !connectionStatus.connected && !connectionStatus.connecting) {
      connect();
    }
  }, [autoConnect, connectionStatus.connected, connectionStatus.connecting, connect]);

  // Auto-subscribe to topics when connected
  useEffect(() => {
    if (connectionStatus.connected && topics.length > 0) {
      topics.forEach(topic => {
        const handler = handlersRef.current.get(topic);
        if (handler) {
          mqttService.subscribe(topic, handler);
        }
      });
    }
  }, [connectionStatus.connected, topics]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    // This cleanup runs only on unmount. The ref's content is managed
    // by subscribe/unsubscribe, and this ensures all are cleaned up.
    // The linter warning is a false positive for this specific pattern.
    return () => {
      const currentHandlers = handlersRef.current;
      currentHandlers.forEach((handler, topic) => {
        mqttService.unsubscribe(topic, handler);
      });
      currentHandlers.clear();
    };
  }, []);



  const disconnect = useCallback((): void => {
    mqttService.disconnect();
  }, []);

  const subscribe = useCallback((topic: string, handler: MqttMessageHandler): void => {
    handlersRef.current.set(topic, handler);
    mqttService.subscribe(topic, handler);
  }, []);

  const unsubscribe = useCallback((topic: string, handler?: MqttMessageHandler): void => {
    if (handler) {
      mqttService.unsubscribe(topic, handler);
    } else {
      const storedHandler = handlersRef.current.get(topic);
      if (storedHandler) {
        mqttService.unsubscribe(topic, storedHandler);
        handlersRef.current.delete(topic);
      }
    }
  }, []);

  const publish = useCallback((
    topic: string, 
    message: string, 
    qos: 0 | 1 | 2 = 0, 
    retain: boolean = false
  ): boolean => {
    return mqttService.publish(topic, message, qos, retain);
  }, []);

  const sendDeviceCommand = useCallback((
    deviceId: string, 
    command: string, 
    payload?: CommandPayload
  ): boolean => {
    return mqttService.sendDeviceCommand(deviceId, command, payload);
  }, []);

  const sendRfidResponse = useCallback((uid: string, response: CommandPayload): boolean => {
    return mqttService.sendRfidResponse(uid, response);
  }, []);

  return {
    connectionStatus,
    isConnected: connectionStatus.connected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
    sendDeviceCommand,
    sendRfidResponse
  };
};

// Hook for specific RFID events
export const useRfidEvents = () => {
  const [recentScans, setRecentScans] = useState<RfidScanEvent[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<Map<string, DeviceStatus>>(new Map());
  
  const { subscribe, unsubscribe, sendRfidResponse, ...mqtt } = useMqtt({
    autoConnect: true,
    topics: ['rfid/tags', 'rfid/status', 'rfid/command']
  });

  useEffect(() => {
    // Handle RFID scan events
    const handleRfidScan = (_topic: string, message: string) => {
      try {
        const data = JSON.parse(message);
        const scanEvent: RfidScanEvent = {
          uid: data.uid,
          device_id: data.device_id || 'ESP32-RFID-01',
          signal_strength: data.signal_strength,
          timestamp: data.timestamp || Date.now(),
        };
        
        setRecentScans(prev => [scanEvent, ...prev.slice(0, 9)]);
      } catch (error) {
        console.error('Error parsing RFID scan:', error);
      }
    };

    // Handle device status updates
    const handleDeviceStatus = (_topic: string, message: string) => {
      try {
        const data = JSON.parse(message);
        const status: DeviceStatus = {
          device_id: data.device_id,
          wifi_connected: data.wifi_connected || false,
          mqtt_connected: data.mqtt_connected || false,
          rfid_ready: data.rfid_ready || false,
          device_ip: data.device_ip,
          uptime: data.uptime,
          firmware_version: data.firmware_version,
          free_heap: data.free_heap,
          last_seen: new Date()
        };
        
        setDeviceStatuses(prev => new Map(prev.set(data.device_id, status)));
      } catch (error) {
        console.error('Error parsing device status:', error);
      }
    };

    // Handle RFID responses
    const handleRfidResponse = (_topic: string, message: string) => {
      try {
        const data = JSON.parse(message);
        setRecentScans(prev => 
          prev.map(scan => 
            scan.uid === data.uid && !scan.response
              ? {
                  ...scan,
                  response: {
                    status: data.status,
                    user: data.user,
                    message: data.message,
                    access_granted: data.access_granted
                  }
                }
              : scan
          )
        );
      } catch (error) {
        console.error('Error parsing RFID response:', error);
      }
    };

    subscribe('rfid/tags', handleRfidScan);
    subscribe('rfid/status', handleDeviceStatus);
    subscribe('rfid/command', handleRfidResponse);

    return () => {
      unsubscribe('rfid/tags');
      unsubscribe('rfid/status');
      unsubscribe('rfid/command');
    };
  }, [subscribe, unsubscribe]);

  const sendResponse = useCallback((uid: string, response: CommandPayload) => {
    return sendRfidResponse(uid, response);
  }, [sendRfidResponse]);

  return {
    ...mqtt,
    recentScans,
    deviceStatuses,
    sendResponse
  };
};

// Hook for device management
export const useDeviceControl = () => {
  const mqtt = useMqtt({ autoConnect: true });

  const sendCommand = useCallback((deviceId: string, command: string, payload?: CommandPayload) => {
    return mqtt.sendDeviceCommand(deviceId, command, payload);
  }, [mqtt]);

  const restartDevice = useCallback((deviceId: string) => {
    return sendCommand(deviceId, 'restart');
  }, [sendCommand]);

  const pingDevice = useCallback((deviceId: string) => {
    return sendCommand(deviceId, 'ping');
  }, [sendCommand]);

  const testRfidScan = useCallback((deviceId: string) => {
    return sendCommand(deviceId, 'scan_rfid');
  }, [sendCommand]);

  const updateDeviceConfig = useCallback((deviceId: string, config: CommandPayload) => {
    return sendCommand(deviceId, 'update_config', config);
  }, [sendCommand]);

  return {
    ...mqtt,
    sendCommand,
    restartDevice,
    pingDevice,
    testRfidScan,
    updateDeviceConfig
  };
};

export default useMqtt;