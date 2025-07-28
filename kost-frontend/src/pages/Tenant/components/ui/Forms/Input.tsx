// File: src/pages/Tenant/components/ui/Forms/Input.tsx
import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { mergeClasses } from '../../../utils/helpers';
import { MOBILE_OPTIMIZED_CLASSES, TOUCH_TARGETS } from '../../../utils/constants';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
  loading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  size = 'md',
  variant = 'default',
  loading = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseInputClasses = [
    'w-full rounded-lg border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
    TOUCH_TARGETS.MIN_SIZE, // Ensure minimum touch target height
  ];

  const variantClasses = {
    default: 'border-gray-300 bg-white',
    filled: 'border-gray-200 bg-gray-50 focus:bg-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base',
  };

  const errorClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : '';

  const hasLeftIcon = LeftIcon;
  const hasRightIcon = RightIcon || loading;

  const paddingClasses = {
    sm: `${hasLeftIcon ? 'pl-10' : ''} ${hasRightIcon ? 'pr-10' : ''}`,
    md: `${hasLeftIcon ? 'pl-11' : ''} ${hasRightIcon ? 'pr-11' : ''}`,
    lg: `${hasLeftIcon ? 'pl-12' : ''} ${hasRightIcon ? 'pr-12' : ''}`,
  };

  const inputClasses = mergeClasses(
    ...baseInputClasses,
    variantClasses[variant],
    sizeClasses[size],
    paddingClasses[size],
    errorClasses,
    className
  );

  const iconPositionClasses = {
    sm: 'top-2.5',
    md: 'top-3.5',
    lg: 'top-4',
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className={mergeClasses(
            'absolute left-3 pointer-events-none text-gray-400',
            iconPositionClasses[size]
          )}>
            <LeftIcon className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled || loading}
          {...props}
        />
        
        {(RightIcon || loading) && (
          <div className={mergeClasses(
            'absolute right-3',
            iconPositionClasses[size]
          )}>
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
            ) : RightIcon ? (
              <button
                type="button"
                onClick={onRightIconClick}
                className={mergeClasses(
                  'text-gray-400 hover:text-gray-600 transition-colors',
                  onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
                )}
              >
                <RightIcon className="w-5 h-5" />
              </button>
            ) : null}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;