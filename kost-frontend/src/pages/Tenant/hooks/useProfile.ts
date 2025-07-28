// File: src/pages/Tenant/hooks/useProfile.ts (FINAL & FIXED)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { tenantQueryKeys } from '../config/apiConfig';
// [PERBAIKAN 1]: Impor `profileService` dari file yang benar.
import { profileService } from '../services/profileService';
import { TenantProfile, ProfileUpdateData } from '../types/profile';

/**
 * Hook untuk mengambil data profil tenant.
 */
export const useProfile = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: tenantQueryKeys.profile(),
    // Memanggil fungsi dari service yang benar.
    queryFn: () => profileService.getProfile(),
    staleTime: 10 * 60 * 1000, // Cache selama 10 menit
  });

  return {
    ...query,
    refreshProfile: () => queryClient.invalidateQueries({
      queryKey: tenantQueryKeys.profile(),
    }),
    profile: query.data as TenantProfile | undefined,
  };
};

/**
 * Hook untuk melakukan update data profil tenant.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Tipe data untuk `data` diperjelas.
    // Fungsi updateProfile ini sudah bisa menangani upload foto (avatar).
    mutationFn: (data: ProfileUpdateData) => profileService.updateProfile(data),
    
    onSuccess: (response) => {
      // [PERBAIKAN ERROR]: Logika `setQueryData` dihapus.
      // API Anda hanya mengembalikan pesan sukses, bukan data profil lengkap,
      // sehingga cara paling aman dan benar adalah dengan mengandalkan `invalidateQueries`.
      // Ini akan memicu pengambilan ulang data profil yang baru dari server.
      toast.success(response.message || 'Profile updated successfully');
      
      // Invalidate query untuk memastikan data tetap sinkron dengan server.
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.dashboard() });
    },
    onError: (error: any) => {
      // Penanganan error sudah baik.
      const message = error?.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });
};

/**
 * Hook untuk upload foto profil tenant.
 */
export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileService.updateProfile({ avatar: file }),
    
    onSuccess: (response) => {
      toast.success(response.message || 'Profile photo updated successfully');
      
      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.dashboard() });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to upload photo';
      toast.error(message);
    },
  });
};

/**
 * Hook untuk mengganti password tenant.
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: {
      current_password: string;
      new_password: string;
      new_password_confirmation: string;
    }) => profileService.changePassword(data),
    
    onSuccess: (response) => {
      toast.success(response.message || 'Password berhasil diubah');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Gagal mengubah password';
      toast.error(message);
    },
  });
};
