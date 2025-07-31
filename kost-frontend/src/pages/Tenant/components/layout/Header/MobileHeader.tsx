// File: src/pages/Tenant/components/layout/Header/MobileHeader.tsx
import React from 'react';
import { Menu, Bell, Settings, Home, CreditCard, BarChart3, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { IconButton } from '../../ui/Buttons';
import NotificationBell from './NotificationBell';

interface MobileHeaderProps {
  onMenuClick: () => void;
  title?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onMenuClick,
  title,
  showNotifications = true,
  showSettings = true,
}) => {
  const location = useLocation();

  const getPageTitle = () => {
    if (title) return title;
    
    switch (location.pathname) {
      case '/tenant':
      case '/tenant/':
        return 'Dashboard';
      case '/tenant/payments':
        return 'Payments';
      case '/tenant/access-history':
        return 'Access History';
      case '/tenant/profile':
        return 'Profile';
      case '/tenant/notifications':
        return 'Notifications';
      default:
        return 'MyKost';
    }
  };

  const getPageIcon = () => {
    switch (location.pathname) {
      case '/tenant':
      case '/tenant/':
        return Home;
      case '/tenant/payments':
        return CreditCard;
      case '/tenant/access-history':
        return BarChart3;
      case '/tenant/profile':
        return User;
      case '/tenant/notifications':
        return Bell;
      default:
        return Home;
    }
  };

  return (
    <header className="md:hidden bg-white shadow-lg border-b px-4 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm bg-white/95">
      <div className="flex items-center gap-3">
        <IconButton
          icon={Menu}
          onClick={onMenuClick}
          variant="ghost"
          size="md"
          aria-label="Open menu"
          className="text-gray-600 hover:text-gray-900"
        />
        
        <div className="flex items-center gap-2">
          {React.createElement(getPageIcon(), { className: "w-5 h-5 text-gray-600" })}
          <h1 className="text-lg font-bold text-gray-900 truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {showNotifications && <NotificationBell />}
        
        {showSettings && (
          <IconButton
            icon={Settings}
            variant="ghost"
            size="md"
            aria-label="Settings"
            className="text-gray-600 hover:text-gray-900"
          />
        )}
      </div>
    </header>
  );
};

export default MobileHeader;