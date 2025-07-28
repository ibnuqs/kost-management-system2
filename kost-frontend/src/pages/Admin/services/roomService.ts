// File: src/pages/Admin/services/roomService.ts
import api from '../../../utils/api';
import type { Room, RoomFormData, RoomStats, RoomFilters, TenantAssignmentData, ArchiveRoomData } from '../types/room';
import type { PaginationData } from '../types/common';

interface RoomsResponse {
  success: boolean;
  data: Room[];  // ✅ FIXED: Direct array, not nested in data.data
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    status: string;
    search: string;
    sort_by: string;
    sort_order: string;
  };
  message?: string;
}

interface RoomResponse {
  success: boolean;
  data: Room;
  message?: string;
}

export const roomService = {
  /**
   * Get rooms with optional filters
   */
  async getRooms(filters?: RoomFilters): Promise<{
    rooms: Room[];
    stats: RoomStats;
    pagination: PaginationData;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      // Always include archived rooms to handle filtering on frontend
      params.append('include_archived', 'true');

      // Default to 100 per page if not specified
      if (!filters?.per_page) {
        params.append('per_page', '100');
      }

      console.log('🏠 ROOM MANAGEMENT: Fetching rooms with params:', params.toString());
      const response = await api.get(`/admin/rooms?${params}`);
      console.log('🏠 ROOM MANAGEMENT: Response received:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch rooms');
      }

      // ✅ FIXED: Correct parsing based on your backend response structure
      const responseData = response.data;  // This is the whole response
      
      // 🔍 DEBUG: Log detailed room information
      console.log('=== ROOM DEBUG INFO ===');
      console.log('Raw response:', responseData);
      console.log('Total rooms received:', responseData.data?.length || 0);
      console.log('Room IDs:', responseData.data?.map((room: any) => room.id) || []);
      console.log('Room ID 8 exists:', responseData.data?.some((room: any) => room.id === 8));
      console.log('Room ID 8 data:', responseData.data?.find((room: any) => room.id === 8));
      console.log('All rooms summary:', responseData.data?.map((room: any) => ({
        id: room.id,
        room_number: room.room_number,
        room_name: room.room_name,
        status: room.status
      })) || []);
      console.log('Pagination info:', responseData.pagination);
      console.log('========================');
      
      // ✅ FIXED: Transform backend data to match frontend expectations
      const rooms = responseData.data?.map((room: any) => ({
        ...room,
        // Transform tenant data to match frontend structure
        tenant: room.tenant ? {
          ...room.tenant,
          user: {
            id: room.tenant.id,
            name: room.tenant.user_name || 'Unknown User',
            email: room.tenant.user_email || '',
          }
        } : null
      })) || [];
      
      const activeRooms = rooms.filter((r: Room) => !r.is_archived);
      const archivedRooms = rooms.filter((r: Room) => r.is_archived);
      
      // Fetch actual stats from backend instead of calculating locally
      let stats: RoomStats;
      try {
        const statsResponse = await api.get('/admin/rooms/stats');
        if (statsResponse.data.success) {
          stats = statsResponse.data.data;
        } else {
          throw new Error('Failed to fetch stats from backend');
        }
      } catch (statsError) {
        console.warn('Failed to fetch backend stats, falling back to calculated stats:', statsError);
        // Fallback to calculated stats if backend fails
        stats = {
          total_rooms: rooms.length,
          active_rooms: activeRooms.length,
          available_rooms: activeRooms.filter((r: Room) => r.status === 'available').length,
          occupied_rooms: activeRooms.filter((r: Room) => r.status === 'occupied').length,
          maintenance_rooms: activeRooms.filter((r: Room) => r.status === 'maintenance').length,
          reserved_rooms: activeRooms.filter((r: Room) => r.status === 'reserved').length,
          archived_rooms: archivedRooms.length,
          occupancy_rate: activeRooms.length > 0 ? 
            (activeRooms.filter((r: Room) => r.status === 'occupied').length / activeRooms.length) * 100 : 0,
          average_monthly_price: activeRooms.length > 0 ?
            activeRooms.reduce((sum, r) => sum + parseFloat(r.monthly_price), 0) / activeRooms.length : 0,
          total_revenue: 0, // Will be 0 if backend fails
          price_range: {
            min: activeRooms.length > 0 ? Math.min(...activeRooms.map(r => parseFloat(r.monthly_price))) : 0,
            max: activeRooms.length > 0 ? Math.max(...activeRooms.map(r => parseFloat(r.monthly_price))) : 0
          }
        };
      }
      
      return {
        rooms: rooms,
        stats: stats,
        pagination: {
          current_page: responseData.pagination?.current_page || 1,
          last_page: responseData.pagination?.last_page || 1,
          per_page: responseData.pagination?.per_page || 100,
          total: responseData.pagination?.total || rooms.length
        }
      };
    } catch (error: any) {
      console.error('Failed to fetch rooms:', error);
      
      // More specific error handling
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to access rooms data.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error occurred. Please try again later.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch rooms');
    }
  },

  /**
   * Create a new room
   */
  async createRoom(data: RoomFormData): Promise<Room> {
    try {
      // Convert monthly_price to number to match backend validation
      const payload = {
        room_number: data.room_number.trim().toUpperCase(),
        room_name: data.room_name.trim(),
        monthly_price: parseFloat(data.monthly_price),
        status: data.status || 'available'
      };

      console.log('Creating room with payload:', payload);
      
      // Validate payload before sending
      if (!payload.room_number) {
        throw new Error('Room number is required');
      }
      if (!payload.room_name) {
        throw new Error('Room name is required');
      }
      if (isNaN(payload.monthly_price) || payload.monthly_price <= 0) {
        throw new Error('Valid monthly price is required');
      }

      const response = await api.post('/admin/rooms', payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create room');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create room:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat();
          throw new Error(errorMessages.join(', '));
        }
      }
      
      // Handle specific business logic errors
      if (error.response?.status === 409) {
        throw new Error('Room number already exists. Please choose a different room number.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to create room');
    }
  },

  /**
   * Update an existing room
   */
  async updateRoom(id: number, data: RoomFormData): Promise<Room> {
    try {
      const payload = {
        room_number: data.room_number.trim().toUpperCase(),
        room_name: data.room_name.trim(),
        monthly_price: parseFloat(data.monthly_price),
        status: data.status
      };

      console.log('Updating room with payload:', payload);

      // Validate payload before sending
      if (!payload.room_number) {
        throw new Error('Room number is required');
      }
      if (!payload.room_name) {
        throw new Error('Room name is required');
      }
      if (isNaN(payload.monthly_price) || payload.monthly_price <= 0) {
        throw new Error('Valid monthly price is required');
      }

      const response = await api.put(`/admin/rooms/${id}`, payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update room');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to update room:', error);
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat();
          throw new Error(errorMessages.join(', '));
        }
      }
      
      if (error.response?.status === 404) {
        throw new Error('Room not found. It may have been deleted.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to update room');
    }
  },

  /**
   * Delete a room
   */
  async deleteRoom(id: number): Promise<void> {
    try {
      console.log('Deleting room with ID:', id);
      
      const response = await api.delete(`/admin/rooms/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete room');
      }
      
      console.log('Room deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 404) {
        throw new Error('Room not found. The room may have already been deleted.');
      } else if (error.response?.status === 422) {
        const errorData = error.response?.data;
        const errorType = errorData?.error_type;
        
        if (errorType === 'active_tenants') {
          throw new Error('Cannot delete room with active tenants. Please remove the tenant first.');
        } else if (errorType === 'has_history') {
          const suggestions = errorData.suggestions?.join(', ') || '';
          throw new Error(`Room has historical data. ${suggestions}`);
        } else if (errorType === 'constraint_violation') {
          throw new Error('Cannot delete room due to database constraints. Please remove all related data first.');
        } else {
          const message = errorData?.message || 'Cannot delete room. Please check for related data.';
          throw new Error(message);
        }
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this room.');
      } else if (error.response?.status === 500) {
        const errorData = error.response?.data;
        const errorType = errorData?.error_type;
        
        if (errorType === 'database_error') {
          throw new Error('Database error occurred. Please try again or contact support.');
        } else {
          const message = errorData?.message || 'Server error occurred while deleting room.';
          throw new Error(message);
        }
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete room');
    }
  },

  /**
   * Assign tenant to room
   */
  async assignTenant(roomId: number, data: TenantAssignmentData): Promise<Room> {
    try {
      const payload = {
        user_id: parseInt(data.user_id),
        monthly_rent: parseFloat(data.monthly_rent),
        start_date: data.start_date
      };

      console.log('Assigning tenant with payload:', payload);
      
      // Validate payload before sending
      if (isNaN(payload.user_id) || payload.user_id <= 0) {
        throw new Error('Valid user selection is required');
      }
      if (isNaN(payload.monthly_rent) || payload.monthly_rent <= 0) {
        throw new Error('Valid monthly rent is required');
      }
      if (!payload.start_date) {
        throw new Error('Start date is required');
      }

      const response = await api.post(`/admin/rooms/${roomId}/assign-tenant`, payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to assign tenant');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to assign tenant:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat();
          throw new Error(errorMessages.join(', '));
        }
      }

      if (error.response?.status === 400) {
        const message = error.response.data.message;
        if (message?.includes('already an active tenant')) {
          throw new Error('This user is already a tenant in another room.');
        } else if (message?.includes('not available')) {
          throw new Error('This room is not available for assignment.');
        }
        throw new Error(message || 'Cannot assign tenant to this room');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to assign tenant');
    }
  },

  /**
   * Remove tenant from room
   */
  async removeTenant(roomId: number): Promise<Room> {
    try {
      console.log('Removing tenant from room:', roomId);
      
      const response = await api.delete(`/admin/rooms/${roomId}/remove-tenant`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove tenant');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to remove tenant:', error);
      
      if (error.response?.status === 400) {
        const message = error.response.data.message;
        if (message?.includes('No active tenant')) {
          throw new Error('No active tenant found in this room.');
        }
        throw new Error(message || 'Cannot remove tenant from this room');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to remove tenant');
    }
  },

  /**
   * Get available tenants for room assignment
   */
  async getAvailableTenants(): Promise<any[]> {
    try {
      // Fetch users who are not currently tenants
      const response = await api.get('/admin/tenants/available');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch available tenants');
      }
      
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch available tenants:', error);
      // Return empty array if API fails
      return [];
    }
  },

  /**
   * Get available rooms only
   */
  async getAvailableRooms(): Promise<Room[]> {
    try {
      const response = await this.getRooms({ status: 'available', per_page: 100 });
      return response.rooms;
    } catch (error) {
      console.error('Failed to fetch available rooms:', error);
      return [];
    }
  },

  /**
   * Get room by ID
   */
  async getRoom(id: number): Promise<Room> {
    try {
      console.log('Fetching room with ID:', id);
      const response = await api.get(`/admin/rooms/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch room');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch room:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Room not found');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch room');
    }
  },

  /**
   * Get room statistics
   */
  async getStats(): Promise<RoomStats> {
    try {
      // Try to get stats from rooms index endpoint first (more accurate)
      const roomsResponse = await this.getRooms({ per_page: 1 });
      return roomsResponse.stats;
    } catch (error: any) {
      console.error('Failed to fetch room stats:', error);
      
      // Return default stats if everything fails
      return {
        total_rooms: 0,
        active_rooms: 0,
        available_rooms: 0,
        occupied_rooms: 0,
        maintenance_rooms: 0,
        archived_rooms: 0,
        occupancy_rate: 0,
        average_monthly_price: 0,
        price_range: { min: 0, max: 0 }
      };
    }
  },

  /**
   * Archive a room
   */
  async archiveRoom(id: number, data?: ArchiveRoomData): Promise<Room> {
    try {
      console.log('Archiving room with ID:', id, 'reason:', data?.reason);
      
      const response = await api.post(`/admin/rooms/${id}/archive`, data || {});
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal mengarsipkan kamar');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to archive room:', error);
      
      if (error.response?.status === 422) {
        const errorType = error.response.data.error_type;
        if (errorType === 'active_tenants') {
          throw new Error('Tidak dapat mengarsipkan kamar yang masih ditempati. Silakan pindahkan penyewa terlebih dahulu.');
        }
      }
      
      if (error.response?.status === 404) {
        throw new Error('Kamar tidak ditemukan.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Gagal mengarsipkan kamar');
    }
  },

  /**
   * Unarchive a room
   */
  async unarchiveRoom(id: number): Promise<Room> {
    try {
      console.log('Unarchiving room with ID:', id);
      
      const response = await api.post(`/admin/rooms/${id}/unarchive`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal memulihkan kamar dari arsip');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to unarchive room:', error);
      
      if (error.response?.status === 422) {
        const errorType = error.response.data.error_type;
        if (errorType === 'not_archived') {
          throw new Error('Kamar tidak dalam status arsip.');
        }
      }
      
      if (error.response?.status === 404) {
        throw new Error('Kamar tidak ditemukan.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Gagal memulihkan kamar dari arsip');
    }
  },

  /**
   * Get archived rooms
   */
  async getArchivedRooms(filters?: Partial<RoomFilters>): Promise<{
    rooms: Room[];
    pagination: PaginationData;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      // Default to 50 per page if not specified
      if (!filters?.per_page) {
        params.append('per_page', '50');
      }

      console.log('Fetching archived rooms with params:', params.toString());
      const response = await api.get(`/admin/rooms/archived?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal mengambil data kamar arsip');
      }

      const responseData = response.data;
      const rooms = responseData.data || [];
      
      return {
        rooms: rooms,
        pagination: {
          current_page: responseData.pagination?.current_page || 1,
          last_page: responseData.pagination?.last_page || 1,
          per_page: responseData.pagination?.per_page || 50,
          total: responseData.pagination?.total || rooms.length
        }
      };
    } catch (error: any) {
      console.error('Failed to fetch archived rooms:', error);
      throw new Error(error.response?.data?.message || error.message || 'Gagal mengambil data kamar arsip');
    }
  }
};