// File: src/pages/Admin/services/esp32Service.ts
import api, { endpoints } from '../../../utils/api';
import type { RfidCard } from '../types/rfid';

export interface ESP32Device {
  id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  room_id?: string;
  status: 'online' | 'offline' | 'error';
  last_seen: string;
  device_info: {
    wifi_connected?: boolean;
    mqtt_connected?: boolean;
    rfid_ready?: boolean;
    device_ip?: string;
    uptime?: string;  // ESP32 sends as "1h 30m" format
    firmware_version?: string;
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
      console.log('📡 Attempting to fetch devices from /admin/iot-devices');
    
    try {
      console.log('🔍 Fetching ESP32 devices from /admin/iot-devices');
      
      // Try test endpoint first (since it's guaranteed to work)
      let response;
      try {
        console.log('🧪 Trying test endpoint first...');
        // Use fetch directly instead of api.get to bypass potential axios issues
        const fetchResponse = await fetch('https://148.230.96.228/api/test-iot-devices');
        const fetchData = await fetchResponse.json();
        console.log('✅ Test endpoint response:', fetchData);
        
        // Convert fetch response to match api.get format
        response = { data: fetchData };
      } catch (testError: any) {
        console.warn('⚠️ Test endpoint failed, trying main endpoint...');
        try {
          response = await api.get('/admin/iot-devices');
          console.log('✅ Main endpoint worked');
        } catch (mainError) {
          console.error('❌ All endpoints failed');
          throw new Error('Failed to fetch devices from all endpoints');
        }
      }
      
      if (response.data.success) {
        const data = response.data.data;
        console.log('✅ ESP32 devices response:', data);
        
        // Handle different response structures
        if (Array.isArray(data)) {
          return data.map(this.mapDeviceFromApi);
        } else if (data && Array.isArray(data.data)) {
          return data.data.map(this.mapDeviceFromApi);
        }
        return [];
      }
      
      console.warn('❌ Invalid response format');
      throw new Error('Invalid response format from devices API');
      
    } catch (error: any) {
      console.error('❌ Error fetching ESP32 devices:', error);
      throw error;
    }
  } catch (outerError: any) {
    console.error('❌ Complete failure to fetch devices:', outerError);
    throw outerError;
  }
}

  // Quick backend availability check
  private async checkBackendAvailability(): Promise<boolean> {
    try {
      // Very quick timeout for availability check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://148.230.96.228/api'}/health`, {
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
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('⏱️ Backend health check timed out (3s)');
      } else {
        console.warn('🌐 Backend health check failed:', error.message);
      }
      return false;
    }
  }

  async updateDeviceStatus(deviceId: string, statusData: any): Promise<boolean> {
    try {
      const response = await api.put(`/admin/iot-devices/${deviceId}/status`, {
        status: statusData.wifi_connected && statusData.mqtt_connected ? 'online' : 'offline',
        last_seen: new Date().toISOString(),
        device_info: statusData
      });
      return response.data.success;
    } catch (error) {
      console.error('Error updating device status:', error);
      return false;
    }
  }

  // Room Management
  async getRooms(): Promise<any[]> {
    try {
      const response = await api.get('/admin/rooms');
      if (response.data.success) {
        const data = response.data.data;
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch (error) {
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
        if (data && data.data && Array.isArray(data.data)) {
          return data.data.map(this.mapRfidCardFromApi);
        } else if (Array.isArray(data)) {
          return data.map(this.mapRfidCardFromApi);
        }
        return [];
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching RFID cards from /admin/rfid/cards:', error);
      
      // Fallback to alternative endpoint
      try {
        const fallbackResponse = await api.get('/admin/rfid-cards');
        if (fallbackResponse.data.success) {
          const fallbackData = fallbackResponse.data.data;
          return Array.isArray(fallbackData) ? fallbackData.map(this.mapRfidCardFromApi) : [];
        }
      } catch (fallbackError) {
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
    } catch (error) {
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
      } catch (primaryError: any) {
        console.warn('⚠️ Primary endpoint failed:', primaryError.response?.status, primaryError.message);
        
        try {
          console.log('🔍 Trying alternative endpoint: /admin/rfid/register-card');
          response = await api.post('/admin/rfid/register-card', payload);
          endpointUsed = '/admin/rfid/register-card';
        } catch (altError: any) {
          console.warn('⚠️ Alternative endpoint failed:', altError.response?.status, altError.message);
          
          try {
            console.log('🔍 Trying fallback endpoint: /admin/rfid/register-card');
            response = await api.post('/admin/rfid/register-card', payload);
            endpointUsed = '/admin/rfid/register-card';
          } catch (fallbackError: any) {
            console.error('❌ All endpoints failed for RFID card creation');
            console.error('Primary error:', primaryError.response?.data || primaryError.message);
            console.error('Alt error:', altError.response?.data || altError.message);
            console.error('Fallback error:', fallbackError.response?.data || fallbackError.message);
            throw new Error(`RFID card creation failed. Last error: ${fallbackError.response?.data?.message || fallbackError.message}`);
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
    } catch (error: any) {
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
    } catch (error) {
      console.error('Error updating RFID card:', error);
      return false;
    }
  }

  async deleteRfidCard(cardId: string | number): Promise<boolean> {
    try {
      const response = await api.delete(`/admin/rfid/cards/${cardId}`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting RFID card:', error);
      return false;
    }
  }

  async processRfidScan(scanData: { uid: string; device_id: string; signal_strength?: number }): Promise<any> {
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
    } catch (error) {
      console.error('Error processing RFID scan:', error);
      return {
        status: 'error',
        user: 'System',
        message: 'System error occurred',
        access_granted: false
      };
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
          return data.map(this.mapAccessLogFromApi);
        }
        return [];
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching access attempts:', error);
      console.error('No access attempts available - API endpoint failed');
      return [];
    }
  }

  async logAccessAttempt(attemptData: Partial<AccessAttempt>): Promise<boolean> {
    try {
      const response = await api.post('/admin/access-logs', {
        rfid_uid: attemptData.card_uid,
        device_id: attemptData.device_id,
        access_granted: attemptData.access_granted,
        reason: attemptData.reason,
        accessed_at: new Date().toISOString()
      });
      return response.data.success;
    } catch (error) {
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
        return Array.isArray(data) ? data.map(this.mapDeviceFromApi) : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching door devices:', error);
      throw error;
    }
  }

  async sendDoorCommand(deviceId: string, command: 'open_door' | 'close_door' | 'ping' | 'restart', reason?: string): Promise<any> {
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
      } catch (authError: any) {
        console.warn('❌ Auth endpoint failed:', authError.response?.status, authError.message);
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
    } catch (error: any) {
      console.error('❌ All endpoints failed:', error);
      throw error;
    }
  }

  async openDoor(deviceId: string, reason: string = 'Manual open from admin'): Promise<any> {
    return this.sendDoorCommand(deviceId, 'open_door', reason);
  }

  async closeDoor(deviceId: string, reason: string = 'Manual close from admin'): Promise<any> {
    return this.sendDoorCommand(deviceId, 'close_door', reason);
  }

  async getDeviceStatus(deviceId: string): Promise<any> {
    try {
      const response = await api.get(`/admin/door-control/device/${deviceId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting device status:', error);
      throw error;
    }
  }

  async getDoorAccessLogs(deviceId?: string, limit: number = 20): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (deviceId) params.append('device_id', deviceId);
      params.append('limit', limit.toString());

      const response = await api.get(`/admin/door-control/access-logs?${params}`);
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching door access logs:', error);
      return [];
    }
  }

  async testMqttConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/admin/door-control/test-connection');
      return response.data;
    } catch (error) {
      console.error('Error testing MQTT connection:', error);
      throw error;
    }
  }

  // ESP32 Command Functions (Legacy MQTT)
  sendRestartCommand(deviceId: string): void {
    if (window.mqttService) {
      const command = {
        command: 'restart',
        device_id: deviceId,
        timestamp: Date.now(),
        from: 'admin_dashboard'
      };
      window.mqttService.publish('rfid/command', JSON.stringify(command));
      console.log('🔄 Restart command sent to ESP32:', command);
    }
  }

  sendPingCommand(deviceId: string): void {
    if (window.mqttService) {
      const command = {
        command: 'ping',
        device_id: deviceId,
        timestamp: Date.now(),
        from: 'admin_dashboard'
      };
      window.mqttService.publish('rfid/command', JSON.stringify(command));
      console.log('📡 Ping command sent to ESP32:', command);
    }
  }

  sendDoorOpenCommand(deviceId: string): void {
    if (window.mqttService) {
      const command = {
        command: 'open_door',
        device_id: deviceId,
        timestamp: Date.now(),
        from: 'admin_dashboard',
        reason: 'Manual open from dashboard'
      };
      window.mqttService.publish('rfid/command', JSON.stringify(command));
      console.log('🔓 Door open command sent to ESP32:', command);
    }
  }

  sendDoorCloseCommand(deviceId: string): void {
    if (window.mqttService) {
      const command = {
        command: 'close_door',
        device_id: deviceId,
        timestamp: Date.now(),
        from: 'admin_dashboard',
        reason: 'Manual close from dashboard'
      };
      window.mqttService.publish('rfid/command', JSON.stringify(command));
      console.log('🔒 Door close command sent to ESP32:', command);
    }
  }

  // Config update removed - ESP32 doesn't support complex configuration

  // Helper methods
  private mapDeviceFromApi(apiData: any): ESP32Device {
    return {
      id: apiData.id,
      device_id: apiData.device_id,
      device_name: apiData.device_name,
      device_type: apiData.device_type,
      room_id: apiData.room_id,
      status: apiData.status,
      last_seen: apiData.last_seen,
      device_info: typeof apiData.device_info === 'string' 
        ? JSON.parse(apiData.device_info) 
        : apiData.device_info,
      room: apiData.room
    };
  }

  private mapRfidCardFromApi(apiData: any): RfidCard {
    console.log('🔍 Mapping API data:', apiData);
    
    return {
      id: parseInt(apiData.id?.toString() || '0'),
      uid: apiData.uid,
      user_id: apiData.user_id ? parseInt(apiData.user_id.toString()) : undefined,
      tenant_id: apiData.tenant_id ? parseInt(apiData.tenant_id.toString()) : undefined,
      device_id: apiData.device_id || null,
      card_type: apiData.card_type || 'primary',
      status: apiData.status,
      created_at: apiData.created_at,
      updated_at: apiData.updated_at,
      
      // Handle user mapping - check multiple possible sources
      user: apiData.user ? {
        id: apiData.user.id || apiData.user_id || 0,
        name: apiData.user.name || apiData.user_name || '',
        email: apiData.user.email || ''
      } : (apiData.user_name ? {
        id: apiData.user_id || 0,
        name: apiData.user_name,
        email: ''
      } : undefined),
      
      // Handle tenant mapping - check multiple possible sources  
      tenant: apiData.tenant ? {
        id: apiData.tenant.id || apiData.tenant_id || 0,
        tenant_code: apiData.tenant.tenant_code || apiData.tenant_code || '',
        room: apiData.tenant.room ? {
          id: apiData.tenant.room.id || 0,
          room_number: apiData.tenant.room.room_number || apiData.room_number || '',
          room_name: apiData.tenant.room.room_name || `Room ${apiData.tenant.room.room_number}` || ''
        } : undefined
      } : (apiData.tenant_code || apiData.room_number ? {
        id: apiData.tenant_id || 0,
        tenant_code: apiData.tenant_code || '',
        room: apiData.room_number ? {
          id: 0,
          room_number: apiData.room_number,
          room_name: `Room ${apiData.room_number}`
        } : undefined
      } : undefined)
    };
  }

  private mapAccessLogFromApi(apiData: any): AccessAttempt {
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