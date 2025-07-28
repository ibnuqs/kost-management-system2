// File: src/pages/Tenant/components/dashboard/NotificationsList.tsx - UPDATED VERSION
import React, { memo } from 'react';
import { Bell, ChevronRight, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatTimeAgo } from '../../utils/formatters';
import { getNotificationTypeLabel, getNotificationTypeIcon } from '../../types/notification';
import { Notification } from '../../types/notification';
import { tenantService } from '../../services/tenantService';

interface NotificationsListProps {
  limit?: number;
  className?: string;
}

const NotificationsList: React.FC<NotificationsListProps> = memo(({ limit = 5, className = '' }) => {
  const { notifications, isLoading, isError } = useNotifications({ 
    enabled: true,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Gunakan data real dari database
  const displayNotifications = notifications ? notifications.slice(0, limit) : [];

  // Safe date formatting
  const formatNotificationDate = (notification: Notification): string => {
    try {
      const dateValue = notification.created_at;
      
      if (!dateValue) {
        console.warn('No date field found for notification:', notification);
        return 'Waktu tidak diketahui';
      }

      return formatTimeAgo(dateValue);
    } catch (error) {
      console.error('Error formatting notification date:', error, 'Notification:', notification);
      return 'Waktu tidak diketahui';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder':
      case 'payment_failed':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </div>
        );
      case 'payment_success':
      case 'rfid_request_approved':
      case 'access_granted':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
        );
      case 'access_denied':
      case 'rfid_request_rejected':
      case 'security_alert':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Info className="w-4 h-4 text-blue-600" />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifikasi Terbaru</h2>
          </div>
          <a
            href="/tenant/notifications"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <span className="hidden sm:inline">Lihat Semua</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Safe rendering */}
        <div className="space-y-3">
          {displayNotifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">Belum ada notifikasi</h3>
              <p className="text-gray-500 text-sm">Anda akan melihat update penting di sini</p>
            </div>
          ) : (
            displayNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  notification.status === 'unread' 
                    ? 'bg-blue-50 border border-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {getTypeIcon(notification.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`text-sm font-medium ${
                      notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h3>
                    {notification.status === 'unread' && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {formatNotificationDate(notification)}
                    </p>
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      {getNotificationTypeLabel(notification.type)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status info */}
        {displayNotifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {displayNotifications.filter(n => n.status === 'unread').length} belum dibaca
              </span>
              <span>
                {displayNotifications.length} dari {notifications?.length || 0} notifikasi
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

NotificationsList.displayName = 'NotificationsList';

export default NotificationsList;