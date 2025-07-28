// File: src/pages/Admin/components/feature/rfid/SimpleRfidMonitor.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { CreditCard, Lock, Unlock } from 'lucide-react';
import mqtt from 'mqtt';

interface RfidEvent {
  uid: string;
  device_id: string;
  timestamp: number;
  user?: string;
  access_granted?: boolean;
  message?: string;
}

interface DeviceStatus {
  device_id: string;
  status: 'online' | 'offline';
  last_seen: Date;
  ip?: string;
}

export const SimpleRfidMonitor: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<RfidEvent[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [stats, setStats] = useState({
    todayScans: 0,
    granted: 0,
    denied: 0
  });

  const mqttRef = useRef<mqtt.MqttClient | null>(null);

  // Connect to MQTT
  useEffect(() => {
    const connect = () => {
      // Check if MQTT credentials are configured
      const host = import.meta.env.VITE_HIVEMQ_HOST;
      const username = import.meta.env.VITE_HIVEMQ_USERNAME;
      const password = import.meta.env.VITE_HIVEMQ_PASSWORD;

      if (!host || !username || !password || 
          host === 'your_hivemq_host_here' ||
          username === 'your_mqtt_username_here' ||
          password === 'your_mqtt_password_here') {
        console.warn('🔧 MQTT not configured - update .env file for real-time features');
        setIsConnected(false);
        return;
      }

      try {
        const brokerUrl = `wss://${host}:${import.meta.env.VITE_HIVEMQ_PORT || '8884'}/mqtt`;
        const client = mqtt.connect(brokerUrl, {
          clientId: `kost_monitor_${Math.random().toString(16).substr(2, 8)}`,
          username,
          password,
          keepalive: 60,
          clean: true,
        });

        mqttRef.current = client;

        client.on('connect', () => {
          setIsConnected(true);
          client.subscribe(['rfid/tags', 'rfid/status', 'rfid/command'], (err) => {
            if (!err) console.log('✅ Subscribed to RFID topics');
          });
        });

        client.on('message', (topic, message) => {
          handleMessage(topic, message.toString());
        });

        client.on('error', () => setIsConnected(false));
        client.on('close', () => setIsConnected(false));

      } catch (error) {
        console.error('MQTT connection failed:', error);
      }
    };

    connect();
    return () => {
      if (mqttRef.current) {
        mqttRef.current.end();
      }
    };
  }, []);

  const handleMessage = (topic: string, message: string) => {
    try {
      const data = JSON.parse(message);
      
      if (topic === 'rfid/tags') {
        // New RFID scan
        const event: RfidEvent = {
          uid: data.uid,
          device_id: data.device_id || 'ESP32-RFID-01',
          timestamp: Date.now(),
        };
        
        setEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20
        setStats(prev => ({ ...prev, todayScans: prev.todayScans + 1 }));
        
      } else if (topic === 'rfid/command' && data.uid) {
        // Access decision response
        setEvents(prev => prev.map(event => 
          event.uid === data.uid && !event.user ? {
            ...event,
            user: data.user,
            access_granted: data.access_granted,
            message: data.message
          } : event
        ));
        
        if (data.access_granted) {
          setStats(prev => ({ ...prev, granted: prev.granted + 1 }));
        } else {
          setStats(prev => ({ ...prev, denied: prev.denied + 1 }));
        }
        
      } else if (topic === 'rfid/status') {
        // Device status
        const device: DeviceStatus = {
          device_id: data.device_id || 'ESP32-RFID-01',
          status: data.wifi_connected && data.mqtt_connected ? 'online' : 'offline',
          last_seen: new Date(),
          ip: data.device_ip
        };
        
        setDevices(prev => {
          const filtered = prev.filter(d => d.device_id !== device.device_id);
          return [device, ...filtered];
        });
      }
    } catch (error) {
      console.error('Failed to parse MQTT message:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Quick Status Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="min-w-0 flex-1">
                <div className={`text-lg font-bold truncate ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </div>
                <div className="text-xs text-gray-500">MQTT Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-xl">📱</div>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-bold">{stats.todayScans}</div>
                <div className="text-xs text-gray-500">Total Scans</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-xl">✅</div>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-bold text-green-600">{stats.granted}</div>
                <div className="text-xs text-gray-500">Access Granted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-xl">❌</div>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-bold text-red-600">{stats.denied}</div>
                <div className="text-xs text-gray-500">Access Denied</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Status */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">ESP32 Devices</h3>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <div className="text-3xl mb-2">🔍</div>
              <div>No devices detected</div>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map(device => (
                <div key={device.device_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <div className="font-medium">{device.device_id}</div>
                      <div className="text-sm text-gray-500">{device.ip}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {device.last_seen.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live RFID Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live RFID Activity</h3>
            <div className={`px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {isConnected ? '🟢 Live' : '🔴 Offline'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4">
                <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
              </div>
              <div>Waiting for RFID scans...</div>
              <div className="text-sm">Tap an RFID card to see activity</div>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 lg:max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div key={`${event.uid}-${event.timestamp}`} 
                     className={`p-3 rounded-lg border-l-4 hover:shadow-sm transition-shadow ${
                       event.access_granted === true ? 'border-green-500 bg-green-50' :
                       event.access_granted === false ? 'border-red-500 bg-red-50' :
                       'border-blue-500 bg-blue-50'
                     }`}>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {event.access_granted === true ? (
                          <Unlock className="w-5 h-5 text-green-600" />
                        ) : event.access_granted === false ? (
                          <Lock className="w-5 h-5 text-red-600" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">
                          UID: {event.uid}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {event.device_id} • {formatTime(event.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-1 flex-shrink-0">
                      {event.user && (
                        <div className="font-medium text-sm truncate max-w-32">{event.user}</div>
                      )}
                      {event.access_granted !== undefined && (
                        <div className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                          event.access_granted ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
                          {event.access_granted ? 'GRANTED' : 'DENIED'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {event.message && (
                    <div className="mt-2 text-sm text-gray-600">
                      {event.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simple Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔄 Refresh
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};