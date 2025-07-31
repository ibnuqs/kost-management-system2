// Optimized Dashboard Header Component
import React, { memo } from 'react';
import { Bell, Settings, User, Menu } from 'lucide-react';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';

// User type definition
interface UserData {
  name?: string;
  avatar?: string;
}

// Memoized user avatar component
const UserAvatar = memo<{
  user: unknown;
  className?: string;
}>(({ user, className = '' }) => {
  const userData = user as UserData;
  const initials = userData?.name ? userData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'T';
  
  return (
    <div className={`w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium ${className}`}>
      {userData?.avatar ? (
        <img 
          src={userData.avatar} 
          alt={userData.name || 'User'}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

// Memoized notification badge
const NotificationBadge = memo<{
  count: number;
}>(({ count }) => {
  if (count === 0) return null;
  
  return (
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
      <span className="text-xs font-medium text-white">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  );
});

NotificationBadge.displayName = 'NotificationBadge';

const OptimizedDashboardHeader: React.FC = () => {
  const { data, isLoading } = useTenantDashboard();
  const user = data?.user;
  const tenantInfo = data?.tenant_info;
  const unreadNotifications = data?.quick_stats?.unread_notifications || 0;

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Format room info
  const roomInfo = tenantInfo?.room ? `Room ${tenantInfo.room.number}` : 'Room not assigned';

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        {/* Left side - User info */}
        <div className="flex items-center gap-4">
          <UserAvatar user={user} className="w-12 h-12" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {getGreeting()}, {(user as UserData)?.name || 'Tenant'}!
            </h1>
            <p className="text-sm text-gray-600">
              {roomInfo} • {tenantInfo?.status || 'Active'}
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <NotificationBadge count={unreadNotifications} />
          </div>

          {/* Settings */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu (hidden on desktop) */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors md:hidden">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Days as Tenant</p>
            <p className="text-lg font-semibold text-gray-900">
              {data?.quick_stats?.days_since_move_in || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Payments Made</p>
            <p className="text-lg font-semibold text-green-600">
              {data?.quick_stats?.total_payments_made || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Access Today</p>
            <p className="text-lg font-semibold text-blue-600">
              {data?.quick_stats?.access_count_today || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Notifications</p>
            <p className="text-lg font-semibold text-purple-600">
              {unreadNotifications}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(OptimizedDashboardHeader);