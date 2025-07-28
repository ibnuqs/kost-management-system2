// File: src/pages/Tenant/hooks/useTenantPayments.ts (FINAL & FIXED)

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantQueryKeys } from '../config/apiConfig';
// [PERBAIKAN 1]: Impor `paymentService` dari file yang benar, bukan `tenantService`.
import { paymentService } from '../services/paymentService';
import { Payment } from '../types/payment';
import { FilterParams } from '../types/common';

interface UsePaymentsParams extends FilterParams {
  enabled?: boolean;
}

// [PERBAIKAN 2]: Hook `usePaymentHistory` telah dihapus untuk menghindari duplikasi.
// Kita hanya menggunakan satu hook yang sudah terbukti benar.
export const useTenantPayments = (params: UsePaymentsParams = {}) => {
  const { enabled = true, ...filterParams } = params;
  const queryClient = useQueryClient();

  const query = useQuery({
    // [PERBAIKAN 3 - ERROR FIXED]: Menggunakan queryKey yang dinamis dengan cara yang benar.
    // Memanggil tenantQueryKeys.payments() tanpa argumen, lalu menambahkan filterParams ke dalam array.
    queryKey: [...tenantQueryKeys.payments(), filterParams],

    // [PERBAIKAN 4]: Memanggil fungsi `getPayments` dari `paymentService` yang sudah benar.
    queryFn: () => paymentService.getPayments(filterParams),

    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Opsi `select` tidak lagi diperlukan karena `paymentService` sudah mengembalikan format yang benar.
  });

  const refreshPayments = () => {
    // Menggunakan invalidateQueries dengan queryKey dasar agar semua query pembayaran di-refresh.
    return queryClient.invalidateQueries({
      queryKey: tenantQueryKeys.payments(),
    });
  };

  return {
    ...query,
    refreshPayments, // Mengganti nama `refreshHistory` menjadi `refreshPayments` untuk konsistensi
    // Mengakses data dengan aman dan memberikan nilai default array kosong
    payments: query.data?.payments || [],
    // Membuat objek pagination yang lebih informatif dan kuat
    pagination: query.data ? {
      current_page: filterParams.page || 1,
      last_page: query.data.total > 0 ? Math.ceil(query.data.total / (filterParams.per_page || 10)) : 1,
      per_page: filterParams.per_page || 10,
      total: query.data.total || 0,
    } : null,
  };
};
