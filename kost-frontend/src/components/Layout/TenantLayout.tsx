// Tenant Layout with Navigation
import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { NavigationSidebar, NavigationHeader, MobileBottomNav } from '../Navigation';
import { 
  tenantMenuItems, 
  tenantQuickActions, 
  tenantMobileNavItems 
} from '../../config/navigation';

interface TenantLayoutProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  badges?: Record<string, number>;
}

const TenantLayout: React.FC<TenantLayoutProps> = ({
  user = { name: 'Tenant User', email: 'tenant@kost.com' },
  badges = {}
}) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sample badge data - in real app, this would come from API/context
  const sampleBadges = {
    pending_payments: 2,
    unread_notifications: 5,
    ...badges
  };

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'pay_outstanding':
        navigate('/tenant/payments?filter=pending');
        toast.success('Showing pending payments...');
        break;
      case 'report_issue':
        toast('Opening issue reporting form...');
        // In real app, this might open a modal or navigate to a form
        break;
      case 'emergency_access':
        toast.loading('Requesting emergency access...');
        // Simulate emergency access request
        setTimeout(() => {
          toast.success('Emergency access granted for 10 minutes');
        }, 1500);
        break;
      case 'download_receipt':
        navigate('/tenant/payments?action=download-latest');
        toast.success('Downloading latest receipt...');
        break;
      default:
        toast(`Action: ${actionId}`);
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    // In real app, this would clear auth state
    toast.success('Logged out successfully');
    navigate('/auth/login');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <NavigationSidebar
        menuItems={tenantMenuItems}
        badges={sampleBadges}
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        userRole="tenant"
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <NavigationHeader
          title="Tenant Portal"
          subtitle="Manage your tenancy"
          onMenuToggle={handleSidebarToggle}
          quickActions={tenantQuickActions}
          onQuickAction={handleQuickAction}
          notificationCount={sampleBadges.unread_notifications}
          user={user}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        menuItems={tenantMobileNavItems}
        badges={sampleBadges}
      />
    </div>
  );
};

export default TenantLayout;