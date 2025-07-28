// pages/Auth/components/layout/AuthLayout.tsx
// Enhanced authentication layout with background patterns

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-apple-background ${className}`}>
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center w-full">
        {children}
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-4 left-0 right-0 z-10">
        <div className="text-center text-xs text-apple-text-secondary opacity-75">
          <p>&copy; 2024 Potuna Kost. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};