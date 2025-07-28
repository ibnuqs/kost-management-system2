// src/pages/Landing/components/ui/AnimatedButton.tsx - FIXED
import React from 'react';
import * as LucideIcons from 'lucide-react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button'
}) => {
  // Get icon component dynamically
  const IconComponent = icon ? (LucideIcons as any)[icon] : null;

  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-2xl
    transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-offset-2
    disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm
    hover:scale-[1.02] active:scale-[0.98] transform
    shadow-lg hover:shadow-xl border border-white/10
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white 
      focus:ring-blue-500/50 shadow-blue-500/25
    `,
    secondary: `
      bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white 
      focus:ring-slate-500/50 shadow-slate-500/25
    `,
    outline: `
      border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50
      focus:ring-white/30 bg-white/5 backdrop-blur-md
    `,
    ghost: `
      text-white/90 hover:bg-white/10 focus:ring-white/30
      bg-transparent backdrop-blur-sm
    `,
    'ghost-dynamic': `
      hover:bg-white/10 focus:ring-white/30
      bg-transparent backdrop-blur-sm
    `
  };

  const sizeClasses = {
    sm: 'px-4 py-2.5 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
    xl: 'px-10 py-5 text-xl min-h-[64px]'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
    >
      {loading && (
        <LucideIcons.Loader2 
          size={iconSizes[size]} 
          className="animate-spin"
        />
      )}
      
      {!loading && IconComponent && iconPosition === 'left' && (
        <IconComponent size={iconSizes[size]} />
      )}
      
      <span>{children}</span>
      
      {!loading && IconComponent && iconPosition === 'right' && (
        <IconComponent size={iconSizes[size]} />
      )}
    </button>
  );
};

export default AnimatedButton;