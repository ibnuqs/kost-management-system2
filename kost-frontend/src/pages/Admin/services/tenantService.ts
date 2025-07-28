// File: src/pages/Admin/services/tenantService.ts
import api from '../../../utils/api';
import type { 
  Tenant, 
  TenantStats, 
  TenantFormData, 
  TenantFilters,
  TenantsResponse,
  TenantResponse,
  TenantDetailResponse,
  MoveOutData,
  DashboardData
} from '../types/tenant';
import type { PaginationData } from '../types/common';

export const tenantService = {
  /**
   * Get tenants with filters and pagination
   */
  async getTenants(filters?: TenantFilters): Promise<{
    tenants: Tenant[];
    stats: TenantStats;
    pagination: PaginationData;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && value !== false) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get(`/admin/tenants?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch tenants');
      }

      const tenants = response.data.data || [];
      const stats = response.data.stats || {
        total: 0,
        active: 0,
        moved_out: 0,
        suspended: 0,
        overdue_count: 0,
        total_monthly_rent: 0,
        average_rent: 0,
        occupancy_rate: 0
      };
      const pagination = response.data.pagination || {};
      
      console.log('🔍 Tenant Service Debug:', {
        tenantsCount: tenants.length,
        stats,
        pagination
      });
      
      return {
        tenants: tenants,
        stats: stats,
        pagination: {
          current_page: pagination.current_page || 1,
          last_page: pagination.last_page || 1,
          per_page: pagination.per_page || 15,
          total: pagination.total || 0
        }
      };
    } catch (error: any) {
      console.error('Failed to fetch tenants:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch tenants');
    }
  },

  /**
   * Create a new tenant
   */
  async createTenant(data: TenantFormData): Promise<Tenant> {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password: data.password,
        password_confirmation: data.password_confirmation,
        room_id: parseInt(data.room_id),
        tenant_code: data.tenant_code || null, // ✅ TAMBAH: Include tenant_code
        monthly_rent: parseFloat(data.monthly_rent),
        start_date: data.start_date,
      };

      const response = await api.post('/admin/tenants', payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create tenant');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create tenant:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat();
          throw new Error(errorMessages.join(', '));
        }
      }

      // Handle room availability error
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Room is not available');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to create tenant');
    }
  },

  /**
   * Update an existing tenant
   */
  async updateTenant(id: number, data: TenantFormData): Promise<Tenant> {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        room_id: parseInt(data.room_id), // ✅ TAMBAH: Include room_id
        tenant_code: data.tenant_code || null,
        monthly_rent: parseFloat(data.monthly_rent),
        start_date: data.start_date, // ✅ TAMBAH: Include start_date
        status: data.status || 'active',
      };

      console.log('🔄 Updating tenant:', { id, payload });
      
      const response = await api.put(`/admin/tenants/${id}`, payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update tenant');
      }
      
      console.log('✅ Tenant updated successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to update tenant:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat();
          throw new Error(errorMessages.join(', '));
        }
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to update tenant');
    }
  },

  /**
   * Delete a tenant
   */
  async deleteTenant(id: number): Promise<void> {
    try {
      const response = await api.delete(`/admin/tenants/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete tenant');
      }
    } catch (error: any) {
      console.error('Failed to delete tenant:', error);
      
      // Handle business logic errors (pending payments, etc.)
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Cannot delete tenant');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete tenant');
    }
  },

  /**
   * Move out a tenant
   */
  async moveOut(id: number, data: MoveOutData): Promise<void> {
    try {
      // Map frontend fields to backend expected fields
      const requestData = {
        end_date: data.move_out_date,
        reason: data.reason
      };
      
      const response = await api.post(`/admin/tenants/${id}/move-out`, requestData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to move out tenant');
      }
    } catch (error: any) {
      console.error('Failed to move out tenant:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat();
          throw new Error(errorMessages.join(', '));
        }
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to move out tenant');
    }
  },

  /**
   * Get tenant by ID with detailed stats
   */
  async getTenant(id: number): Promise<{tenant: Tenant; stats: any}> {
    try {
      const response = await api.get(`/admin/tenants/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch tenant');
      }
      
      return {
        tenant: response.data.data,
        stats: response.data.stats
      };
    } catch (error: any) {
      console.error('Failed to fetch tenant:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Tenant not found');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch tenant');
    }
  },

  /**
   * Get dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get('/admin/tenants/dashboard');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch dashboard data');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch dashboard data');
    }
  },

  /**
   * Get tenant statistics only
   */
  async getStats(): Promise<TenantStats> {
    try {
      // Use the main endpoint with minimal data to get stats
      const response = await api.get('/admin/tenants?per_page=1');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch tenant stats');
      }
      
      return response.data.summary || {
        total: 0,
        active: 0,
        moved_out: 0,
        suspended: 0,
        overdue_count: 0,
        total_monthly_rent: 0,
        average_rent: 0,
        occupancy_rate: 0
      };
    } catch (error: any) {
      console.error('Failed to fetch tenant stats:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch tenant stats');
    }
  },

  /**
   * Suspend a tenant
   */
  async suspendTenant(id: number, reason: string): Promise<Tenant> {
    try {
      const response = await api.put(`/admin/tenants/${id}`, { 
        status: 'suspended',
        suspend_reason: reason 
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to suspend tenant');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to suspend tenant:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to suspend tenant');
    }
  },

  /**
   * Reactivate a tenant
   */
  async reactivateTenant(id: number): Promise<Tenant> {
    try {
      const response = await api.put(`/admin/tenants/${id}`, { 
        status: 'active' 
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reactivate tenant');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to reactivate tenant:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to reactivate tenant');
    }
  }
};