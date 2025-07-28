// Optimized Quick Stats Component
import React, { memo } from 'react';
import { Calendar, CreditCard, Key, Wifi, TrendingUp, TrendingDown } from 'lucide-react';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';

// Memoized stat card component
const StatCard = memo<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  loading?: boolean;
}>(({ title, value, icon: Icon, color, trend, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

const OptimizedQuickStats: React.FC = () => {
  const { data, isLoading } = useTenantDashboard();
  const stats = data?.quick_stats;

  // Calculate trends
  const deviceUptime = stats?.devices_total ? ((stats.devices_online / stats.devices_total) * 100) : 0;
  const monthlyAccess = stats?.access_count_month || 0;
  const weeklyAccess = stats?.access_count_week || 0;
  const accessTrend = weeklyAccess > 0 ? ((monthlyAccess / weeklyAccess) * 100) - 100 : 0;

  const statsData = [
    {
      title: 'Days as Tenant',
      value: stats?.days_since_move_in || 0,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Payments Made',
      value: stats?.total_payments_made || 0,
      icon: CreditCard,
      color: 'bg-green-500',
      trend: {
        value: stats?.current_streak || 0,
        isPositive: (stats?.current_streak || 0) > 0,
        label: 'month streak'
      }
    },
    {
      title: 'Access Today',
      value: stats?.access_count_today || 0,
      icon: Key,
      color: 'bg-purple-500',
      trend: {
        value: Math.round(accessTrend),
        isPositive: accessTrend > 0,
        label: 'vs last week'
      }
    },
    {
      title: 'Device Status',
      value: `${stats?.devices_online || 0}/${stats?.devices_total || 0}`,
      icon: Wifi,
      color: deviceUptime > 80 ? 'bg-green-500' : 'bg-yellow-500',
      trend: {
        value: Math.round(deviceUptime),
        isPositive: deviceUptime > 80,
        label: 'uptime'
      }
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          loading={isLoading}
        />
      ))}
    </div>
  );
};

export default memo(OptimizedQuickStats);