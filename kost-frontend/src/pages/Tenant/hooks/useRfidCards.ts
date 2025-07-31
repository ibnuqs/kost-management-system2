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
    onError: (error: unknown) => {
      console.error('Failed to fetch RFID cards:', error);
      // Optional: Show toast error message
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage && !errorMessage.includes('Authentication required')) {
        toast.error('Gagal memuat kartu RFID: ' + errorMessage);
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
    onError: (error: unknown) => {
      let message = 'Failed to submit card request';
      if (error && typeof error === 'object' && 'response' in error) {
        const errorWithResponse = error as { response?: { data?: { message?: string } } };
        if (errorWithResponse.response?.data?.message) {
          message = errorWithResponse.response.data.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
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
    onError: (error: unknown) => {
      let message = 'Failed to report lost card';
      if (error && typeof error === 'object' && 'response' in error) {
        const errorWithResponse = error as { response?: { data?: { message?: string } } };
        if (errorWithResponse.response?.data?.message) {
          message = errorWithResponse.response.data.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
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
    onError: (error: unknown) => {
      let message = 'Gagal mengubah status kartu';
      if (error && typeof error === 'object' && 'response' in error) {
        const errorWithResponse = error as { response?: { data?: { message?: string } } };
        if (errorWithResponse.response?.data?.message) {
          message = errorWithResponse.response.data.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    },
  });
};