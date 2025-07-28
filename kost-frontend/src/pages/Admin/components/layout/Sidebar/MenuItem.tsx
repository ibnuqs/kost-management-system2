// File: src/pages/Admin/components/layout/Sidebar/MenuItem.tsx
import React from 'react';
import type { MenuItem as MenuItemType } from '../../../types';

interface MenuItemProps {
  item: MenuItemType;
  isActive: boolean;
  onClick: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group relative ${
        isActive
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon className={`w-5 h-5 mr-4 flex-shrink-0 transition-colors ${
        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
      }`} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm truncate">{item.label}</p>
          {item.isNew && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
              New
            </span>
          )}
          {item.badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
              {item.badge}
            </span>
          )}
        </div>
        <p className={`text-xs transition-colors truncate ${
          isActive ? 'text-blue-500' : 'text-slate-500'
        }`}>
          {item.description}
        </p>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full" />
      )}
    </button>
  );
};