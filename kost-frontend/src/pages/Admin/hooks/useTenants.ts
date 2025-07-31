// File: src/pages/Admin/hooks/useTenants.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tenantService } from '../services/tenantService';
import type { 
  Tenant, 
  TenantStats, 
  TenantFormData, 
  TenantFilters,
  MoveOutData 
} from '../types/tenant';
import type { PaginationData } from '../types/common';

interface UseTenantReturn {
  tenants: Tenant[];
  stats: TenantStats | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationData;
  loadTenants: (filters?: TenantFilters, forceRefresh?: boolean) => Promise<void>;
  createTenant: (data: TenantFormData) => Promise<void>;
  updateTenant: (id: number, data: TenantFormData) => Promise<void>;
  deleteTenant: (id: number) => Promise<void>;
  moveOutTenant: (id: number, data: MoveOutData) => Promise<void>;
  suspendTenant: (id: number, reason: string) => Promise<void>;
  reactivateTenant: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useTenants = (): UseTenantReturn => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  // Store current filters for refresh
  const [currentFilters, setCurrentFilters] = useState<TenantFilters | undefined>();

  const loadTenants = useCallback(async (filters?: TenantFilters, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timestamp for force refresh
      const params = { 
        ...filters, 
        _t: forceRefresh ? Date.now() : undefined 
      };
      
      console.log('📋 Loading tenants with params:', params);
      const data = await tenantService.getTenants(params);
      console.log('📋 Loaded tenants data:', {
        tenantsCount: data.tenants.length,
        firstTenant: data.tenants[0]?.user?.name,
        stats: data.stats
      });
      
      setTenants(data.tenants);
      setStats(data.stats);
      setPagination(data.pagination);
      setCurrentFilters(filters);
      
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to load tenants';
      setError(errorMessage);
      console.error('Load tenants error:', err);
      
      // Don't show toast for initial load or if it's a refresh
      if (!forceRefresh) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createTenant = useCallback(async (data: TenantFormData) => {
    try {
      await tenantService.createTenant(data);
      
      // Refresh the tenant list
      await loadTenants(currentFilters, true);
      
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to create tenant';
      console.error('Create tenant error:', err);
      throw new Error(errorMessage);
    }
  }, [loadTenants, currentFilters]);

  const updateTenant = useCallback(async (id: number, data: TenantFormData) => {
    try {
      console.log('🔄 Starting tenant update:', { id, data });
      
      const updatedTenant = await tenantService.updateTenant(id, data);
      console.log('✅ Tenant update API success:', updatedTenant);
      
      // Refresh the tenant list
      console.log('🔄 Refreshing tenant list with filters:', currentFilters);
      await loadTenants(currentFilters, true);
      console.log('✅ Tenant list refreshed');
      
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to update tenant';
      console.error('❌ Update tenant error:', err);
      throw new Error(errorMessage);
    }
  }, [loadTenants, currentFilters]);

  const deleteTenant = useCallback(async (id: number) => {
    try {
      await tenantService.deleteTenant(id);
      
      // Refresh the tenant list
      await loadTenants(currentFilters, true);
      
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to delete tenant';
      console.error('Delete tenant error:', err);
      throw new Error(errorMessage);
    }
  }, [loadTenants, currentFilters]);

  const moveOutTenant = useCallback(async (id: number, data: MoveOutData) => {
    try {
      await tenantService.moveOut(id, data);
      
      // Refresh the tenant list
      await loadTenants(currentFilters, true);
      
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to move out tenant';
      console.error('Move out tenant error:', err);
      throw new Error(errorMessage);
    }
  }, [loadTenants, currentFilters]);

  const suspendTenant = useCallback(async (id: number, reason: string) => {
    try {
      await tenantService.suspendTenant(id, reason);
      
      // Refresh the tenant list
      await loadTenants(currentFilters, true);
      
      toast.success('Tenant suspended successfully');
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to suspend tenant';
      console.error('Suspend tenant error:', err);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadTenants, currentFilters]);

  const reactivateTenant = useCallback(async (id: number) => {
    try {
      await tenantService.reactivateTenant(id);
      
      // Refresh the tenant list
      await loadTenants(currentFilters, true);
      
      toast.success('Tenant reactivated successfully');
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to reactivate tenant';
      console.error('Reactivate tenant error:', err);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadTenants, currentFilters]);

  const refresh = useCallback(async () => {
    await loadTenants(currentFilters, true);
  }, [loadTenants, currentFilters]);

  return {
    tenants,
    stats,
    loading,
    error,
    pagination,
    loadTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    moveOutTenant,
    suspendTenant,
    reactivateTenant,
    refresh
  };
};