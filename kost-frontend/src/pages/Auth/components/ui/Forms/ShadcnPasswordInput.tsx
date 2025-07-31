import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface ShadcnPasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  variant?: 'default' | 'floating';
  showStrength?: boolean;
  showRequirements?: boolean;
}

export const ShadcnPasswordInput = forwardRef<HTMLInputElement, ShadcnPasswordInputProps>(
  ({
    id,
    name,
    label,
    placeholder,
    value,
    onChange,
    disabled = false,
    required = false,
    autoComplete,
    error,
    icon,
    helperText,
    variant = 'default',
    showStrength = false,
    showRequirements = false,
    className = '',
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const isFloating = variant === 'floating';
    const hasValue = value && value.toString().length > 0;

    const passwordValue = value as string || '';

    const getPasswordStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };

    const strength = getPasswordStrength(passwordValue);

    const strengthColor = () => {
      switch (strength) {
        case 0: return 'text-gray-400';
        case 1: return 'text-red-500';
        case 2: return 'text-orange-500';
        case 3: return 'text-yellow-500';
        case 4: return 'text-green-500';
        case 5: return 'text-green-600';
        default: return 'text-gray-400';
      }
    };

    const strengthText = () => {
      switch (strength) {
        case 0: return 'Very Weak';
        case 1: return 'Weak';
        case 2: return 'Fair';
        case 3: return 'Good';
        case 4: return 'Strong';
        case 5: return 'Very Strong';
        default: return '';
      }
    };

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
            type={showPassword ? 'text' : 'password'}
            autoComplete={autoComplete}
            required={required}
            className={cn(
              'block w-full px-4 py-3 border rounded-xl bg-white text-gray-900 text-sm font-medium transition-all duration-200 ease-out shadow-sm hover:shadow-md focus:shadow-lg',
              error ? 'border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500' : 'border-gray-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 hover:border-gray-300',
              icon ? 'pl-10' : '',
              'pr-10', // Always reserve space for the toggle
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
        </div>

        {/* Password Strength */}
        {showStrength && passwordValue.length > 0 && (
          <div className="flex items-center mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
              <div
                className={cn(
                  'h-1.5 rounded-full',
                  strengthColor()
                )}
                style={{ width: `${(strength / 5) * 100}%` }}
              ></div>
            </div>
            <span className={cn('ml-2 text-xs font-medium', strengthColor())}>
              {strengthText()}
            </span>
          </div>
        )}

        {/* Password Requirements */}
        {showRequirements && (
          <ul className="text-xs text-gray-500 mt-2 space-y-1">
            <li className={cn('flex items-center', passwordValue.length >= 8 ? 'text-green-600' : '')}>
              {passwordValue.length >= 8 ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
              At least 8 characters
            </li>
            <li className={cn('flex items-center', /[A-Z]/.test(passwordValue) ? 'text-green-600' : '')}>
              {/[A-Z]/.test(passwordValue) ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
              Includes uppercase letter
            </li>
            <li className={cn('flex items-center', /[a-z]/.test(passwordValue) ? 'text-green-600' : '')}>
              {/[a-z]/.test(passwordValue) ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
              Includes lowercase letter
            </li>
            <li className={cn('flex items-center', /[0-9]/.test(passwordValue) ? 'text-green-600' : '')}>
              {/[0-9]/.test(passwordValue) ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
              Includes a number
            </li>
            <li className={cn('flex items-center', /[^A-Za-z0-9]/.test(passwordValue) ? 'text-green-600' : '')}>
              {/[^A-Za-z0-9]/.test(passwordValue) ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
              Includes a special character
            </li>
          </ul>
        )}

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

ShadcnPasswordInput.displayName = 'ShadcnPasswordInput';
