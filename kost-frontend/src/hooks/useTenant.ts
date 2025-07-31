// File: src/hooks/useTenant.ts (FIXED VERSION)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '../services/tenantService';
import type { 
  TenantDashboardData, 
  PaymentUrlResponse, 
  Payment, 
  AccessLog, 
  RfidCard,
  TenantProfile,
  IoTDevice
} from '../services/tenantService';
import type { PaginatedResponse } from '../utils/api';
import { toast } from 'react-hot-toast';

// Query keys for React Query
export const tenantKeys = {
  all: ['tenant'] as const,
  dashboard: () => [...tenantKeys.all, 'dashboard'] as const,
  payments: () => [...tenantKeys.all, 'payments'] as const,
  payment: (id: number | string) => [...tenantKeys.payments(), id] as const,
  accessLogs: () => [...tenantKeys.all, 'accessLogs'] as const,
  rfidCards: () => [...tenantKeys.all, 'rfidCards'] as const,
  notifications: () => [...tenantKeys.all, 'notifications'] as const,
  profile: () => [...tenantKeys.all, 'profile'] as const,
  iotDevices: () => [...tenantKeys.all, 'iotDevices'] as const,
};

// ===================================================================
// DASHBOARD HOOKS
// ===================================================================
export const useTenantDashboard = () => {
  return useQuery({
    queryKey: tenantKeys.dashboard(),
    queryFn: async (): Promise<TenantDashboardData> => {
      const response = await tenantService.getDashboard();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};

// ===================================================================
// PAYMENT HOOKS
// ===================================================================
export const useTenantPayments = (params?: {
  page?: number;
  per_page?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}) => {
  return useQuery({
    queryKey: [...tenantKeys.payments(), params],
    queryFn: async (): Promise<PaginatedResponse<Payment>> => {
      const response = await tenantService.getPayments(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePayment = (paymentId: number | string) => {
  return useQuery({
    queryKey: tenantKeys.payment(paymentId),
    queryFn: async (): Promise<Payment> => {
      const response = await tenantService.getPayment(paymentId);
      return response.data;
    },
    enabled: !!paymentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const usePaymentUrl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentId: number | string): Promise<PaymentUrlResponse> => {
      const response = await tenantService.getPaymentUrl(paymentId);
      return response.data;
    },
    onSuccess: (data, paymentId) => {
      // Optionally update the payment cache with the URL
      queryClient.setQueryData(tenantKeys.payment(paymentId), (old: Payment | undefined) => {
        if (old) {
          return { ...old, payment_url: data.payment_url };
        }
        return old;
      });
      toast.success('Payment URL generated successfully');
    },
    onError: (error) => {
      console.error('Failed to get payment URL:', error);
      toast.error('Failed to generate payment URL');
    },
  });
};

export const useCheckPaymentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentId: number | string) => {
      const response = await tenantService.checkPaymentStatus(paymentId);
      return response.data;
    },
    onSuccess: (data, paymentId) => {
      // Extract payment data from Laravel response structure
      const payment = data.payment;
      const midtransStatus = data.midtrans_status;

      // Update payment cache with new status
      queryClient.setQueryData(tenantKeys.payment(paymentId), (old: Payment | undefined) => {
        if (old) {
          return { 
            ...old, 
            status: payment.status,
            paid_at: payment.paid_at,
            payment_method: payment.payment_method,
            transaction_id: payment.transaction_id,
          };
        }
        return payment; // Use complete payment object if no old data
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: tenantKeys.payments() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.dashboard() });

      // Log midtrans status if available
      if (midtransStatus) {
        console.log('Midtrans status:', midtransStatus);
      }
    },
    onError: (error) => {
      console.error('Failed to check payment status:', error);
    },
  });
};

export const usePaymentHistory = (params?: {
  page?: number;
  per_page?: number;
  year?: number;
  month?: number;
}) => {
  return useQuery({
    queryKey: [...tenantKeys.payments(), 'history', params],
    queryFn: async (): Promise<PaginatedResponse<Payment>> => {
      const response = await tenantService.getPaymentHistory(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ===================================================================
// ACCESS LOG HOOKS
// ===================================================================
export const useAccessHistory = (params?: {
  page?: number;
  per_page?: number;
  date_from?: string;
  date_to?: string;
  access_type?: 'entry' | 'exit';
}) => {
  return useQuery({
    queryKey: [...tenantKeys.accessLogs(), params],
    queryFn: async (): Promise<PaginatedResponse<AccessLog>> => {
      const response = await tenantService.getAccessHistory(params);
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Legacy alias for backward compatibility
export const useTenantAccessHistory = useAccessHistory;

export const useAccessStats = () => {
  return useQuery({
    queryKey: [...tenantKeys.accessLogs(), 'stats'],
    queryFn: async () => {
      const response = await tenantService.getAccessStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ===================================================================
// RFID CARD HOOKS
// ===================================================================
export const useRfidCards = () => {
  return useQuery({
    queryKey: tenantKeys.rfidCards(),
    queryFn: async (): Promise<RfidCard[]> => {
      const response = await tenantService.getRfidCards();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Legacy alias for backward compatibility
export const useTenantRfidCards = useRfidCards;

export const useRequestNewCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reason: string) => {
      const response = await tenantService.requestNewCard(reason);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.rfidCards() });
      toast.success(data.message || 'Card request submitted successfully');
    },
    onError: (error) => {
      console.error('Failed to request new card:', error);
      toast.error('Failed to submit card request');
    },
  });
};

export const useReportLostCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cardId, reason }: { cardId: number | string; reason: string }) => {
      const response = await tenantService.reportLostCard(cardId, reason);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.rfidCards() });
      toast.success(data.message || 'Card reported as lost successfully');
    },
    onError: (error) => {
      console.error('Failed to report lost card:', error);
      toast.error('Failed to report lost card');
    },
  });
};

// ===================================================================
// NOTIFICATION HOOKS
// ===================================================================
export const useNotifications = (params?: {
  page?: number;
  per_page?: number;
  read?: boolean;
}) => {
  return useQuery({
    queryKey: [...tenantKeys.notifications(), params],
    queryFn: async () => {
      const response = await tenantService.getNotifications(params);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: [...tenantKeys.notifications(), 'unread-count'],
    queryFn: async (): Promise<number> => {
      const response = await tenantService.getUnreadNotificationsCount();
      return response.data.count;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: number | string) => {
      const response = await tenantService.markNotificationAsRead(notificationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.notifications() });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await tenantService.markAllNotificationsAsRead();
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.notifications() });
      toast.success(data.message || 'All notifications marked as read');
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    },
  });
};

// ===================================================================
// PROFILE HOOKS
// ===================================================================
export const useTenantProfile = () => {
  return useQuery({
    queryKey: tenantKeys.profile(),
    queryFn: async (): Promise<TenantProfile> => {
      const response = await tenantService.getProfile();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name?: string;
      phone?: string;
      email?: string;
    }) => {
      const response = await tenantService.updateProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(tenantKeys.profile(), data);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    },
  });
};

export const useUpdateEmergencyContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      relationship: string;
    }) => {
      const response = await tenantService.updateEmergencyContact(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.profile() });
      toast.success(data.message || 'Emergency contact updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update emergency contact:', error);
      toast.error('Failed to update emergency contact');
    },
  });
};

// ===================================================================
// IOT DEVICE HOOKS
// ===================================================================
export const useRoomDevices = () => {
  return useQuery({
    queryKey: tenantKeys.iotDevices(),
    queryFn: async (): Promise<IoTDevice[]> => {
      const response = await tenantService.getRoomDevices();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDeviceStatus = (deviceId: number | string) => {
  return useQuery({
    queryKey: [...tenantKeys.iotDevices(), 'status', deviceId],
    queryFn: async () => {
      const response = await tenantService.getDeviceStatus(deviceId);
      return response.data;
    },
    enabled: !!deviceId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
};

// ===================================================================
// UTILITY HOOKS
// ===================================================================
export const useRefreshTenantData = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    toast.success('Data refreshed');
  };
};

// Export all types for convenience
export type {
  TenantDashboardData,
  PaymentUrlResponse,
  Payment,
  AccessLog,
  RfidCard,
  TenantProfile,
  IoTDevice,
};