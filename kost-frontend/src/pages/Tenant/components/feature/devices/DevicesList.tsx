// ===== FIXED: src/pages/Tenant/components/feature/devices/DeviceList.tsx =====
import React, { useState } from 'react';
import { Search, Settings } from 'lucide-react';
import { Device, DeviceStatus, DeviceType } from '../../../types/device';
import DeviceCard from './DeviceCard';
import { Card } from '../../ui/Card';
import { SearchInput, Select } from '../../ui/Forms';
import { StatusBadge } from '../../ui/Status';
import { getResponsiveColumns, mergeClasses } from '../../../utils/helpers';

interface DeviceListProps {
  devices: Device[];
  loading?: boolean;
  onDeviceControl?: (device: Device) => void;
  onDeviceSettings?: (device: Device) => void;
  className?: string;
}

const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  loading = false,
  onDeviceControl,
  onDeviceSettings,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<DeviceType | 'all'>('all');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'error', label: 'Error' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'door_lock', label: 'Door Lock' },
    { value: 'sensor', label: 'Sensor' },
    { value: 'camera', label: 'Camera' },
    { value: 'thermostat', label: 'Thermostat' },
    { value: 'light', label: 'Light' },
    { value: 'speaker', label: 'Speaker' },
    { value: 'other', label: 'Other' },
  ];

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.room_number?.includes(searchTerm) ||
                         device.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    const matchesType = typeFilter === 'all' || device.device_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusCounts = () => {
    return devices.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {} as Record<DeviceStatus, number>);
  };

  const statusCounts = getStatusCounts();

  // Handle search function
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  if (loading) {
    return (
      <div className={mergeClasses('space-y-6', className)}>
        {/* Filters Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        
        {/* Cards Skeleton */}
        <div className={mergeClasses('grid gap-4', getResponsiveColumns(3))}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={mergeClasses('space-y-6', className)}>
      {/* Status Overview */}
      <div className="flex flex-wrap gap-3">
        <StatusBadge
          status="info"
          label={`Total: ${devices.length}`}
          size="sm"
        />
        <StatusBadge
          status="success"
          label={`Online: ${statusCounts.online || 0}`}
          size="sm"
        />
        <StatusBadge
          status="error"
          label={`Offline: ${statusCounts.offline || 0}`}
          size="sm"
        />
        {statusCounts.error > 0 && (
          <StatusBadge
            status="error"
            label={`Error: ${statusCounts.error}`}
            size="sm"
          />
        )}
        {statusCounts.maintenance > 0 && (
          <StatusBadge
            status="warning"
            label={`Maintenance: ${statusCounts.maintenance}`}
            size="sm"
          />
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SearchInput
          placeholder="Search devices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={handleSearch}
          icon={Search}
        />
        
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | 'all')}
          options={statusOptions}
          placeholder="Filter by status"
        />
        
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as DeviceType | 'all')}
          options={typeOptions}
          placeholder="Filter by type"
        />
      </div>

      {/* Device Grid */}
      {filteredDevices.length > 0 ? (
        <div className={mergeClasses('grid gap-4', getResponsiveColumns(3))}>
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onControl={onDeviceControl}
              onSettings={onDeviceSettings}
            />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Devices Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No devices match your current filters.'
                : 'No devices are registered for your room.'}
            </p>
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DeviceList;