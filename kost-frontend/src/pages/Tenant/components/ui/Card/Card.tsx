// File: src/pages/Tenant/components/ui/Card/Card.tsx
import React from 'react';
import { mergeClasses } from '../../../utils/helpers';
import { MOBILE_OPTIMIZED_CLASSES } from '../../../utils/constants';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hover?: boolean;
  loading?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  hover = false,
  loading = false,
}) => {
  const baseClasses = 'bg-white rounded-xl border transition-all duration-200';
  
  const variantClasses = {
    default: 'shadow-sm hover:shadow-md',
    compact: 'shadow-sm',
    elevated: 'shadow-lg hover:shadow-xl',
    bordered: 'border-2 shadow-none hover:shadow-sm',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: MOBILE_OPTIMIZED_CLASSES.CARD_MOBILE.split(' ').filter(c => c.startsWith('p-')).join(' '),
    lg: 'p-6 sm:p-8',
  };

  const hoverClasses = hover || onClick ? 'hover:scale-[1.02] cursor-pointer' : '';
  const loadingClasses = loading ? 'opacity-50 pointer-events-none' : '';

  const classes = mergeClasses(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    loadingClasses,
    className
  );

  return (
    <div className={classes} onClick={onClick}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;