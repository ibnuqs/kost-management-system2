// File: src/pages/Admin/components/ui/Chart/ChartContainer.tsx
import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { chartTheme } from '../../../utils/chartTheme';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const LoadingSkeleton: React.FC<{ message?: string }> = ({ message = 'Memuat data...' }) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    <div className="text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <AlertCircle className="w-12 h-12 text-red-400" />
    <div className="text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
      <p className="text-gray-500 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Coba Lagi
        </button>
      )}
    </div>
  </div>
);

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  icon: Icon,
  children,
  isLoading = false,
  error = null,
  onRetry,
  actions,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {Icon && (
              <div className="p-3 sm:p-4 bg-blue-600 rounded-2xl shadow-sm flex-shrink-0">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</h3>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        {error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex-1">
            {children}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isLoading && !error && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex-shrink-0">
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="text-xs sm:text-sm text-gray-500">
              Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};