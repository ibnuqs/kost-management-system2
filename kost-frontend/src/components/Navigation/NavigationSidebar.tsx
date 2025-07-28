// Universal Navigation Sidebar Component
import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { MenuItem } from '../../config/navigation';

interface NavigationSidebarProps {
  menuItems: MenuItem[];
  badges?: Record<string, number>;
  isOpen?: boolean;
  onClose?: () => void;
  userRole: 'admin' | 'tenant';
  className?: string;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = memo(({
  menuItems,
  badges = {},
  isOpen = true,
  onClose,
  userRole,
  className = ''
}) => {
  const location = useLocation();

  const isActiveRoute = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getBadgeCount = (badgeKey?: string): number => {
    if (!badgeKey || !badges[badgeKey]) return 0;
    return badges[badgeKey];
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {userRole === 'admin' ? 'Admin Panel' : 'Tenant Portal'}
            </h1>
            <p className="text-sm text-gray-500">
              {userRole === 'admin' ? 'Manage your kost' : 'Your dashboard'}
            </p>
          </div>
          
          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => {
              const isActive = isActiveRoute(item.path, item.exact);
              const badgeCount = getBadgeCount(item.badge);
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={onClose} // Close mobile menu on navigation
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {/* Icon */}
                    <Icon 
                      className={`
                        w-5 h-5 transition-colors duration-200
                        ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                      `} 
                    />
                    
                    {/* Label */}
                    <span className="flex-1">{item.label}</span>
                    
                    {/* Badge */}
                    {badgeCount > 0 && (
                      <span className={`
                        inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full min-w-[20px] h-5
                        ${isActive 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      `}>
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    )}
                  </Link>
                  
                  {/* Tooltip for description */}
                  {item.description && (
                    <div className="hidden lg:block">
                      <p className="text-xs text-gray-500 px-6 py-1">
                        {item.description}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500 text-center">
            <p>Kost Management v2.0</p>
            <p>© 2025 All rights reserved</p>
          </div>
        </div>
      </aside>
    </>
  );
});

NavigationSidebar.displayName = 'NavigationSidebar';

export default NavigationSidebar;