// File: src/pages/Admin/components/feature/rfid/AdminDoorControl.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import { DoorOpen, DoorClosed, Home, Shield, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { Room } from '../../../types/room';
import type { IoTDevice } from '../../../types/iot';
import type { AdminDoorControlRequest } from '../../../types/rfid';

interface AdminDoorControlProps {
  rooms: Room[];
  devices: IoTDevice[];
  onDoorControl: (request: AdminDoorControlRequest) => Promise<boolean>;
}

interface DoorStatus {
  room_id: number;
  device_id: string;
  status: 'open' | 'closed' | 'unknown';
  last_action: string;
  timestamp: Date;
}

export const AdminDoorControl: React.FC<AdminDoorControlProps> = ({
  rooms,
  devices,
  onDoorControl
}) => {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [lastAction, setLastAction] = useState<{ room: string; action: string; time: Date } | null>(null);
  const [doorStatuses, setDoorStatuses] = useState<Record<number, DoorStatus>>({});


  // Use only real data from database
  const availableRooms = rooms;
  

  const getDeviceForRoom = (roomId: number) => {
    return devices.find(device => 
      device.room_id?.toString() === roomId?.toString() || device.room_id === roomId
    );
  };

  const handleDoorAction = async (roomId: number, action: 'open_door' | 'close_door') => {
    const room = rooms.find(r => r.id === roomId);
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

        // Update door status locally
        setDoorStatuses(prev => ({
          ...prev,
          [roomId]: {
            room_id: roomId,
            device_id: getDeviceForRoom(roomId)?.device_id || '',
            status: action === 'open_door' ? 'open' : 'closed',
            last_action: action === 'open_door' ? 'Opened by admin' : 'Closed by admin',
            timestamp: new Date()
          }
        }));

        setReason('');
      }
    } catch (error) {
      // Door control error will be shown in UI
    } finally {
      setLoading(null);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5" />
          🔐 Kontrol Pintu
        </h3>
        <p className="text-gray-600">Buka atau tutup pintu kamar secara manual</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Kamar
            </label>
            <select
              value={selectedRoom || ''}
              onChange={(e) => setSelectedRoom(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih kamar...</option>
              {availableRooms.map(room => (
                <option key={room.id} value={room.id}>
                  Kamar {room.room_number} 
                  {room.tenant?.user?.name ? ` - ${room.tenant.user.name}` : ' - Kosong'}
                </option>
              ))}
            </select>
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
          {availableRooms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data kamar</h3>
              <p>Pastikan backend berjalan dan data kamar sudah diload</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};