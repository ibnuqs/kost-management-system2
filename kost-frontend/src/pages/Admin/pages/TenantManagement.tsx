// File: src/pages/Admin/pages/TenantManagement.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useTenants } from '../hooks/useTenants';
import api, { endpoints } from '../../../utils/api';
import {
  TenantStats,
  TenantTable,
  TenantFilters,
  TenantWizard,
  MoveOutWizard,
  RoomTransferWizard
} from '../components/feature/tenants';
import { PageHeader } from '../components/layout';
import { DangerousActionModal } from '../components/ui';
import type { 
  Tenant, 
  TenantFormData, 
  MoveOutData, 
  TenantFilters as TenantFiltersType 
} from '../types/tenant';

const TenantManagement: React.FC = () => {
  const {
    tenants,
    stats,
    loading,
    error,
    pagination,
    loadTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    moveOutTenant,
    refresh
  } = useTenants();

  const [filters, setFilters] = useState<TenantFiltersType>({
    search: '',
    status: '',
    room_id: '',
    overdue_only: false,
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 15,
    page: 1
  });

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [showMoveOutWizard, setShowMoveOutWizard] = useState(false);
  const [showRoomTransferWizard, setShowRoomTransferWizard] = useState(false);
  const [showDangerousAction, setShowDangerousAction] = useState<{
    type: 'update_access' | 'bulk_action' | null;
    data?: any;
  }>({ type: null });

  // Load tenants when filters change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('🔍 TenantManagement loading tenants with filters:', filters);
      loadTenants(filters);
    }, 300); // Debounce for search

    return () => clearTimeout(timeoutId);
  }, [filters, loadTenants]);

  // Debug: Log when tenants data changes
  useEffect(() => {
    console.log('🔍 TenantManagement tenants updated:', {
      count: tenants.length,
      loading,
      error,
      stats,
      firstTenant: tenants[0]
    });
  }, [tenants, loading, error, stats]);

  // Handle create tenant
  const handleCreateTenant = async (data: TenantFormData) => {
    try {
      await createTenant(data);
      setShowTenantForm(false);
      setSelectedTenant(null);
      toast.success('Penyewa berhasil ditambahkan');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan penyewa');
      throw error; // Re-throw to prevent modal from closing on error
    }
  };

  // Handle update tenant
  const handleUpdateTenant = async (data: TenantFormData) => {
    if (!selectedTenant) return;
    
    try {
      console.log('🎯 handleUpdateTenant called with:', {
        tenantId: selectedTenant.id,
        originalData: {
          name: selectedTenant.user.name,
          room_id: selectedTenant.room_id,
          monthly_rent: selectedTenant.monthly_rent
        },
        newData: data
      });
      
      await updateTenant(selectedTenant.id, data);
      
      console.log('✅ Update successful, closing modal');
      setShowTenantForm(false);
      setSelectedTenant(null);
      toast.success('Penyewa berhasil diperbarui');
    } catch (error: any) {
      console.error('❌ Update failed:', error);
      toast.error(error.message || 'Gagal memperbarui penyewa');
      throw error; // Re-throw to prevent modal from closing on error
    }
  };

  // Handle move out tenant
  const handleMoveOut = async (data: MoveOutData & { billing_calculation?: any }) => {
    if (!selectedTenant) return;
    
    try {
      console.log('🚪 Move out data:', data);
      await moveOutTenant(selectedTenant.id, data);
      setShowMoveOutWizard(false);
      setSelectedTenant(null);
      
      if (data.billing_calculation) {
        toast.success(`Penyewa berhasil di-move out dengan refund ${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(data.billing_calculation.finalBalance)}`);
      } else {
        toast.success('Penyewa berhasil di-move out');
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal melakukan move out');
      throw error; // Re-throw to prevent modal from closing on error
    }
  };

  // Handle delete tenant with confirmation
  const handleDeleteTenant = async (tenantId: number) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus ${tenant.user.name}?\n\nTindakan ini akan:\n- Menghapus permanen akun penyewa dan pengguna\n- Membuat kamar tersedia kembali\n- Tidak dapat dibatalkan\n\nCatatan: Penyewa dengan riwayat pembayaran tidak dapat dihapus.`
    );
    
    if (!confirmed) return;

    try {
      await deleteTenant(tenantId);
      toast.success('Penyewa berhasil dihapus');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus penyewa');
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof TenantFiltersType, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to first page when filters change, except for page navigation
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    handleFilterChange('page', page);
  };

  // Handle edit tenant
  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowTenantForm(true);
  };

  // Handle move out tenant
  const handleMoveOutTenant = (tenant: Tenant) => {
    if (tenant.status !== 'active') {
      toast.error('Hanya penyewa aktif yang dapat dipindahkan');
      return;
    }
    setSelectedTenant(tenant);
    setShowMoveOutWizard(true);
  };

  // Handle room transfer
  const handleRoomTransfer = (tenant: Tenant) => {
    if (tenant.status !== 'active') {
      toast.error('Hanya penyewa aktif yang dapat dipindahkan kamar');
      return;
    }
    setSelectedTenant(tenant);
    setShowRoomTransferWizard(true);
  };

  // Close form modal
  const handleCloseForm = () => {
    setShowTenantForm(false);
    setSelectedTenant(null);
  };

  // Close move out wizard
  const handleCloseMoveOut = () => {
    setShowMoveOutWizard(false);
    setSelectedTenant(null);
  };

  // Close room transfer wizard
  const handleCloseRoomTransfer = () => {
    setShowRoomTransferWizard(false);
    setSelectedTenant(null);
  };

  // Handle room transfer success
  const handleRoomTransferSuccess = () => {
    handleRefresh();
  };

  // Handle add new tenant
  const handleAddTenant = () => {
    setSelectedTenant(null);
    setShowTenantForm(true);
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Data berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui data');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">Manajemen Penyewa</h1>
                  <p className="mt-2 text-sm text-gray-600">Kelola informasi penyewa, kontrak, dan penugasan kamar</p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Refresh Data
                  </button>
                  <button
                    onClick={handleAddTenant}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Tambah Penyewa
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-semibold text-red-800">Gagal Memuat Data</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleRefresh}
                      className="bg-red-100 px-4 py-2 rounded-lg text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Section */}
          {stats && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistik Penyewa</h2>
              <TenantStats stats={stats} />
            </div>
          )}

          {/* Main Content Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Filters Section */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter & Pencarian</h2>
              <TenantFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                resultCount={tenants.length}
              />
            </div>

            {/* Table Section */}
            <div className="p-6">
              <TenantTable
                tenants={tenants}
                loading={loading}
                pagination={pagination}
                onEdit={handleEditTenant}
                onDelete={handleDeleteTenant}
                onMoveOut={handleMoveOutTenant}
                onRoomTransfer={handleRoomTransfer}
                onPageChange={handlePageChange}
              />
            </div>
          </div>

        {/* Modals */}
        <TenantWizard
          isOpen={showTenantForm}
          tenant={selectedTenant}
          onClose={handleCloseForm}
          onSubmit={selectedTenant ? handleUpdateTenant : handleCreateTenant}
        />

        <MoveOutWizard
          isOpen={showMoveOutWizard}
          tenant={selectedTenant}
          onClose={handleCloseMoveOut}
          onSubmit={handleMoveOut}
        />

        <RoomTransferWizard
          isOpen={showRoomTransferWizard}
          tenant={selectedTenant}
          onClose={handleCloseRoomTransfer}
          onSuccess={handleRoomTransferSuccess}
        />

        <DangerousActionModal
          isOpen={showDangerousAction.type === 'update_access'}
          title="Update Akses Semua Tenant"
          message="Operasi ini akan memperbarui data akses dan sinkronisasi untuk SEMUA tenant aktif. Proses ini akan mempengaruhi sistem RFID dan dapat memakan waktu beberapa menit."
          confirmText="Ya, Update Semua"
          cancelText="Batal"
          dangerLevel="medium"
          onConfirm={() => {
            // TODO: Implement bulk update access logic
            console.log('Bulk update access all tenants');
            setShowDangerousAction({ type: null });
          }}
          onCancel={() => setShowDangerousAction({ type: null })}
        />
        </div>
      </div>
    </div>
  );
};

export default TenantManagement;