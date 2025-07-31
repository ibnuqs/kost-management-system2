// File: src/pages/Admin/services/esp32Service.ts
import api from '../../../utils/api';
import { ENV } from '../../../config/environment';
import type { RfidCard } from '../types/rfid';
import type { Room } from '../types/common';

// API Response Interfaces
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}


interface RfidApiData {
  id: string | number;
  uid: string;
  user_id?: string | number | null;
  tenant_id?: string | number | null;
  device_id?: string | null;
  card_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  user_name?: string;
  tenant?: {
    id: number;
    tenant_code: string;
    room: Room;
  };
  tenant_code?: string;
  room_number?: string;
}

interface AccessApiData {
  id: string;
  rfid_uid: string;
  device_id: string;
  access_granted: boolean;
  reason: string;
  accessed_at: string;
  user?: {
    name: string;
  };
  room?: {
    room_number: string;
  };
}

interface DeviceStatusData {
  wifi_connected?: boolean;
  mqtt_connected?: boolean;
  rfid_ready?: boolean;
  device_ip?: string;
  uptime?: string;
  firmware_version?: string;
  door_status?: string;
}

interface ScanResponseData {
  status: string;
  user: string;
  message: string;
  access_granted: boolean;
}

interface DoorCommandResponse {
  success: boolean;
  message?: string;
}

interface DeviceStatusResponse {
  success: boolean;
  data: unknown;
  message?: string;
}

interface MqttTestResponse {
  success: boolean;
  message: string;
}

export interface ESP32Device {
  id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  room_id?: string;
  status: 'online' | 'offline' | 'error' | string;
  last_seen: string;
  device_info: {
    wifi_connected?: boolean;
    mqtt_connected?: boolean;
    rfid_ready?: boolean;
    device_ip?: string;
    uptime?: string;  // ESP32 sends as "1h 30m" format
    firmware_version?: string;
    door_status?: string;
  };
  room?: {
    room_number: string;
    room_name: string;
  };
}

// RfidCard interface is now imported from types/rfid

export interface AccessAttempt {
  id: string;
  card_uid: string;
  device_id: string;
  access_granted: boolean;
  reason: string;
  timestamp: string;
  user_name?: string;
  room_number?: string;
}

class ESP32Service {
  // ESP32 Device Management
  async getDevices(): Promise<ESP32Device[]> {
    console.log('🔄 Loading devices from backend API...');
    console.log('🔧 DEBUG: esp32Service.getDevices() called');
    
    // Try backend first before using any fallback
    try {
      console.log('🔍 Fetching ESP32 devices from /admin/iot-devices');
      
      // Use main API endpoint directly (no hardcoded production URLs)
      const response = await api.get('/admin/iot-devices');
      console.log('✅ Main endpoint worked');
      
      if (response.data.success) {
        const data = response.data.data;
        console.log('✅ ESP32 devices response:', data);
        
        // Handle different response structures
        if (Array.isArray(data)) {
          return data.map(this.mapDeviceFromApi);
        } else if (data && Array.isArray((data as { data: unknown[] }).data)) {
          return (data as { data: unknown[] }).data.map(this.mapDeviceFromApi);
        }
        return [];
      }
      
      console.warn('❌ Invalid response format');
      throw new Error('Invalid response format from devices API');
      
    } catch (error: unknown) {
      console.error('❌ Error fetching ESP32 devices:', error);
      throw error;
    }
  }

