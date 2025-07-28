// File: src/pages/Admin/pages/AccessLogManagement.tsx
import React, { useState } from 'react';
import { useAccessLogs } from '../hooks';
import {
  AccessLogStats,
  AccessLogTable,
  AccessLogFilters,
  AccessLogStatistics
} from '../components/feature/access-logs'; // Fixed: feature -> features
import { PageHeader } from '../components/layout';
import { Card } from '../components/ui';
import type { AccessLogFilters as AccessLogFiltersType } from '../types/accessLog';

const AccessLogManagement: React.FC = () => {
  const {
    logs,
    stats,
    statistics,
    loading,
    pagination,
    loadLogs,
    loadStatistics,
    exportLogs,
    refresh
  } = useAccessLogs();

  const [activeTab, setActiveTab] = useState<'logs' | 'statistics'>('logs');
  const [filters, setFilters] = useState<AccessLogFiltersType>({
    search: '',
    access_granted: undefined,
    start_date: '',
    end_date: '',
    today: false,
    page: 1
  });
  
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterChange = (key: keyof AccessLogFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 }; // Reset to page 1 when filtering
    setFilters(newFilters);
    loadLogs(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadLogs(newFilters);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportLogs(filters);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsExporting(false);
    }
  };

  // Load statistics when switching to statistics tab
  const handleTabChange = (tab: 'logs' | 'statistics') => {
    setActiveTab(tab);
    if (tab === 'statistics' && !statistics) {
      loadStatistics();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Access Log Management"
        description="Monitor and analyze door access activities"
        actions={[
          {
            label: isExporting ? 'Exporting...' : 'Export',
            onClick: handleExport,
            variant: 'secondary',
            disabled: isExporting
          },
          {
            label: 'Refresh',
            onClick: refresh,
            variant: 'secondary',
            disabled: loading
          }
        ]}
      />

      {stats && <AccessLogStats stats={stats} />}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Access Logs
          </button>
          <button
            onClick={() => handleTabChange('statistics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'statistics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {activeTab === 'logs' ? (
        <Card>
          <AccessLogFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          
          <AccessLogTable
            logs={logs}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </Card>
      ) : (
        <AccessLogStatistics statistics={statistics} />
      )}
    </div>
  );
};

export default AccessLogManagement;