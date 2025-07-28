// File: src/pages/Admin/hooks/useRooms.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { roomService } from '../services';
import type { Room, RoomStats, RoomFormData, RoomFilters, TenantAssignmentData, ArchiveRoomData } from '../types';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    status: 'all',
    per_page: 100
  });

  const loadRooms = useCallback(async (customFilters?: RoomFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = customFilters || filters;
      console.log('Loading rooms with filters:', filtersToUse);
      
      // Use the correct structure from your roomService
      const data = await roomService.getRooms(filtersToUse);
      
      console.log('Rooms loaded:', data);
      
      setRooms(data.rooms); // Your roomService returns { rooms, stats, pagination }
      setStats(data.stats);
    } catch (err: any) {
      console.error('Failed to load rooms:', err);
      setError(err.message);
      toast.error('Gagal memuat data kamar: ' + err.message);
      
      // Reset data on error
      setRooms([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createRoom = useCallback(async (data: RoomFormData) => {
    try {
      console.log('Creating room with data:', data);
      await roomService.createRoom(data);
      toast.success('Kamar berhasil dibuat');
      await loadRooms();
    } catch (err: any) {
      console.error('Failed to create room:', err);
      toast.error(err.message || 'Gagal membuat kamar');
      throw err;
    }
  }, [loadRooms]);

  const updateRoom = useCallback(async (id: number, data: RoomFormData) => {
    try {
      console.log('Updating room:', id, data);
      
      // Check if room exists in current state
      const roomExists = rooms.find(room => room.id === id);
      if (!roomExists) {
        toast.error('Kamar tidak ditemukan. Mungkin sudah dihapus.');
        await loadRooms(); // Refresh to sync state
        throw new Error('Room not found');
      }
      
      await roomService.updateRoom(id, data);
      toast.success('Kamar berhasil diperbarui');
      await loadRooms();
    } catch (err: any) {
      console.error('Failed to update room:', err);
      
      // If room not found, refresh the rooms list
      if (err.message.includes('not found') || err.message.includes('404')) {
        console.log('Room not found, refreshing rooms list');
        await loadRooms();
      }
      
      toast.error(err.message || 'Gagal memperbarui kamar');
      throw err;
    }
  }, [loadRooms, rooms]);

  const deleteRoom = useCallback(async (id: number) => {
    try {
      console.log('Deleting room:', id);
      
      // Check if room exists in current state
      const roomExists = rooms.find(room => room.id === id);
      if (!roomExists) {
        toast.success('Kamar sudah dihapus');
        await loadRooms(); // Refresh to sync state
        return;
      }
      
      await roomService.deleteRoom(id);
      toast.success('Kamar berhasil dihapus');
      await loadRooms();
    } catch (err: any) {
      console.error('Failed to delete room:', err);
      
      // If room not found, it's already deleted - refresh the list
      if (err.message.includes('not found') || err.message.includes('404') || err.message.includes('already been deleted')) {
        console.log('Room already deleted, refreshing rooms list');
        toast.success('Room was already deleted');
        await loadRooms();
        return;
      }
      
      // Handle business logic errors with specific messages
      if (err.message.includes('active tenants')) {
        toast.error('Cannot delete room with active tenants. Please remove the tenant first.');
      } else if (err.message.includes('historical data')) {
        toast.error('Room has historical data. Consider archiving instead of deleting.');
      } else if (err.message.includes('IoT devices')) {
        toast.error('Cannot delete room with assigned IoT devices. Please unassign devices first.');
      } else {
        toast.error(err.message || 'Failed to delete room');
      }
      
      throw err;
    }
  }, [loadRooms, rooms]);

  const assignTenant = useCallback(async (roomId: number, tenantData: TenantAssignmentData) => {
    try {
      console.log('Assigning tenant to room:', roomId, tenantData);
      
      // Check if room exists in current state
      const roomExists = rooms.find(room => room.id === roomId);
      if (!roomExists) {
        toast.error('Kamar tidak ditemukan. Mungkin sudah dihapus.');
        await loadRooms(); // Refresh to sync state
        throw new Error('Room not found');
      }
      
      await roomService.assignTenant(roomId, tenantData);
      toast.success('Tenant assigned successfully');
      await loadRooms();
    } catch (err: any) {
      console.error('Failed to assign tenant:', err);
      
      // If room not found, refresh the rooms list
      if (err.message.includes('not found') || err.message.includes('404')) {
        console.log('Room not found, refreshing rooms list');
        await loadRooms();
      }
      
      // Handle specific business logic errors
      if (err.message.includes('already a tenant')) {
        toast.error('This user is already a tenant in another room.');
      } else if (err.message.includes('not available')) {
        toast.error('This room is not available for assignment.');
      } else {
        toast.error(err.message || 'Failed to assign tenant');
      }
      
      throw err;
    }
  }, [loadRooms, rooms]);

  const removeTenant = useCallback(async (roomId: number) => {
    try {
      console.log('Removing tenant from room:', roomId);
      
      // Check if room exists in current state
      const roomExists = rooms.find(room => room.id === roomId);
      if (!roomExists) {
        toast.error('Kamar tidak ditemukan. Mungkin sudah dihapus.');
        await loadRooms(); // Refresh to sync state
        throw new Error('Room not found');
      }
      
      // Check if room has a tenant
      if (!roomExists.tenant) {
        toast.error('No active tenant found in this room.');
        return;
      }
      
      await roomService.removeTenant(roomId);
      toast.success('Tenant removed successfully');
      await loadRooms();
    } catch (err: any) {
      console.error('Failed to remove tenant:', err);
      
      // If room not found, refresh the rooms list
      if (err.message.includes('not found') || err.message.includes('404')) {
        console.log('Room not found, refreshing rooms list');
        await loadRooms();
      }
      
      // Handle specific business logic errors
      if (err.message.includes('No active tenant')) {
        toast.error('No active tenant found in this room.');
      } else {
        toast.error(err.message || 'Failed to remove tenant');
      }
      
      throw err;
    }
  }, [loadRooms, rooms]);

  // Update filters and reload
  const updateFilters = useCallback(async (newFilters: Partial<RoomFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    await loadRooms(updatedFilters);
  }, [filters, loadRooms]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    console.log('Manual refresh triggered');
    await loadRooms();
  }, [loadRooms]);

  // Check if specific room exists
  const checkRoomExists = useCallback((id: number): boolean => {
    return rooms.some(room => room.id === id);
  }, [rooms]);

  // Get specific room by ID
  const getRoomById = useCallback((id: number): Room | undefined => {
    return rooms.find(room => room.id === id);
  }, [rooms]);

  // Get available rooms only
  const getAvailableRooms = useCallback((): Room[] => {
    return rooms.filter(room => room.status === 'available');
  }, [rooms]);

  // Get rooms by status
  const getRoomsByStatus = useCallback((status: string): Room[] => {
    if (status === 'all') return rooms;
    return rooms.filter(room => room.status === status);
  }, [rooms]);

  // Archive room function
  const archiveRoom = useCallback(async (id: number, data?: ArchiveRoomData) => {
    try {
      console.log('Archiving room:', id, data);
      
      // Check if room exists in current state
      const roomExists = rooms.find(room => room.id === id);
      if (!roomExists) {
        toast.error('Kamar tidak ditemukan. Mungkin sudah dihapus.');
        await loadRooms(); // Refresh to sync state
        throw new Error('Room not found');
      }
      
      // Check if room can be archived
      if (!roomExists.can_be_archived) {
        toast.error('Kamar tidak dapat diarsipkan. Pastikan tidak ada penyewa aktif.');
        return;
      }
      
      await roomService.archiveRoom(id, data);
      toast.success('Kamar berhasil diarsipkan');
      await loadRooms();
    } catch (err: any) {
      console.error('Failed to archive room:', err);
      
      // If room not found, refresh the rooms list
      if (err.message.includes('not found') || err.message.includes('404')) {
        console.log('Room not found, refreshing rooms list');
        await loadRooms();
      }
      
      toast.error(err.message || 'Gagal mengarsipkan kamar');
      throw err;
    }
  }, [loadRooms, rooms]);

  // Unarchive room function
  const unarchiveRoom = useCallback(async (id: number) => {
    try {
      console.log('Unarchiving room:', id);
      
      // Check if room exists in current state
      const roomExists = rooms.find(room => room.id === id);
      if (!roomExists) {
        toast.error('Kamar tidak ditemukan. Mungkin sudah dihapus.');
        await loadRooms(); // Refresh to sync state
        throw new Error('Room not found');
      }
      
      // Check if room can be unarchived
      if (!roomExists.can_be_unarchived) {
        toast.error('Kamar tidak dapat dipulihkan dari arsip.');
        return;
      }
      
      await roomService.unarchiveRoom(id);
      toast.success('Kamar berhasil dipulihkan dari arsip');
      await loadRooms();
    } catch (err: any) {
      console.error('Failed to unarchive room:', err);
      
      // If room not found, refresh the rooms list
      if (err.message.includes('not found') || err.message.includes('404')) {
        console.log('Room not found, refreshing rooms list');
        await loadRooms();
      }
      
      toast.error(err.message || 'Gagal memulihkan kamar dari arsip');
      throw err;
    }
  }, [loadRooms, rooms]);

  // Get archived rooms function
  const getArchivedRooms = useCallback((): Room[] => {
    return rooms.filter(room => room.is_archived);
  }, [rooms]);

  // Get active (non-archived) rooms function
  const getActiveRooms = useCallback((): Room[] => {
    return rooms.filter(room => !room.is_archived);
  }, [rooms]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    console.log('useRooms: Initial load');
    loadRooms();
  }, []);

  // Auto-refresh every 30 seconds to sync with other users
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        console.log('Auto-refresh triggered');
        loadRooms();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadRooms, loading]);

  // Debug logging
  useEffect(() => {
    console.log('useRooms state updated:', {
      roomsCount: rooms.length,
      loading,
      error,
      stats
    });
  }, [rooms, loading, error, stats]);

  return {
    // Data
    rooms,
    stats,
    loading,
    error,
    filters,
    
    // Actions (maintain exact same signature as your current implementation)
    createRoom,
    updateRoom,
    deleteRoom,
    assignTenant,
    removeTenant,
    archiveRoom,
    unarchiveRoom,
    refresh,
    
    // Utilities
    updateFilters,
    checkRoomExists,
    getRoomById,
    getAvailableRooms,
    getActiveRooms,
    getArchivedRooms,
    getRoomsByStatus,
    clearError,
    
    // For backward compatibility
    loadRooms
  };
};