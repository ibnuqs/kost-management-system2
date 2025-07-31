// File: src/pages/Tenant/components/dashboard/AccessStats.tsx
import React from 'react';
import { Key, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/Status';
import { formatCompactNumber } from '../../utils/formatters';
import { mergeClasses } from '../../utils/helpers';

interface AccessStatsProps {
  className?: string;
}

const AccessStats: React.FC<AccessStatsProps> = ({
  className = '',
}) => {
  const { dashboardData, isLoading } = useTenantDashboard();
  const accessStats = dashboardData?.access_stats;
  const quickStats = dashboardData?.quick_stats;

  if (isLoading) {
    return (
      <Card className={mergeClasses('animate-pulse', className)}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const successRate = accessStats?.success_rate || 0;
  const todayCount = quickStats?.access_count_today || 0;
  const weekCount = quickStats?.access_count_week || 0;
  const monthCount = quickStats?.access_count_month || 0;

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'green';
    if (rate >= 70) return 'yellow';
    return 'red';
  };

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Statistik Akses</h3>
        </div>
        
        <Link
          to="/tenant/access-history"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          Lihat Riwayat
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Access Counts */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-xl font-bold text-blue-600">{todayCount}</span>
          </div>
          <p className="text-xs text-gray-500">Hari Ini</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-xl font-bold text-green-600">{weekCount}</span>
          </div>
          <p className="text-xs text-gray-500">Minggu Ini</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-xl font-bold text-purple-600">{monthCount}</span>
          </div>
          <p className="text-xs text-gray-500">Bulan Ini</p>
        </div>
      </div>

      {/* Success Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Tingkat Keberhasilan</span>
          <div className="flex items-center gap-1">
            {successRate >= 90 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            )}
            <span className="text-sm font-bold text-gray-900">
              {Math.round(successRate)}%
            </span>
          </div>
        </div>
        
        <ProgressBar
          value={successRate}
          max={100}
          color={getSuccessRateColor(successRate)}
          size="md"
          animated
        />
      </div>

      {/* Additional Stats */}
      {accessStats && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500">Total Akses</p>
            <p className="font-semibold text-gray-900">
              {formatCompactNumber(accessStats.total_count || 0)}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500">Rata-rata Harian</p>
            <p className="font-semibold text-gray-900">
              {Math.round(accessStats.average_daily || 0)}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500">Jam Puncak</p>
            <p className="font-semibold text-gray-900">
              {accessStats.peak_hours?.[0]?.hour ? 
                `${accessStats.peak_hours[0].hour}:00` : '-'}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500">Ditolak</p>
            <p className="font-semibold text-red-600">
              {accessStats.denial_count || 0}
            </p>
          </div>
        </div>
      )}

    </Card>
  );
};

export default AccessStats;