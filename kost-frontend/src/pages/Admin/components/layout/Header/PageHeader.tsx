// File: src/pages/Admin/components/layout/Header/PageHeader.tsx
import React from 'react';
import { RefreshCw, Plus, Download, Filter } from 'lucide-react';

interface HeaderAction {
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  icon?: 'refresh' | 'plus' | 'download' | 'filter';
  loading?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: HeaderAction[];
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions = [],
  breadcrumbs = []
}) => {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'refresh': return RefreshCw;
      case 'plus': return Plus;
      case 'download': return Download;
      case 'filter': return Filter;
      default: return null;
    }
  };

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400';
      case 'secondary':
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50';
    }
  };

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="text-gray-300 mx-2">/</span>
                )}
                {crumb.href ? (
                  <a 
                    href={crumb.href}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-900">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            {actions.map((action, index) => {
              const Icon = getIcon(action.icon);
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                    ${getVariantClasses(action.variant)}
                    disabled:cursor-not-allowed disabled:opacity-50
                  `}
                >
                  {action.loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : Icon ? (
                    <Icon className="w-4 h-4" />
                  ) : null}
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};