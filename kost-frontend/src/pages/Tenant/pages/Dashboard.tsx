// Optimized Tenant Dashboard - Performance & User Experience Focused
import React, { Suspense, lazy } from 'react';
import { useTenantDashboard } from '../hooks/useTenantDashboard';
import { ErrorBoundary } from '../../../components/Common/ErrorBoundary';
import { LoadingSpinner } from '../components/ui/Status';
import { RefreshCw, Wifi, CreditCard, Key, User, Bell } from 'lucide-react';

// Lazy load components for better performance
const DashboardHeader = lazy(() => import('../components/dashboard/DashboardHeader'));
const QuickStats = lazy(() => import('../components/dashboard/QuickStats'));
const PaymentStatus = lazy(() => import('../components/dashboard/PaymentStatus'));
const AccessStats = lazy(() => import('../components/dashboard/AccessStats'));
const NotificationsList = lazy(() => import('../components/dashboard/NotificationsList'));
const TenancySummary = lazy(() => import('../components/dashboard/TenancySummary'));
const TenantDoorControl = lazy(() => import('../components/feature/door/TenantDoorControl'));

// Mobile-optimized skeleton loader
const SkeletonLoader: React.FC<{ height?: string; className?: string }> = ({ 
  height = 'h-32', 
  className = '' 
}) => (
  <div className={`${height} bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse ${className}`}>
    <div className="p-3 sm:p-6">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 sm:mb-4"></div>
      <div className="space-y-2 sm:space-y-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        <div className="h-3 bg-gray-200 rounded w-3/5"></div>
      </div>
    </div>
  </div>
);

// Performance indicator component
const PerformanceIndicator: React.FC<{ 
  isLoading: boolean; 
  onRefresh: () => void;
}> = ({ isLoading, onRefresh }) => (
  <div className="fixed bottom-4 right-4 z-50">
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-xs text-gray-600">Live</span>
        </div>
        <div className="border-l border-gray-200 pl-2">
          <span className="text-xs text-gray-500">
            {new Date().toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  </div>
);

// Mobile-optimized quick action buttons
const QuickActionButtons: React.FC = () => {
  const actions = [
    { 
      label: 'Bayar Sewa', 
      href: '/tenant/payments', 
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: CreditCard
    },
    { 
      label: 'Riwayat Akses', 
      href: '/tenant/access-history', 
      color: 'bg-green-600 hover:bg-green-700',
      icon: Key
    },
    { 
      label: 'Profil', 
      href: '/tenant/profile', 
      color: 'bg-purple-600 hover:bg-purple-700',
      icon: User
    },
    { 
      label: 'Notifikasi', 
      href: '/tenant/notifications', 
      color: 'bg-orange-600 hover:bg-orange-700',
      icon: Bell
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <a
              key={index}
              href={action.href}
              className={`${action.color} text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center hover:shadow-md`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="truncate">{action.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

// Main dashboard component
const Dashboard: React.FC = () => {
  const {
    isLoading,
    isError,
    error,
    refetch,
    dashboardData,
  } = useTenantDashboard();

  // Initial loading state
  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Dashboard</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Silakan periksa koneksi internet Anda dan coba lagi.'}
          </p>
          <button 
            onClick={() => refetch()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Background refresh indicator */}
        {isLoading && dashboardData && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-lg">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Memperbarui...</span>
            </div>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <ErrorBoundary fallback={<SkeletonLoader height="h-32" />}>
            <Suspense fallback={<SkeletonLoader height="h-32" />}>
              <DashboardHeader />
            </Suspense>
          </ErrorBoundary>

          {/* Door Control - Below Greeting Card */}
          <ErrorBoundary fallback={<SkeletonLoader height="h-48" />}>
            <Suspense fallback={<SkeletonLoader height="h-48" />}>
              <TenantDoorControl />
            </Suspense>
          </ErrorBoundary>

          {/* Quick Stats */}
          <ErrorBoundary fallback={<SkeletonLoader height="h-24" />}>
            <Suspense fallback={<SkeletonLoader height="h-24" />}>
              <QuickStats />
            </Suspense>
          </ErrorBoundary>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left Column - Primary Content */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              {/* Payment Status - Most Important */}
              <ErrorBoundary fallback={<SkeletonLoader height="h-80" />}>
                <Suspense fallback={<SkeletonLoader height="h-80" />}>
                  <PaymentStatus />
                </Suspense>
              </ErrorBoundary>

              {/* Access Stats */}
              <ErrorBoundary fallback={<SkeletonLoader height="h-64" />}>
                <Suspense fallback={<SkeletonLoader height="h-64" />}>
                  <AccessStats />
                </Suspense>
              </ErrorBoundary>
            </div>

            {/* Right Column - Secondary Content */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-6">
              {/* Quick Actions */}
              <QuickActionButtons />

              {/* Notifications */}
              <ErrorBoundary fallback={<SkeletonLoader height="h-64" />}>
                <Suspense fallback={<SkeletonLoader height="h-64" />}>
                  <NotificationsList limit={5} />
                </Suspense>
              </ErrorBoundary>

              {/* Tenancy Summary */}
              <ErrorBoundary fallback={<SkeletonLoader height="h-48" />}>
                <Suspense fallback={<SkeletonLoader height="h-48" />}>
                  <TenancySummary />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>

          {/* Mobile Bottom Spacing */}
          <div className="h-20 md:hidden"></div>
        </div>
      </div>

      {/* Performance Indicator */}
      <PerformanceIndicator
        isLoading={isLoading}
        onRefresh={() => refetch()}
      />
    </div>
  );
};

export default Dashboard;