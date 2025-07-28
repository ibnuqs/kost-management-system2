// File: src/pages/Admin/components/feature/rooms/RoomFilters.tsx
import React from 'react';
import { Grid, List, Home, User, Wrench, Archive, Search } from 'lucide-react';

interface RoomFiltersProps {
  filters: {
    search: string;
    status: string;
  };
  onFilterChange: (filters: { search: string; status: string }) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  resultCount?: number;
}

export const RoomFilters: React.FC<RoomFiltersProps> = ({ 
  filters, 
  onFilterChange,
  viewMode = 'grid',
  onViewModeChange,
  resultCount 
}) => {
  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const statusOptions = [
    { value: 'active', label: 'Semua Aktif', icon: Home, color: 'text-blue-600' },
    { value: 'available', label: 'Tersedia', icon: Home, color: 'text-green-600' },
    { value: 'occupied', label: 'Terisi', icon: User, color: 'text-blue-600' },
    { value: 'maintenance', label: 'Perawatan', icon: Wrench, color: 'text-orange-600' },
    { value: 'archived', label: 'Diarsipkan', icon: Archive, color: 'text-gray-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari berdasarkan nomor kamar, nama kamar, atau nama penyewa..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Filter Status & View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isActive = filters.status === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : option.color || 'text-gray-600'}`} />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* View Mode & Results Counter */}
        <div className="flex items-center gap-4">
          {/* Results Counter */}
          {resultCount !== undefined && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{resultCount}</span> kamar
            </div>
          )}

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
                Kotak
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                Daftar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};