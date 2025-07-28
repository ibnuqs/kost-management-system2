// File: src/pages/Admin/components/feature/rooms/RoomBulkActions.tsx
import React, { useState } from 'react';
import { CheckSquare, Square, Settings, Wrench, Archive, Trash2, X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Room } from '../../../types/room';

interface RoomBulkActionsProps {
  rooms: Room[];
  onBulkStatusChange: (roomIds: number[], newStatus: string) => Promise<void>;
  onBulkDelete: (roomIds: number[]) => Promise<void>;
  onBulkArchive: (roomIds: number[]) => Promise<void>;
}

export const RoomBulkActions: React.FC<RoomBulkActionsProps> = ({
  rooms,
  onBulkStatusChange,
  onBulkDelete,
  onBulkArchive
}) => {
  const [selectedRooms, setSelectedRooms] = useState<Set<number>>(new Set());
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleRoomSelection = (roomId: number) => {
    const newSelected = new Set(selectedRooms);
    if (newSelected.has(roomId)) {
      newSelected.delete(roomId);
    } else {
      newSelected.add(roomId);
    }
    setSelectedRooms(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRooms.size === rooms.length) {
      setSelectedRooms(new Set());
    } else {
      setSelectedRooms(new Set(rooms.map(room => room.id)));
    }
  };

  const clearSelection = () => {
    setSelectedRooms(new Set());
    setShowBulkMenu(false);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRooms.size === 0) return;

    try {
      setIsProcessing(true);
      const roomIds = Array.from(selectedRooms);

      switch (action) {
        case 'maintenance':
          await onBulkStatusChange(roomIds, 'maintenance');
          toast.success(`${roomIds.length} kamar diubah ke status maintenance`);
          break;
        case 'available':
          await onBulkStatusChange(roomIds, 'available');
          toast.success(`${roomIds.length} kamar diubah ke status tersedia`);
          break;
        case 'archive':
          if (confirm(`Arsipkan ${roomIds.length} kamar yang dipilih?`)) {
            await onBulkArchive(roomIds);
            toast.success(`${roomIds.length} kamar berhasil diarsipkan`);
          }
          break;
        case 'delete':
          if (confirm(`Hapus ${roomIds.length} kamar yang dipilih? Tindakan ini tidak dapat dibatalkan.`)) {
            await onBulkDelete(roomIds);
            toast.success(`${roomIds.length} kamar berhasil dihapus`);
          }
          break;
      }

      clearSelection();
    } catch (error: any) {
      toast.error(error.message || 'Gagal melakukan aksi bulk');
    } finally {
      setIsProcessing(false);
    }
  };

  const availableRooms = rooms.filter(room => room.status === 'available');
  const occupiedRooms = rooms.filter(room => room.status === 'occupied');
  const maintenanceRooms = rooms.filter(room => room.status === 'maintenance');

  if (rooms.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-6">
          <h3 className="text-lg font-semibold text-gray-900">Manajemen Bulk Kamar</h3>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>Legenda Status:</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full mr-2"></div>
              {availableRooms.length} Tersedia
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-full mr-2"></div>
              {occupiedRooms.length} Terisi
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-full mr-2"></div>
              {maintenanceRooms.length} Maintenance
            </span>
          </div>
        </div>
        
        {selectedRooms.size > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedRooms.size} kamar dipilih
            </span>
            <button
              onClick={clearSelection}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Room Selection */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
          >
            {selectedRooms.size === rooms.length ? (
              <CheckSquare className="h-4 w-4 text-blue-600" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            <span>Pilih Semua ({rooms.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-32 overflow-y-auto">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => toggleRoomSelection(room.id)}
              className={`p-2 text-xs rounded-lg border transition-colors ${
                selectedRooms.has(room.id)
                  ? 'bg-blue-100 border-blue-300 text-blue-900'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-1">
                {selectedRooms.has(room.id) ? (
                  <CheckSquare className="h-3 w-3" />
                ) : (
                  <Square className="h-3 w-3" />
                )}
                <span className="truncate">{room.room_number}</span>
              </div>
              <div className={`mt-1 text-xs px-1 py-0.5 rounded ${
                room.status === 'available' ? 'bg-green-100 text-green-800' :
                room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {room.status === 'available' ? 'Tersedia' :
                 room.status === 'occupied' ? 'Terisi' :
                 'Maintenance'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRooms.size > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                Aksi untuk {selectedRooms.size} kamar:
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('maintenance')}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition-colors"
              >
                <Wrench className="h-4 w-4" />
                <span>Maintenance</span>
              </button>
              
              <button
                onClick={() => handleBulkAction('available')}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Tersedia</span>
              </button>
              
              <button
                onClick={() => handleBulkAction('archive')}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <Archive className="h-4 w-4" />
                <span>Arsip</span>
              </button>
              
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus</span>
              </button>
            </div>
          </div>

          {/* Warning for occupied rooms */}
          {Array.from(selectedRooms).some(id => {
            const room = rooms.find(r => r.id === id);
            return room?.status === 'occupied';
          }) && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">Perhatian</p>
                  <p>Beberapa kamar yang dipilih sedang terisi penyewa. Pastikan penyewa sudah dipindahkan sebelum mengubah status kamar.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomBulkActions;