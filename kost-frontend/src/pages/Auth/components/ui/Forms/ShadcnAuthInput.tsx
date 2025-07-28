import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface ShadcnAuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  helperText?: string;
  variant?: 'default' | 'floating';
}

export const ShadcnAuthInput = forwardRef<HTMLInputElement, ShadcnAuthInputProps>(
  ({
    id,
    name,
    type = 'text',
    label,
    placeholder,
    value,
    onChange,
    disabled = false,
    required = false,
    autoComplete,
    error,
    icon,
    showPasswordToggle = false,
    helperText,
    variant = 'default',
    className = '',
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
    const isFloating = variant === 'floating';
    const hasValue = value && value.toString().length > 0;

    return (
      <div className="space-y-1">
        {!isFloating && (
          <Label htmlFor={id} className="block text-sm font-semibold text-gray-900 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <div className={cn('h-5 w-5 transition-colors', error ? 'text-red-500' : 'text-gray-400')}>
                {icon}
              </div>
            </div>
          )}

          {/* Floating Label */}
          {isFloating && (
            <Label
              htmlFor={id}
              className={cn(
                'absolute left-4 transition-all duration-200 ease-out pointer-events-none',
                isFocused || hasValue ? 'top-1 text-xs text-blue-600 font-semibold' : 'top-3.5 text-sm text-gray-500'
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}

          {/* Input Field */}
          <Input
            ref={ref}
            id={id}
            name={name}
            type={inputType}
            autoComplete={autoComplete}
            required={required}
            className={cn(
              'block w-full px-4 py-3 border rounded-xl bg-white text-gray-900 text-sm font-medium transition-all duration-200 ease-out shadow-sm hover:shadow-md focus:shadow-lg',
              error ? 'border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500' : 'border-gray-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 hover:border-gray-300',
              icon ? 'pl-10' : '',
              showPasswordToggle ? 'pr-10' : '',
              isFloating ? 'pt-5 pb-1' : '',
              'placeholder:text-gray-400',
              'disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-200',
              className
            )}
            placeholder={isFloating ? '' : placeholder}
            value={value}
            onChange={onChange}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />

          {/* Password Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={`${id}-error`} className="text-sm text-red-600 font-medium" role="alert">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ShadcnAuthInput.displayName = 'ShadcnAuthInput';
