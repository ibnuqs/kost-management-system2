// File: src/pages/Admin/components/ui/Chart/StatCard.tsx
import React from 'react';
import { getStatCardStyle, getIconStyle, getTextStyle } from '../../../utils/chartTheme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  type = 'neutral',
  trend,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`${getStatCardStyle(type)} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${getTextStyle(type, 'light')}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${getTextStyle(type, 'dark')}`}>
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1 ${getTextStyle(type, 'light')}`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs bulan lalu</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={getIconStyle(type)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};