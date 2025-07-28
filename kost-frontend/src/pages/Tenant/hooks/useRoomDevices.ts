// File: src/pages/Tenant/hooks/useRoomDevices.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantQueryKeys } from '../config/apiConfig';
import { tenantService } from '../services/tenantService';
import { Device } from '../types/device';

export const useRoomDevices = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: tenantQueryKeys.roomDevices(),
    queryFn: () => tenantService.getRoomDevices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes for device status
    select: (data): Device[] => data, // Remove .data since service already returns the array
  });

  const refreshDevices = () => {
    return queryClient.invalidateQueries({
      queryKey: tenantQueryKeys.roomDevices(),
    });
  };

  return {
    ...query,
    refreshDevices,
    devices: query.data || [],
    onlineDevices: query.data?.filter(device => device.status === 'online') || [],
    offlineDevices: query.data?.filter(device => device.status === 'offline') || [],
    maintenanceDevices: query.data?.filter(device => device.status === 'maintenance') || [],
    errorDevices: query.data?.filter(device => device.status === 'error') || [],
  };
};

export const useDeviceStatus = (deviceId: number | string, enabled: boolean = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tenant', 'device', deviceId],
    queryFn: () => {
      // Ensure deviceId is a string as expected by the service
      const id = typeof deviceId === 'number' ? deviceId.toString() : deviceId;
      return tenantService.getDeviceStatus(id);
    },
    enabled: enabled && !!deviceId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute for individual device
    select: (data): Device => data, // Remove .data since service already returns the Device object
  });

  const refreshDeviceStatus = () => {
    return queryClient.invalidateQueries({
      queryKey: ['tenant', 'device', deviceId],
    });
  };

  return {
    ...query,
    refreshDeviceStatus,
    device: query.data,
  };
};