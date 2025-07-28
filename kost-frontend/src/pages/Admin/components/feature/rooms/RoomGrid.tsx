// File: src/pages/Admin/components/feature/rooms/RoomGrid.tsx
import React from 'react';
import { 
  Home, User, DollarSign, Calendar, MoreVertical,
  Edit, Trash2, UserPlus, UserMinus, Eye, Wrench, Archive, ArchiveRestore
} from 'lucide-react';
import { StatusBadge, IconButton } from '../../ui';
import type { Room } from '../../../types/room';

interface RoomGridProps {
  rooms: Room[];
  loading: boolean;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onViewDetails: (room: Room) => void;
  onAssignTenant: (room: Room) => void;
  onRemoveTenant: (room: Room) => void;
  onArchive?: (room: Room) => void;
  onUnarchive?: (room: Room) => void;
  onReserve?: (room: Room) => void;
  onViewTenant?: (room: Room) => void;
}

// Helper function to format currency
const formatCurrency = (amount: string): string => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return amount;
  
  if (numAmount >= 1_000_000) {
    return `Rp ${(numAmount / 1_000_000).toFixed(1)}Jt`;
  }
  if (numAmount >= 1_000) {
    return `Rp ${(numAmount / 1_000).toFixed(0)}K`;
  }
  return `Rp ${numAmount.toLocaleString('id-ID')}`;
};

// Helper function to get status styling
const getStatusStyling = (status?: string) => {
  switch (status) {
    case 'available':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        badge: 'bg-green-100 text-green-800'
      };
    case 'occupied':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800'
      };
    case 'maintenance':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        badge: 'bg-orange-100 text-orange-800'
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        badge: 'bg-gray-100 text-gray-800'
      };
  }
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-20" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="text-center py-12">
    <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada kamar ditemukan</h3>
    <p className="text-gray-500">Tidak ada kamar yang sesuai dengan filter saat ini.</p>
  </div>
);

// Room card component
const RoomCard: React.FC<{
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onViewDetails: (room: Room) => void;
  onAssignTenant: (room: Room) => void;
  onRemoveTenant: (room: Room) => void;
  onArchive?: (room: Room) => void;
  onUnarchive?: (room: Room) => void;
  onViewTenant?: (room: Room) => void;
}> = ({ room, onEdit, onDelete, onViewDetails, onAssignTenant, onRemoveTenant, onArchive, onUnarchive, onViewTenant }) => {
  const styling = getStatusStyling(room.status);
  const [showActions, setShowActions] = React.useState(false);

  const getStatusIcon = () => {
    switch (room.status) {
      case 'available':
        return <Home className="w-4 h-4" />;
      case 'occupied':
        return <User className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${styling.border} hover:shadow-md transition-all duration-200 overflow-hidden ${room.is_archived ? 'opacity-75 bg-gray-50' : ''}`}>
      {/* Header */}
      <div className={`${styling.bg} px-6 py-4 border-b ${styling.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {room.room_number}
              </h3>
              {room.is_archived && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                  <Archive className="w-3 h-3" />
                  Arsip
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{room.room_name}</p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {/* Actions Dropdown */}
            {showActions && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]">
                <button
                  onClick={() => {
                    onViewDetails(room);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4" />
                  Lihat Detail
                </button>
                <button
                  onClick={() => {
                    onEdit(room);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  Edit Kamar
                </button>
                {room.status === 'available' && (
                  <button
                    onClick={() => {
                      onAssignTenant(room);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    Tempatkan Penyewa
                  </button>
                )}
                {room.status === 'occupied' && room.tenant && (
                  <>
                    <button
                      onClick={() => {
                        if (onViewTenant) {
                          onViewTenant(room);
                        }
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                    >
                      <User className="w-4 h-4" />
                      Lihat Penyewa
                    </button>
                  </>
                )}
                {room.status === 'maintenance' && (
                  <div className="px-4 py-2 text-sm text-gray-500 italic">
                    Kamar dalam perbaikan
                  </div>
                )}
                
                {/* Archive/Unarchive buttons */}
                {!room.is_archived && room.can_be_archived && onArchive && (
                  <button
                    onClick={() => {
                      onArchive(room);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Archive className="w-4 h-4" />
                    Arsipkan Kamar
                  </button>
                )}
                
                {room.is_archived && room.can_be_unarchived && onUnarchive && (
                  <button
                    onClick={() => {
                      onUnarchive(room);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <ArchiveRestore className="w-4 h-4" />
                    Pulihkan dari Arsip
                  </button>
                )}
                
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <StatusBadge 
            status={room.status as any} 
            size="md" 
            icon={getStatusIcon()}
          >
            {room.status === 'available' ? 'Tersedia' : 
             room.status === 'occupied' ? 'Terisi' : 
             room.status === 'maintenance' ? 'Perawatan' : room.status}
          </StatusBadge>
          
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(room.monthly_price)}
            </div>
            <div className="text-xs text-gray-500">per bulan</div>
          </div>
        </div>

        {/* Tenant Information */}
        {room.tenant ? (
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">
                {room.tenant.user?.name || 'Data penyewa tidak tersedia'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span>Sewa: {formatCurrency(room.tenant.monthly_rent)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Sejak: {new Date(room.tenant.start_date).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada penyewa</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          {/* Only show View Details for rooms with tenants (has meaningful info) */}
          {room.tenant ? (
            <>
              <button
                onClick={() => onViewDetails(room)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lihat Detail
              </button>
              
              <div className="flex gap-1">
                <IconButton
                  icon={<Edit className="h-4 w-4" />}
                  tooltip="Edit kamar"
                  variant="secondary"
                  size="md"
                  onClick={() => onEdit(room)}
                />
              </div>
            </>
          ) : (
            /* For empty rooms, show primary actions */
            <div className="flex gap-2 w-full">
              {room.status === 'available' && (
                <button
                  onClick={() => onAssignTenant(room)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Tempatkan Penyewa
                </button>
              )}
              
              <IconButton
                icon={<Edit className="h-4 w-4" />}
                tooltip="Edit kamar"
                variant="secondary"
                size="md"
                onClick={() => onEdit(room)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RoomGrid: React.FC<RoomGridProps> = ({
  rooms,
  loading,
  onEdit,
  onDelete,
  onViewDetails,
  onAssignTenant,
  onRemoveTenant,
  onArchive,
  onUnarchive,
  onViewTenant
}) => {
  // Click outside handler
  React.useEffect(() => {
    const handleClickOutside = () => {
      // Close all action dropdowns when clicking outside
      const dropdowns = document.querySelectorAll('[data-dropdown]');
      dropdowns.forEach(dropdown => {
        dropdown.classList.add('hidden');
      });
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (rooms.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          onAssignTenant={onAssignTenant}
          onRemoveTenant={onRemoveTenant}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onViewTenant={onViewTenant}
        />
      ))}
    </div>
  );
};