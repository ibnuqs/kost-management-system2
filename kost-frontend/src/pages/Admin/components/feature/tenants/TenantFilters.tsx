// File: src/pages/Admin/components/features/tenants/TenantFilters.tsx
import React from 'react';
import { Search, UserCheck, UserX, User, AlertTriangle } from 'lucide-react';
import type { TenantFilters as TenantFiltersType } from '../../../types/tenant';

interface TenantFiltersProps {
  filters: TenantFiltersType;
  onFilterChange: (key: keyof TenantFiltersType, value: any) => void;
  resultCount?: number;
}

export const TenantFilters: React.FC<TenantFiltersProps> = ({ 
  filters, 
  onFilterChange,
  resultCount 
}) => {

  const handleStatusChange = (status: string) => {
    onFilterChange('status', status);
  };

  const handleSearchChange = (search: string) => {
    onFilterChange('search', search);
  };

  const statusOptions = [
    { value: '', label: 'Semua Status', icon: User, color: 'text-blue-600' },
    { value: 'active', label: 'Aktif', icon: UserCheck, color: 'text-green-600' },
    { value: 'moved_out', label: 'Pindah', icon: UserX, color: 'text-gray-600' },
    { value: 'suspended', label: 'Ditangguhkan', icon: AlertTriangle, color: 'text-orange-600' }
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
          placeholder="Cari berdasarkan nama penyewa, email, atau nomor kamar..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Filter Status & Results Counter */}
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

        {/* Results Counter */}
        <div className="flex items-center gap-4">
          {resultCount !== undefined && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{resultCount}</span> penyewa
            </div>
          )}
        </div>
      </div>
    </div>
  );
};