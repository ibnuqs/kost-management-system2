// File: src/pages/Admin/components/feature/rfid/RfidRealTimeMonitor.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { StatusBadge } from '../../ui/Status/StatusBadge';
import mqtt from 'mqtt';

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
  uptime?: string;  // ESP32 sends "1h 30m" format  
  firmware_version?: string;
  last_seen: Date;
}

interface MqttConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export const RfidRealTimeMonitor: React.FC = () => {
  const [recentScans, setRecentScans] = useState<RfidScanEvent[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<Map<string, DeviceStatus>>(new Map());
  const [mqttStatus, setMqttStatus] = useState<MqttConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0
  });
  
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // MQTT connection setup
  useEffect(() => {
    // Always try to connect (use fallback values if env vars not set)
    connectToMqtt();
    
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connectToMqtt = () => {
    if (mqttStatus.connecting || mqttStatus.connected) return;
    
    setMqttStatus(prev => ({ ...prev, connecting: true, error: null }));

    try {
      // Use environment variables for MQTT connection (adjust for WebSocket over SSL)
      const host = import.meta.env.VITE_HIVEMQ_HOST || '16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud';
      const port = import.meta.env.VITE_HIVEMQ_PORT || '8884';
      const brokerUrl = `wss://${host}:${port}/mqtt`;
      
      const options: mqtt.IClientOptions = {
        clientId: `kost_frontend_${Math.random().toString(16).substr(2, 8)}`,
        username: import.meta.env.VITE_HIVEMQ_USERNAME || 'hivemq.webclient.1745310839638',
        password: import.meta.env.VITE_HIVEMQ_PASSWORD || 'UXNM#Agehw3B8!4;>6tz',
        keepalive: 60,
        reconnectPeriod: 0, // Disable auto-reconnect, we'll handle it manually
        clean: true,
      };

      const client = mqtt.connect(brokerUrl, options);
      mqttClientRef.current = client;

      client.on('connect', () => {
        console.log('🔗 Connected to MQTT broker');
        setMqttStatus({
          connected: true,
          connecting: false,
          error: null,
          reconnectAttempts: 0
        });

        // Subscribe to ESP32 topics
        const topics = [
          'rfid/tags',      // RFID scan events from ESP32
          'rfid/status',    // ESP32 device status updates
          'rfid/command',   // Responses to ESP32
          'kost_system/status' // System status
        ];

        topics.forEach(topic => {
          client.subscribe(topic, (err) => {
            if (err) {
              console.error(`❌ Failed to subscribe to ${topic}:`, err);
            } else {
              console.log(`✅ Subscribed to ${topic}`);
            }
          });
        });
      });

      client.on('message', (topic, message) => {
        handleMqttMessage(topic, message.toString());
      });

      client.on('error', (error) => {
        console.error('❌ MQTT connection error:', error);
        setMqttStatus(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false,
          error: error.message 
        }));
        scheduleReconnect();
      });

      client.on('close', () => {
        console.log('🔌 MQTT connection closed');
        setMqttStatus(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false 
        }));
        scheduleReconnect();
      });

      client.on('offline', () => {
        console.log('📵 MQTT client offline');
        setMqttStatus(prev => ({ 
          ...prev, 
          connected: false 
        }));
      });

    } catch (error) {
      console.error('❌ Failed to create MQTT client:', error);
      setMqttStatus(prev => ({ 
        ...prev, 
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (mqttStatus.reconnectAttempts >= maxReconnectAttempts) {
      console.log('🛑 Max reconnection attempts reached');
      return;
    }

    setMqttStatus(prev => ({ 
      ...prev, 
      reconnectAttempts: prev.reconnectAttempts + 1 
    }));

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`🔄 Attempting to reconnect (${mqttStatus.reconnectAttempts + 1}/${maxReconnectAttempts})`);
      connectToMqtt();
    }, reconnectDelay);
  };

  const handleMqttMessage = (topic: string, message: string) => {
    try {
      const data = JSON.parse(message);
      
      switch (topic) {
        case 'rfid/tags':
          handleRfidScan(data);
          break;
        case 'rfid/status':
          handleDeviceStatus(data);
          break;
        case 'rfid/command':
          handleRfidResponse(data);
          break;
        case 'kost_system/status':
          handleSystemStatus(data);
          break;
        default:
          console.log(`📨 Message from ${topic}:`, data);
      }
    } catch (error) {
      console.error(`❌ Failed to parse message from ${topic}:`, error);
    }
  };

  const handleRfidScan = (data: any) => {
    const scanEvent: RfidScanEvent = {
      uid: data.uid,
      device_id: data.device_id || 'ESP32-RFID-01',
      signal_strength: data.signal_strength,
      timestamp: data.timestamp || Date.now(),
    };

    setRecentScans(prev => [scanEvent, ...prev.slice(0, 9)]); // Keep last 10 scans
    console.log('📱 RFID scan detected:', scanEvent);
  };

  const handleRfidResponse = (data: any) => {
    // Update the recent scan with response data
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
    console.log('📤 RFID response received:', data);
  };

  const handleDeviceStatus = (data: any) => {
    // Handle ESP32 status format based on actual ESP32 capabilities
    const status: DeviceStatus = {
      device_id: data.device_id || 'ESP32-RFID-01',
      wifi_connected: data.wifi_connected !== undefined ? data.wifi_connected : true,
      mqtt_connected: data.mqtt_connected !== undefined ? data.mqtt_connected : true,
      rfid_ready: data.rfid_ready !== undefined ? data.rfid_ready : true,
      device_ip: data.device_ip || '192.168.1.100',
      uptime: data.uptime || '0h 0m',  // ESP32 sends as string
      firmware_version: data.firmware_version || 'v1.0.0',
      last_seen: new Date()
    };

    setDeviceStatuses(prev => new Map(prev.set(status.device_id, status)));
    console.log('📊 ESP32 status update:', status);
  };

  const handleSystemStatus = (data: any) => {
    console.log('🏠 System status:', data);
  };

  // formatUptime removed - ESP32 sends uptime as string directly

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* MQTT Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">MQTT Connection Status</h3>
            <StatusBadge 
              status={mqttStatus.connected ? 'Connected' : 'Disconnected'}
              variant={mqttStatus.connected ? 'success' : 'error'}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Status:</span>
              <div className="font-medium">
                {mqttStatus.connecting ? 'Connecting...' : 
                 mqttStatus.connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Reconnect Attempts:</span>
              <div className="font-medium">{mqttStatus.reconnectAttempts}</div>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-500">Error:</span>
              <div className="font-medium text-red-600">
                {mqttStatus.error || 'None'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ESP32 Device Status */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">ESP32 Device Status</h3>
        </CardHeader>
        <CardContent>
          {deviceStatuses.size === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📡</div>
              <div>No ESP32 devices detected</div>
              <div className="text-sm">Waiting for device status updates...</div>
            </div>
          ) : (
            <div className="grid gap-4">
              {Array.from(deviceStatuses.values()).map(device => (
                <div key={device.device_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{device.device_id}</h4>
                    <div className="flex gap-2">
                      <StatusBadge 
                        status="WiFi"
                        variant={device.wifi_connected ? 'success' : 'error'}
                      />
                      <StatusBadge 
                        status="MQTT"
                        variant={device.mqtt_connected ? 'success' : 'error'}
                      />
                      <StatusBadge 
                        status="RFID"
                        variant={device.rfid_ready ? 'success' : 'error'}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">IP Address:</span>
                      <div className="font-medium">{device.device_ip || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Uptime:</span>
                      <div className="font-medium">
                        {device.uptime || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Firmware:</span>
                      <div className="font-medium">{device.firmware_version || 'N/A'}</div>
                    </div>
                    {/* Free Heap removed - ESP32 doesn't provide this */}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Last seen: {device.last_seen.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent RFID Scans */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent RFID Scans</h3>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💳</div>
              <div>No recent RFID scans</div>
              <div className="text-sm">Scan an RFID card to see activity here</div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div key={`${scan.uid}-${scan.timestamp}`} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">💳</div>
                      <div>
                        <div className="font-medium">UID: {scan.uid}</div>
                        <div className="text-sm text-gray-500">
                          {scan.device_id} • {formatTimestamp(scan.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    {scan.response && (
                      <StatusBadge 
                        status={scan.response.access_granted ? 'Granted' : 'Denied'}
                        variant={scan.response.access_granted ? 'success' : 'error'}
                      />
                    )}
                  </div>
                  
                  {scan.response && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">User:</span>
                          <div className="font-medium">{scan.response.user}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div className="font-medium">{scan.response.status}</div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-500">Message:</span>
                        <div className="font-medium">{scan.response.message}</div>
                      </div>
                    </div>
                  )}
                  
                  {scan.signal_strength && (
                    <div className="mt-2 text-xs text-gray-500">
                      Signal Strength: {scan.signal_strength} dBm
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};