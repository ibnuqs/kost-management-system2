// File: src/pages/Tenant/components/ui/Status/StatusBadge.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { mergeClasses } from '../../../utils/helpers';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  label?: string;
  text?: string; // Add text prop for backward compatibility
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'soft';
  pulse?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  text, // Add text prop
  icon: Icon,
  size = 'md',
  variant = 'soft',
  pulse = false,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const statusClasses = {
    success: {
      solid: 'bg-green-600 text-white',
      outline: 'border-2 border-green-600 text-green-600 bg-transparent',
      soft: 'bg-green-100 text-green-800 border border-green-200',
    },
    warning: {
      solid: 'bg-yellow-600 text-white',
      outline: 'border-2 border-yellow-600 text-yellow-600 bg-transparent',
      soft: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    },
    error: {
      solid: 'bg-red-600 text-white',
      outline: 'border-2 border-red-600 text-red-600 bg-transparent',
      soft: 'bg-red-100 text-red-800 border border-red-200',
    },
    info: {
      solid: 'bg-blue-600 text-white',
      outline: 'border-2 border-blue-600 text-blue-600 bg-transparent',
      soft: 'bg-blue-100 text-blue-800 border border-blue-200',
    },
    neutral: {
      solid: 'bg-gray-600 text-white',
      outline: 'border-2 border-gray-600 text-gray-600 bg-transparent',
      soft: 'bg-gray-100 text-gray-800 border border-gray-200',
    },
    // Add loading status for backward compatibility
    loading: {
      solid: 'bg-blue-600 text-white',
      outline: 'border-2 border-blue-600 text-blue-600 bg-transparent',
      soft: 'bg-blue-100 text-blue-800 border border-blue-200',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const pulseClasses = pulse ? 'animate-pulse' : '';

  // Safe access to statusClasses with fallback
  const statusClass = statusClasses[status as keyof typeof statusClasses];
  const variantClass = statusClass?.[variant] || statusClasses.neutral.soft;

  const classes = mergeClasses(
    baseClasses,
    variantClass,
    sizeClasses[size],
    pulseClasses,
    className
  );

  // Use label or text, whichever is provided
  const displayText = label || text || '';

  return (
    <span className={classes}>
      {Icon && <Icon className={iconSizeClasses[size]} />}
      {displayText}
    </span>
  );
};

export default StatusBadge;