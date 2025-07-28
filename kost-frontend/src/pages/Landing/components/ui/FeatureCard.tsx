// src/pages/Landing/components/ui/FeatureCard.tsx - FIXED
import React from 'react';
import * as LucideIcons from 'lucide-react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  highlight?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  highlight = false,
  className = '',
  style
}) => {
  // Get icon component dynamically
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Star;

  return (
    <div
      className={`
        relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 sm:p-8
        transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]
        transform group
        ${highlight ? 'ring-2 ring-blue-500/30 bg-gradient-to-br from-blue-50/50 to-indigo-50/50' : ''}
        ${className}
      `}
      style={style}
    >
      {highlight && (
        <div className="absolute -top-3 left-6">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            Premium
          </span>
        </div>
      )}

      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110
        ${highlight 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
          : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-600'
        }
      `}>
        <IconComponent size={28} />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">
        {title}
      </h3>

      <p className="text-gray-600 text-base leading-relaxed font-medium">
        {description}
      </p>

      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-2xl pointer-events-none" />
      )}
    </div>
  );
};

export default FeatureCard;