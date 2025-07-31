// File: src/pages/Admin/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats, ActivityItem, RevenueData } from '../types';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [accessHistoryData, setAccessHistoryData] = useState<Record<string, unknown>[]>([]);
  const [paymentTrendsData, setPaymentTrendsData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState({ 
    stats: true, 
    revenue: true, 
    accessHistory: true, 
    paymentTrends: true
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const data = await dashboardService.getDashboardData();
      setStats(data.stats);
      setActivities(data.activities);
    } catch (err: unknown) {
      console.error('Dashboard loading error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  const loadRevenueData = useCallback(async (period: 'monthly' | 'yearly') => {
    try {
      setLoading(prev => ({ ...prev, revenue: true }));
      const data = await dashboardService.getRevenueData(period);
      setRevenueData(data);
    } catch (err: unknown) {
      console.error('Revenue loading error:', err);
      toast.error(`Failed to load ${period} revenue data`);
      setRevenueData([]);
    } finally {
      setLoading(prev => ({ ...prev, revenue: false }));
    }
  }, []);

  const loadAccessHistoryData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, accessHistory: true }));
      const data = await dashboardService.getAccessHistoryData();
      setAccessHistoryData(data);
    } catch (err: unknown) {
      console.error('Access history loading error:', err);
      setAccessHistoryData([]);
    } finally {
      setLoading(prev => ({ ...prev, accessHistory: false }));
    }
  }, []);

  const loadPaymentTrendsData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, paymentTrends: true }));
      const data = await dashboardService.getPaymentTrendsData();
      setPaymentTrendsData(data);
    } catch (err: unknown) {
      console.error('Payment trends loading error:', err);
      setPaymentTrendsData([]);
    } finally {
      setLoading(prev => ({ ...prev, paymentTrends: false }));
    }
  }, []);


  const refresh = useCallback(async (revenuePeriod: 'monthly' | 'yearly' = 'monthly') => {
    const refreshPromise = Promise.all([
      loadDashboardData(),
      loadRevenueData(revenuePeriod),
      loadAccessHistoryData(),
      loadPaymentTrendsData()
    ]);
    
    toast.promise(refreshPromise, {
      loading: 'Refreshing dashboard data...',
      success: 'Dashboard updated successfully!',
      error: 'Failed to refresh data',
    });
    
    setLastUpdated(new Date());
  }, [loadDashboardData, loadRevenueData, loadAccessHistoryData, loadPaymentTrendsData]);

  useEffect(() => {
    loadDashboardData();
    loadRevenueData('monthly'); // Load revenue data otomatis saat pertama kali
    loadAccessHistoryData(); // Load access history data
    loadPaymentTrendsData(); // Load payment trends data
  }, [loadDashboardData, loadRevenueData, loadAccessHistoryData, loadPaymentTrendsData]);

  return {
    stats,
    activities,
    revenueData,
    accessHistoryData,
    paymentTrendsData,
    loading,
    lastUpdated,
    loadRevenueData,
    refresh
  };
};
