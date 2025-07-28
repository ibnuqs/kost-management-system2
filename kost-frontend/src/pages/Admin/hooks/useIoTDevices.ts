// File: src/pages/Admin/hooks/useIoTDevices.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { iotService } from '../services';
import type { IoTDevice, DeviceStats, DeviceFormData, DeviceFilters } from '../types';

export const useIoTDevices = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [stats, setStats] = useState<DeviceStats>({
    total: 0,
    online: 0,
    offline: 0,
    door_locks: 0,
    card_scanners: 0
  });
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  const loadDevices = useCallback(async (filters?: DeviceFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await iotService.getDevices(filters);
      setDevices(data.devices);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load IoT devices');
      // Fallback to test data for development
      setDevices([]);
      setStats({
        total: 0,
        online: 0,
        offline: 0,
        door_locks: 0,
        card_scanners: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      console.log('🏠 useIoTDevices: Starting loadRooms...');
      const data = await iotService.getRooms();
      console.log('🏠 useIoTDevices: Rooms loaded:', data.length, data);
      setRooms(data);
    } catch (err: any) {
      console.error('❌ useIoTDevices: Failed to load rooms:', err);
      setRooms([]);
    }
  }, []);

  const createDevice = useCallback(async (data: DeviceFormData) => {
    try {
      await iotService.createDevice(data);
      toast.success('Device created successfully');
      loadDevices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create device');
      throw err;
    }
  }, [loadDevices]);

  const updateDevice = useCallback(async (id: number, data: DeviceFormData) => {
    try {
      await iotService.updateDevice(id, data);
      toast.success('Device updated successfully');
      loadDevices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update device');
      throw err;
    }
  }, [loadDevices]);

  const deleteDevice = useCallback(async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this device?')) {
      return;
    }
    
    try {
      await iotService.deleteDevice(id);
      toast.success('Device deleted successfully');
      loadDevices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete device');
      throw err;
    }
  }, [loadDevices]);

  const toggleDeviceStatus = useCallback(async (id: number, status: string) => {
    try {
      await iotService.updateStatus(id, status);
      toast.success(`Device ${status === 'online' ? 'enabled' : 'disabled'} successfully`);
      loadDevices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update device status');
      throw err;
    }
  }, [loadDevices]);

  const exportDevices = useCallback(async (format: string = 'csv') => {
    try {
      await iotService.exportDevices(format);
      toast.success('Export completed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to export devices');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadDevices();
    loadRooms();
  }, [loadDevices, loadRooms]);

  return {
    devices,
    stats,
    rooms,
    loading,
    error,
    pagination,
    loadDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    toggleDeviceStatus,
    exportDevices,
    refresh: loadDevices
  };
};