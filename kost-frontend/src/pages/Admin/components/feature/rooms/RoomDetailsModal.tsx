// File: src/pages/Admin/components/feature/rooms/RoomDetailsModal.tsx
import React from 'react';
import { 
  X, Home, User, DollarSign, Calendar, MapPin, 
  Edit, UserPlus, Archive, ArchiveRestore, CheckCircle 
} from 'lucide-react';
import { StatusBadge } from '../../ui';
import type { Room } from '../../../types/room';

interface RoomDetailsModalProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
  onEdit: () => void;
  onAssignTenant: () => void;
  onArchive?: (room: Room) => void;
  onUnarchive?: (room: Room) => void;
}

// Helper function to format currency
const formatCurrency = (amount: string): string => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return amount;
  return `Rp ${numAmount.toLocaleString('id-ID')}`;
};


export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  isOpen,
  room,
  onClose,
  onEdit,
  onAssignTenant,
  onArchive,
  onUnarchive,
}) => {
  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header - Simplified */}
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {room.room_number}
                    </h2>
                    <StatusBadge 
                      status={room.status} 
                      size="md"
                    >
                      {room.status === 'available' ? 'Tersedia' : 
                       room.status === 'occupied' ? 'Terisi' : 
                       room.status === 'maintenance' ? 'Perawatan' : room.status}
                    </StatusBadge>
                    {room.is_archived && (
                      <StatusBadge status="archived" icon={<Archive className="w-4 h-4" />}>
                        Arsip
                      </StatusBadge>
                    )}
                  </div>
                  {room.is_archived && room.archive_info && (
                    <p className="text-sm text-gray-500 mt-1">
                      Diarsipkan {room.archive_info.archived_ago}
                      {room.archive_info.archived_reason && 
                        ` • ${room.archive_info.archived_reason}`
                      }
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {/* Price Info - Simplified */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(room.monthly_price)}
                </span>
                <span className="text-gray-500">/ bulan</span>
              </div>
            </div>

            {/* Room Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Informasi Kamar
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Nama Kamar:</span>
                      <p className="font-medium text-gray-900">{room.room_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Dibuat:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(room.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tenant Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Informasi Penyewa
                </h3>
                
                {room.tenant ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">Nama Penyewa:</span>
                        <p className="font-medium text-gray-900">
                          {room.tenant.user?.name || 'Unknown Tenant'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">Sewa Bulanan:</span>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(room.tenant.monthly_rent)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">Tanggal Mulai:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(room.tenant.start_date).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">Status Pembayaran:</span>
                        {/* TODO: Add payment status logic */}
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-700 font-medium">Pembayaran Lancar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium text-gray-500 mb-1">Belum Ada Penyewa</p>
                    <p className="text-sm">Kamar ini saat ini kosong</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Simplified */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                Edit Kamar
              </button>
              
              {room.status === 'available' && !room.tenant && (
                <button
                  onClick={onAssignTenant}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <UserPlus className="h-4 w-4" />
                  Tugaskan Penyewa
                </button>
              )}
              
              {/* Archive/Unarchive buttons */}
              {!room.is_archived && room.can_be_archived && onArchive && (
                <button
                  onClick={() => onArchive(room)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <Archive className="h-4 w-4" />
                  Arsipkan
                </button>
              )}
              
              {room.is_archived && room.can_be_unarchived && onUnarchive && (
                <button
                  onClick={() => onUnarchive(room)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ArchiveRestore className="h-4 w-4" />
                  Pulihkan
                </button>
              )}
              
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium ml-auto"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};