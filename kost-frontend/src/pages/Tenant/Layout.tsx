// ===== src/pages/Tenant/Layout.tsx =====
import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tenantService } from './services/tenantService';
import { mergeClasses } from './utils/helpers';

// Layout Components
import MobileHeader from './components/layout/Header/MobileHeader';
import Sidebar from './components/layout/Sidebar/Sidebar';
import MobileBottomNav from './components/layout/Navigation/MobileBottomNav';
import LoadingScreen from './components/ui/Status/LoadingSpinner';

const Layout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop) {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get user data for layout - with better error handling
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch 
  } = useQuery({
    queryKey: ['tenant-dashboard'],
    queryFn: () => tenantService.getDashboardData(),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  // Memoized handlers
  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when route changes (mobile only)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Show loading screen only on initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingScreen />
          <p className="mt-4 text-gray-600">Loading tenant dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if dashboard data fails to load
  if (isError && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            {(error as Error)?.message || 'Something went wrong while loading the tenant dashboard.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Only visible on mobile */}
      <MobileHeader
        onMenuClick={handleMenuClick}
        showNotifications={true}
        showSettings={true}
      />

      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={mergeClasses(
        // Mobile: account for mobile header and bottom nav
        'pt-0 md:pt-0', // No top padding since header is sticky
        'pb-20 md:pb-6', // Space for mobile bottom nav
        // Desktop: margin for fixed sidebar
        'md:ml-72', // Space for 288px (w-72) sidebar on desktop
        'transition-all duration-300 ease-in-out',
        'min-h-screen' // Ensure content takes full height
      )}>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;