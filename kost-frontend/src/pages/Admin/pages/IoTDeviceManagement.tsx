import React, { useState } from 'react';
import { useIoTDevices } from '../hooks/useIoTDevices';
import { DeviceForm, DeviceRoomMapping } from '../components/feature/iot';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Forms/Button';
import type { IoTDevice } from '../types/iot';

// Removed tabs, now single page

const IoTDeviceManagement: React.FC = () => {
  const {
    devices,
    rooms,
    loading,
    pagination,
    loadDevices,
    createDevice,
    updateDevice,
    exportDevices,
    refresh
  } = useIoTDevices();

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    device_type: '',
    room_id: ''
  });
  
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCreateDevice = async (data: {
    device_id: string;
    device_name: string;
    device_type: string;
    room_id?: string;
    status: string;
  }) => {
    try {
      const deviceData = {
        ...data,
        device_type: data.device_type as 'door_lock' | 'card_scanner',
        status: data.status as 'online' | 'offline'
      };
      
      await createDevice(deviceData);
      setShowForm(false);
      setSelectedDevice(null);
    } catch {
      // Error handled by hook
    }
  };

  const handleUpdateDevice = async (data: {
    device_id: string;
    device_name: string;
    device_type: string;
    room_id?: string;
    status: string;
  }) => {
    if (!selectedDevice) return;
    
    try {
      const deviceData = {
        ...data,
        device_type: data.device_type as 'door_lock' | 'card_scanner',
        status: data.status as 'online' | 'offline'
      };
      
      await updateDevice(selectedDevice.id, deviceData);
      setShowForm(false);
      setSelectedDevice(null);
    } catch {
      // Error handled by hook
    }
  };


  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportDevices('csv');
    } catch {
      // Error handled by hook
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadDevices(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      device_type: '',
      room_id: ''
    };
    setFilters(clearedFilters);
    loadDevices(clearedFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    loadDevices(newFilters);
  };

  const handleEditDevice = (device: IoTDevice) => {
    setSelectedDevice(device);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedDevice(null);
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kelola Perangkat ESP32</h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Atur nama perangkat dan pindahkan antar kamar
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={isExporting || devices.length === 0}
              className="text-xs lg:text-sm"
            >
{isExporting ? 'Mengekspor...' : 'Ekspor'}
            </Button>
            <Button 
              variant="outline" 
              onClick={refresh}
              disabled={loading}
              className="text-xs lg:text-sm"
            >
Segarkan
            </Button>
          </div>
        </div>

        {/* Statistik Perangkat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-blue-600">
                  {devices.length}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">Total Perangkat</div>
                  <div className="text-xs text-gray-400">ESP32 terdaftar</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-green-600">
                  {devices.filter(d => d.status === 'online').length}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">Sedang Online</div>
                  <div className="text-xs text-gray-400">Perangkat aktif</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-green-600">
                  {devices.filter(d => d.room_id).length}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">Sudah Dipasang</div>
                  <div className="text-xs text-gray-400">Di kamar</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {rooms.filter(r => !devices.some(d => d.room_id === r.id)).length}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-500">Kamar Kosong</div>
                  <div className="text-xs text-gray-400">Belum ada perangkat</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unified Device Room Mapping */}
        <DeviceRoomMapping 
          devices={devices}
          rooms={rooms}
          onUpdateMapping={async (deviceId, roomId) => {
            // Update device room assignment
            const device = devices.find(d => d.device_id === deviceId);
            if (device) {
              await updateDevice(device.id, { 
                ...device, 
                room_id: roomId 
              });
            }
          }}
          onDeviceUpdated={refresh}
          onAddDevice={() => setShowForm(true)}
          onEditDevice={handleEditDevice}
          filters={filters}
          showFilters={showFilters}
          onFilterChange={handleFilterChange}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onClearFilters={handleClearFilters}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
        />

        {/* Device Form Modal */}
        {showForm && (
          <DeviceForm
            isOpen={showForm}
            device={selectedDevice}
            rooms={rooms}
            onClose={handleCloseForm}
            onSubmit={selectedDevice ? handleUpdateDevice : handleCreateDevice}
          />
        )}

        {/* Simple Footer */}
        <div className="text-center text-sm text-gray-500">
          Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')} • 
          {devices.filter(d => d.status === 'online').length}/{devices.length} device online
        </div>
      </div>
    </div>
  );
};

export default IoTDeviceManagement;