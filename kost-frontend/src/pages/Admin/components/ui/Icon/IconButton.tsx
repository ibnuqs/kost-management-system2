// File: src/pages/Admin/components/ui/Icon/IconButton.tsx
import React from 'react';
import { Tooltip } from '../Tooltip';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'text-blue-600 hover:text-blue-700 hover:bg-blue-50';
      case 'secondary':
        return 'text-gray-600 hover:text-gray-700 hover:bg-gray-50';
      case 'danger':
        return 'text-red-600 hover:text-red-700 hover:bg-red-50';
      case 'ghost':
      default:
        return 'text-gray-500 hover:text-gray-700 hover:bg-gray-100';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-7 h-7 text-sm [&>svg]:w-3 [&>svg]:h-3';
      case 'lg':
        return 'w-10 h-10 text-base [&>svg]:w-5 [&>svg]:h-5';
      case 'md':
      default:
        return 'w-8 h-8 text-sm [&>svg]:w-4 [&>svg]:h-4';
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center 
    rounded-lg transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
  `;

  return (
    <Tooltip content={tooltip} disabled={disabled}>
      <button
        className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
        disabled={disabled}
        {...props}
      >
        {icon}
      </button>
    </Tooltip>
  );
};

export default IconButton;