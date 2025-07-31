// File: src/pages/Admin/components/feature/rfid/RfidRealTimeMonitor.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  // Handler functions
  const handleRfidScan = (data: Record<string, unknown>) => {
    const scanEvent: RfidScanEvent = {
      uid: data.uid,
      device_id: data.device_id || 'ESP32-RFID-01',
      signal_strength: data.signal_strength,
      timestamp: data.timestamp || Date.now(),
    };

    setRecentScans(prev => [scanEvent, ...prev.slice(0, 9)]); // Keep last 10 scans
    console.log('📱 RFID scan detected:', scanEvent);
  };

  const handleDeviceStatus = (data: Record<string, unknown>) => {
    const deviceId = (data.device_id as string) || 'ESP32-RFID-01';
    const status: DeviceStatus = {
      device_id: deviceId,
      wifi_connected: data.wifi_connected !== undefined ? data.wifi_connected as boolean : true,
      mqtt_connected: data.mqtt_connected !== undefined ? data.mqtt_connected as boolean : true,
      rfid_ready: data.rfid_ready !== undefined ? data.rfid_ready as boolean : true,
      device_ip: (data.device_ip as string) || '192.168.1.100',
      uptime: (data.uptime as string) || '0h 0m',
      firmware_version: (data.firmware_version as string) || 'v1.0.0',
      last_seen: new Date()
    };

    setDeviceStatuses(prev => new Map(prev.set(deviceId, status)));
    console.log('📊 ESP32 status update:', status);
  };

  const handleRfidResponse = (data: Record<string, unknown>) => {
    // Update the recent scan with response data
    setRecentScans(prev => 
      prev.map(scan => 
        scan.uid === data.uid 
          ? { ...scan, response: data }
          : scan
      )
    );
  };

  const handleSystemStatus = (data: Record<string, unknown>) => {
    console.log('🏠 System status update:', data);
    // Handle system-wide status updates
  };

  // Define all callback functions before useEffect
  const handleMqttMessage = useCallback((topic: string, message: string) => {
    try {
      const data = JSON.parse(message);
      console.log(`📨 MQTT message on ${topic}:`, data);

      if (topic === 'rfid/tags') {
        handleRfidScan(data);
      } else if (topic === 'rfid/status') {
        handleDeviceStatus(data);
      } else if (topic === 'rfid/command') {
        handleRfidResponse(data);
      } else if (topic === 'kost_system/status') {
        handleSystemStatus(data);
      }
    } catch (e) {
      console.error('Failed to parse MQTT message:', e);
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    setMqttStatus(prev => {
      if (prev.reconnectAttempts >= maxReconnectAttempts) {
        console.log('🛑 Max reconnection attempts reached');
        return prev;
      }

      const newAttempts = prev.reconnectAttempts + 1;
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`🔄 Attempting to reconnect (${newAttempts}/${maxReconnectAttempts})`);
        connectToMqtt();
      }, reconnectDelay);

      return { 
        ...prev, 
        reconnectAttempts: newAttempts 
      };
    });
  }, []);

  const connectToMqtt = useCallback(() => {
    if (mqttStatus.connecting || mqttStatus.connected) return;
    
    // Check if MQTT should be disabled due to previous failures
    if (mqttStatus.reconnectAttempts >= maxReconnectAttempts) {
      console.log('🔧 MQTT disabled - max reconnection attempts reached');
      setMqttStatus(prev => ({ 
        ...prev, 
        connecting: false,
        error: 'MQTT disabled - check credentials and restart app to retry' 
      }));
      return;
    }
    
    setMqttStatus(prev => ({ ...prev, connecting: true, error: null }));

    try {
      // Check if MQTT credentials are properly configured
      const host = import.meta.env.VITE_HIVEMQ_HOST;
      const port = import.meta.env.VITE_HIVEMQ_PORT || '8884';
      const username = import.meta.env.VITE_HIVEMQ_USERNAME;
      let password = import.meta.env.VITE_HIVEMQ_PASSWORD;
      
      // Handle different MQTT brokers
      if (host.includes('broker.emqx.io')) {
        console.log('🔧 Using public EMQX broker (no auth)');
        // Public broker - no credentials needed
      } else {
        // Ensure we have the complete password for HiveMQ
        if (username === 'hivemq.webclient.1745310839638') {
          password = 'UXNM#Agehw3B8!4;>6tz';
          console.log('🔧 Using complete HiveMQ password for RealTime Monitor');
        }
        
        // Remove quotes if they exist (Vite might include them)
        if (password && password.startsWith('"') && password.endsWith('"')) {
          password = password.slice(1, -1);
        }
        
        // Also handle single quotes
        if (password && password.startsWith("'") && password.endsWith("'")) {
          password = password.slice(1, -1);
        }
      }

      // Skip connection if credentials are not configured (except for public brokers)
      if (!host || 
          host === 'your_hivemq_host_here') {
        console.warn('🔧 MQTT host not properly configured - skipping connection');
        setMqttStatus(prev => ({ 
          ...prev, 
          connecting: false,
          error: 'MQTT host not configured in .env file' 
        }));
        return;
      }
      
      // For private brokers, check credentials
      if (!host.includes('broker.emqx.io') && (!username || !password || 
          username === 'your_mqtt_username_here' || 
          password === 'your_mqtt_password_here')) {
        console.warn('🔧 MQTT credentials not properly configured for private broker');
        setMqttStatus(prev => ({ 
          ...prev, 
          connecting: false,
          error: 'MQTT credentials not configured for private broker' 
        }));
        return;
      }

      const brokerUrl = `wss://${host}:${port}/mqtt`;
      
      const options: mqtt.IClientOptions = {
        clientId: `kost_frontend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        keepalive: 30,
        connectTimeout: 10000,
        reconnectPeriod: 0, // Disable auto-reconnect, we'll handle it manually
        clean: true,
        protocol: 'wss',
        protocolVersion: 4,
      };
      
      // Add credentials only for private brokers
      if (!host.includes('broker.emqx.io')) {
        options.username = username;
        options.password = password;
      }

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
        
        // Check if this is an authorization error
        if (error.message.includes('Not authorized') || error.message.includes('Connection refused')) {
          console.error('🔒 MQTT Authorization failed - credentials may be invalid or expired');
          setMqttStatus(prev => ({ 
            ...prev, 
            connected: false, 
            connecting: false,
            error: 'Authorization failed - check MQTT credentials',
            reconnectAttempts: maxReconnectAttempts // Stop further attempts
          }));
          return; // Don't schedule reconnect for auth failures
        }
        
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
  }, [handleMqttMessage]);

  // MQTT connection setup
  useEffect(() => {
    // Check if MQTT is explicitly disabled
    if (import.meta.env.VITE_MQTT_ENABLED === 'false') {
      console.log('🔧 MQTT explicitly disabled - skipping connection');
      setMqttStatus({
        connected: false,
        connecting: false,
        error: 'MQTT disabled in configuration',
        reconnectAttempts: maxReconnectAttempts
      });
      return;
    }

    // Try to connect if enabled
    connectToMqtt();
    
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array to run only once



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
          {mqttStatus.reconnectAttempts >= maxReconnectAttempts && mqttStatus.error?.includes('Authorization failed') ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-yellow-600">⚠️</div>
                <div className="font-medium text-yellow-800">MQTT Disabled</div>
              </div>
              <div className="text-sm text-yellow-700 mb-3">
                Real-time RFID monitoring is disabled due to invalid MQTT credentials.
              </div>
              <div className="text-xs text-yellow-600">
                <strong>To fix:</strong> Update your HiveMQ credentials in .env file and restart the application.
              </div>
            </div>
          ) : (
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
          )}
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
              {recentScans.map((scan) => (
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