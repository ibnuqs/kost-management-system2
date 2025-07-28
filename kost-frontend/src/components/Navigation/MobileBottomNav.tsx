// Mobile Bottom Navigation Component
import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuItem } from '../../config/navigation';

interface MobileBottomNavProps {
  menuItems: MenuItem[];
  badges?: Record<string, number>;
  className?: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = memo(({
  menuItems,
  badges = {},
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
    <nav 
      className={`
        fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200
        lg:hidden ${className}
      `}
    >
      <div className="flex">
        {menuItems.map((item) => {
          const isActive = isActiveRoute(item.path, item.exact);
          const badgeCount = getBadgeCount(item.badge);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`
                flex-1 flex flex-col items-center justify-center py-2 px-1 relative
                transition-colors duration-200
                ${isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {/* Badge */}
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full min-w-[18px] h-4">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
              
              {/* Icon */}
              <Icon className="w-5 h-5 mb-1" />
              
              {/* Label */}
              <span className="text-xs font-medium leading-tight">
                {item.label}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';

export default MobileBottomNav;