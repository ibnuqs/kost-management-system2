// File: src/pages/Tenant/components/layout/Sidebar/MenuItem.tsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MenuItem as MenuItemType } from '../../../types/common';
import { mergeClasses } from '../../../utils/helpers';
import { TOUCH_TARGETS } from '../../../utils/constants';

interface MenuItemProps {
  item: MenuItemType;
  onClick?: () => void;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  onClick,
  className = '',
}) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const Icon = item.icon;

  const baseClasses = [
    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
    'hover:bg-blue-50 hover:text-blue-700 group relative',
    TOUCH_TARGETS.MIN_SIZE,
  ];

  const activeClasses = isActive 
    ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
    : 'text-gray-700';

  const classes = mergeClasses(
    ...baseClasses,
    activeClasses,
    className
  );

  const handleClick = () => {
    onClick?.();
  };

  return (
    <Link
      to={item.path}
      className={classes}
      onClick={handleClick}
    >
      <div className={mergeClasses(
        'w-5 h-5 flex-shrink-0 transition-transform duration-200',
        'group-hover:scale-110',
        isActive ? 'text-white' : 'text-gray-500'
      )}>
        <Icon className="w-full h-full" />
      </div>
      
      <div className="flex-1 min-w-0">
        <span className={mergeClasses(
          'font-medium truncate text-sm',
          isActive ? 'text-white' : 'text-gray-700'
        )}>
          {item.label}
        </span>
        {item.description && (
          <p className={mergeClasses(
            'text-xs truncate mt-0.5',
            isActive ? 'text-blue-100' : 'text-gray-500'
          )}>
            {item.description}
          </p>
        )}
      </div>
      
      {item.badge && (
        <div className={mergeClasses(
          'flex-shrink-0 px-2 py-1 rounded-full text-xs font-bold',
          isActive 
            ? 'bg-white/20 text-white' 
            : 'bg-red-500 text-white'
        )}>
          {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
        </div>
      )}
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
      )}
    </Link>
  );
};

export default MenuItem;