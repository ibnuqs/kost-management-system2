// Mobile-Optimized Dashboard Header
import React, { memo } from 'react';
import { RefreshCw, Sunrise, Sun, Moon, Home, AlertCircle, CheckCircle } from 'lucide-react';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';
import { useUnreadNotificationsCount } from '../../hooks/useNotifications';
import { IconButton } from '../ui/Buttons';
import { NotificationBell } from '../layout/Header';
import { mergeClasses } from '../../utils/helpers';

interface DashboardHeaderProps {
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = memo(({
  className = '',
}) => {
  const { dashboardData, refreshDashboard, isLoading } = useTenantDashboard();
  const { unreadCount } = useUnreadNotificationsCount();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return Sunrise;
    if (hour < 17) return Sun;
    return Moon;
  };

  const GreetingIcon = getGreetingIcon();

  return (
    <div className={mergeClasses(
      'bg-blue-600 text-white rounded-xl shadow-lg',
      className
    )}>
      {/* Main Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <GreetingIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold leading-tight">
                  {getGreeting()}
                </h1>
                <p className="text-sm font-medium text-blue-100">
                  {dashboardData?.user?.name?.split(' ')[0] || 'Penyewa'}
                </p>
              </div>
            </div>
            
            <p className="text-blue-100 text-sm leading-relaxed">
              Selamat datang kembali di dashboard Anda
            </p>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <IconButton
              icon={RefreshCw}
              onClick={refreshDashboard}
              variant="ghost"
              size="md"
              loading={isLoading}
              className="text-white hover:bg-white/20 transition-colors"
              aria-label="Refresh dashboard"
            />
            
            <div className="hidden sm:block">
              <NotificationBell className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Home className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Kamar</span>
              </div>
              <p className="text-white font-bold text-sm">
                {dashboardData?.tenant_info?.room_number || '-'}
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Status</span>
              </div>
              <p className="text-white font-bold text-sm capitalize">
                {dashboardData?.tenant_info?.status === 'active' ? 'Aktif' : 
                 dashboardData?.tenant_info?.status === 'moved_out' ? 'Pindah' :
                 dashboardData?.tenant_info?.status === 'suspended' ? 'Suspend' : '-'}
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertCircle className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs font-medium">Notifikasi</span>
              </div>
              <p className="text-white font-bold text-sm">
                {unreadCount > 0 ? unreadCount : 'Tidak ada'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DashboardHeader;