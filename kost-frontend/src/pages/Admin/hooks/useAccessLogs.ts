// File: src/pages/Admin/hooks/useAccessLogs.ts
import { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-hot-toast';
import { accessLogService } from '../services/accessLogService';
import type { AccessLog, AccessLogStats, AccessLogFilters, AccessLogStatistics } from '../types/accessLog';

export const useAccessLogs = (initialFilters?: AccessLogFilters) => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<AccessLogStats | null>(null);
  const [statistics, setStatistics] = useState<AccessLogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  const loadLogs = useCallback(async (filters?: AccessLogFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await accessLogService.getLogs(filters);
      setLogs(data.logs);
      setStats(data.summary);
      setPagination(data.pagination);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load access logs';
      setError(errorMessage);
      console.error('Error loading access logs:', err);
      // toast.error(errorMessage);
      
      // Set empty state on error
      setLogs([]);
      setStats(null);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStatistics = useCallback(async (days: number = 7) => {
    try {
      const data = await accessLogService.getStatistics(days);
      setStatistics(data);
    } catch (err: any) {
      console.error('Failed to load access log statistics:', err);
      // Don't show error toast for statistics as it's not critical
      setStatistics(null);
    }
  }, []);

  const exportLogs = useCallback(async (filters?: AccessLogFilters) => {
    try {
      await accessLogService.exportLogs(filters);
      // toast.success('Export completed successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to export access logs';
      console.error('Error exporting access logs:', err);
      // toast.error(errorMessage);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([
      loadLogs(),
      loadStatistics()
    ]);
  }, [loadLogs, loadStatistics]);

  // Initial load
  useEffect(() => {
    loadLogs(initialFilters);
    loadStatistics();
  }, [loadLogs, loadStatistics]);

  return {
    data: {
      logs,
      total: pagination.total,
      ...stats
    },
    logs,
    stats,
    statistics,
    loading,
    error,
    isLoading: loading,
    pagination,
    loadLogs,
    loadStatistics,
    exportLogs,
    refresh,
    refetch: () => loadLogs(initialFilters)
  };
};