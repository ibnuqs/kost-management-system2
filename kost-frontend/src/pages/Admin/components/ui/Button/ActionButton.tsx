// File: src/pages/Admin/components/ui/Button/ActionButton.tsx
import React from 'react';
import { getButtonClasses } from '../../../utils/colorSystem';
import type { ActionColors } from '../../../utils/colorSystem';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof ActionColors;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = getButtonClasses(variant, size);
  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${className} flex items-center justify-center space-x-2`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      )}
      {!loading && leftIcon && <span>{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

export default ActionButton;