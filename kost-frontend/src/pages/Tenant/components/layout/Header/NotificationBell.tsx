// File: src/pages/Tenant/components/layout/Header/NotificationBell.tsx
import React from 'react';
import { Bell } from 'lucide-react';
import { IconButton } from '../../ui/Buttons';
import { useUnreadNotificationsCount } from '../../../hooks/useNotifications';
import { mergeClasses } from '../../../utils/helpers';

interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
  className = '',
}) => {
  const { unreadCount, isLoading } = useUnreadNotificationsCount();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default action - navigate to notifications
      window.location.href = '/tenant/notifications';
    }
  };

  return (
    <div className={mergeClasses('relative', className)}>
      <IconButton
        icon={Bell}
        onClick={handleClick}
        variant="ghost"
        size="md"
        loading={isLoading}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className="text-gray-600 hover:text-gray-900"
      />
      
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;