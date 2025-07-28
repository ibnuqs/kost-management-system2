// File: src/pages/Admin/components/features/iot/DeviceFilters.tsx
import React from 'react';
import { Search, Filter, X, Monitor, Wifi, WifiOff } from 'lucide-react';

interface DeviceFiltersProps {
  filters: {
    search: string;
    status: string;
    device_type: string;
    room_id: string;
  };
  rooms: Array<{
    id: number;
    room_number: string;
    label?: string;
  }>;
  showFilters: boolean;
  onFilterChange: (key: string, value: string) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

const DeviceFilters: React.FC<DeviceFiltersProps> = ({ 
  filters, 
  rooms, 
  showFilters, 
  onFilterChange, 
  onToggleFilters, 
  onClearFilters 
}) => {
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.status ||
    filters.device_type ||
    filters.room_id
  );

  const clearIndividualFilter = (key: string) => {
    onFilterChange(key, '');
  };

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Filter Perangkat IoT</h3>
          </div>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Hapus Semua
              </button>
            )}
            <button
              onClick={onToggleFilters}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Content */}
      {showFilters && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Search Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cari Perangkat
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau ID perangkat..."
                  value={filters.search}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {filters.search && (
                  <button
                    onClick={() => clearIndividualFilter('search')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status Perangkat
              </label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              >
                <option value="">Semua Status</option>
                <option value="online">
                  🟢 Terhubung
                </option>
                <option value="offline">
                  🔴 Terputus
                </option>
              </select>
            </div>

            {/* Device Type Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tipe Perangkat
              </label>
              <select
                value={filters.device_type}
                onChange={(e) => onFilterChange('device_type', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              >
                <option value="">Semua Tipe</option>
                <option value="door_lock">
                  🚪 Kunci Pintu
                </option>
                <option value="card_scanner">
                  💳 Pembaca Kartu
                </option>
              </select>
            </div>

            {/* Room Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Penugasan Kamar
              </label>
              <select
                value={filters.room_id}
                onChange={(e) => onFilterChange('room_id', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              >
                <option value="">Semua Kamar</option>
                <option value="unassigned">🏠 Belum Ditugaskan</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id.toString()}>
                    🏠 Kamar {room.room_number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-500">Filter aktif:</span>
                
                {filters.search && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Pencarian: "{filters.search}"
                    <button
                      onClick={() => clearIndividualFilter('search')}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {filters.status === 'online' ? (
                      <>
                        <Wifi className="w-3 h-3 mr-1" />
                        Terhubung
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 mr-1" />
                        Terputus
                      </>
                    )}
                    <button
                      onClick={() => clearIndividualFilter('status')}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.device_type && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Monitor className="w-3 h-3 mr-1" />
                    {filters.device_type === 'door_lock' ? 'Kunci Pintu' : 'Pembaca Kartu'}
                    <button
                      onClick={() => clearIndividualFilter('device_type')}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:text-purple-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.room_id && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Kamar: {filters.room_id === 'unassigned' 
                      ? 'Belum Ditugaskan' 
                      : rooms.find(r => r.id.toString() === filters.room_id)?.room_number || 'Tidak Diketahui'
                    }
                    <button
                      onClick={() => clearIndividualFilter('room_id')}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-400 hover:text-orange-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceFilters;