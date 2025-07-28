// File: src/pages/Admin/services/iotService.ts
import api from '../../../utils/api';
import { getLastSeenHuman, isDeviceOnline } from '../../../utils/dateUtils';
import type { IoTDevice, DeviceStats, DeviceFormData, DeviceFilters } from '../types';

class IoTService {
  // Quick backend availability check - simplified version
  private async checkBackendAvailability(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // Faster timeout
      
      // Just try a simple health check that won't cause CORS issues
      const baseUrl = import.meta.env.VITE_API_URL || 'https://148.230.96.228/api';
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error: any) {
      // Silently fail and use mock data
      return false;
    }
  }

  async getDevices(filters?: DeviceFilters): Promise<{
    devices: IoTDevice[];
    stats: DeviceStats;
    pagination: any;
  }> {
    // Return empty data if backend not available
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      return {
        devices: [],
        stats: { total: 0, online: 0, offline: 0, door_locks: 0, card_scanners: 0 },
        pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 }
      };
    }

    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      
      // Try main endpoint first
      let response;
      try {
        response = await api.get(`/admin/iot-devices?${params}`);
      } catch (mainError: any) {
        return {
          devices: [],
          stats: { total: 0, online: 0, offline: 0, door_locks: 0, card_scanners: 0 },
          pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 }
        };
      }

      if (!response.data.success) {
        return {
          devices: [],
          stats: { total: 0, online: 0, offline: 0, door_locks: 0, card_scanners: 0 },
          pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 }
        };
      }

      // Process devices data and add missing fields
      const rawDevices = response.data.data?.data || response.data.data || [];
      const processedDevices = rawDevices.map((device: any) => {
        // Debug logging for timestamp issues
        console.debug('Processing device timestamps:', {
          device_id: device.device_id,
          last_seen: device.last_seen,
          last_seen_type: typeof device.last_seen,
          updated_at: device.updated_at,
          created_at: device.created_at
        });
        
        // Validate timestamps before processing
        let validLastSeen = device.last_seen;
        let validUpdatedAt = device.updated_at;
        
        // Check if last_seen is a reasonable timestamp
        if (validLastSeen) {
          const testDate = new Date(validLastSeen);
          if (isNaN(testDate.getTime()) || testDate.getFullYear() < 2020 || testDate.getFullYear() > 2030) {
            console.warn(`Invalid last_seen timestamp for device ${device.device_id}:`, validLastSeen);
            validLastSeen = null;
          }
        }
        
        // Check if updated_at is a reasonable timestamp
        if (validUpdatedAt) {
          const testDate = new Date(validUpdatedAt);
          if (isNaN(testDate.getTime()) || testDate.getFullYear() < 2020 || testDate.getFullYear() > 2030) {
            console.warn(`Invalid updated_at timestamp for device ${device.device_id}:`, validUpdatedAt);
            validUpdatedAt = null;
          }
        }
        
        // Calculate last seen time and determine real online status using utility functions
        const lastSeenHuman = getLastSeenHuman(validLastSeen, validUpdatedAt);
        const isReallyOnline = isDeviceOnline(validLastSeen, 2); // 2 minutes threshold (ESP32 sends every 30s)

        // Override status based on last seen time
        const calculatedStatus = isReallyOnline ? 'online' : 'offline';
        const statusFromDB = device.status || 'offline';

        return {
          ...device,
          last_seen: validLastSeen, // Use validated timestamp
          last_seen_human: device.last_seen_human || lastSeenHuman,
          device_type_label: device.device_type_label || (device.device_type === 'door_lock' ? 'Door Lock' : 'Card Scanner'),
          status: calculatedStatus, // Use calculated status based on last_seen
          status_db: statusFromDB, // Keep original DB status for reference
          status_label: calculatedStatus === 'online' ? 'Online' : 'Offline',
          is_online: isReallyOnline,
          last_seen_date: validLastSeen || validUpdatedAt || device.created_at
        };
      });

      return {
        devices: processedDevices,
        stats: response.data.stats || {
          total: 0,
          online: 0,
          offline: 0,
          door_locks: 0,
          card_scanners: 0
        },
        pagination: response.data.pagination || response.data.data || { current_page: 1, last_page: 1, per_page: 15, total: 0 }
      };

    } catch (error: any) {
      return {
        devices: [],
        stats: { total: 0, online: 0, offline: 0, door_locks: 0, card_scanners: 0 },
        pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 }
      };
    }
  }


  async getRooms(): Promise<any[]> {
    try {
      // Use EXACT same approach as Room Management
      const params = new URLSearchParams();
      params.append('include_archived', 'false'); // ✅ FIXED: Do not fetch archived rooms
      params.append('per_page', '100');
      
      console.log('🏠 IoT Service fetching rooms with EXACT same params as Room Management...');
      console.log('🏠 Params:', params.toString());
      const response = await api.get(`/admin/rooms?${params}`);
      
      if (!response.data.success) {
        console.error('❌ Failed to fetch rooms:', response.data.message);
        return [];
      }
      
      const roomsData = response.data.data || [];
      console.log('🏠 Raw rooms received:', roomsData.length);
      
      // Filter out archived rooms on frontend as extra safety
      const activeRooms = roomsData.filter((room: any) => 
        room.status !== 'archived' && 
        !room.archived_at && 
        !room.is_archived
      );
      
      console.log('🏠 Active rooms after filtering:', activeRooms.length);
      console.log('🏠 Sample room with tenant:', activeRooms[0]);
      
      if (activeRooms.length > 0) {
        const firstRoom = activeRooms[0];
        console.log('🏠 Tenant data check:', {
          firstRoom: firstRoom,
          hasTenant: !!firstRoom?.tenant,
          tenantName: firstRoom?.tenant?.name,
          tenantUserName: firstRoom?.tenant?.user_name,
          tenantStructure: firstRoom?.tenant,
          roomsWithTenants: activeRooms.filter((r: any) => r.tenant).length,
          roomsWithoutTenants: activeRooms.filter((r: any) => !r.tenant).length
        });
      }
      
      return Array.isArray(activeRooms) ? activeRooms.map((room: any) => {
        // Try multiple ways to extract tenant data
        const tenantData = room.tenant || room.tenants?.[0] || room.currentTenant || room.occupant || null;
        const tenantId = room.tenant_id || room.tenant?.id || tenantData?.id || null;
        // Backend uses 'user_name' field, not 'name'
        const tenantName = room.tenant?.user_name || tenantData?.user_name || room.tenant?.name || tenantData?.name || room.tenant_name || null;
        
        // Log only if tenant name extraction fails for debugging
        if (tenantData && !tenantName) {
          console.log(`🏠 ⚠️ Room ${room.room_number} has tenant data but no name extracted:`, {
            tenantData,
            availableFields: Object.keys(tenantData)
          });
        }
        
        return {
          id: room.id,
          room_number: room.room_number,
          room_type: room.room_type || 'standard',
          status: room.status || 'available',
          label: `Room ${room.room_number}`,
          room_name: room.room_name || `Room ${room.room_number}`,
          // Include tenant data with multiple extraction methods
          tenant: tenantData,
          tenant_id: tenantId,
          tenant_name: tenantName,
          // Additional room info
          archived_at: room.archived_at || null,
          is_archived: room.is_archived || false,
          // Keep original data for debugging
          raw_data: room
        };
      }) : [];
    } catch (error) {
      console.error('❌ Error fetching rooms for IoT:', error);
      return [];
    }
  }


  async createDevice(data: DeviceFormData): Promise<IoTDevice> {
    // Check if backend is available first
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      throw new Error('Backend is not available. Device creation requires a running backend server.');
    }

    try {
      const payload = {
        ...data,
        room_id: data.room_id === '' || data.room_id === undefined ? null : data.room_id
      };
      
      const response = await api.post('/admin/iot-devices', payload);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create device');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error creating device:', error);
      throw error;
    }
  }

  async updateDevice(id: number, data: DeviceFormData): Promise<IoTDevice> {
    // Check if backend is available first
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      throw new Error('Backend is not available. Device updates require a running backend server.');
    }

    try {
      const payload = {
        ...data,
        room_id: data.room_id === '' || data.room_id === undefined ? null : data.room_id
      };
      
      const response = await api.put(`/admin/iot-devices/${id}`, payload);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update device');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  }

  async deleteDevice(id: number): Promise<void> {
    // Check if backend is available first
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      throw new Error('Backend is not available. Device deletion requires a running backend server.');
    }

    try {
      const response = await api.delete(`/admin/iot-devices/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete device');
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      throw error;
    }
  }

  async updateStatus(id: number, status: string): Promise<void> {
    // Check if backend is available first
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      throw new Error('Backend is not available. Status updates require a running backend server.');
    }

    try {
      const response = await api.post(`/admin/iot-devices/${id}/status`, { status });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update device status');
      }
    } catch (error) {
      console.error('Error updating device status:', error);
      throw error;
    }
  }

  async exportDevices(format: string): Promise<void> {
    // Check if backend is available first
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      throw new Error('Backend is not available. Device export requires a running backend server.');
    }

    try {
      const response = await api.get(`/admin/iot-devices/export/${format}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `iot_devices_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting devices:', error);
      throw error;
    }
  }
}

// Export singleton instance to maintain compatibility
export const iotService = new IoTService();