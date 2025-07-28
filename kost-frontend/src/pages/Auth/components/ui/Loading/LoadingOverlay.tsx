// pages/Auth/components/ui/Loading/LoadingOverlay.tsx
// Full-screen loading overlay component

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isVisible?: boolean;
  message?: string;
  backdrop?: 'dark' | 'light' | 'blur';
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible = true,
  message = 'Loading...', 
  backdrop = 'dark',
  className = ''
}) => {
  if (!isVisible) return null;

  const backdropClasses = {
    dark: 'bg-black bg-opacity-50',
    light: 'bg-white bg-opacity-75',
    blur: 'bg-white bg-opacity-50 backdrop-blur-sm'
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${backdropClasses[backdrop]} ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4 flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" color="primary" />
        <div className="text-center">
          <p className="text-gray-700 font-medium">{message}</p>
          <p className="text-gray-500 text-sm mt-1">Please wait...</p>
        </div>
      </div>
    </div>
  );
};