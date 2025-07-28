// File: src/pages/Tenant/components/ui/Forms/Select.tsx
import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { mergeClasses } from '../../../utils/helpers';
import { TOUCH_TARGETS } from '../../../utils/constants';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
  loading?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  placeholder,
  size = 'md',
  variant = 'default',
  loading = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseSelectClasses = [
    'w-full rounded-lg border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
    'appearance-none bg-no-repeat bg-right',
    'pr-10', // Space for arrow icon
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

  const selectClasses = mergeClasses(
    ...baseSelectClasses,
    variantClasses[variant],
    sizeClasses[size],
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
        <select
          ref={ref}
          className={selectClasses}
          disabled={disabled || loading}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className={mergeClasses(
          'absolute right-3 pointer-events-none',
          iconPositionClasses[size]
        )}>
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
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

Select.displayName = 'Select';

export default Select;