// Optimized Notifications List Component
import React, { memo } from 'react';
import { Bell, AlertCircle, CheckCircle, Info, CreditCard, Key, Wifi, Clock } from 'lucide-react';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';

// Memoized notification item
const NotificationItem = memo<{
  notification: any;
  isUnread?: boolean;
}>(({ notification, isUnread }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return CreditCard;
      case 'access':
        return Key;
      case 'device':
        return Wifi;
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-green-100 text-green-600';
      case 'access':
        return 'bg-blue-100 text-blue-600';
      case 'device':
        return 'bg-purple-100 text-purple-600';
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);

  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      isUnread 
        ? 'bg-blue-50 border-blue-200' 
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
              <Clock className="w-3 h-3" />
              {notification.created_at ? new Date(notification.created_at).toLocaleString('id-ID') : 'Just now'}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          {isUnread && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

// Memoized empty state
const EmptyNotifications = memo(() => (
  <div className="text-center py-8">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Bell className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-gray-900 font-medium mb-1">No notifications yet</h3>
    <p className="text-gray-500 text-sm">You'll see important updates here</p>
  </div>
));

EmptyNotifications.displayName = 'EmptyNotifications';

// Memoized loading state
const NotificationSkeleton = memo(() => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
));

NotificationSkeleton.displayName = 'NotificationSkeleton';

interface OptimizedNotificationsListProps {
  limit?: number;
  showHeader?: boolean;
}

const OptimizedNotificationsList: React.FC<OptimizedNotificationsListProps> = ({
  limit = 10,
  showHeader = true
}) => {
  const { data, isLoading } = useTenantDashboard();
  const notifications = data?.notifications || [];
  const unreadCount = data?.quick_stats?.unread_notifications || 0;

  // Get limited notifications
  const displayNotifications = notifications.slice(0, limit);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} new
              </span>
            )}
          </div>
          {notifications.length > limit && (
            <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
              View All
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <NotificationSkeleton />
      ) : displayNotifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <div className="space-y-3">
          {displayNotifications.map((notification, index) => (
            <NotificationItem
              key={notification.id || index}
              notification={notification}
              isUnread={notification.read_at === null}
            />
          ))}
        </div>
      )}

      {/* Show more button */}
      {!isLoading && displayNotifications.length > 0 && notifications.length > limit && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
            View {notifications.length - limit} more notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(OptimizedNotificationsList);