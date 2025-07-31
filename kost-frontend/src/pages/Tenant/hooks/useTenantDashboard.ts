// Optimized Tenant Dashboard Hook - Performance Focused
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { tenantService } from '../services/tenantService';
import { DashboardData } from '../types/dashboard';
import { TENANT_CONSTANTS } from '../config/constants';

// Cache keys for different data segments
const CACHE_KEYS = {
  dashboard: ['tenant', 'dashboard'],
  quick_stats: ['tenant', 'dashboard', 'quick_stats'],
  payment_info: ['tenant', 'dashboard', 'payment_info'],
  access_stats: ['tenant', 'dashboard', 'access_stats'],
  notifications: ['tenant', 'dashboard', 'notifications'],
} as const;

// ✅ Default data structure with proper typing
const DEFAULT_DASHBOARD_DATA: DashboardData = {
  user: null,
  tenant_info: null,
  payment_info: { 
    current: null, 
    next: null, 
    recent: [], 
    overdue: [], 
    total_unpaid: 0,
    payment_history_summary: {
      total_payments: 0,
      total_paid: 0,
      success_rate: 0
    }
  },
  access_stats: {
    today_count: 0,
    week_count: 0,
    month_count: 0,
    total_count: 0,
    success_rate: 0,
    granted_count: 0,
    denied_count: 0,
    peak_hour: 0,
  },
  rfid_cards: [],
  room_devices: [],
  notifications: [],
  quick_stats: {
    days_since_move_in: 0,
    total_payments_made: 0,
    total_amount_paid: 0,
    current_streak: 0,
    access_count_today: 0,
    access_count_week: 0,
    access_count_month: 0,
    devices_online: 0,
    devices_total: 0,
    unread_notifications: 0
  },
  last_updated: new Date().toISOString()
};

// Optimized query configuration
const QUERY_CONFIG = {
  staleTime: 3 * 60 * 1000, // 3 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 3000),
} as const;

export const useTenantDashboard = () => {
  const queryClient = useQueryClient();

  // Main dashboard query with aggressive caching
  const dashboardQuery = useQuery({
    queryKey: CACHE_KEYS.dashboard,
    queryFn: async (): Promise<DashboardData> => {
      try {
        const result = await tenantService.getDashboardData();
        return {
          ...DEFAULT_DASHBOARD_DATA,
          ...result,
          last_updated: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Dashboard API error:', error);
        
        // Return cached data if available
        const cachedData = queryClient.getQueryData<DashboardData>(CACHE_KEYS.dashboard);
        if (cachedData) {
          return cachedData;
        }
        
        // Fallback to default data
        return DEFAULT_DASHBOARD_DATA;
      }
    },
    
    ...QUERY_CONFIG,
    
    // Performance optimizations
    structuralSharing: true,
    placeholderData: (previousData) => previousData ?? DEFAULT_DASHBOARD_DATA,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    
    // Smart refetch interval
    refetchInterval: (query) => {
      if (query.state.error) return false;
      if (document.hidden) return false; // Don't refetch when tab is hidden
      return TENANT_CONSTANTS.DASHBOARD_REFRESH_INTERVAL || 5 * 60 * 1000; // 5 minutes
    },
    
    // Network optimization
    networkMode: 'online',
    throwOnError: false,
  });

  // Memoized data selectors for performance
  const memoizedData = useMemo(() => {
    const data = dashboardQuery.data ?? DEFAULT_DASHBOARD_DATA;
    
    return {
      user: data.user,
      tenant_info: data.tenant_info,
      payment_info: data.payment_info,
      access_stats: data.access_stats,
      notifications: data.notifications,
      quick_stats: data.quick_stats,
      rfid_cards: data.rfid_cards,
      room_devices: data.room_devices,
      last_updated: data.last_updated,
    };
  }, [dashboardQuery.data]);

  // Optimized refresh functions
  const refreshDashboard = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: CACHE_KEYS.dashboard,
      exact: true,
    });
  }, [queryClient]);

  const softRefreshDashboard = useCallback(async () => {
    return queryClient.refetchQueries({
      queryKey: CACHE_KEYS.dashboard,
      exact: true,
    });
  }, [queryClient]);

  // Optimistic updates
  const updateDashboardOptimistically = useCallback(
    (updater: (old: DashboardData) => DashboardData) => {
      queryClient.setQueryData(CACHE_KEYS.dashboard, updater);
    },
    [queryClient]
  );

  // Prefetch related data
  const prefetchRelatedData = useCallback(async () => {
    const prefetchPromises = [
      queryClient.prefetchQuery({
        queryKey: ['tenant', 'payments'],
        queryFn: () => tenantService.getPayments(),
        staleTime: QUERY_CONFIG.staleTime,
      }),
      queryClient.prefetchQuery({
        queryKey: ['tenant', 'access-history'],
        queryFn: () => tenantService.getAccessHistory(),
        staleTime: QUERY_CONFIG.staleTime,
      }),
    ];

    await Promise.allSettled(prefetchPromises);
  }, [queryClient]);

  // Data freshness indicator
  const isDataFresh = useMemo(() => {
    const queryState = queryClient.getQueryState(CACHE_KEYS.dashboard);
    if (!queryState?.dataUpdatedAt) return false;
    
    const freshnessThreshold = 3 * 60 * 1000; // 3 minutes
    return Date.now() - queryState.dataUpdatedAt <= freshnessThreshold;
  }, [queryClient, dashboardQuery.dataUpdatedAt]);

  return {
    // Core data
    data: memoizedData,
    
    // Query states
    isLoading: dashboardQuery.isLoading,
    isFetching: dashboardQuery.isFetching,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    isSuccess: dashboardQuery.isSuccess,
    
    // Enhanced loading states
    isInitialLoading: dashboardQuery.isLoading && !dashboardQuery.data,
    isBackgroundRefreshing: dashboardQuery.isFetching && !dashboardQuery.isLoading,
    isRefetching: dashboardQuery.isRefetching,
    
    // Data freshness
    isDataFresh,
    lastUpdated: memoizedData.last_updated,
    
    // Actions
    refetch: dashboardQuery.refetch,
    refreshDashboard,
    softRefreshDashboard,
    updateDashboardOptimistically,
    prefetchRelatedData,
    
    // Legacy compatibility
    dashboardData: memoizedData,
  };
};