// Optimized Quick Stats Component
import React, { memo, useMemo } from 'react';
import { Calendar, CreditCard, Key, Wifi, TrendingUp, TrendingDown } from 'lucide-react';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';
import { StatCard } from '../ui/Card';
import { mergeClasses, getResponsiveColumns } from '../../utils/helpers';
import { formatCompactNumber } from '../../utils/formatters';

interface QuickStatsProps {
  className?: string;
}

const QuickStats: React.FC<QuickStatsProps> = memo(({
  className = '',
}) => {
  const { dashboardData, isLoading } = useTenantDashboard();
  const stats = dashboardData?.quick_stats;

  // Memoize stats data to prevent unnecessary recalculations
  const statsData = useMemo(() => {
    if (!stats) return [];

    const deviceUptime = stats.devices_total ? ((stats.devices_online / stats.devices_total) * 100) : 0;
    const accessTrend = stats.access_count_week > 0 ? 
      Math.round(((stats.access_count_month / stats.access_count_week) * 100) - 100) : 0;

    return [
      {
        title: 'Hari Tinggal',
        value: stats.days_since_move_in || 0,
        icon: Calendar,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        trend: {
          value: 0,
          label: 'hari total',
          isPositive: true,
        },
      },
      {
        title: 'Pembayaran',
        value: formatCompactNumber(stats.total_payments_made || 0),
        icon: CreditCard,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100',
        subtitle: `${stats.current_streak || 0} bulan berturut`,
        trend: {
          value: stats.current_streak || 0,
          label: 'bulan berturut',
          isPositive: (stats.current_streak || 0) > 0,
        },
      },
      {
        title: 'Akses Hari Ini',
        value: stats.access_count_today || 0,
        icon: Key,
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-100',
        subtitle: `${stats.access_count_week || 0} minggu ini`,
        trend: {
          value: Math.abs(accessTrend),
          label: 'vs minggu lalu',
          isPositive: accessTrend > 0,
        },
      },
      {
        title: 'Status Perangkat',
        value: `${stats.devices_online || 0}/${stats.devices_total || 0}`,
        icon: Wifi,
        iconColor: deviceUptime > 80 ? 'text-green-600' : 'text-yellow-600',
        iconBg: deviceUptime > 80 ? 'bg-green-100' : 'bg-yellow-100',
        trend: {
          value: Math.round(deviceUptime),
          label: 'aktif',
          isPositive: deviceUptime > 80,
        },
      },
    ];
  }, [stats]);

  if (isLoading) {
    return (
      <div className={mergeClasses(
        'grid gap-3 sm:gap-4',
        'grid-cols-2 sm:grid-cols-4',
        className
      )}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={mergeClasses(
      'grid gap-3 sm:gap-4',
      'grid-cols-2 sm:grid-cols-4',
      className
    )}>
      {statsData.map((stat, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {stat.title}
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
              {stat.trend && (
                <div className="flex items-center mt-1">
                  {stat.trend.isPositive ? (
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${stat.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend.value}
                  </span>
                </div>
              )}
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {stat.subtitle}
                </p>
              )}
            </div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${stat.iconBg} ml-2`}>
              <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default QuickStats;