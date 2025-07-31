// File: src/pages/Tenant/components/ui/Buttons/Button.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { mergeClasses } from '../../../utils/helpers';
import { TOUCH_TARGETS } from '../../../utils/constants';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    // Add fallback if TOUCH_TARGETS is undefined
    TOUCH_TARGETS?.MIN_SIZE || 'min-h-[44px]',
  ];

  const variantClasses = {
    primary: [
      'bg-blue-600 text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
      'shadow-lg hover:shadow-xl',
    ],
    secondary: [
      'bg-gray-100 text-gray-700 border border-gray-300',
      'hover:bg-gray-200 hover:border-gray-400',
      'focus:ring-gray-500',
    ],
    success: [
      'bg-green-600 text-white',
      'hover:bg-green-700',
      'focus:ring-green-500',
      'shadow-md hover:shadow-lg',
    ],
    warning: [
      'bg-yellow-600 text-white',
      'hover:bg-yellow-700',
      'focus:ring-yellow-500',
      'shadow-md hover:shadow-lg',
    ],
    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'shadow-md hover:shadow-lg',
    ],
    ghost: [
      'text-gray-700 hover:bg-gray-100',
      'focus:ring-gray-500',
    ],
    outline: [
      'border-2 border-blue-600 text-blue-600',
      'hover:bg-blue-50',
      'focus:ring-blue-500',
    ],
    // Add disabled variant for backward compatibility
    disabled: [
      'bg-gray-300 text-gray-500 cursor-not-allowed',
      'hover:bg-gray-300', // Prevent hover effects
    ],
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-3 text-sm gap-2',
    lg: 'px-6 py-4 text-base gap-2.5',
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  // Safe access to variantClasses with fallback
  const selectedVariantClasses = variantClasses[variant as keyof typeof variantClasses] || variantClasses.primary;

  const classes = mergeClasses(
    ...baseClasses,
    ...selectedVariantClasses,
    sizeClasses[size],
    widthClasses,
    className
  );

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4" />
      )}
      
      <span className={loading ? 'ml-2' : ''}>{children}</span>
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4" />
      )}
    </button>
  );
};

export default Button;