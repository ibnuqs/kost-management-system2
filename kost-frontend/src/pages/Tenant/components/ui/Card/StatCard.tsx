// File: src/pages/Tenant/components/ui/Card/StatCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import Card from './Card';
import { mergeClasses } from '../../../utils/helpers';
import { getResponsiveTextSize } from '../../../utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-100',
  trend,
  loading = false,
  onClick,
  className = '',
}) => {
  return (
    <Card 
      variant="default" 
      padding="md" 
      hover={!!onClick}
      loading={loading}
      onClick={onClick}
      className={className}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {Icon && (
          <div className={mergeClasses(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            iconBg
          )}>
            <Icon className={mergeClasses('w-5 h-5 sm:w-6 sm:h-6', iconColor)} />
          </div>
        )}
        
        <div className="min-w-0 flex-1">
          <p className={mergeClasses(
            'text-gray-500 truncate font-medium',
            getResponsiveTextSize('sm')
          )}>
            {title}
          </p>
          <p className={mergeClasses(
            'font-bold text-gray-900 truncate',
            getResponsiveTextSize('xl')
          )}>
            {value}
          </p>
          
          {subtitle && (
            <p className={mergeClasses(
              'text-gray-400 truncate mt-1',
              getResponsiveTextSize('sm')
            )}>
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span className={mergeClasses(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-400">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;