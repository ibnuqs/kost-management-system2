// File: src/pages/Tenant/components/dashboard/TenancySummary.tsx
import React from 'react';
import { Home, Calendar, CreditCard, TrendingUp, MapPin, Users } from 'lucide-react';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/Status';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { mergeClasses } from '../../utils/helpers';

interface TenancySummaryProps {
  className?: string;
}

const TenancySummary: React.FC<TenancySummaryProps> = ({
  className = '',
}) => {
  const { dashboardData, isLoading } = useTenantDashboard();
  
  const tenantInfo = dashboardData?.tenant_info;
  const quickStats = dashboardData?.quick_stats;

  const moveInDate = tenantInfo?.start_date;
  
  // Calculate lease progress
  const daysLived = quickStats?.days_since_move_in || 0;
  
  // Calculate move-in date from days_since_move_in if not available
  const actualMoveInDate = moveInDate || (quickStats?.days_since_move_in 
    ? new Date(Date.now() - (quickStats.days_since_move_in * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    : null);
  
  
  // Calculate payment streak
  const paymentStreak = quickStats?.current_streak || 0;

  if (isLoading) {
    return (
      <Card className={mergeClasses('animate-pulse', className)}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="flex items-center gap-2 mb-6">
        <Home className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-900">Ringkasan Penyewaan</h3>
        {tenantInfo?.status && (
          <StatusBadge
            status={tenantInfo.status === 'active' ? 'success' : 'warning'}
            label={tenantInfo.status}
            size="sm"
          />
        )}
      </div>

      {/* Room Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              Room {tenantInfo?.room_number}
            </h4>
            <p className="text-sm text-gray-600">
              {formatCurrency(tenantInfo?.monthly_rent || 0)} per month
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tanggal Masuk</p>
            <p className="font-medium text-gray-900">
              {actualMoveInDate ? formatDate(actualMoveInDate) : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Status Sewa</p>
            <p className="font-medium text-gray-900 capitalize">
              {tenantInfo?.status === 'active' ? 'Aktif' : tenantInfo?.status || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Rent Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Sewa Bulanan</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(tenantInfo?.monthly_rent || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Hari</p>
            <p className="text-lg font-bold text-blue-600">{daysLived} hari</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-blue-600">{daysLived}</p>
          <p className="text-xs text-blue-600">Hari sebagai Penyewa</p>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <CreditCard className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-green-600">{paymentStreak}</p>
          <p className="text-xs text-green-600">Berturut Bayar</p>
        </div>
      </div>

      {/* Simple Financial Info */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Informasi Pembayaran
        </h4>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Dibayar</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(quickStats?.total_amount_paid || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center">
            <CreditCard className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-blue-600">Lihat Pembayaran</p>
          </button>
          
          <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
            <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-green-600">Hubungi Dukungan</p>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default TenancySummary;