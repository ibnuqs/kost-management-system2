// Admin Layout with Navigation
import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { NavigationSidebar, NavigationHeader, MobileBottomNav } from '../Navigation';
import { 
  adminMenuItems, 
  adminQuickActions, 
  adminMobileNavItems,
  getQuickActionsByRole 
} from '../../config/navigation';

interface AdminLayoutProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  badges?: Record<string, number>;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  user = { name: 'Admin User', email: 'admin@kost.com' },
  badges = {}
}) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sample badge data - in real app, this would come from API/context
  const sampleBadges = {
    maintenance_requests: 3,
    new_applications: 2,
    pending_payments: 8,
    offline_devices: 1,
    unread_notifications: 12,
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
      case 'add_tenant':
        navigate('/admin/tenants?action=add');
        toast.success('Opening tenant registration form...');
        break;
      case 'generate_payments':
        navigate('/admin/payments?action=generate');
        toast.success('Opening payment generation...');
        break;
      case 'send_announcement':
        navigate('/admin/notifications?action=send');
        toast.success('Opening announcement composer...');
        break;
      case 'backup_system':
        toast.loading('Starting system backup...');
        // Simulate backup process
        setTimeout(() => {
          toast.success('System backup completed!');
        }, 2000);
        break;
      default:
        toast.info(`Action: ${actionId}`);
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
        menuItems={adminMenuItems}
        badges={sampleBadges}
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        userRole="admin"
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <NavigationHeader
          title="Admin Dashboard"
          subtitle="Manage your kost system"
          onMenuToggle={handleSidebarToggle}
          quickActions={adminQuickActions}
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
        menuItems={adminMobileNavItems}
        badges={sampleBadges}
      />
    </div>
  );
};

export default AdminLayout;