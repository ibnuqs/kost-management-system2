// File: src/pages/Admin/services/rfidService.ts
import api from '../../../utils/api';
import { esp32Service } from './esp32Service'; // Use ESP32Service for RFID cards
import type { RfidCard, AdminUser as User, Room } from '../types';

class RfidService {
  // Quick backend availability check (shared logic)
  private async checkBackendAvailability(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://148.230.96.228:8000/api'}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Backend is available for RFID service');
        return true;
      } else {
        console.warn('⚠️ Backend returned non-OK status:', response.status);
        return false;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('⏱️ Backend health check timed out (3s) for RFID service');
      } else {
        console.warn('🌐 Backend health check failed for RFID service:', error.message);
      }
      return false;
    }
  }

  async getAllData(): Promise<{
    cards: RfidCard[];
    users: User[];
    rooms: Room[];
  }> {
    // Check if backend is available first
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      console.warn('🚧 Backend not available - using mock RFID data for development');
      return this.getMockRfidData();
    }

    try {
      console.log('🔍 Fetching RFID data from backend');

      // Load RFID cards using ESP32Service (which already has fallback logic)
      const cards = await esp32Service.getRfidCards();

      // Load users with multiple endpoints fallback
      let users: User[] = [];
      const userEndpoints = ['/admin/tenants', '/admin/users', '/users', '/tenants'];
      
      for (const endpoint of userEndpoints) {
        try {
          const usersResponse = await api.get(endpoint);
          let usersData = usersResponse.data.data || usersResponse.data;
          
          if (Array.isArray(usersData.data)) {
            usersData = usersData.data;
          }
          
          users = Array.isArray(usersData) ? usersData.map((u: any) => ({
            id: u.user_id || u.id,
            name: u.name || u.user_name || u.full_name || `User ${u.id}`,
            email: u.email || u.user_email || ''
          })) : [];
          
          if (users.length > 0) break;
        } catch (error) {
          continue;
        }
      }

      // Load rooms using ESP32Service (which already has fallback logic)
      const roomsData = await esp32Service.getRooms();
      const rooms: Room[] = roomsData.map((room: any) => ({
        id: room.id,
        room_number: room.room_number,
        room_name: room.room_name || `Room ${room.room_number}`,
        room_type: room.room_type || 'standard',
        status: room.status || 'available'
      }));

      // If we couldn't load users, use mock data
      if (users.length === 0) {
        console.warn('🔧 Using mock users data due to API errors');
        users = this.getMockUsers();
      }

      console.log('✅ RFID data loaded successfully', {
        cards: cards.length,
        users: users.length,
        rooms: rooms.length
      });

      return { cards, users, rooms };

    } catch (error: any) {
      console.error('❌ Error loading RFID data:', error);
      console.warn('🔧 Using mock RFID data due to backend issues');
      return this.getMockRfidData();
    }
  }

  // Mock data for development
  private getMockRfidData(): Promise<{
    cards: RfidCard[];
    users: User[];
    rooms: Room[];
  }> {
    console.warn('🔍 Using mock RFID data - check API endpoints');
    console.warn('🚀 Backend may not be running. Start with: cd kost-backend && php artisan serve');

    const mockCards: RfidCard[] = [
      {
        id: 1,
        uid: 'CARD001',
        user_id: 1,
        room_id: 1,
        status: 'active',
        access_type: 'room_only',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        },
        room: {
          id: 1,
          room_number: '101',
          room_name: 'Room 101'
        }
      },
      {
        id: 2,
        uid: 'CARD002',
        user_id: 2,
        room_id: 2,
        status: 'active',
        access_type: 'room_only',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com'
        },
        room: {
          id: 2,
          room_number: '102',
          room_name: 'Room 102'
        }
      },
      {
        id: 3,
        uid: 'CARD003',
        user_id: undefined,
        room_id: undefined,
        status: 'inactive',
        access_type: 'room_only',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: undefined,
        room: undefined
      }
    ];

    return Promise.resolve({
      cards: mockCards,
      users: this.getMockUsers(),
      rooms: this.getMockRooms()
    });
  }

  private getMockUsers(): User[] {
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Bob Wilson', email: 'bob@example.com' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com' }
    ];
  }

  private getMockRooms(): Room[] {
    return [
      { id: 1, room_number: '101', room_name: 'Room 101', room_type: 'standard', status: 'occupied' },
      { id: 2, room_number: '102', room_name: 'Room 102', room_type: 'standard', status: 'available' },
      { id: 3, room_number: '201', room_name: 'Room 201', room_type: 'premium', status: 'available' },
      { id: 4, room_number: '202', room_name: 'Room 202', room_type: 'premium', status: 'maintenance' }
    ];
  }

  async registerCard(uid: string): Promise<RfidCard> {
    // Check if backend is available first
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      console.warn('🚧 Backend not available - cannot register card in development mode');
      throw new Error('Backend is not available. Card registration requires a running backend server.');
    }

    try {
      // Try ESP32Service first (which has fallback logic)
      const card = await esp32Service.addRfidCard({ uid: uid.trim(), status: 'active' });
      if (card) {
        return card;
      }

      // Fallback to direct API call
      const response = await api.post('/rfid/register-card', { uid: uid.trim() });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to register card');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error registering card:', error);
      throw error;
    }
  }

  async assignCard(cardId: number, assignment: { user_id?: number; room_id?: number }): Promise<void> {
    // Check if backend is available first
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      console.warn('🚧 Backend not available - cannot assign card in development mode');
      throw new Error('Backend is not available. Card assignment requires a running backend server.');
    }

    try {
      // Try ESP32Service first (which has fallback logic)
      const success = await esp32Service.updateRfidCard(cardId, {
        user_id: assignment.user_id,
        room_id: assignment.room_id,
        uid: '', // Will be preserved by update
        status: 'active'
      });

      if (!success) {
        // Fallback to direct API call
        const response = await api.put(`/admin/rfid/cards/${cardId}/assign`, assignment);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to assign card');
        }
      }
    } catch (error: any) {
      console.error('Error assigning card:', error);
      throw error;
    }
  }

  async toggleStatus(cardId: number): Promise<void> {
    // Check if backend is available first
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      console.warn('🚧 Backend not available - cannot toggle card status in development mode');
      throw new Error('Backend is not available. Status updates require a running backend server.');
    }

    try {
      const response = await api.put(`/admin/rfid/cards/${cardId}/toggle`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to toggle card status');
      }
    } catch (error: any) {
      console.error('Error toggling card status:', error);
      throw error;
    }
  }

  async deleteCard(cardId: number): Promise<void> {
    // Check if backend is available first
    const isBackendAvailable = await this.checkBackendAvailability();
    
    if (!isBackendAvailable) {
      console.warn('🚧 Backend not available - cannot delete card in development mode');
      throw new Error('Backend is not available. Card deletion requires a running backend server.');
    }

    try {
      // Try ESP32Service first (which has fallback logic)
      const success = await esp32Service.deleteRfidCard(cardId);
      
      if (!success) {
        // Fallback to direct API call
        const response = await api.delete(`/admin/rfid/cards/${cardId}`);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to delete card');
        }
      }
    } catch (error: any) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }
}

// Export singleton instance to maintain compatibility
export const rfidService = new RfidService();
