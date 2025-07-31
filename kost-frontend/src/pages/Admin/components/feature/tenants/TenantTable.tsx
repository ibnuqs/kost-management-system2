// File: src/pages/Admin/components/features/tenants/TenantTable.tsx
import React from 'react';
import { Edit, Trash2, UserX, Mail, Phone, Calendar, DollarSign, Home } from 'lucide-react';
import { StatusBadge, IconButton } from '../../ui';
import type { Tenant } from '../../../types/tenant';
import type { PaginationData } from '../../../types/common';

interface TenantTableProps {
  tenants: Tenant[];
  loading: boolean;
  pagination: PaginationData;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenantId: number) => void;
  onMoveOut: (tenant: Tenant) => void;
  onRoomTransfer: (tenant: Tenant) => void;
  onPageChange: (page: number) => void;
}

export const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  loading,
  pagination,
  onEdit,
  onDelete,
  onMoveOut,
  onRoomTransfer,
  onPageChange
}) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'moved_out':
        return 'Pindah';
      case 'suspended':
        return 'Suspended';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: string | number) => {
    return `Rp ${Number(amount).toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysAsTenant = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <p className="text-gray-500 mt-4">Memuat data penyewa...</p>
        </div>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200">
        <div className="p-12 text-center text-gray-500">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <UserX className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada penyewa ditemukan</h3>
          <p className="text-sm text-gray-600">Coba sesuaikan filter atau tambah penyewa baru</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Informasi Penyewa
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Detail Kamar
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Sewa & Durasi
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100">
                {/* Tenant Information */}
                <td className="px-6 py-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                        <span className="text-base font-bold text-blue-700">
                          {tenant.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {tenant.user.name}
                      </div>
                      {tenant.tenant_code && (
                        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                          {tenant.tenant_code}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1.5 text-gray-400" />
                        <span className="truncate">{tenant.user.email}</span>
                      </div>
                      {tenant.user.phone && (
                        <div className="text-sm text-gray-600 flex items-center">
                          <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
                          {tenant.user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Room Details */}
                <td className="px-6 py-5">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-semibold text-gray-900">
                      Room {tenant.room.room_number}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {tenant.room.room_name}
                    </div>
                  </div>
                </td>

                {/* Rent & Duration */}
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-900 font-semibold bg-green-50 px-3 py-1 rounded-lg">
                      <DollarSign className="h-4 w-4 mr-1.5 text-green-600" />
                      {formatCurrency(tenant.monthly_rent)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-1.5 text-gray-400" />
                      <span className="text-sm">{formatDate(tenant.start_date)}</span>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {calculateDaysAsTenant(tenant.start_date)} hari sebagai penyewa
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-5">
                  <StatusBadge 
                    status={tenant.status as 'active' | 'inactive' | 'pending' | 'suspended'} 
                    size="md"
                  >
                    {getStatusText(tenant.status)}
                  </StatusBadge>
                </td>

                {/* Actions */}
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <IconButton
                      icon={<Edit className="h-4 w-4" />}
                      tooltip="Edit penyewa"
                      variant="primary"
                      onClick={() => onEdit(tenant)}
                    />
                    
                    {tenant.status === 'active' && (
                      <>
                        <IconButton
                          icon={<Home className="h-4 w-4" />}
                          tooltip="Pindah kamar"
                          variant="secondary"
                          onClick={() => onRoomTransfer(tenant)}
                        />
                        
                        <IconButton
                          icon={<UserX className="h-4 w-4" />}
                          tooltip="Move out penyewa"
                          variant="secondary"
                          onClick={() => onMoveOut(tenant)}
                        />
                      </>
                    )}
                    
                    <IconButton
                      icon={<Trash2 className="h-4 w-4" />}
                      tooltip="Hapus penyewa"
                      variant="danger"
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menghapus ${tenant.user.name}? Tindakan ini tidak dapat dibatalkan.`)) {
                          onDelete(tenant.id);
                        }
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          {/* Mobile pagination */}
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sebelumnya
            </button>
            <span className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-200">
              Halaman {pagination.current_page} dari {pagination.last_page}
            </span>
            <button
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Selanjutnya
            </button>
          </div>
          
          {/* Desktop pagination */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Menampilkan{' '}
                <span className="font-medium">
                  {((pagination.current_page - 1) * pagination.per_page) + 1}
                </span>{' '}
                sampai{' '}
                <span className="font-medium">
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                </span>{' '}
                dari{' '}
                <span className="font-medium">{pagination.total}</span> hasil
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* Previous button */}
                <button
                  onClick={() => onPageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Sebelumnya</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  let pageNum;
                  if (pagination.last_page <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current_page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current_page >= pagination.last_page - 2) {
                    pageNum = pagination.last_page - 4 + i;
                  } else {
                    pageNum = pagination.current_page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                        pageNum === pagination.current_page
                          ? 'z-10 bg-blue-100 border-blue-300 text-blue-700 font-semibold'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next button */}
                <button
                  onClick={() => onPageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Selanjutnya</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};