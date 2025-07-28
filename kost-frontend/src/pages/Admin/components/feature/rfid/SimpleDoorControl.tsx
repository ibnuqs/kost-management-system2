// File: src/pages/Admin/components/feature/rfid/SimpleDoorControl.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import { DoorOpen, Home, AlertTriangle } from 'lucide-react';
import { formatTenantDisplay } from '../../../utils/tenantHelpers';

interface SimpleDoorControlProps {
  rooms: any[];
  devices: any[];
  onDoorControl: (request: any) => Promise<boolean>;
}

export const SimpleDoorControl: React.FC<SimpleDoorControlProps> = ({
  rooms,
  devices,
  onDoorControl
}) => {
  const [reason, setReason] = useState('Kontrol manual admin');
  const [loading, setLoading] = useState<number | null>(null);

  // Predefined reason options in Indonesian
  const reasonOptions = [
    'Kontrol manual admin',
    'Akses darurat',
    'Pemeliharaan ruangan',
    'Inspeksi keamanan',
    'Bantuan penyewa',
    'Perbaikan teknis',
    'Cleaning service',
    'Pengiriman barang'
  ];

  // Filter rooms that have online devices
  const getAvailableRooms = () => {
    return rooms.filter(room => {
      const device = devices.find(d => d.room_id === room.id);
      return device && device.status === 'online';
    });
  };

  const availableRooms = getAvailableRooms();

  const handleDoorAction = async (roomId: number, action: 'open_door' | 'close_door') => {
    // Auto-set reason if empty
    const finalReason = reason.trim() || 'Kontrol manual admin';

    setLoading(roomId);
    try {
      await onDoorControl({
        room_id: roomId,
        action,
        reason: finalReason,
        emergency_access: false
      });
      // Keep the reason selected for next action
    } catch (error) {
      console.error('Door control failed:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <DoorOpen className="w-6 h-6 text-orange-600" />
          🚪 Door Control Center
        </h2>
        <p className="text-sm text-gray-600">Manual door control</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            🏠 Room Control
          </h3>
        </CardHeader>
        <CardContent>
          {/* Reason Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Alasan Kontrol Akses
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {reasonOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Pilih alasan atau akan otomatis menggunakan "Kontrol manual admin"
            </div>
          </div>

          {/* Room List */}
          <div className="space-y-3">
            {availableRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <div>Tidak ada kamar dengan perangkat online</div>
                <div className="text-sm mt-2 text-gray-400">
                  Hanya kamar dengan perangkat IoT online yang dapat dikontrol
                </div>
                {rooms.length > 0 && (
                  <div className="text-sm mt-2 text-blue-600">
                    Total kamar: {rooms.length} | Kamar dengan perangkat online: {availableRooms.length}
                  </div>
                )}
              </div>
            ) : (
              availableRooms.map(room => {
                const isLoading = loading === room.id;
                
                const device = devices.find(d => d.room_id === room.id);
                
                return (
                  <div key={room.id} className="p-4 border rounded-lg border-green-200 bg-green-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <Home className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{room.room_number}</div>
                          <div className="text-sm text-gray-600">
                            {formatTenantDisplay(room)}
                          </div>
                          <div className="text-xs text-green-600 font-medium mt-1">
                            🟢 {device?.device_id} - Online
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleDoorAction(room.id, 'open_door')}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isLoading ? '⏳' : '🔓'} Buka Pintu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDoorAction(room.id, 'close_door')}
                        disabled={isLoading}
                        className="flex-1 border-green-300 text-green-700 hover:bg-green-100"
                      >
                        {isLoading ? '⏳' : '🔒'} Tutup Pintu
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};