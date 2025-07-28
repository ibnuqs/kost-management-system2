// File: src/pages/Tenant/hooks/useRfidCards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { tenantQueryKeys } from '../config/apiConfig';
import { tenantService } from '../services/tenantService';
import { RfidCard } from '../types/rfid';

export const useRfidCards = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: tenantQueryKeys.rfidCards(),
    queryFn: () => tenantService.getRfidCards(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
    select: (data): RfidCard[] => data, // Remove .data since service already returns the array
    onError: (error: any) => {
      console.error('Failed to fetch RFID cards:', error);
      // Optional: Show toast error message
      if (error.message && !error.message.includes('Authentication required')) {
        toast.error('Gagal memuat kartu RFID: ' + error.message);
      }
    },
  });

  const refreshCards = () => {
    return queryClient.invalidateQueries({
      queryKey: tenantQueryKeys.rfidCards(),
    });
  };

  return {
    ...query,
    refreshCards,
    cards: query.data || [],
    isEmpty: !query.isLoading && (!query.data || query.data.length === 0),
    hasError: !!query.error,
  };
};

export const useRequestNewCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => tenantService.requestRfidCard(reason),
    onSuccess: () => {
      toast.success('RFID card request submitted successfully');
      queryClient.invalidateQueries({
        queryKey: tenantQueryKeys.rfidCards(),
      });
      queryClient.invalidateQueries({
        queryKey: tenantQueryKeys.dashboard(),
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to submit card request';
      toast.error(message);
    },
  });
};

export const useReportLostCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, reason }: { cardId: number | string; reason: string }) => {
      // Ensure cardId is a number
      const id = typeof cardId === 'string' ? parseInt(cardId) : cardId;
      return tenantService.reportLostCard(id, reason);
    },
    onSuccess: () => {
      toast.success('Lost card report submitted successfully');
      queryClient.invalidateQueries({
        queryKey: tenantQueryKeys.rfidCards(),
      });
      queryClient.invalidateQueries({
        queryKey: tenantQueryKeys.dashboard(),
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to report lost card';
      toast.error(message);
    },
  });
};

export const useToggleCardStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, status }: { cardId: number | string; status: 'active' | 'inactive' }) => {
      const id = typeof cardId === 'string' ? parseInt(cardId) : cardId;
      return tenantService.toggleCardStatus(id, status);
    },
    onSuccess: (_, variables) => {
      const statusText = variables.status === 'active' ? 'diaktifkan' : 'dinonaktifkan';
      toast.success(`Kartu berhasil ${statusText}`);
      queryClient.invalidateQueries({
        queryKey: tenantQueryKeys.rfidCards(),
      });
      queryClient.invalidateQueries({
        queryKey: tenantQueryKeys.dashboard(),
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Gagal mengubah status kartu';
      toast.error(message);
    },
  });
};