// File: src/pages/Admin/hooks/useRfid.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { rfidService } from '../services';
import type { RfidCard, AdminUser as User, Room } from '../types';

export const useRfid = () => {
  const [cards, setCards] = useState<RfidCard[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rfidService.getAllData();
      setCards(data.cards);
      setUsers(data.users);
      setRooms(data.rooms);
    } catch (err: unknown) {
      setError((err as Error).message);
      toast.error('Failed to load RFID data');
    } finally {
      setLoading(false);
    }
  }, []);

  const registerCard = useCallback(async (uid: string) => {
    try {
      await rfidService.registerCard(uid);
      toast.success('Card registered successfully');
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to register card');
      throw err;
    }
  }, [loadData]);

  const assignCard = useCallback(async (cardId: number, userId?: number, roomId?: number) => {
    try {
      await rfidService.assignCard(cardId, { user_id: userId, room_id: roomId });
      toast.success('Card assignment updated');
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to assign card');
      throw err;
    }
  }, [loadData]);

  const toggleCardStatus = useCallback(async (cardId: number) => {
    try {
      await rfidService.toggleStatus(cardId);
      toast.success('Card status updated');
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to toggle card status');
      throw err;
    }
  }, [loadData]);

  const deleteCard = useCallback(async (cardId: number) => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }
    
    try {
      await rfidService.deleteCard(cardId);
      toast.success('Card deleted successfully');
      loadData();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete card');
      throw err;
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    cards,
    users,
    rooms,
    loading,
    error,
    registerCard,
    assignCard,
    toggleCardStatus,
    deleteCard,
    refresh: loadData
  };
};