// File: src/pages/Admin/components/feature/iot/ESP32Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { StatusBadge } from '../../ui/Status/StatusBadge';
import { Button } from '../../ui/Forms/Button';
import { Modal } from '../../ui/Modal';
import { useRfidEvents } from '../../../../../hooks';
import { esp32Service } from '../../../services/esp32Service';

interface ESP32Device {
  id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  room_id?: string;
  status: 'online' | 'offline' | 'error' | string;
  last_seen: string;
  device_info: {
    wifi_connected?: boolean;
    mqtt_connected?: boolean;
    rfid_ready?: boolean;
    device_ip?: string;
    uptime?: string;  // ESP32 sends as "1h 30m" format
    firmware_version?: string;
    door_status?: string;
  };
  room?: {
    room_number: string;
    room_name: string;
  };
}

interface DeviceCommand {
  type: 'restart' | 'ping';  // Simplified commands for ESP32
  payload?: any;
}

export const ESP32Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<ESP32Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<ESP32Device | null>(null);
  const [commandModal, setCommandModal] = useState(false);
  const [configModal, setConfigModal] = useState(false);
  const [commandType, setCommandType] = useState<DeviceCommand['type']>('ping');
  
  // Get real-time device data from MQTT
  const { deviceStatuses, isConnected } = useRfidEvents();

  useEffect(() => {
    fetchDevices();
    // Set up periodic refresh
    const interval = setInterval(fetchDevices, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Update devices when MQTT data changes
  useEffect(() => {
    if (deviceStatuses.size > 0) {
      fetchDevices();
    }
  }, [deviceStatuses]);

  const fetchDevices = async () => {
    try {
      // Get devices from API
      const apiDevices = await esp32Service.getDevices();
      
      // Merge with real-time MQTT data
      const updatedDevices = Array.isArray(apiDevices) ? apiDevices.map(device => {
        const liveStatus = deviceStatuses.get(device.device_id);
        if (liveStatus) {
          return {
            ...device,
            status: (liveStatus?.wifi_connected && liveStatus?.mqtt_connected && liveStatus?.rfid_ready) ? 'online' : 'offline',
            last_seen: liveStatus?.last_seen?.toISOString() || new Date().toISOString(),
            device_info: {
              ...(device.device_info || {}),
              ...liveStatus
            }
          };
        }
        return device;
      }) : [];
      
      // Add any devices only seen in MQTT that aren't in API yet
      Array.from(deviceStatuses.values()).forEach(mqttDevice => {
        if (!updatedDevices.find(d => d.device_id === mqttDevice.device_id)) {
          const newDevice: ESP32Device = {
            id: `mqtt-${mqttDevice.device_id}`,
            device_id: mqttDevice.device_id,
            device_name: `${mqttDevice.device_id} (Auto-detected)`,
            device_type: 'rfid_reader',
            status: (mqttDevice?.wifi_connected && mqttDevice?.mqtt_connected && mqttDevice?.rfid_ready) ? 'online' : 'offline',
            last_seen: mqttDevice?.last_seen?.toISOString() || new Date().toISOString(),
            device_info: mqttDevice || {}
          };
          updatedDevices.push(newDevice);
        }
      });
      
      setDevices(updatedDevices);
    } catch (error) {
      // Error loading devices - will show in UI debug info
    } finally {
      setLoading(false);
    }
  };

  const sendCommand = async (device: ESP32Device, command: DeviceCommand) => {
    try {
      // Send command to ESP32 via MQTT using your actual ESP32 code format
      const mqttMessage = {
        command: command.type, // ESP32 listens for specific commands
        device_id: device.device_id,
        timestamp: Date.now(),
        payload: command.payload || {},
        from: 'admin_dashboard'
      };
      
      // Use MQTT service to publish command to the topic ESP32 listens to
      if (window.mqttService && window.mqttService.publish) {
        const success = window.mqttService.publish('rfid/command', JSON.stringify(mqttMessage));
        if (success) {
          alert(`Perintah "${command.type}" telah dikirim ke ${device.device_name}`);
        } else {
          throw new Error('MQTT publish failed');
        }
      } else {
        // Use esp32Service as fallback
        switch (command.type) {
          case 'restart':
            esp32Service.sendRestartCommand(device.device_id);
            break;
          case 'ping':
            esp32Service.sendPingCommand(device.device_id);
            break;
        }
        alert(`Perintah "${command.type}" telah dikirim ke ${device.device_name}`);
      }
      
    } catch (error) {
      alert(`Gagal mengirim perintah: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'error': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // formatUptime removed - ESP32 sends uptime as string directly

  const formatLastSeen = (timestamp: string): string => {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">Memuat perangkat ESP32...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Perangkat ESP32</h2>
          <p className="text-gray-600">Monitor dan kontrol perangkat ESP32 RFID Anda</p>
        </div>
        <Button onClick={fetchDevices}>
          🔄 Segarkan
        </Button>
      </div>

      {/* Device Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(devices) ? devices.length : 0}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">Total Perangkat</div>
                <div className="text-xs text-gray-400">Pembaca RFID ESP32</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(devices) ? devices.filter(d => d.status === 'online').length : 0}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">Terhubung</div>
                <div className="text-xs text-gray-400">Perangkat aktif</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-red-600">
                {Array.isArray(devices) ? devices.filter(d => d.status === 'offline').length : 0}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">Terputus</div>
                <div className="text-xs text-gray-400">Tidak terhubung</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                {Array.isArray(devices) ? devices.filter(d => d.device_info?.rfid_ready).length : 0}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">RFID Siap</div>
                <div className="text-xs text-gray-400">Siap untuk scan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <div className="grid gap-6">
        {Array.isArray(devices) ? devices.map(device => (
          <Card key={device.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📡</div>
                  <div>
                    <h3 className="text-lg font-semibold">{device.device_name}</h3>
                    <p className="text-sm text-gray-500">{device.device_id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={device.status} />
                  {device.room && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {device.room.room_number}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Connection Status */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${device.device_info?.wifi_connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm">WiFi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${device.device_info?.mqtt_connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm">MQTT</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${device.device_info?.rfid_ready ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm">RFID</span>
                </div>
              </div>

              {/* Device Information - Simplified for ESP32 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Alamat IP:</span>
                  <div className="font-medium">{device.device_info?.device_ip || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Uptime:</span>
                  <div className="font-medium">
                    {device.device_info?.uptime || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Firmware:</span>
                  <div className="font-medium">{device.device_info?.firmware_version || 'N/A'}</div>
                </div>
              </div>

              {/* WiFi Information - Removed complex data not provided by ESP32 */}

              {/* Last Seen */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Terakhir aktif: {formatLastSeen(device.last_seen)}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDevice(device);
                      setCommandType('ping');
                      setCommandModal(true);
                    }}
                  >
                    📡 Ping
                  </Button>
                  
                  {device.status === 'online' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDevice(device);
                          setCommandType('restart');
                          setCommandModal(true);
                        }}
                      >
                        🔄 Restart
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📡</div>
            <div>Tidak ada perangkat ESP32 ditemukan</div>
            <div className="text-sm">Perangkat akan muncul di sini ketika terhubung melalui MQTT</div>
          </div>
        )}
      </div>

      {/* Command Confirmation Modal */}
      {commandModal && selectedDevice && (
        <Modal
          isOpen={commandModal}
          onClose={() => setCommandModal(false)}
          title={`Kirim Perintah ke ${selectedDevice.device_name}`}
        >
          <div className="p-6">
            <p className="mb-4">
              Apakah Anda yakin ingin mengirim perintah "{commandType}" ke {selectedDevice.device_id}?
            </p>
            
            {commandType === 'restart' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Ini akan me-restart perangkat ESP32 dan mungkin akan offline selama beberapa menit.
                </p>
              </div>
            )}
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCommandModal(false)}>
                Batal
              </Button>
              <Button 
                onClick={() => {
                  sendCommand(selectedDevice, { type: commandType });
                  setCommandModal(false);
                }}
              >
                Kirim Perintah
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};