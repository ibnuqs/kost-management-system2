// File: src/pages/Tenant/components/layout/Header/PageHeader.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../../ui/Buttons';
import { mergeClasses } from '../../../utils/helpers';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  breadcrumb,
  className = '',
}) => {
  return (
    <div className={mergeClasses(
      'bg-white rounded-lg border mb-4 sm:mb-6',
      className
    )}>
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        {breadcrumb && (
          <nav className="mb-3 sm:mb-4">
            <ol className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              {breadcrumb.map((item, index) => (
                <li key={index} className="flex items-center gap-1 sm:gap-2">
                  {index > 0 && (
                    <span className="text-gray-400">/</span>
                  )}
                  {item.href ? (
                    <a 
                      href={item.href}
                      className="text-blue-600 hover:text-blue-700 hover:underline truncate"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-gray-500 truncate">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            {Icon && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;