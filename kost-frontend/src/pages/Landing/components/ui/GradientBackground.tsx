// src/pages/Landing/components/ui/GradientBackground.tsx
import React from 'react';
import { useParallax } from '../../hooks';

interface GradientBackgroundProps {
  variant?: 'hero' | 'section' | 'footer' | 'subtle';
  children?: React.ReactNode;
  className?: string;
  enableParallax?: boolean;
  overlay?: boolean;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  variant = 'hero',
  children,
  className = '',
  enableParallax = false,
  overlay = false
}) => {
  const parallaxOffset = useParallax(0.3);

  const gradientVariants = {
    hero: `
      bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900
      relative overflow-hidden
    `,
    section: `
      bg-gradient-to-r from-slate-50 via-white to-blue-50
      relative
    `,
    footer: `
      bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800
      relative
    `,
    subtle: `
      bg-gradient-to-r from-slate-50/50 to-white
      relative
    `
  };

  const decorativeElements = {
    hero: (
      <>
        {/* Apple-style floating orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"
          style={{
            transform: enableParallax ? `translateY(${parallaxOffset * 0.3}px)` : undefined
          }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-2xl"
          style={{
            transform: enableParallax ? `translateY(${parallaxOffset * 0.5}px)` : undefined
          }}
        />
        <div 
          className="absolute bottom-1/4 left-1/2 w-32 h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"
          style={{
            transform: enableParallax ? `translateY(${parallaxOffset * 0.4}px)` : undefined
          }}
        />
        
        {/* Subtle mesh gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%),
                        radial-gradient(circle at 40% 80%, rgba(120, 200, 255, 0.3), transparent 50%)`,
            transform: enableParallax ? `translateY(${parallaxOffset * 0.1}px)` : undefined
          }}
        />
      </>
    ),
    
    section: (
      <>
        {/* Apple-style section decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-100/30 to-transparent rounded-full blur-3xl transform translate-x-48 -translate-y-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-indigo-100/20 to-transparent rounded-full blur-2xl transform -translate-x-40 translate-y-40" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-slate-200/10 to-blue-200/10 rounded-full blur-xl transform -translate-x-20 -translate-y-20" />
      </>
    ),
    
    footer: (
      <>
        {/* Dark Apple-style decorations */}
        <div className="absolute top-0 left-1/4 w-56 h-56 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-44 h-44 bg-gradient-to-r from-slate-600/15 to-blue-600/15 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-xl" />
      </>
    ),
    
    subtle: (
      <>
        {/* Minimal Apple-style decoration */}
        <div className="absolute top-1/4 right-0 w-48 h-48 bg-gradient-to-l from-slate-200/30 to-transparent rounded-full blur-3xl transform translate-x-24" />
        <div className="absolute bottom-1/3 left-0 w-36 h-36 bg-gradient-to-r from-blue-100/20 to-transparent rounded-full blur-2xl transform -translate-x-18" />
      </>
    )
  };

  return (
    <div 
      className={`
        ${gradientVariants[variant]}
        ${className}
      `}
    >
      {/* Decorative elements */}
      {decorativeElements[variant]}
      
      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-black/20" />
      )}
      
      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export default GradientBackground;