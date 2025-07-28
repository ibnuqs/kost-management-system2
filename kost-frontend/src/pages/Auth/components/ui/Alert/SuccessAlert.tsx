// pages/Auth/components/ui/Alert/SuccessAlert.tsx
// Success alert component for displaying success messages

import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface SuccessAlertProps {
  message: string;
  onClose?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
  showIcon?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({ 
  message, 
  onClose,
  className = '',
  variant = 'default',
  showIcon = true,
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  const isCompact = variant === 'compact';

  // Auto close functionality
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
    // No cleanup needed if autoClose is false
    return undefined;
  }, [autoClose, onClose, autoCloseDelay]);

  return (
    <div 
      className={`rounded-md bg-green-50 border border-green-200 ${isCompact ? 'p-3' : 'p-4'} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <CheckCircle className={`text-green-400 ${isCompact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </div>
        )}
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          <p className={`text-green-700 ${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md bg-green-50 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50 transition-colors ${isCompact ? 'p-1' : 'p-1.5'}`}
              aria-label="Close success message"
            >
              <X className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};