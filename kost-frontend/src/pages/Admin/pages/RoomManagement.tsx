// File: src/pages/Admin/pages/RoomManagement.tsx
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  Building2, 
  Search,
  Filter,
  LayoutGrid,
  Loader2,
  Settings
} from 'lucide-react';
import { useRooms } from '../hooks';
import {
  RoomStats,
  RoomGrid,
  RoomFilters,
  RoomForm,
  RoomDetailsModal,
  TenantAssignmentWizard,
  ArchiveConfirmModal,
  ReservationModal
} from '../components/feature/rooms';
import { PageHeader } from '../components/layout';
import { reservationService } from '../services/reservationService';
import type { Room, RoomFormData, TenantAssignmentData, RoomReservationData } from '../types/room';

// Loading component
const RoomManagementLoading = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">Memuat Data Kamar</h3>
        <p className="text-sm text-gray-600">Mohon tunggu sebentar...</p>
      </div>
    </div>
  </div>
);

// Error component
const RoomManagementError = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-6 max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Tidak Dapat Memuat Data</h3>
        <p className="text-gray-600">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
      >
        <RefreshCw className="w-4 h-4" />
        Coba Lagi
      </button>
    </div>
  </div>
);

const RoomManagement: React.FC = () => {
  const {
    rooms,
    stats,
    loading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    assignTenant,
    removeTenant,
    archiveRoom,
    unarchiveRoom,
    refresh
  } = useRooms();

  // State management
  const [filters, setFilters] = useState({
    search: '',
    status: 'active' // Default to active rooms
  });
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modals, setModals] = useState({
    add: false,
    edit: false,
    details: false,
    assign: false,
    archive: false,
    reservation: false
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal management helpers
  const openModal = (modalName: keyof typeof modals, room?: Room) => {
    if (room) setSelectedRoom(room);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    if (modalName !== 'details') setSelectedRoom(null);
  };

  const closeAllModals = () => {
    setModals({ 
      add: false, 
      edit: false, 
      details: false, 
      assign: false, 
      archive: false,
      reservation: false
    });
    setSelectedRoom(null);
  };

  // Simple and user-friendly filtering
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Search filter
      const matchesSearch = 
        room.room_number.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.room_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (room.tenant?.user?.name || '').toLowerCase().includes(filters.search.toLowerCase());
      
      // Status filter - simple and clear
      if (filters.status === 'active') {
        // Show all non-archived rooms regardless of status
        return matchesSearch && !room.is_archived;
      }
      
      if (filters.status === 'archived') {
        // Show only archived rooms
        return matchesSearch && room.is_archived;
      }
      
      // Show specific status (available, occupied, maintenance) and not archived
      return matchesSearch && room.status === filters.status && !room.is_archived;
    });
  }, [rooms, filters]);

  // Action handlers
  const handleCreateRoom = async (data: RoomFormData) => {
    try {
      await createRoom(data);
      closeModal('add');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdateRoom = async (data: RoomFormData) => {
    if (!selectedRoom) return;
    try {
      await updateRoom(selectedRoom.id, data);
      closeModal('edit');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kamar ${room.room_number}?\n\nTindakan ini tidak dapat dibatalkan.`
    );
    
    if (confirmed) {
      try {
        await deleteRoom(room.id);
        closeAllModals();
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  // Note: Tenant assignment is now handled by TenantAssignmentWizard

  const handleRemoveTenant = async (room: Room) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin mengeluarkan penyewa dari kamar ${room.room_number}?\n\nIni akan membuat kamar tersedia untuk penyewa baru.`
    );
    
    if (confirmed) {
      try {
        await removeTenant(room.id);
        closeAllModals();
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };


  const handleViewTenant = (room: Room) => {
    if (!room.tenant) return;
    
    // For now, show tenant details in an alert
    // TODO: Replace with proper tenant details modal
    const tenant = room.tenant;
    const tenantInfo = [
      `Nama: ${tenant.user?.name || 'Unknown'}`,
      `Email: ${tenant.user?.email || 'N/A'}`,
      `Telepon: ${tenant.user?.phone || 'N/A'}`,
      `Kode Penyewa: ${tenant.tenant_code || 'N/A'}`,
      `Sewa Bulanan: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(parseFloat(tenant.monthly_rent))}`,
      `Tanggal Mulai: ${new Date(tenant.start_date).toLocaleDateString('id-ID')}`,
      `Status: ${tenant.status === 'active' ? 'Aktif' : tenant.status}`
    ].join('\n');
    
    alert(`Detail Penyewa Kamar ${room.room_number}:\n\n${tenantInfo}`);
  };

  const handleArchiveRoom = (room: Room) => {
    setSelectedRoom(room);
    openModal('archive');
  };

  const handleConfirmArchive = async (room: Room, reason?: string) => {
    try {
      await archiveRoom(room.id, reason ? { reason } : undefined);
      closeModal('archive');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUnarchiveRoom = async (room: Room) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin memulihkan kamar ${room.room_number} dari arsip?\n\nKamar akan kembali tersedia untuk penugasan penyewa.`
    );
    
    if (confirmed) {
      try {
        await unarchiveRoom(room.id);
        closeAllModals();
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleReserveRoom = async (data: RoomReservationData) => {
    if (!selectedRoom) return;
    try {
      await reservationService.reserveRoom(selectedRoom.id, data);
      closeModal('reservation');
      // Refresh the rooms list to show updated reservation status
      await refresh();
    } catch (error) {
      console.error('Failed to reserve room:', error);
    }
  };

  // Show loading state
  if (loading && !rooms.length) {
    return <RoomManagementLoading />;
  }

  // Show error state
  if (error && !rooms.length) {
    return <RoomManagementError error={error} onRetry={refresh} />;
  }

  // Transform rooms to ensure compatibility if needed
  const compatibleRooms: Room[] = rooms.map(room => ({
    ...room,
    // Ensure all required properties exist
    room_number: room.room_number || '',
    room_name: room.room_name || '',
    monthly_price: room.monthly_price || '0',
    status: room.status || 'available',
    created_at: room.created_at || new Date().toISOString(),
    updated_at: room.updated_at || new Date().toISOString(),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Page Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Kamar</h1>
                <p className="text-gray-600 mt-1">Kelola data kamar, harga, dan penugasan penyewa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Memuat...' : 'Refresh'}
              </button>
              <button
                onClick={() => openModal('add')}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah Kamar
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && rooms.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Terjadi Kesalahan</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ringkasan Status */}
        {stats && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Ringkasan Status</h3>
            </div>
            <RoomStats stats={stats} />
          </div>
        )}

        {/* Filter & Tampilan */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cari & Filter Kamar</h3>
          </div>
          
          <RoomFilters
            filters={filters}
            onFilterChange={setFilters}
            resultCount={filteredRooms.length}
          />
        </div>

        {/* Room Grid Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <LayoutGrid className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Daftar Kamar</h3>
          </div>
          <RoomGrid
            rooms={filteredRooms}
            loading={loading}
            onEdit={(room) => openModal('edit', room)}
            onDelete={handleDeleteRoom}
            onViewDetails={(room) => openModal('details', room)}
            onAssignTenant={(room) => openModal('assign', room)}
            onRemoveTenant={handleRemoveTenant}
            onArchive={handleArchiveRoom}
            onUnarchive={handleUnarchiveRoom}
            onReserve={(room) => openModal('reservation', room)}
            onViewTenant={handleViewTenant}
          />
        </div>

      </div>

      {/* Modals */}
      
      {/* Add Room Modal */}
      <RoomForm
        isOpen={modals.add}
        onClose={() => closeModal('add')}
        onSubmit={handleCreateRoom}
        title="Tambah Kamar Baru"
      />

      {/* Edit Room Modal */}
      <RoomForm
        isOpen={modals.edit}
        room={selectedRoom}
        onClose={() => closeModal('edit')}
        onSubmit={handleUpdateRoom}
        onArchive={handleArchiveRoom}
        title="Edit Kamar"
      />

      {/* Room Details Modal */}
      <RoomDetailsModal
        isOpen={modals.details}
        room={selectedRoom}
        onClose={() => closeModal('details')}
        onEdit={() => {
          closeModal('details');
          openModal('edit', selectedRoom!);
        }}
        onAssignTenant={() => {
          closeModal('details');
          openModal('assign', selectedRoom!);
        }}
        onArchive={(room) => {
          closeModal('details');
          handleArchiveRoom(room);
        }}
        onUnarchive={handleUnarchiveRoom}
      />

      {/* Assign Tenant Wizard */}
      <TenantAssignmentWizard
        isOpen={modals.assign}
        room={selectedRoom}
        onClose={() => closeModal('assign')}
        onSuccess={() => {
          closeModal('assign');
          refresh();
        }}
      />

      {/* Archive Confirm Modal */}
      <ArchiveConfirmModal
        isOpen={modals.archive}
        room={selectedRoom}
        onClose={() => closeModal('archive')}
        onConfirm={handleConfirmArchive}
      />

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={modals.reservation}
        room={selectedRoom}
        onClose={() => closeModal('reservation')}
        onSubmit={handleReserveRoom}
      />

    </div>
  );
};

export default RoomManagement;