// ===== UPDATED: src/pages/Tenant/components/feature/access-history/AccessStatistics.tsx =====
import React from 'react';
import { TrendingUp, Key, Clock, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { AccessStats } from '../../../types/access';
import { StatCard, Card } from '../../ui/Card';
import { ProgressBar } from '../../ui/Status';
import { formatCompactNumber } from '../../../utils/formatters';
import { mergeClasses, getResponsiveColumns } from '../../../utils/helpers';

interface AccessStatisticsProps {
  stats?: AccessStats;
  isLoading?: boolean;
  className?: string;
}

const AccessStatistics: React.FC<AccessStatisticsProps> = ({
  stats,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={mergeClasses('space-y-6', className)}>
        {/* Stats Cards Skeleton */}
        <div className={mergeClasses('grid gap-4', getResponsiveColumns(4))}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada statistik akses yang tersedia</p>
        </div>
      </Card>
    );
  }

  const statsCards = [
    {
      title: 'Hari Ini',
      value: stats.today_count || 0,
      subtitle: 'Percobaan akses',
      icon: Clock,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Minggu Ini',
      value: stats.week_count || 0,
      subtitle: `vs ${stats.last_month || 0} bulan lalu`,
      icon: TrendingUp,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      trend: stats.week_count && stats.last_month ? {
        value: Math.round(((stats.week_count - stats.last_month) / stats.last_month) * 100),
        label: 'vs bulan lalu',
        isPositive: stats.week_count >= stats.last_month,
      } : undefined,
    },
    {
      title: 'Total Akses',
      value: formatCompactNumber(stats.total_count || 0),
      subtitle: `${stats.average_daily || 0} rata-rata harian`,
      icon: Key,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Tingkat Keberhasilan',
      value: `${Math.round(stats.success_rate || 0)}%`,
      subtitle: `${stats.denial_count || 0} ditolak`,
      icon: (stats.success_rate || 0) >= 90 ? CheckCircle : AlertCircle,
      iconColor: (stats.success_rate || 0) >= 90 ? 'text-green-600' : 'text-yellow-600',
      iconBg: (stats.success_rate || 0) >= 90 ? 'bg-green-100' : 'bg-yellow-100',
    },
  ];

  return (
    <div className={mergeClasses('space-y-4 sm:space-y-6', className)}>
      {/* Stats Cards - Mobile optimized grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className={mergeClasses(
                "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0",
                stat.iconBg
              )}>
                <stat.icon className={mergeClasses("w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6", stat.iconColor)} />
              </div>
              
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">{stat.title}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 truncate">{stat.subtitle}</p>
                
                {stat.trend && (
                  <div className={mergeClasses(
                    "flex items-center gap-1 mt-1",
                    stat.trend.isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Analytics - Mobile responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Access Performance */}
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">Kinerja Akses</h3>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Success Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Tingkat Keberhasilan</span>
                <span className="text-xs sm:text-sm font-bold text-green-600">
                  {Math.round(stats.success_rate || 0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className={mergeClasses(
                    "h-2 sm:h-3 rounded-full transition-all duration-1000",
                    (stats.success_rate || 0) >= 90 ? "bg-green-500" : 
                    (stats.success_rate || 0) >= 70 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(stats.success_rate || 0, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(stats.success_rate || 0) >= 95 ? 'Performa sangat baik' : 
                 (stats.success_rate || 0) >= 85 ? 'Performa baik' : 
                 'Periksa kartu RFID'}
              </p>
            </div>

            {/* Access Breakdown */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  {(stats.total_count || 0) - (stats.denial_count || 0)}
                </p>
                <p className="text-xs text-gray-500">Diizinkan</p>
              </div>
              
              <div className="text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{stats.denial_count || 0}</p>
                <p className="text-xs text-gray-500">Ditolak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Peak Hours - Mobile optimized */}
        {stats.peak_hours && stats.peak_hours.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Jam Puncak</h3>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {stats.peak_hours.slice(0, 5).map((peak, index) => (
                <div key={index} className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">
                    {peak.hour}:00-{peak.hour + 1}:00
                  </span>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2 min-w-[40px]">
                      <div 
                        className="bg-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${Math.max((peak.count / (stats.peak_hours?.[0]?.count || 1)) * 100, 10)}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 font-medium min-w-[1.5rem] text-right">
                      {peak.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessStatistics;