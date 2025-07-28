// File: src/pages/Tenant/components/ui/Buttons/IconButton.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { mergeClasses } from '../../../utils/helpers';
import { TOUCH_TARGETS } from '../../../utils/constants';

interface IconButtonProps {
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  tooltip?: string;
  className?: string;
  'aria-label'?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  tooltip,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    TOUCH_TARGETS.MIN_SIZE, // Ensure minimum touch target
  ];

  const variantClasses = {
    default: [
      'text-gray-600 hover:text-gray-700 hover:bg-gray-100',
      'focus:ring-gray-500',
    ],
    primary: [
      'bg-blue-600 text-white hover:bg-blue-700',
      'focus:ring-blue-500',
      'shadow-md hover:shadow-lg',
    ],
    secondary: [
      'bg-gray-100 text-gray-700 hover:bg-gray-200',
      'focus:ring-gray-500',
    ],
    success: [
      'bg-green-600 text-white hover:bg-green-700',
      'focus:ring-green-500',
      'shadow-md hover:shadow-lg',
    ],
    warning: [
      'bg-yellow-600 text-white hover:bg-yellow-700',
      'focus:ring-yellow-500',
      'shadow-md hover:shadow-lg',
    ],
    danger: [
      'bg-red-600 text-white hover:bg-red-700',
      'focus:ring-red-500',
      'shadow-md hover:shadow-lg',
    ],
    ghost: [
      'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
      'focus:ring-gray-500',
    ],
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const classes = mergeClasses(
    ...baseClasses,
    ...variantClasses[variant],
    sizeClasses[size],
    className
  );

  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      title={tooltip}
      aria-label={ariaLabel || tooltip}
    >
      {loading ? (
        <div className={mergeClasses(
          'animate-spin rounded-full border-b-2 border-current',
          iconSizeClasses[size]
        )}></div>
      ) : (
        <Icon className={iconSizeClasses[size]} />
      )}
    </button>
  );
};

export default IconButton;