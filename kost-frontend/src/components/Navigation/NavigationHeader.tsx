// Navigation Header Component
import React, { memo } from 'react';
import { Menu, Bell, User, Search, LogOut } from 'lucide-react';
import { QuickAction } from '../../config/navigation';
import QuickActions from './QuickActions';

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
  quickActions?: QuickAction[];
  onQuickAction?: (actionId: string) => void;
  notificationCount?: number;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  className?: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = memo(({
  title,
  subtitle,
  onMenuToggle,
  quickActions = [],
  onQuickAction = () => {},
  notificationCount = 0,
  user,
  onLogout,
  className = ''
}) => {
  return (
    <header className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Page Title */}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center Section - Quick Actions */}
        <div className="hidden md:flex flex-1 justify-center max-w-md">
          {quickActions.length > 0 && (
            <QuickActions 
              actions={quickActions} 
              onActionClick={onQuickAction}
            />
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search (Desktop) */}
          <button className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Search className="w-5 h-5 text-gray-500" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Bell className="w-5 h-5 text-gray-500" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full min-w-[18px] h-4">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          {user && (
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {user.name}
                </span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                
                <div className="py-2">
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                  
                  {onLogout && (
                    <button 
                      onClick={onLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Quick Actions */}
      {quickActions.length > 0 && (
        <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
          <QuickActions 
            actions={quickActions} 
            onActionClick={onQuickAction}
            className="flex-wrap"
          />
        </div>
      )}
    </header>
  );
});

NavigationHeader.displayName = 'NavigationHeader';

export default NavigationHeader;