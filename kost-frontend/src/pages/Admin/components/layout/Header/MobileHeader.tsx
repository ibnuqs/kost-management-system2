// File: src/pages/Admin/components/layout/MobileHeader.tsx
import React from 'react';
import { Menu } from 'lucide-react';
import type { MenuItem } from '../../../types';

interface MobileHeaderProps {
  currentMenuItem?: MenuItem;
  onMenuOpen: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentMenuItem,
  onMenuOpen
}) => {
  return (
    <header className="lg:hidden bg-white/95 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200/80 px-4 h-16 flex items-center justify-between shadow-sm">
      <button 
        onClick={onMenuOpen} 
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex items-center space-x-2">
        {currentMenuItem?.icon && (
          <currentMenuItem.icon className="w-5 h-5 text-slate-600" />
        )}
        <h1 className="text-lg font-semibold text-slate-800">
          {currentMenuItem?.label || 'Dashboard'}
        </h1>
        {currentMenuItem?.isNew && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            New
          </span>
        )}
      </div>
      
      <div className="w-8"></div> {/* Spacer */}
    </header>
  );
};