// File: src/pages/Admin/components/feature/rfid/AdminDoorControl.tsx
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import { DoorOpen, DoorClosed, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import type { Room } from '../../../types/room';
import type { AdminDoorControlRequest } from '../../../types/rfid';

interface AdminDoorControlProps {
  rooms?: Room[];
  onDoorControl: (request: AdminDoorControlRequest) => Promise<boolean>;
}



export const AdminDoorControl: React.FC<AdminDoorControlProps> = ({
  rooms = [],
  onDoorControl
}) => {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [lastAction, setLastAction] = useState<{ room: string; action: string; time: Date } | null>(null);
  
  // ULTRA-OPTIMIZED: Pre-computed room options with minimal re-computation
  const roomOptions = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    
    
    // Pre-compute all display strings in single pass
    return rooms.map(room => {
      const roomNum = room.room_number;
      const tenantName = room.tenant?.user?.name;
      
      return {
        id: room.id,
        value: room.id,
        // Optimized string concatenation
        label: `Kamar ${roomNum}${tenantName ? ` - ${tenantName}` : ' - Kosong'}`,
        room // Keep reference for fast lookup
      };
    });
  }, [rooms]); // Only depend on rooms array
  
  // Fast room lookup by ID
  const getRoomById = useMemo(() => {
    const roomMap = new Map(rooms.map(room => [room.id, room]));
    return (id: number) => roomMap.get(id);
  }, [rooms]);
  


  const handleDoorAction = async (roomId: number, action: 'open_door' | 'close_door') => {
    const room = getRoomById(roomId); // Fast O(1) lookup
    if (!room) return;

    setLoading(roomId);
    try {
      const success = await onDoorControl({
        room_id: roomId,
        action,
        reason: reason || `Admin manual ${action.replace('_', ' ')}`
      });

      if (success) {
        setLastAction({
          room: `Room ${room.room_number}`,
          action: action === 'open_door' ? 'Opened' : 'Closed',
          time: new Date()
        });

        

        setReason('');
      }
    } catch {
      // Door control error will be shown in UI
    } finally {
      setLoading(null);
    }
  };


  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5" />
Kontrol Pintu
        </h3>
        <p className="text-gray-600">Buka atau tutup pintu kamar secara manual</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Room Selection - Optimized */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Kamar {roomOptions.length > 0 && (
                <span className="text-green-600 text-xs ml-1">({roomOptions.length} kamar tersedia)</span>
              )}
            </label>
            {roomOptions.length === 0 ? (
              <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-blue-50 text-blue-600 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
Mencari ESP32 online... ({rooms?.length || 0} kamar ditemukan)
              </div>
            ) : (
              <select
                value={selectedRoom || ''}
                onChange={(e) => setSelectedRoom(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih kamar...</option>
                {roomOptions.map(option => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan (Opsional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Darurat, Maintenance, dll"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => selectedRoom && handleDoorAction(selectedRoom, 'open_door')}
              disabled={!selectedRoom || loading === selectedRoom}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading === selectedRoom ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <DoorOpen className="w-4 h-4 mr-2" />
              )}
              Buka Pintu
            </Button>
            
            <Button
              onClick={() => selectedRoom && handleDoorAction(selectedRoom, 'close_door')}
              disabled={!selectedRoom || loading === selectedRoom}
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              {loading === selectedRoom ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <DoorClosed className="w-4 h-4 mr-2" />
              )}
              Tutup Pintu
            </Button>
          </div>

          {/* Last Action Status */}
          {lastAction && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Berhasil!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                {lastAction.action} {lastAction.room} pada {lastAction.time.toLocaleTimeString()}
              </p>
            </div>
          )}


          {/* No rooms message */}
          {roomOptions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada kamar dengan ESP32 online</h3>
              <p className="text-sm">Tunggu beberapa detik, sistem sedang mencari ESP32 yang online...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};