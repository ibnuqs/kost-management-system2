// File: src/pages/Tenant/components/layout/Sidebar/QuickActions.tsx
import React from 'react';
import { CreditCard, Bell, MessageCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenantPayments } from '../../../hooks/useTenantPayments';
import { useUnreadNotificationsCount } from '../../../hooks/useNotifications';
import api, { endpoints } from '../../../../../utils/api'; // Import API dari utils
import { toast } from 'react-hot-toast';
import { mergeClasses } from '../../../utils/helpers';

interface QuickActionsProps {
  onActionClick?: () => void;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onActionClick,
  className = '',
}) => {
  const navigate = useNavigate();
  const { payments } = useTenantPayments();
  const { unreadCount } = useUnreadNotificationsCount();

  const handleQuickPay = () => {
    navigate('/tenant/payments');
    onActionClick?.();
  };

  const handleNotifications = () => {
    navigate('/tenant/notifications');
    onActionClick?.();
  };

  const handleSupport = () => {
    // Open support/contact modal or navigate to support page
    onActionClick?.();
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        // Call logout API using the endpoint from api.ts
        await api.post(endpoints.auth.logout);
        
        // Clear authentication data from localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Show success message
        toast.success('Logged out successfully');
        
        // Redirect to login page
        navigate('/login', { replace: true });
        
        onActionClick?.();
      } catch (error: unknown) {
        console.error('Logout failed:', error);
        
        // Even if API call fails, clear local storage and redirect
        // This ensures user is logged out locally
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Show error message but still redirect
        toast.error('Logout completed (with connection issue)');
        navigate('/login', { replace: true });
        
        onActionClick?.();
      }
    }
  };

  const pendingPayment = payments?.find(p => p.status === 'pending');

  return (
    <div className={mergeClasses('space-y-3', className)}>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Quick Actions
      </h4>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Quick Pay */}
        <button
          onClick={handleQuickPay}
          className={mergeClasses(
            'flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200',
            'hover:bg-blue-50 hover:scale-105 group',
            pendingPayment ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
          )}
        >
          <div className={mergeClasses(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            pendingPayment 
              ? 'bg-red-100 text-red-600' 
              : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
          )}>
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-gray-700">
            {pendingPayment ? 'Pay Now!' : 'Payments'}
          </span>
          {pendingPayment && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={handleNotifications}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:scale-105 transition-all duration-200 group relative"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Alerts</span>
          {unreadCount > 0 && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>

        {/* Support */}
        <button
          onClick={handleSupport}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-green-50 hover:scale-105 transition-all duration-200 group"
        >
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <MessageCircle className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Support</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-red-50 hover:scale-105 transition-all duration-200 group"
        >
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <LogOut className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;