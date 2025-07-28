// ===== ADDED: src/pages/Tenant/components/ui/Status/LoadingSpinner.tsx =====
import React from 'react';
import { Loader2 } from 'lucide-react';
import { mergeClasses } from '../../../utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  if (fullScreen) {
    return (
      <div className={mergeClasses(
        'fixed inset-0 flex flex-col items-center justify-center bg-white z-50',
        className
      )}>
        <Loader2 className={mergeClasses(
          'animate-spin text-blue-600',
          sizeClasses[size]
        )} />
        {text && (
          <p className={mergeClasses(
            'mt-4 text-gray-600 font-medium',
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={mergeClasses(
      'flex items-center justify-center',
      text ? 'flex-col gap-2' : '',
      className
    )}>
      <Loader2 className={mergeClasses(
        'animate-spin text-blue-600',
        sizeClasses[size]
      )} />
      {text && (
        <span className={mergeClasses(
          'text-gray-600 font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;