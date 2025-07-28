// ===== FIXED: src/pages/Tenant/hooks/useNotifications.ts =====
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { tenantQueryKeys } from '../config/apiConfig';
import { tenantService } from '../services/tenantService';
import { Notification, NotificationFilters } from '../types/notification';
import { PaginatedResponse } from '../types/common';
import { TENANT_CONSTANTS } from '../config/constants';

interface UseNotificationsParams extends NotificationFilters {
  enabled?: boolean;
}

export const useNotifications = (params: UseNotificationsParams = {}) => {
  const { enabled = true, ...filterParams } = params;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: tenantQueryKeys.notifications(filterParams),
    queryFn: async () => {
      try {
        // Add per_page limit for dashboard component
        const params = { ...filterParams, per_page: 5 };
        const result = await tenantService.getNotifications(params);
        return result;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Return default structure instead of throwing
        return { notifications: [], total: 0 };
      }
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes - lebih lama untuk dashboard
    refetchInterval: false, // Hapus auto refetch untuk performa
    initialData: { notifications: [], total: 0 }, // Prevent undefined
    retry: 1,
    refetchOnWindowFocus: false, // Tidak refetch saat focus
    refetchOnMount: 'always', // Always fresh data on mount
  });

  const refreshNotifications = () => {
    return queryClient.invalidateQueries({
      queryKey: tenantQueryKeys.notifications(),
    });
  };

  return {
    ...query,
    refreshNotifications,
    notifications: query.data?.notifications || [],
    total: query.data?.total || 0,
    pagination: query.data ? {
      current_page: 1,
      last_page: 1,
      per_page: query.data.notifications?.length || 0,
      total: query.data.total || 0,
    } : null,
  };
};

// FIXED: Updated unread count hook
export const useUnreadNotificationsCount = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: tenantQueryKeys.unreadCount(),
    queryFn: async () => {
      try {
        const count = await tenantService.getUnreadNotificationsCount();
        // Return the count directly, not wrapped in data object
        return count;
      } catch (error) {
        console.error('Error fetching unread count:', error);
        // Return 0 instead of throwing
        return 0;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: TENANT_CONSTANTS.NOTIFICATION_CHECK_INTERVAL,
    initialData: 0, // Prevent undefined
    retry: 1,
  });

  const refreshUnreadCount = () => {
    return queryClient.invalidateQueries({
      queryKey: tenantQueryKeys.unreadCount(),
    });
  };

  return {
    ...query,
    refreshUnreadCount,
    unreadCount: query.data || 0,
    isLoading: query.isLoading,
  };
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number | string) => {
      const id = typeof notificationId === 'string' ? parseInt(notificationId) : notificationId;
      return tenantService.markNotificationAsRead(id);
    },
    onMutate: async (notificationId) => {
      // Optimistic update untuk UI yang langsung berubah
      const id = typeof notificationId === 'string' ? parseInt(notificationId) : notificationId;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: tenantQueryKeys.notifications() });
      
      // Get current data
      const previousNotifications = queryClient.getQueryData(tenantQueryKeys.notifications());
      
      // Update notification status optimistically
      queryClient.setQueryData(tenantQueryKeys.notifications(), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          notifications: old.notifications.map((notification: any) => 
            notification.id === id 
              ? { ...notification, status: 'read' }
              : notification
          )
        };
      });
      
      // Update unread count optimistically
      queryClient.setQueryData(tenantQueryKeys.unreadCount(), (old: any) => {
        const currentCount = old || 0;
        return Math.max(0, currentCount - 1);
      });
      
      return { previousNotifications };
    },
    onSuccess: (data) => {
      // Show success message
      toast.success('Notifikasi ditandai sebagai sudah dibaca');
      
      // Refresh data from server
      queryClient.invalidateQueries({
        queryKey: tenantQueryKeys.notifications(),
      });
      queryClient.invalidateQueries({
        queryKey: tenantQueryKeys.unreadCount(),
      });
    },
    onError: (error: any, notificationId, context) => {
      // Rollback optimistic update
      if (context?.previousNotifications) {
        queryClient.setQueryData(tenantQueryKeys.notifications(), context.previousNotifications);
      }
      
      const message = error?.response?.data?.message || 'Gagal menandai notifikasi sebagai sudah dibaca';
      toast.error(message);
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tenantService.markAllNotificationsAsRead(),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: tenantQueryKeys.notifications() });
      
      // Get current data
      const previousNotifications = queryClient.getQueryData(tenantQueryKeys.notifications());
      
      // Update all notifications status optimistically
      queryClient.setQueryData(tenantQueryKeys.notifications(), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          notifications: old.notifications.map((notification: any) => ({
            ...notification,
            status: 'read'
          }))
        };
      });
      
      // Update unread count to 0 optimistically
      queryClient.setQueryData(tenantQueryKeys.unreadCount(), 0);
      
      return { previousNotifications };
    },
    onSuccess: (data) => {
      toast.success('Semua notifikasi ditandai sebagai sudah dibaca');
      
      // Refresh data from server
      queryClient.invalidateQueries({
        queryKey: tenantQueryKeys.notifications(),
      });
      queryClient.invalidateQueries({
        queryKey: tenantQueryKeys.unreadCount(),
      });
    },
    onError: (error: any, variables, context) => {
      // Rollback optimistic update
      if (context?.previousNotifications) {
        queryClient.setQueryData(tenantQueryKeys.notifications(), context.previousNotifications);
      }
      
      const message = error?.response?.data?.message || 'Gagal menandai semua notifikasi sebagai sudah dibaca';
      toast.error(message);
    },
  });
};
