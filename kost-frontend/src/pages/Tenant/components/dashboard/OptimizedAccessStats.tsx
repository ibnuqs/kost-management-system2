// Optimized Access Stats Component
import React, { memo, useMemo } from 'react';
import { Key, Clock, TrendingUp, Calendar, Shield } from 'lucide-react';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';

// Memoized access card component
const AccessCard = memo<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}>(({ title, value, subtitle, icon: Icon, color, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
});

AccessCard.displayName = 'AccessCard';

// Memoized recent access list
const RecentAccessList = memo<{
  accessLogs: any[];
  loading?: boolean;
}>(({ accessLogs, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!accessLogs || accessLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No recent access logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {accessLogs.slice(0, 5).map((log, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 p-3 rounded-lg ${
            log.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            log.status === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {log.status === 'success' ? (
              <Key className="w-4 h-4 text-green-600" />
            ) : (
              <Shield className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {log.location || 'Main Door'}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(log.timestamp).toLocaleString('id-ID')}
            </p>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            log.status === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {log.status === 'success' ? 'Granted' : 'Denied'}
          </div>
        </div>
      ))}
    </div>
  );
});

RecentAccessList.displayName = 'RecentAccessList';

const OptimizedAccessStats: React.FC = () => {
  const { data, isLoading } = useTenantDashboard();
  const accessStats = data?.access_stats;

  // Memoized calculations
  const statsData = useMemo(() => {
    if (!accessStats) {
      return [
        { title: 'Today', value: 0, icon: Calendar, color: 'bg-blue-500' },
        { title: 'This Week', value: 0, icon: TrendingUp, color: 'bg-green-500' },
        { title: 'This Month', value: 0, icon: Clock, color: 'bg-purple-500' },
        { title: 'Success Rate', value: '0%', icon: Shield, color: 'bg-yellow-500' }
      ];
    }

    const todayCount = accessStats.today_count || 0;
    const weekCount = accessStats.week_count || 0;
    const monthCount = accessStats.month_count || 0;
    const successCount = accessStats.success_count || 0;
    const totalCount = accessStats.total_count || 0;
    const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

    return [
      { 
        title: 'Today', 
        value: todayCount, 
        icon: Calendar, 
        color: 'bg-blue-500',
        subtitle: 'access attempts'
      },
      { 
        title: 'This Week', 
        value: weekCount, 
        icon: TrendingUp, 
        color: 'bg-green-500',
        subtitle: 'total accesses'
      },
      { 
        title: 'This Month', 
        value: monthCount, 
        icon: Clock, 
        color: 'bg-purple-500',
        subtitle: 'monthly total'
      },
      { 
        title: 'Success Rate', 
        value: `${successRate}%`, 
        icon: Shield, 
        color: successRate > 80 ? 'bg-green-500' : 'bg-yellow-500',
        subtitle: `${successCount}/${totalCount} successful`
      }
    ];
  }, [accessStats]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Key className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Access Statistics</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsData.map((stat, index) => (
          <AccessCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Recent Access Logs */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Recent Access Logs</h4>
        <RecentAccessList 
          accessLogs={accessStats?.recent_logs || []} 
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default memo(OptimizedAccessStats);