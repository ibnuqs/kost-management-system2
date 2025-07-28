// File: src/pages/Tenant/components/layout/Sidebar/Sidebar.tsx
import React from 'react';
import { X } from 'lucide-react';
import { tenantMenuItems } from '../../../config/menuConfig';
import { useTenantDashboard } from '../../../hooks/useTenantDashboard';
import { IconButton } from '../../ui/Buttons';
import MenuItem from './MenuItem';
import UserInfo from './UserInfo';
import QuickActions from './QuickActions';
import { mergeClasses } from '../../../utils/helpers';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  className = '',
}) => {
  const { dashboardData } = useTenantDashboard();

  // Prevent scroll when sidebar is open on mobile only
  React.useEffect(() => {
    const isMobile = window.innerWidth < 768; // md breakpoint
    
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={mergeClasses(
        // Mobile: Fixed positioning
        'fixed left-0 top-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out',
        'w-72 border-r',
        // Desktop: Fixed positioning but always visible
        'md:fixed md:left-0 md:top-0 md:h-screen md:translate-x-0 md:shadow-lg',
        // Mobile show/hide logic
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">M</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">MyKost</h2>
              <p className="text-blue-100 text-sm">Tenant Portal</p>
            </div>
          </div>
          
          <IconButton
            icon={X}
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/20"
            aria-label="Close sidebar"
          />
        </div>

        {/* User Info */}
        <div className="p-4 border-b bg-gray-50">
          <UserInfo 
            user={dashboardData?.user || undefined}
            tenantInfo={dashboardData?.tenant_info || undefined}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-2">
            {tenantMenuItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                onClick={onClose}
              />
            ))}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t bg-gray-50">
          <QuickActions onActionClick={onClose} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              POTUNA KOST Tenant v1.0
            </p>
            <p className="text-xs text-gray-400 mt-1">
              © 2024 All rights reserved
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;