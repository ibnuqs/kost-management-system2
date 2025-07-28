// File: src/pages/Admin/components/layout/Sidebar.tsx
import React from 'react';
import { 
  Shield, LogOut, Server, 
  ChevronDown, ChevronRight 
} from 'lucide-react';
import type { MenuCategories, CategoryLabels, MenuItem } from '../../../types';

interface SidebarProps {
  user: any;
  menuCategories: MenuCategories;
  categoryLabels: CategoryLabels;
  currentPage: string;
  collapsedSections: Record<string, boolean>;
  sidebarOpen: boolean;
  onMenuClick: (itemId: string) => void;
  onToggleSection: (category: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  menuCategories,
  categoryLabels,
  currentPage,
  collapsedSections,
  sidebarOpen,
  onMenuClick,
  onToggleSection,
  onLogout
}) => {
  const renderMenuSection = (category: keyof MenuCategories, items: MenuItem[]) => {
    const isCollapsed = collapsedSections[category];
    const isMainCategory = category === 'main';
    
    return (
      <div key={category} className="mb-4">
        {!isMainCategory && (
          <button
            onClick={() => onToggleSection(category)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors"
          >
            <span>{categoryLabels[category]}</span>
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
        
        <div className={`space-y-1 ${!isMainCategory && isCollapsed ? 'hidden' : ''}`}>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onMenuClick(item.id)}
                className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium border border-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 flex-shrink-0 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm truncate">{item.label}</p>
                    {item.badge && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 ml-2">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:static flex flex-col`}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 bg-blue-600">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Sistem Kost</h1>
            <p className="text-xs text-blue-100">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              <span className="text-xs text-green-600">Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col">
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {renderMenuSection('main', menuCategories.main)}
          {renderMenuSection('property', menuCategories.property)}
          {renderMenuSection('security', menuCategories.security)}
        </nav>

        {/* System Status */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500">
              <Server className="w-3 h-3 mr-1" />
              <span>Status Sistem</span>
            </div>
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
              <span className="font-medium">Normal</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 mr-3 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span className="text-sm font-medium">Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
};