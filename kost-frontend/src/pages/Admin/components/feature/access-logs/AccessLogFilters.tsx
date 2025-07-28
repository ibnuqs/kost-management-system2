// File: src/pages/Admin/components/features/access-logs/AccessLogFilters.tsx
import React from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';

import type { AccessLogFilters as AccessLogFiltersType } from '../../../types/accessLog';

interface AccessLogFiltersProps {
  filters: AccessLogFiltersType;
  onFilterChange: (key: keyof AccessLogFiltersType, value: any) => void;
}

export const AccessLogFilters: React.FC<AccessLogFiltersProps> = ({ 
  filters, 
  onFilterChange 
}) => {
  const handleTodayToggle = () => {
    if (filters.today) {
      // Reset date filters when unchecking today
      onFilterChange('today', false);
      onFilterChange('start_date', '');
      onFilterChange('end_date', '');
    } else {
      // Set today's date when checking today
      const today = new Date().toISOString().split('T')[0];
      onFilterChange('today', true);
      onFilterChange('start_date', today);
      onFilterChange('end_date', today);
    }
  };

  const clearFilters = () => {
    onFilterChange('search', '');
    onFilterChange('access_granted', undefined);
    onFilterChange('start_date', '');
    onFilterChange('end_date', '');
    onFilterChange('today', false);
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.access_granted !== undefined ||
    filters.start_date ||
    filters.end_date ||
    filters.today
  );

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Filter Access Logs</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Search Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or card UID..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {filters.search && (
                <button
                  onClick={() => onFilterChange('search', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Access Status Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Access Status
            </label>
            <select
              value={filters.access_granted !== undefined ? String(filters.access_granted) : ''}
              onChange={(e) => onFilterChange('access_granted', e.target.value ? e.target.value === 'true' : undefined)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
            >
              <option value="">All Access Types</option>
              <option value="true">✅ Granted</option>
              <option value="false">❌ Denied</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date Range
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => onFilterChange('start_date', e.target.value)}
                  disabled={filters.today}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                  title="Start Date"
                />
              </div>
              <div className="flex items-center text-gray-400">
                to
              </div>
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => onFilterChange('end_date', e.target.value)}
                  disabled={filters.today}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                  title="End Date"
                />
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Quick Filters
            </label>
            <div className="space-y-3">
              {/* Today Only Toggle */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.today || false}
                  onChange={handleTodayToggle}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Today Only
                </span>
              </label>

              {/* Quick Date Presets */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    onFilterChange('today', false);
                    onFilterChange('start_date', yesterday.toISOString().split('T')[0]);
                    onFilterChange('end_date', yesterday.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  Yesterday
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today);
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    
                    onFilterChange('today', false);
                    onFilterChange('start_date', lastWeek.toISOString().split('T')[0]);
                    onFilterChange('end_date', today.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today);
                    lastMonth.setDate(lastMonth.getDate() - 30);
                    
                    onFilterChange('today', false);
                    onFilterChange('start_date', lastMonth.toISOString().split('T')[0]);
                    onFilterChange('end_date', today.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  Last 30 Days
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-500">Active filters:</span>
              
              {filters.search && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{filters.search}"
                  <button
                    onClick={() => onFilterChange('search', '')}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filters.access_granted !== undefined && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Status: {filters.access_granted ? 'Granted' : 'Denied'}
                  <button
                    onClick={() => onFilterChange('access_granted', undefined)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:text-green-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filters.today && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Today Only
                  <button
                    onClick={handleTodayToggle}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:text-purple-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {(filters.start_date || filters.end_date) && !filters.today && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Date: {filters.start_date || '...'} to {filters.end_date || '...'}
                  <button
                    onClick={() => {
                      onFilterChange('start_date', '');
                      onFilterChange('end_date', '');
                    }}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-400 hover:text-orange-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};