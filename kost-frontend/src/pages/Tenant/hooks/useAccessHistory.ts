// File: src/pages/Tenant/hooks/useAccessHistory.ts (FIXED)

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantQueryKeys } from '../config/apiConfig';
// [PERBAIKAN 1]: Mengimpor `accessService` dari file yang benar, bukan `tenantService`.
import { accessService } from '../services/accessService';
import { AccessFilters } from '../types/access';
import { FilterParams } from '../types/common';

// Menggabungkan tipe filter dengan aman untuk menghindari konflik properti
interface UseAccessHistoryParams extends Omit<FilterParams, 'sort_by'>, AccessFilters {
  enabled?: boolean;
}

/**
 * Hook untuk mengambil data riwayat akses dengan paginasi dan filter.
 */
export const useAccessHistory = (params: UseAccessHistoryParams = {}) => {
  const { enabled = true, ...filterParams } = params;
  const queryClient = useQueryClient();

  const query = useQuery({
    // Menggunakan queryKey yang dinamis agar query di-refresh saat filter berubah
    queryKey: [...tenantQueryKeys.accessHistory(), filterParams],
    
    // [PERBAIKAN 2]: Memanggil fungsi `getAccessHistory` dari `accessService`.
    queryFn: () => accessService.getAccessHistory(filterParams),
    
    enabled,
    staleTime: 2 * 60 * 1000, // Cache selama 2 menit
  });

  const refreshAccessHistory = () => {
    return queryClient.invalidateQueries({
      queryKey: tenantQueryKeys.accessHistory(),
    });
  };

  return {
    ...query,
    refreshAccessHistory,
    accessLogs: query.data?.logs || [],
    pagination: query.data ? {
      current_page: filterParams.page || 1,
      last_page: query.data.total > 0 ? Math.ceil(query.data.total / (filterParams.per_page || 10)) : 1,
      per_page: filterParams.per_page || 10,
      total: query.data.total || 0,
      from: ((filterParams.page || 1) - 1) * (filterParams.per_page || 10) + 1,
      to: Math.min((filterParams.page || 1) * (filterParams.per_page || 10), query.data.total || 0),
    } : null,
  };
};

/**
 * Hook untuk mengambil data statistik riwayat akses.
 */
export const useAccessStats = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: tenantQueryKeys.accessStats(),
    // [PERBAIKAN 3]: Memanggil fungsi `getAccessStats` dari `accessService`.
    queryFn: () => accessService.getAccessStats(),
    staleTime: 5 * 60 * 1000, // Cache selama 5 menit
  });

  return {
    ...query,
    refreshAccessStats: () => queryClient.invalidateQueries({
      queryKey: tenantQueryKeys.accessStats(),
    }),
    stats: query.data,
  };
};
