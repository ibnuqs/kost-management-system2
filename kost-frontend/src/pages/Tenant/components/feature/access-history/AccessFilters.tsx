// File: src/pages/Tenant/components/feature/access-history/AccessFilters.tsx
import React from 'react';
import { X, Calendar, Filter, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { AccessFilters as AccessFiltersType } from '../../../types/access';
import { Card } from '../../ui/Card';
import { Button, IconButton } from '../../ui/Buttons';
import { Input, Select } from '../../ui/Forms';
import { mergeClasses } from '../../../utils/helpers';

interface AccessFiltersProps {
  filters: AccessFiltersType;
  onFiltersChange: (filters: AccessFiltersType) => void;
  onClear: () => void;
  onClose?: () => void;
  className?: string;
}

const AccessFilters: React.FC<AccessFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
  onClose,
  className = '',
}) => {
  const accessGrantedOptions = [
    { value: 'all', label: 'Semua Percobaan Akses' },
    { value: 'true', label: 'Hanya yang Diizinkan' },
    { value: 'false', label: 'Hanya yang Ditolak' },
  ];

  const entryMethodOptions = [
    { value: 'all', label: 'Semua Metode' },
    { value: 'rfid', label: 'Kartu RFID' },
    { value: 'mobile', label: 'Aplikasi Mobile' },
    { value: 'manual', label: 'Masuk Manual' },
    { value: 'emergency', label: 'Akses Darurat' },
  ];

  const sortOptions = [
    { value: 'accessed_at', label: 'Waktu Akses' },
    { value: 'room_number', label: 'Nomor Kamar' },
    { value: 'access_granted', label: 'Status Akses' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Terbaru Dulu' },
    { value: 'asc', label: 'Terlama Dulu' },
  ];

  const updateFilter = (key: keyof AccessFiltersType, value: string | boolean | null) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== 'all'
  );

  return (
    <Card className={mergeClasses('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Filter Riwayat Akses</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Aktif
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
            >
              Hapus Semua
            </Button>
          )}
          
          {onClose && (
            <IconButton
              icon={X}
              onClick={onClose}
              variant="ghost"
              size="sm"
              aria-label="Tutup filter"
            />
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Access Status Filter */}
        <Select
          label="Status Akses"
          value={filters.access_granted === undefined ? 'all' : filters.access_granted.toString()}
          onChange={(e) => {
            const value = e.target.value;
            updateFilter('access_granted', value === 'all' ? undefined : value === 'true');
          }}
          options={accessGrantedOptions}
          variant="filled"
        />

        {/* Entry Method Filter */}
        <Select
          label="Metode Masuk"
          value={filters.entry_method || 'all'}
          onChange={(e) => updateFilter('entry_method', e.target.value)}
          options={entryMethodOptions}
          variant="filled"
        />

        {/* Room Number Filter */}
        <Input
          label="Nomor Kamar"
          value={filters.room_number || ''}
          onChange={(e) => updateFilter('room_number', e.target.value)}
          variant="filled"
          placeholder="contoh: 101"
        />

        {/* Date From */}
        <Input
          label="Dari Tanggal"
          type="date"
          value={filters.date_from || ''}
          onChange={(e) => updateFilter('date_from', e.target.value)}
          variant="filled"
          leftIcon={Calendar}
        />

        {/* Date To */}
        <Input
          label="Sampai Tanggal"
          type="date"
          value={filters.date_to || ''}
          onChange={(e) => updateFilter('date_to', e.target.value)}
          variant="filled"
          leftIcon={Calendar}
        />

        {/* Device ID Filter */}
        <Input
          label="ID Perangkat"
          value={filters.device_id || ''}
          onChange={(e) => updateFilter('device_id', e.target.value)}
          variant="filled"
          placeholder="Pengenal perangkat"
        />

        {/* Sort By */}
        <Select
          label="Urutkan Berdasarkan"
          value={filters.sort_by || 'accessed_at'}
          onChange={(e) => updateFilter('sort_by', e.target.value)}
          options={sortOptions}
          variant="filled"
        />

        {/* Sort Order */}
        <Select
          label="Urutan Sortir"
          value={filters.sort_order || 'desc'}
          onChange={(e) => updateFilter('sort_order', e.target.value)}
          options={sortOrderOptions}
          variant="filled"
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Quick Filters */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Filter Cepat</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.access_granted === true ? 'success' : 'secondary'}
            size="sm"
            onClick={() => updateFilter('access_granted', filters.access_granted === true ? undefined : true)}
            icon={CheckCircle}
          >
            Hanya Diizinkan
          </Button>
          
          <Button
            variant={filters.access_granted === false ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => updateFilter('access_granted', filters.access_granted === false ? undefined : false)}
            icon={AlertCircle}
          >
            Hanya Ditolak
          </Button>
          
          <Button
            variant={filters.entry_method === 'rfid' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => updateFilter('entry_method', filters.entry_method === 'rfid' ? 'all' : 'rfid')}
            icon={Key}
          >
            Akses RFID
          </Button>
          
          <Button
            variant={filters.date_from === new Date().toISOString().split('T')[0] ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              updateFilter('date_from', filters.date_from === today ? '' : today);
              updateFilter('date_to', filters.date_from === today ? '' : today);
            }}
          >
            Hanya Hari Ini
          </Button>
          
          <Button
            variant={filters.entry_method === 'mobile' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => updateFilter('entry_method', filters.entry_method === 'mobile' ? 'all' : 'mobile')}
          >
            Akses Mobile
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Filter Aktif:</strong>{' '}
            {Object.entries(filters)
              .filter(([, value]) => value !== undefined && value !== '' && value !== 'all')
              .map(([key, value]) => {
                if (key === 'access_granted') {
                  return `${key}: ${value ? 'Diizinkan' : 'Ditolak'}`;
                }
                return `${key}: ${value}`;
              })
              .join(', ')}
          </p>
        </div>
      )}
    </Card>
  );
};

export default AccessFilters;