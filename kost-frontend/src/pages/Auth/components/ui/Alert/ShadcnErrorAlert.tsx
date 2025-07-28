import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ShadcnErrorAlertProps {
  message: string;
  onClose?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
  showIcon?: boolean;
}

export const ShadcnErrorAlert: React.FC<ShadcnErrorAlertProps> = ({
  message,
  onClose,
  className = '',
  variant = 'default',
  showIcon = true
}) => {
  const isCompact = variant === 'compact';

  return (
    <Alert
      variant="destructive"
      className={cn(
        'rounded-md bg-red-50 border border-red-200',
        isCompact ? 'p-3' : 'p-4',
        className
      )}
    >
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0">
            <AlertCircle className={cn('text-red-400', isCompact ? 'h-4 w-4' : 'h-5 w-5')} />
          </div>
        )}
        <div className={cn(showIcon ? 'ml-3' : '', 'flex-1', isCompact ? 'text-xs' : 'text-sm', 'font-medium text-red-700')}>
          <AlertDescription>{message}</AlertDescription>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn(
                'inline-flex rounded-md bg-red-50 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 transition-colors',
                isCompact ? 'p-1' : 'p-1.5'
              )}
              aria-label="Close error message"
            >
              <X className={cn(isCompact ? 'h-3 w-3' : 'h-4 w-4')} />
            </Button>
          </div>
        )}
      </div>
    </Alert>
  );
};

ShadcnErrorAlert.displayName = 'ShadcnErrorAlert';
