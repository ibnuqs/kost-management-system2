// File: src/pages/Admin/components/feature/rfid/DoorControl.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { StatusBadge } from '../../ui/Status/StatusBadge';
import { Button } from '../../ui/Forms/Button';
import { Modal } from '../../ui/Modal';
import { DoorOpen } from 'lucide-react';
import { useRfidEvents } from '../../../../../hooks';
import esp32Service from '../../../services/esp32Service';

interface DoorDevice {
  device_id: string;
  device_name: string;
  status: 'online' | 'offline' | 'error' | string;
  door_status: 'open' | 'closed' | 'unknown';
  last_seen: string;
  room?: {
    room_number: string;
    room_name: string;
  };
}

export const DoorControl: React.FC = () => {
  const [devices, setDevices] = useState<DoorDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DoorDevice | null>(null);
  const [commandModal, setCommandModal] = useState(false);
  const [commandType, setCommandType] = useState<'open' | 'close'>('open');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get real-time device data from MQTT
  const { deviceStatuses, isConnected } = useRfidEvents();

  const fetchDoorDevices = async () => {
    setRefreshing(true);
    try {
      const doorDevices = await esp32Service.getDoorDevices();
      const mappedDevices = doorDevices.map(device => ({
        device_id: device.device_id,
        device_name: device.device_name,
        status: device.status,
        door_status: 'unknown' as const, // door_status not available in current device info
        last_seen: device.last_seen,
        room: device.room
      }));
      setDevices(mappedDevices);
    } catch (error) {
      console.error('Error fetching door devices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await esp32Service.testMqttConnection();
      
      if (result.success) {
        alert('MQTT connection test successful! ✅');
      } else {
        alert(`Connection test failed: ${result.message} ❌`);
      }
    } catch (error: any) {
      alert(`Connection test error: ${error.message} ❌`);
    }
  };

  useEffect(() => {
    fetchDoorDevices();
  }, []);

  useEffect(() => {
    // Convert MQTT device statuses to door devices
    const doorDevices: DoorDevice[] = [];
    
    Array.from(deviceStatuses.values()).forEach(device => {
      if (device.device_id.includes('ESP32')) {
        doorDevices.push({
          device_id: device.device_id,
          device_name: `Door ${device.device_id}`,
          status: (device.wifi_connected && device.mqtt_connected) ? 'online' : 'offline',
          door_status: (device as any).door_status || 'unknown',
          last_seen: device.last_seen.toISOString(),
          room: {
            room_number: '101',
            room_name: 'Main Door'
          }
        });
      }
    });

    // Add mock devices if no real devices
    if (doorDevices.length === 0) {
      doorDevices.push({
        device_id: 'ESP32-RFID-01',
        device_name: 'Main Door Controller',
        status: isConnected ? 'online' : 'offline',
        door_status: 'closed',
        last_seen: new Date().toISOString(),
        room: {
          room_number: '101',
          room_name: 'Main Door'
        }
      });
    }

    setDevices(doorDevices);
  }, [deviceStatuses, isConnected]);

  const sendDoorCommand = async (device: DoorDevice, action: 'open' | 'close') => {
    setLoading(true);
    try {
      console.log(`Sending ${action} command to ${device.device_id}`);

      const result = action === 'open' 
        ? await esp32Service.openDoor(device.device_id, `Manual ${action} from admin dashboard`)
        : await esp32Service.closeDoor(device.device_id, `Manual ${action} from admin dashboard`);

      if (result.success) {
        console.log('✅ Door command sent successfully:', result);
        alert(`Door ${action} command sent to ${device.device_name}`);
        
        // Update device status locally for immediate feedback
        setDevices(prev => prev.map(d => 
          d.device_id === device.device_id 
            ? { ...d, door_status: action === 'open' ? 'open' : 'closed' }
            : d
        ));
      } else {
        throw new Error(result.message || 'Command failed');
      }

    } catch (error: any) {
      console.error('Error sending door command:', error);
      alert(`Failed to send door command: ${error.message}`);
    } finally {
      setLoading(false);
      setCommandModal(false);
    }
  };

  const getDoorStatusColor = (status: string): string => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-blue-600 bg-blue-100';
      case 'unknown': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeviceStatusColor = (status: string): string => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Door Control</h3>
            <p className="text-sm text-gray-600">Remote door control via ESP32</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchDoorDevices}
              disabled={refreshing}
            >
              {refreshing ? '🔄' : '↻'} Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={testConnection}
            >
              🔧 Test MQTT
            </Button>
            <StatusBadge 
              status={isConnected ? 'online' : 'offline'} 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <DoorOpen className="w-12 h-12 mx-auto text-gray-400" />
            </div>
            <div>No door controllers found</div>
            <div className="text-sm">ESP32 devices will appear here when connected</div>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map(device => (
              <div key={device.device_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <DoorOpen className="w-6 h-6 text-gray-600" />
                    <div>
                      <h4 className="font-medium">{device.device_name}</h4>
                      <p className="text-sm text-gray-500">{device.device_id}</p>
                      {device.room && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {device.room.room_number} - {device.room.room_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getDeviceStatusColor(device.status)}`}>
                      {device.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDoorStatusColor(device.door_status)}`}>
                      Door: {device.door_status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Last seen: {new Date(device.last_seen).toLocaleString()}
                  </div>
                  
                  {device.status === 'online' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDevice(device);
                          setCommandType('open');
                          setCommandModal(true);
                        }}
                        disabled={loading}
                      >
                        🔓 Open Door
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDevice(device);
                          setCommandType('close');
                          setCommandModal(true);
                        }}
                        disabled={loading}
                      >
                        🔒 Close Door
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MQTT Status Info */}
        {!isConnected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              ⚠️ MQTT not connected. Door control commands cannot be sent.
            </p>
          </div>
        )}
      </CardContent>

      {/* Command Confirmation Modal */}
      {commandModal && selectedDevice && (
        <Modal
          isOpen={commandModal}
          onClose={() => setCommandModal(false)}
          title={`${commandType === 'open' ? 'Open' : 'Close'} Door`}
        >
          <div className="p-6">
            <p className="mb-4">
              Are you sure you want to <strong>{commandType}</strong> the door at {selectedDevice.device_name}?
            </p>
            
            {commandType === 'open' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800 text-sm">
                  🔓 The door will automatically close after 5 seconds for security.
                </p>
              </div>
            )}
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCommandModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => sendDoorCommand(selectedDevice, commandType)}
                disabled={loading}
              >
                {loading ? 'Sending...' : `${commandType === 'open' ? 'Open' : 'Close'} Door`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
};