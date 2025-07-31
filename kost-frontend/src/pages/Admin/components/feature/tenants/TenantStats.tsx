// File: src/pages/Admin/components/features/tenants/TenantStats.tsx
import React from 'react';
import { Users, UserCheck, UserX, DollarSign } from 'lucide-react';

interface TenantStatsProps {
  stats: {
    total: number;
    active: number;
    moved_out: number;
    suspended?: number;
    overdue_count: number;
    total_monthly_rent: number;
    average_rent: number;
    occupancy_rate?: number;
  };
}

export const TenantStats: React.FC<TenantStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Penyewa */}
      <div className="bg-white rounded-xl border border-blue-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
            <div className="text-sm font-medium text-gray-600">Total Penyewa</div>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Penyewa Aktif */}
      <div className="bg-white rounded-xl border border-green-200 p-6 hover:shadow-md hover:border-green-300 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
            <div className="text-sm font-medium text-gray-600">Penyewa Aktif</div>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Sudah Pindah */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-600 mb-1">{stats.moved_out}</div>
            <div className="text-sm font-medium text-gray-600">Sudah Pindah</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <UserX className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Total Pendapatan Bulanan */}
      <div className="bg-white rounded-xl border border-emerald-200 p-6 hover:shadow-md hover:border-emerald-300 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-lg font-bold text-emerald-600 mb-1">
              {formatCurrency(stats.total_monthly_rent)}
            </div>
            <div className="text-sm font-medium text-gray-600">Pendapatan Bulanan</div>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
};