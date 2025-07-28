// File: src/pages/Tenant/services/deviceService.ts (FIXED)
import api, { endpoints, ApiResponse } from '../../../utils/api';
import { 
  Device, 
  DeviceStats,
  DeviceLog,
  DeviceHealth,
  DeviceAlert,
  DeviceControl
} from '../types/device';

class DeviceService {
  /**
   * Get room devices
   */
  async getRoomDevices(): Promise<Device[]> {
    try {
      const response = await api.get<ApiResponse<Device[]>>(endpoints.tenant.iotDevices.roomDevices);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch room devices');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getRoomDevices error:', error);
      throw new Error(error.message || 'Failed to fetch room devices');
    }
  }

  /**
   * Control device
   */
  async controlDevice(deviceId: string, action: string, data?: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
        `/tenant/devices/${deviceId}/control`, 
        { action, data }
      );

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to control device');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.controlDevice error:', error);
      throw new Error(error.message || 'Failed to control device');
    }
  }

  /**
   * Get device status
   */
  async getDeviceStatus(deviceId: string): Promise<Device> {
    try {
      const response = await api.get<ApiResponse<Device>>(
        endpoints.tenant.iotDevices.deviceStatus(deviceId)
      );

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device status');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDeviceStatus error:', error);
      throw new Error(error.message || 'Failed to fetch device status');
    }
  }

  /**
   * Get device by ID
   */
  async getDeviceById(deviceId: string): Promise<Device> {
    try {
      const response = await api.get<ApiResponse<Device>>(`/tenant/devices/${deviceId}`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDeviceById error:', error);
      throw new Error(error.message || 'Failed to fetch device');
    }
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(): Promise<DeviceStats> {
    try {
      const response = await api.get<ApiResponse<DeviceStats>>(`/tenant/devices/stats`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device statistics');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDeviceStats error:', error);
      throw new Error(error.message || 'Failed to fetch device statistics');
    }
  }

  /**
   * Get device logs
   */
  async getDeviceLogs(deviceId?: string, limit?: number): Promise<DeviceLog[]> {
    try {
      const params: any = {};
      if (deviceId) params.device_id = deviceId;
      if (limit) params.limit = limit;

      const response = await api.get<ApiResponse<DeviceLog[]>>(`/tenant/devices/logs`, { params });

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device logs');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDeviceLogs error:', error);
      throw new Error(error.message || 'Failed to fetch device logs');
    }
  }

  /**
   * Get device health status
   */
  async getDeviceHealth(deviceId: string): Promise<DeviceHealth> {
    try {
      const response = await api.get<ApiResponse<DeviceHealth>>(`/tenant/devices/${deviceId}/health`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device health');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDeviceHealth error:', error);
      throw new Error(error.message || 'Failed to fetch device health');
    }
  }

  /**
   * Get device alerts
   */
  async getDeviceAlerts(deviceId?: string): Promise<DeviceAlert[]> {
    try {
      const params = deviceId ? { device_id: deviceId } : {};
      const response = await api.get<ApiResponse<DeviceAlert[]>>(`/tenant/devices/alerts`, { params });

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device alerts');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDeviceAlerts error:', error);
      throw new Error(error.message || 'Failed to fetch device alerts');
    }
  }

  /**
   * Acknowledge device alert
   */
  async acknowledgeAlert(alertId: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(`/tenant/devices/alerts/${alertId}/acknowledge`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to acknowledge alert');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.acknowledgeAlert error:', error);
      throw new Error(error.message || 'Failed to acknowledge alert');
    }
  }

  /**
   * Resolve device alert
   */
  async resolveAlert(alertId: string, resolution?: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(`/tenant/devices/alerts/${alertId}/resolve`, {
        resolution
      });

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to resolve alert');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.resolveAlert error:', error);
      throw new Error(error.message || 'Failed to resolve alert');
    }
  }

  /**
   * Get device control options
   */
  async getDeviceControls(deviceId: string): Promise<DeviceControl> {
    try {
      const response = await api.get<ApiResponse<DeviceControl>>(`/tenant/devices/${deviceId}/controls`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device controls');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDeviceControls error:', error);
      throw new Error(error.message || 'Failed to fetch device controls');
    }
  }

  /**
   * Report device issue
   */
  async reportDeviceIssue(deviceId: string, issue: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(`/tenant/devices/${deviceId}/report`, issue);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to report device issue');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.reportDeviceIssue error:', error);
      throw new Error(error.message || 'Failed to report device issue');
    }
  }

  /**
   * Get online devices
   */
  async getOnlineDevices(): Promise<Device[]> {
    try {
      const response = await api.get<ApiResponse<Device[]>>(`/tenant/devices/online`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch online devices');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getOnlineDevices error:', error);
      throw new Error(error.message || 'Failed to fetch online devices');
    }
  }

  /**
   * Get offline devices
   */
  async getOfflineDevices(): Promise<Device[]> {
    try {
      const response = await api.get<ApiResponse<Device[]>>(`/tenant/devices/offline`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch offline devices');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getOfflineDevices error:', error);
      throw new Error(error.message || 'Failed to fetch offline devices');
    }
  }

  /**
   * Get devices by type
   */
  async getDevicesByType(type: string): Promise<Device[]> {
    try {
      const response = await api.get<ApiResponse<Device[]>>(`/tenant/devices/type/${type}`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch devices by type');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDevicesByType error:', error);
      throw new Error(error.message || 'Failed to fetch devices by type');
    }
  }

  /**
   * Get device configuration
   */
  async getDeviceConfig(deviceId: string): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(`/tenant/devices/${deviceId}/config`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device configuration');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDeviceConfig error:', error);
      throw new Error(error.message || 'Failed to fetch device configuration');
    }
  }

  /**
   * Update device configuration (if allowed)
   */
  async updateDeviceConfig(deviceId: string, config: any): Promise<any> {
    try {
      const response = await api.put<ApiResponse<any>>(`/tenant/devices/${deviceId}/config`, config);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to update device configuration');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.updateDeviceConfig error:', error);
      throw new Error(error.message || 'Failed to update device configuration');
    }
  }

  /**
   * Test device connectivity
   */
  async testDeviceConnectivity(deviceId: string): Promise<{
    connected: boolean;
    response_time: number;
    last_seen: string;
  }> {
    try {
      const response = await api.post<ApiResponse<{
        connected: boolean;
        response_time: number;
        last_seen: string;
      }>>(`/tenant/devices/${deviceId}/test`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to test device connectivity');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.testDeviceConnectivity error:', error);
      throw new Error(error.message || 'Failed to test device connectivity');
    }
  }

  /**
   * Get device usage statistics
   */
  async getDeviceUsage(deviceId: string, period: 'day' | 'week' | 'month'): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(`/tenant/devices/${deviceId}/usage`, {
        params: { period }
      });

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device usage');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDeviceUsage error:', error);
      throw new Error(error.message || 'Failed to fetch device usage');
    }
  }

  /**
   * Get device history (status changes over time)
   */
  async getDeviceHistory(deviceId: string, limit?: number): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/tenant/devices/${deviceId}/history`, {
        params: { limit }
      });

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch device history');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.getDeviceHistory error:', error);
      throw new Error(error.message || 'Failed to fetch device history');
    }
  }

  /**
   * Subscribe to device notifications
   */
  async subscribeToDeviceNotifications(deviceId: string, events: string[]): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(`/tenant/devices/${deviceId}/subscribe`, {
        events
      });

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to subscribe to device notifications');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.subscribeToDeviceNotifications error:', error);
      throw new Error(error.message || 'Failed to subscribe to device notifications');
    }
  }

  /**
   * Unsubscribe from device notifications
   */
  async unsubscribeFromDeviceNotifications(deviceId: string): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(`/tenant/devices/${deviceId}/unsubscribe`);

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to unsubscribe from device notifications');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('DeviceService.unsubscribeFromDeviceNotifications error:', error);
      throw new Error(error.message || 'Failed to unsubscribe from device notifications');
    }
  }
}

export const deviceService = new DeviceService();