  // Quick backend availability check
  private async checkBackendAvailability(): Promise<boolean> {
    try {
      // Very quick timeout for availability check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${ENV.API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Backend is available');
        return true;
      } else {
        console.warn('⚠️ Backend returned non-OK status:', response.status);
        return false;
      }
    } catch (error: unknown) {
      if ((error as Error).name === 'AbortError') {
        console.warn('⏱️ Backend health check timed out (3s)');
      } else {
        console.warn('🌐 Backend health check failed:', (error as Error).message);
      }
      return false;
    }
  }

  async updateDeviceStatus(deviceId: string, statusData: DeviceStatusData): Promise<boolean> {
    try {
      const response = await api.put(`/admin/iot-devices/${deviceId}/status`, {
        status: statusData.wifi_connected && statusData.mqtt_connected ? 'online' : 'offline',
        last_seen: new Date().toISOString(),
        device_info: statusData
      });
      return response.data.success;
    } catch (error: unknown) {
      console.error('Error updating device status:', error);
      return false;
    }
  }

  // Room Management
  async getRooms(): Promise<Room[]> {
    try {
      const response = await api.get('/admin/rooms') as { data: ApiResponse<Room[]> };
      if (response.data.success) {
        const data = response.data.data;
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch (error: unknown) {
      console.error('Error fetching rooms:', error);
      console.warn('Using empty rooms data due to API errors');
      return [];
    }
  }

  // RFID Card Management
  async getRfidCards(): Promise<RfidCard[]> {
    try {
      console.log('🔍 Getting RFID cards from /admin/rfid/cards');
      
      // Use correct backend endpoint from RfidController
      const response = await api.get('/admin/rfid/cards');
      if (response.data.success) {
        const data = response.data.data;
        // Handle paginated response
        if (data && (data as { data: RfidApiData[] }).data && Array.isArray((data as { data: RfidApiData[] }).data)) {
          return (data as { data: RfidApiData[] }).data.map(this.mapRfidCardFromApi);
        } else if (Array.isArray(data)) {
          return (data as RfidApiData[]).map(this.mapRfidCardFromApi);
        }
        return [];
      }
      return [];
    } catch (error: unknown) {
      console.error('Error fetching RFID cards from /admin/rfid/cards:', error);
      
      // Fallback to alternative endpoint
      try {
        const fallbackResponse = await api.get('/admin/rfid-cards');
        if (fallbackResponse.data.success) {
          const fallbackData = fallbackResponse.data.data;
          return Array.isArray(fallbackData) ? (fallbackData as RfidApiData[]).map(this.mapRfidCardFromApi) : [];
        }
      } catch (fallbackError: unknown) {
        console.error('Error fetching from fallback endpoint:', fallbackError);
      }
      
      // No fallback data - strict API-only approach
      console.error('No RFID cards available - API endpoints failed');
      return [];
    }
  }

  async addRfidCard(cardData: Partial<RfidCard>): Promise<RfidCard | null> {
    try {
      const payload = {
        uid: cardData.uid,
        tenant_id: cardData.tenant_id || null,
        card_type: cardData.card_type || 'primary',
        status: cardData.status || 'active'
      };
      
      console.log('Adding RFID card with payload:', payload);
      
      const response = await api.post('/admin/rfid/cards', payload);
      if (response.data.success) {
        return this.mapRfidCardFromApi(response.data.data);
      }
      return null;
    } catch (error: unknown) {
      console.error('Error adding RFID card:', error);
      return null;
    }
  }

  async createRfidCard(cardData: Partial<RfidCard>): Promise<RfidCard | null> {
    try {
      const payload = {
        uid: cardData.uid,
        tenant_id: cardData.tenant_id || null,
        card_type: cardData.card_type || 'primary',
        status: cardData.status || 'active'
      };
      
      console.log('📝 Creating RFID card with payload:', payload);
      
      // Try multiple endpoints for card registration
      let response;
      let endpointUsed = '';
      
      try {
        console.log('🔍 Trying primary endpoint: /admin/rfid/cards');
        response = await api.post('/admin/rfid/cards', payload);
        endpointUsed = '/admin/rfid/cards';
      } catch (primaryError: unknown) {
        console.warn('⚠️ Primary endpoint failed:', (primaryError as { response?: { status: number } } & Error).response?.status, primaryError.message);
        
        try {
          console.log('🔍 Trying alternative endpoint: /admin/rfid/register-card');
          response = await api.post('/admin/rfid/register-card', payload);
          endpointUsed = '/admin/rfid/register-card';
        } catch (altError: unknown) {
          console.warn('⚠️ Alternative endpoint failed:', (altError as { response?: { status: number } } & Error).response?.status, altError.message);
          
          try {
            console.log('🔍 Trying fallback endpoint: /admin/rfid/register-card');
            response = await api.post('/admin/rfid/register-card', payload);
            endpointUsed = '/admin/rfid/register-card';
          } catch (fallbackError: unknown) {
            console.error('❌ All endpoints failed for RFID card creation');
            console.error('Primary error:', (primaryError as { response?: { data: unknown } } & Error).response?.data || primaryError.message);
            console.error('Alt error:', (altError as { response?: { data: unknown } } & Error).response?.data || altError.message);
            console.error('Fallback error:', (fallbackError as { response?: { data: { message?: string } } } & Error).response?.data || fallbackError.message);
            throw new Error(`RFID card creation failed. Last error: ${(fallbackError as { response?: { data?: { message?: string } } } & Error).response?.data?.message || fallbackError.message}`);
          }
        }
      }
      
      console.log(`✅ Successfully used endpoint: ${endpointUsed}`);
      console.log('📝 Response data:', response.data);
      
      if (response.data.success) {
        const createdCard = this.mapRfidCardFromApi(response.data.data);
        console.log('✨ Card created successfully:', createdCard);
        
        // Show success notification
        if (typeof window !== 'undefined' && window.alert) {
          alert(`✅ RFID Card registered successfully!\nUID: ${createdCard.uid}\nUser: ${createdCard.user?.name || 'No user assigned'}`);
        }
        
        return createdCard;
      } else {
        console.error('❌ API returned success=false:', response.data);
        const errorMsg = response.data.message || response.data.error || 'Card creation failed';
        throw new Error(errorMsg);
      }
    } catch (error: unknown) {
      console.error('❌ Error creating RFID card:', error);
      throw error; // Re-throw to let the caller handle it
    }
  }

  async updateRfidCard(cardId: string | number, cardData: Partial<RfidCard>): Promise<boolean> {
    try {
      const payload = {
        uid: cardData.uid,
        tenant_id: cardData.tenant_id || null,
        card_type: cardData.card_type || 'primary',
        status: cardData.status || 'active'
      };
      
      console.log('Updating RFID card with payload:', payload);
      
      const response = await api.put(`/admin/rfid/cards/${cardId}`, payload);
      return response.data.success;
    } catch (error: unknown) {
      console.error('Error updating RFID card:', error);
      return false;
    }
  }

  async deleteRfidCard(cardId: string | number): Promise<boolean> {
    try {
      const response = await api.delete(`/admin/rfid/cards/${cardId}`);
      return response.data.success;
    } catch (error: unknown) {
      console.error('Error deleting RFID card:', error);
      return false;
    }
  }

  async processRfidScan(scanData: { uid: string; device_id: string; signal_strength?: number }): Promise<ScanResponseData> {
    try {
      // Check if card exists in database
      const cards = await this.getRfidCards();
      const card = Array.isArray(cards) ? cards.find(c => c.uid === scanData.uid) : null;

      if (!card) {
        // Auto-register unknown card
        const newCard = await this.addRfidCard({
          uid: scanData.uid,
          status: 'inactive'
        });

        // Log access attempt
        await this.logAccessAttempt({
          card_uid: scanData.uid,
          device_id: scanData.device_id,
          access_granted: true,
          reason: 'Auto-registered new card',
          user_name: newCard?.user?.name || 'Unknown'
        });

        return {
          status: 'granted',
          user: newCard?.user?.name || 'Auto User',
          message: `Welcome! Card auto-registered`,
          access_granted: true
        };
      }

      // Validate existing card
      const isValid = card.status === 'active' && 
                     (!card.expires_at || new Date(card.expires_at) > new Date());

      const response = {
        status: isValid ? 'granted' : 'denied',
        user: card.user?.name || 'Unknown',
        message: isValid ? `Welcome, ${card.user?.name}!` : 
                card.status !== 'active' ? `Card is ${card.status}` : 'Card has expired',
        access_granted: isValid
      };

      // Log access attempt
      await this.logAccessAttempt({
        card_uid: scanData.uid,
        device_id: scanData.device_id,
        access_granted: response.access_granted,
        reason: response.message,
        user_name: response.user,
        room_number: card.room?.room_number
      });

      return response;
    } catch (error: unknown) {
      console.error('Error processing RFID scan:', error);
      return {
        status: 'error',
        user: 'System',
        message: 'System error occurred',
        access_granted: false
      } as ScanResponseData;
    }
  }

  // Access Logs
  async getAccessAttempts(limit: number = 20): Promise<AccessAttempt[]> {
    try {
      const response = await api.get('/admin/access-logs', {
        params: { per_page: limit, sort_by: 'accessed_at', sort_order: 'desc' }
      });
      if (response.data.success) {
        const data = response.data.data;
        // Ensure we always return an array
        if (Array.isArray(data)) {
          return (data as AccessApiData[]).map(this.mapAccessLogFromApi);
        }
        return [];
      }
      return [];
    } catch (error: unknown) {
      console.error('Error fetching access attempts:', error);
      console.error('No access attempts available - API endpoint failed');
      return [];
    }
  }

  async logAccessAttempt(attemptData: Partial<AccessAttempt>): Promise<boolean> {
    try {
      const payload = {
        rfid_uid: attemptData.card_uid,
        device_id: attemptData.device_id,
        access_granted: attemptData.access_granted,
        reason: attemptData.reason,
        accessed_at: new Date().toISOString()
      };

      // Try multiple possible endpoints
      let response;
      try {
        console.log('🔍 Trying primary endpoint: /admin/access-logs');
        response = await api.post('/admin/access-logs', payload);
      } catch (primaryError: unknown) {
        console.warn('⚠️ Primary endpoint failed, trying alternatives...');
        
        try {
          console.log('🔍 Trying alternative: /admin/rfid/access-logs');
          response = await api.post('/admin/rfid/access-logs', payload);
        } catch (altError: unknown) {
          try {
            console.log('🔍 Trying alternative: /admin/access-log');
            response = await api.post('/admin/access-log', payload);
          } catch (alt2Error: unknown) {
            console.error('❌ All logging endpoints failed');
            console.error('Primary error:', primaryError);
            console.error('Alt1 error:', altError);
            console.error('Alt2 error:', alt2Error);
            throw primaryError;
          }
        }
      }
      
      return response.data.success || response.data;
    } catch (error: unknown) {
      console.error('Error logging access attempt:', error);
      return false;
    }
  }

  // Door Control Functions (NEW)
  async getDoorDevices(): Promise<ESP32Device[]> {
    try {
      const response = await api.get('/admin/door-control');
      if (response.data.success) {
        const data = response.data.data;
        return Array.isArray(data) ? (data as unknown[]).map(this.mapDeviceFromApi) : [];
      }
      return [];
    } catch (error: unknown) {
      console.error('Error fetching door devices:', error);
      throw error;
    }
  }

  async sendDoorCommand(deviceId: string, command: 'open_door' | 'close_door' | 'ping' | 'restart', reason?: string): Promise<DoorCommandResponse> {
    try {
      console.log(`🚪 Attempting door command: ${command} for device: ${deviceId}`);
      
      // Try the authenticated endpoint first
      try {
        console.log('🔐 Trying authenticated endpoint: /admin/door-control/command');
        const response = await api.post('/admin/door-control/command', {
          device_id: deviceId,
          command,
          reason: reason || `Manual ${command} from admin dashboard`
        });
        console.log('✅ Auth endpoint success:', response.data);
        return response.data;
      } catch (authError: unknown) {
        console.warn('❌ Auth endpoint failed:', (authError as { response?: { status: number } } & Error).response?.status, (authError as Error).message);
        console.log('🔄 Trying test endpoint: /test-door-control-frontend');
        
        // Fallback to test endpoint (no auth required)
        const response = await api.post('/test-door-control-frontend', {
          device_id: deviceId,
          command,
          reason: reason || `Manual ${command} from admin dashboard (test endpoint)`
        });
        console.log('✅ Test endpoint success:', response.data);
        return response.data;
      }
    } catch (error: unknown) {
      console.error('❌ All endpoints failed:', error);
      throw error;
    }
  }

  async openDoor(deviceId: string, reason: string = 'Manual open from admin'): Promise<DoorCommandResponse> {
    return this.sendDoorCommand(deviceId, 'open_door', reason);
  }

  async closeDoor(deviceId: string, reason: string = 'Manual close from admin'): Promise<DoorCommandResponse> {
    return this.sendDoorCommand(deviceId, 'close_door', reason);
  }

  async getDeviceStatus(deviceId: string): Promise<DeviceStatusResponse> {
    try {
      const response = await api.get(`/admin/door-control/device/${deviceId}/status`) as { data: DeviceStatusResponse };
      return response.data;
    } catch (error: unknown) {
      console.error('Error getting device status:', error);
      throw error;
    }
  }

  async getDoorAccessLogs(deviceId?: string, limit: number = 20): Promise<AccessApiData[]> {
    try {
      const params = new URLSearchParams();
      if (deviceId) params.append('device_id', deviceId);
      params.append('limit', limit.toString());

      const response = await api.get(`/admin/door-control/access-logs?${params}`) as { data: ApiResponse<AccessApiData[]> };
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error: unknown) {
      console.error('Error fetching door access logs:', error);
      return [];
    }
  }

  async testMqttConnection(): Promise<MqttTestResponse> {
    try {
      const response = await api.post('/admin/door-control/test-connection') as { data: MqttTestResponse };
      return response.data;
    } catch (error: unknown) {
      console.error('Error testing MQTT connection:', error);
      throw error;
    }
  }

  // ESP32 Command Functions (Legacy MQTT)
  sendRestartCommand(deviceId: string): void {
    const mqttService = (window as { mqttService?: { publish: (topic: string, message: string) => void } }).mqttService;
    if (mqttService) {
      const command = {
        command: 'restart',
        device_id: deviceId,
        timestamp: Date.now(),
        from: 'admin_dashboard'
      };
      mqttService.publish('rfid/command', JSON.stringify(command));
      console.log('🔄 Restart command sent to ESP32:', command);
    }
  }

  sendPingCommand(deviceId: string): void {
    const mqttService = (window as { mqttService?: { publish: (topic: string, message: string) => void } }).mqttService;
    if (mqttService) {
      const command = {
        command: 'ping',
        device_id: deviceId,
        timestamp: Date.now(),
        from: 'admin_dashboard'
      };
      mqttService.publish('rfid/command', JSON.stringify(command));
      console.log('📡 Ping command sent to ESP32:', command);
    }
  }

  sendDoorOpenCommand(deviceId: string): void {
    const mqttService = (window as { mqttService?: { publish: (topic: string, message: string) => void } }).mqttService;
    if (mqttService) {
      const command = {
        command: 'open_door',
        device_id: deviceId,
        timestamp: Date.now(),
        from: 'admin_dashboard',
        reason: 'Manual open from dashboard'
      };
      mqttService.publish('rfid/command', JSON.stringify(command));
      console.log('🔓 Door open command sent to ESP32:', command);
    }
  }

  sendDoorCloseCommand(deviceId: string): void {
    const mqttService = (window as { mqttService?: { publish: (topic: string, message: string) => void } }).mqttService;
    if (mqttService) {
      const command = {
        command: 'close_door',
        device_id: deviceId,
        timestamp: Date.now(),
        from: 'admin_dashboard',
        reason: 'Manual close from dashboard'
      };
      mqttService.publish('rfid/command', JSON.stringify(command));
      console.log('🔒 Door close command sent to ESP32:', command);
    }
  }

  // Config update removed - ESP32 doesn't support complex configuration

  // Helper methods
  private mapDeviceFromApi(apiData: unknown): ESP32Device {
    const data = apiData as {
      id: string;
      device_id: string;
      device_name: string;
      device_type: string;
      room_id?: string;
      status: string;
      last_seen: string;
      device_info: string | DeviceStatusData;
      room?: {
        room_number: string;
        room_name: string;
      };
    };
    
    return {
      id: data.id,
      device_id: data.device_id,
      device_name: data.device_name,
      device_type: data.device_type,
      room_id: data.room_id,
      status: data.status,
      last_seen: data.last_seen,
      device_info: typeof data.device_info === 'string' 
        ? JSON.parse(data.device_info) as DeviceStatusData
        : data.device_info,
      room: data.room
    };
  }

  private mapRfidCardFromApi(apiData: RfidApiData): RfidCard {
    console.log('🔍 Mapping API data:', apiData);
    
    return {
      id: typeof apiData.id === 'string' ? parseInt(apiData.id) : (apiData.id || 0),
      uid: apiData.uid,
      user_id: apiData.user_id ? (typeof apiData.user_id === 'string' ? parseInt(apiData.user_id) : apiData.user_id) : undefined,
      tenant_id: apiData.tenant_id ? (typeof apiData.tenant_id === 'string' ? parseInt(apiData.tenant_id) : apiData.tenant_id) : undefined,
      device_id: apiData.device_id || null,
      card_type: (apiData.card_type || 'primary') as 'primary' | 'backup' | 'temporary',
      status: apiData.status as 'active' | 'inactive',
      created_at: apiData.created_at,
      updated_at: apiData.updated_at,
      
      // Handle user mapping - check multiple possible sources
      user: apiData.user ? {
        id: apiData.user.id || (apiData.user_id ? (typeof apiData.user_id === 'string' ? parseInt(apiData.user_id) : apiData.user_id) : 0),
        name: apiData.user.name || apiData.user_name || '',
        email: apiData.user.email || ''
      } : (apiData.user_name ? {
        id: apiData.user_id ? (typeof apiData.user_id === 'string' ? parseInt(apiData.user_id) : apiData.user_id) : 0,
        name: apiData.user_name,
        email: ''
      } : undefined),
      
      // Handle tenant mapping - check multiple possible sources  
      tenant: apiData.tenant ? {
        id: apiData.tenant.id || (apiData.tenant_id ? (typeof apiData.tenant_id === 'string' ? parseInt(apiData.tenant_id) : apiData.tenant_id) : 0),
        tenant_code: apiData.tenant.tenant_code || apiData.tenant_code || '',
        room: apiData.tenant.room ? {
          id: apiData.tenant.room.id || 0,
          room_number: apiData.tenant.room.room_number || apiData.room_number || '',
          room_name: apiData.tenant.room.room_name || `Room ${apiData.tenant.room.room_number}` || '',
          monthly_price: '0',
          status: 'available' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : undefined
      } : (apiData.tenant_code || apiData.room_number ? {
        id: apiData.tenant_id ? (typeof apiData.tenant_id === 'string' ? parseInt(apiData.tenant_id) : apiData.tenant_id) : 0,
        tenant_code: apiData.tenant_code || '',
        room: apiData.room_number ? {
          id: 0,
          room_number: apiData.room_number,
          room_name: `Room ${apiData.room_number}`,
          monthly_price: '0',
          status: 'available' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : undefined
      } : undefined)
    };
  }

  private mapAccessLogFromApi(apiData: AccessApiData): AccessAttempt {
    return {
      id: apiData.id,
      card_uid: apiData.rfid_uid,
      device_id: apiData.device_id,
      access_granted: apiData.access_granted,
      reason: apiData.reason,
      timestamp: apiData.accessed_at,
      user_name: apiData.user?.name,
      room_number: apiData.room?.room_number
    };
  }

  // All mock data methods removed - API-only approach per user request
  // User explicitly requested: "saya tidak mau data yang ditulis di code saya maunya data otomatis, apa gabisa?"
}

export const esp32Service = new ESP32Service();
export default esp32Service;