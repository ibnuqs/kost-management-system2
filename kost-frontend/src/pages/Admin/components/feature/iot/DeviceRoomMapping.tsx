// File: src/pages/Admin/components/feature/iot/DeviceRoomMapping.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import { Home, Wifi, Settings, MapPin, CheckCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import api from '../../../../../utils/api';
import { DeviceFilters } from './index';
import type { IoTDevice } from '../../../types/iot';
import type { Room } from '../../../types/room';

interface DeviceRoomMappingProps {
  devices: IoTDevice[];
  rooms: Room[];
  onUpdateMapping: (deviceId: string, roomId: number | null) => void;
  onDeviceUpdated?: () => void;
  onAddDevice?: () => void;
  onEditDevice?: (device: IoTDevice) => void;
  filters?: any;
  showFilters?: boolean;
  onFilterChange?: (key: string, value: string) => void;
  onToggleFilters?: () => void;
  onClearFilters?: () => void;
  pagination?: any;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}


export const DeviceRoomMapping: React.FC<DeviceRoomMappingProps> = ({
  devices,
  rooms,
  onUpdateMapping,
  onDeviceUpdated,
  onAddDevice,
  onEditDevice,
  filters,
  showFilters,
  onFilterChange,
  onToggleFilters,
  onClearFilters,
  pagination,
  onPageChange,
  loading
}) => {
  const [mappings, setMappings] = useState<Record<string, number | null>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    // Initialize mappings from current device assignments
    const initialMappings: Record<string, number | null> = {};
    devices.forEach(device => {
      initialMappings[device.device_id] = device.room_id || null;
      // Debug logging
      if (device.room_id) {
        console.log(`🔧 Device ${device.device_name} (${device.device_id}) assigned to room_id: ${device.room_id}`);
      }
    });
    setMappings(initialMappings);
    console.log('📍 Current mappings:', initialMappings);
  }, [devices]);

  // Auto-refresh rooms data if empty
  useEffect(() => {
    if (rooms.length === 0) {
      console.log('🏠 DeviceRoomMapping: Rooms empty, triggering refresh...');
      onDeviceUpdated?.();
    }
  }, [rooms.length, onDeviceUpdated]);


  const handleMappingChange = async (deviceId: string, roomId: number | null) => {
    setSaving(deviceId);
    try {
      // Find device by device_id
      const device = devices.find(d => d.device_id === deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (roomId) {
        // Use new API endpoint for room assignment
        const response = await api.post(`/admin/iot-devices/${device.id}/assign-room`, {
          room_id: roomId,
          reason: 'Manual assignment from Device Room Mapping'
        });

        if (response.data.success) {
          toast.success(response.data.message);
          setMappings(prev => ({ ...prev, [deviceId]: roomId }));
          onDeviceUpdated?.();
        }
      } else {
        // Fallback to original method for unassigning
        await onUpdateMapping(deviceId, roomId);
        setMappings(prev => ({ ...prev, [deviceId]: roomId }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update device mapping');
    } finally {
      setSaving(null);
    }
  };

  
  // Debug logging
  console.log('🖥️ DeviceRoomMapping render:', {
    devices: devices.length,
    rooms: rooms.length,
    mappings: Object.keys(mappings).length,
    deviceSample: devices[0],
    roomSample: rooms[0],
    roomsWithTenants: rooms.filter(r => r.tenant).length,
    roomsWithoutTenants: rooms.filter(r => !r.tenant).length,
    sampleRoomWithTenant: rooms.find(r => r.tenant),
    archivedRoomsCheck: rooms.filter(r => r.status === 'archived' || r.is_archived).length,
    tenantNames: rooms.filter(r => r.tenant).map(r => ({ room: r.room_number, tenant: r.tenant.name }))
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">🗺️ Kelola Perangkat dan Kamar</h2>
        <div className="flex gap-2">
          {onAddDevice && (
            <Button
              onClick={onAddDevice}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              ➕ Tambah Perangkat
            </Button>
          )}
        </div>
      </div>

      {/* Device Management with Filters and Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">📡 Daftar Perangkat ESP32</h3>
          <p className="text-gray-600">Ubah nama perangkat dan pindahkan ke kamar lain</p>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          {onFilterChange && (
            <DeviceFilters
              filters={filters || {}}
              rooms={rooms}
              showFilters={showFilters || false}
              onFilterChange={onFilterChange}
              onToggleFilters={onToggleFilters}
              onClearFilters={onClearFilters}
            />
          )}

          {/* Device Table with Room Assignment */}
          <div className="space-y-4">
            {devices.map(device => (
              <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Device Info */}
                  <div className={`p-2 rounded-lg ${
                    device.status === 'online' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      📡 {device.device_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {device.device_id} • 
                      <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                        device.status === 'online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`} title={`Status: ${device.status} | DB Status: ${device.status_db} | Minutes since last seen: ${device.minutes_since_last_seen} | Last seen: ${device.last_seen_date}`}>
                        {device.status === 'online' ? 'Online' : 'Offline'}
                        {device.minutes_since_last_seen < 2 && device.minutes_since_last_seen !== undefined && (
                          <span className="ml-1 text-xs">🟢</span>
                        )}
                      </span> • 
                      <span className="ml-1">Aktif {device.last_seen_human}</span>
                    </div>
                  </div>
                </div>

                {/* Room Assignment & Actions */}
                <div className="flex items-center space-x-3">
                  <select
                    value={mappings[device.device_id] || ''}
                    onChange={(e) => handleMappingChange(device.device_id, e.target.value ? parseInt(e.target.value) : null)}
                    disabled={saving === device.device_id}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    title={`Device ${device.device_name}: room_id=${device.room_id}, mapping=${mappings[device.device_id]}`}
                  >
                    <option value="">🚫 Belum Dipasang</option>
                    {rooms && rooms.length > 0 ? rooms.map(room => {
                      const tenantName = room.tenant?.user_name || room.tenant?.name || room.tenant_name || null;
                      return (
                        <option key={room.id} value={room.id}>
                          Kamar {room.room_number}{tenantName ? ` - ${tenantName}` : ' - Kosong'}
                        </option>
                      );
                    }) : (
                      <option disabled>Loading rooms...</option>
                    )}
                  </select>
                  
                  {onEditDevice && (
                    <Button
                      onClick={() => onEditDevice(device)}
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      ✏️ Ubah
                    </Button>
                  )}
                  
                  {saving === device.device_id && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            ))}

            {devices.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <Wifi className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada perangkat</h3>
                <p>Perangkat ESP32 akan muncul di sini ketika terhubung ke sistem</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Kamar Lengkap */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">🏠 Status Kamar dan Penghuni</h3>
        </CardHeader>
        <CardContent>
          {rooms && rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => {
                const assignedDevice = devices.find(d => d.room_id === room.id);
                const hasDevice = !!assignedDevice;
                const tenantName = room.tenant?.user_name || room.tenant?.name || room.tenant_name || null;
                const hasTenant = !!tenantName;
                
                return (
                  <div key={room.id} className={`p-4 rounded-lg border-2 ${
                    hasDevice 
                      ? assignedDevice?.status === 'online'
                        ? 'border-green-200 bg-green-50'
                        : 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">
                        🏠 Kamar {room.room_number}
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        hasDevice 
                          ? assignedDevice?.status === 'online' 
                            ? 'bg-green-400' 
                            : 'bg-yellow-400'
                          : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    {/* Status Utama - Nama Penyewa atau Status Kamar */}
                    <div className="text-sm mb-2">
                      {hasDevice && hasTenant ? (
                        <div className="text-blue-700 font-semibold text-base">
                          {tenantName}
                        </div>
                      ) : hasTenant ? (
                        <div className="text-blue-600 font-medium">
                          {tenantName}
                        </div>
                      ) : (
                        <div className="text-gray-500 font-medium">
                          Kamar Kosong
                        </div>
                      )}
                    </div>
                    
                    {/* Info Perangkat */}
                    <div className="text-sm">
                      {hasDevice ? (
                        <div>
                          <div className="text-green-700 font-medium mb-1">
                            📡 {assignedDevice.device_name}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            assignedDevice.status === 'online' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {assignedDevice.status === 'online' ? '✅ Perangkat Online' : '⚠️ Perangkat Offline'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          ❌ Belum ada perangkat
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg">⏳ Memuat data kamar...</div>
              <div className="text-sm mt-2">Harap tunggu sebentar</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};