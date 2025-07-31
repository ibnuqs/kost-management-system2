// Hook for managing navigation badges
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface BadgeData {
  maintenance_requests?: number;
  new_applications?: number;
  pending_payments?: number;
  offline_devices?: number;
  unread_notifications?: number;
}

// Mock API function - replace with real API call
const fetchNavigationBadges = async (userRole: 'admin' | 'tenant'): Promise<BadgeData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (userRole === 'admin') {
    return {
      maintenance_requests: Math.floor(Math.random() * 5),
      new_applications: Math.floor(Math.random() * 3),
      pending_payments: Math.floor(Math.random() * 10),
      offline_devices: Math.floor(Math.random() * 2),
      unread_notifications: Math.floor(Math.random() * 15)
    };
  } else {
    return {
      pending_payments: Math.floor(Math.random() * 3),
      unread_notifications: Math.floor(Math.random() * 8)
    };
  }
};

export const useNavigationBadges = (userRole: 'admin' | 'tenant') => {
  const [badges, setBadges] = useState<BadgeData>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['navigationBadges', userRole],
    queryFn: () => fetchNavigationBadges(userRole),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  useEffect(() => {
    if (data) {
      setBadges(data);
    }
  }, [data]);

  // Manual badge updates
  const updateBadge = (key: keyof BadgeData, value: number) => {
    setBadges(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const incrementBadge = (key: keyof BadgeData, increment: number = 1) => {
    setBadges(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + increment
    }));
  };

  const decrementBadge = (key: keyof BadgeData, decrement: number = 1) => {
    setBadges(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) - decrement)
    }));
  };

  const clearBadge = (key: keyof BadgeData) => {
    setBadges(prev => ({
      ...prev,
      [key]: 0
    }));
  };

  const clearAllBadges = () => {
    setBadges({});
  };

  return {
    badges,
    isLoading,
    error,
    refetch,
    updateBadge,
    incrementBadge,
    decrementBadge,
    clearBadge,
    clearAllBadges
  };
};