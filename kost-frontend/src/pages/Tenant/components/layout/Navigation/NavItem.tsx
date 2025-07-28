// File: src/pages/Tenant/components/layout/Navigation/NavItem.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuItem } from '../../../types/common';
import { mergeClasses } from '../../../utils/helpers';
import { TOUCH_TARGETS } from '../../../utils/constants';

interface NavItemProps {
  item: MenuItem;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({
  item,
  className = '',
}) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const Icon = item.icon;

  const classes = mergeClasses(
    'flex flex-col items-center justify-center px-2 py-2 transition-all duration-200',
    'hover:bg-blue-50 rounded-xl relative group',
    TOUCH_TARGETS.LARGE_SIZE, // Larger touch target for mobile nav
    isActive ? 'text-blue-600' : 'text-gray-500',
    className
  );

  return (
    <Link to={item.path} className={classes}>
      {/* Icon with active indicator */}
      <div className="relative">
        <Icon className={mergeClasses(
          'w-6 h-6 transition-all duration-200',
          isActive 
            ? 'text-blue-600 scale-110' 
            : 'text-gray-500 group-hover:text-blue-600 group-hover:scale-105'
        )} />
        
        {/* Active dot indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
        )}
        
        {/* Badge for notifications/alerts */}
        {item.badge && (
          <div className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
          </div>
        )}
      </div>
      
      {/* Label */}
      <span className={mergeClasses(
        'text-xs font-medium mt-1 truncate max-w-[60px] text-center leading-tight',
        isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
      )}>
        {item.label}
      </span>
      
      {/* Active bottom border */}
      {isActive && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-t-full" />
      )}
    </Link>
  );
};

export default NavItem;