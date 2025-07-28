// File: src/pages/Tenant/components/ui/Forms/Textarea.tsx
import React, { forwardRef } from 'react';
import { mergeClasses } from '../../../utils/helpers';
import { TOUCH_TARGETS } from '../../../utils/constants';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  variant?: 'default' | 'filled';
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  resize = 'vertical',
  variant = 'default',
  showCharCount = false,
  maxLength,
  className = '',
  value,
  ...props
}, ref) => {
  const baseClasses = [
    'w-full rounded-lg border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
    'px-4 py-3 text-sm',
    'min-h-[100px]', // Minimum height for mobile
  ];

  const variantClasses = {
    default: 'border-gray-300 bg-white',
    filled: 'border-gray-200 bg-gray-50 focus:bg-white',
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const errorClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : '';

  const textareaClasses = mergeClasses(
    ...baseClasses,
    variantClasses[variant],
    resizeClasses[resize],
    errorClasses,
    className
  );

  const currentLength = typeof value === 'string' ? value.length : 0;
  const showCount = showCharCount && (maxLength || currentLength > 0);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          className={textareaClasses}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        
        {showCount && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
            {currentLength}{maxLength && `/${maxLength}`}
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

Textarea.displayName = 'Textarea';

export default Textarea;