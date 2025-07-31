// File: src/pages/Admin/Layout.tsx - CLEAN & MAINTAINABLE VERSION
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../Auth';
import { Sidebar, MobileHeader } from './components/layout';
import { MENU_CONFIG, CATEGORY_LABELS } from './config';
import type { MenuCategories } from './types';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Memoize menu categories to prevent recalculation
  const menuCategories: MenuCategories = useMemo(() => ({
    main: MENU_CONFIG.filter(item => item.category === 'main'),
    property: MENU_CONFIG.filter(item => item.category === 'property'),
    security: MENU_CONFIG.filter(item => item.category === 'security'),
  }), []);

  const handleMenuClick = useCallback((itemId: string) => {
    setCurrentPage(itemId);
    setSidebarOpen(false);
  }, []);

  const toggleSection = useCallback((category: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  // Memoize current menu item lookup
  const currentMenuItem = useMemo(() => 
    MENU_CONFIG.find(item => item.id === currentPage), 
    [currentPage]
  );

  const renderContent = useCallback(() => {
    if (!currentMenuItem) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
          <p className="text-slate-600">The requested page could not be found.</p>
        </div>
      );
    }

    const Component = currentMenuItem.component;
    const props = currentMenuItem.id === 'dashboard' ? { onNavigate: handleMenuClick } : {};
    
    return <Component {...props} />;
  }, [handleMenuClick, currentMenuItem]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <Sidebar
        user={user}
        menuCategories={menuCategories}
        categoryLabels={CATEGORY_LABELS}
        currentPage={currentPage}
        collapsedSections={collapsedSections}
        sidebarOpen={sidebarOpen}
        onMenuClick={handleMenuClick}
        onToggleSection={toggleSection}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <MobileHeader
          currentMenuItem={currentMenuItem}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;