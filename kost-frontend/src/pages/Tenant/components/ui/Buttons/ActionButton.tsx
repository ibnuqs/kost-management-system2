// File: src/pages/Tenant/components/ui/Buttons/ActionButton.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from './Button';

interface ActionButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  icon,
  loading = false,
  disabled = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  className = '',
}) => {
  const displayText = loading && loadingText ? loadingText : children;

  return (
    <Button
      variant={variant}
      size={size}
      icon={icon}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      className={className}
    >
      {displayText}
    </Button>
  );
};

export default ActionButton;