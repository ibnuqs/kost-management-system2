import React from 'react';
import { LoadingSpinner } from '../Loading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  children,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const shadcnVariant = {
    primary: 'default',
    secondary: 'secondary',
    outline: 'outline',
    ghost: 'ghost',
    danger: 'destructive',
  }[variant] as 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' || 'default';

  const shadcnSize = {
    xs: 'sm',
    sm: 'default',
    md: 'default',
    lg: 'lg',
    xl: 'lg',
  }[size] as 'sm' | 'default' | 'lg' || 'default';

  const isDisabled = disabled || loading;

  return (
    <Button
      type={type}
      variant={shadcnVariant}
      size={shadcnSize}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <LoadingSpinner 
          size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'} 
          color="current" 
          className="mr-2" 
        />
      )}
      
      {/* Left Icon */}
      {leftIcon && !loading && (
        <span className="mr-2">
          {leftIcon}
        </span>
      )}
      
      {/* Button Text */}
      <span className={loading ? 'opacity-75' : ''}>
        {children}
      </span>
      
      {/* Right Icon */}
      {rightIcon && !loading && (
        <span className="ml-2">
          {rightIcon}
        </span>
      )}
    </Button>
  );
};