// File: src/pages/Tenant/components/ui/Card/InfoCard.tsx
import React from 'react';
import { LucideIcon, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import Card from './Card';
import { mergeClasses } from '../../../utils/helpers';
import { COLOR_SCHEMES } from '../../../utils/constants';

interface InfoCardProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  message,
  type = 'info',
  icon,
  action,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const typeConfig = {
    info: {
      icon: Info,
      scheme: COLOR_SCHEMES.INFO,
    },
    success: {
      icon: CheckCircle,
      scheme: COLOR_SCHEMES.SUCCESS,
    },
    warning: {
      icon: AlertTriangle,
      scheme: COLOR_SCHEMES.WARNING,
    },
    error: {
      icon: AlertCircle,
      scheme: COLOR_SCHEMES.ERROR,
    },
  };

  const config = typeConfig[type];
  const Icon = icon || config.icon;

  return (
    <Card 
      variant="bordered" 
      padding="md"
      className={mergeClasses(
        config.scheme.bg,
        config.scheme.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className={mergeClasses('w-5 h-5', config.scheme.icon)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={mergeClasses(
            'font-semibold text-sm sm:text-base',
            config.scheme.text
          )}>
            {title}
          </h4>
          <p className={mergeClasses(
            'text-sm mt-1 leading-relaxed',
            config.scheme.text
          )}>
            {message}
          </p>
          
          {action && (
            <button
              onClick={action.onClick}
              className={mergeClasses(
                'mt-3 text-sm font-medium underline hover:no-underline transition-all',
                config.scheme.text
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={mergeClasses(
              'flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors',
              config.scheme.text
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </Card>
  );
};

export default InfoCard;