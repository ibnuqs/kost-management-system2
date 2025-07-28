// File: src/pages/Admin/components/features/access-logs/AccessLogTable.tsx
import React from 'react';
import { CheckCircle, XCircle, Clock, User, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../../ui';
import type { AccessLog } from '../../../types/accessLog';

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface AccessLogTableProps {
  logs: AccessLog[];
  loading: boolean;
  pagination: Pagination;
  onPageChange?: (page: number) => void;
}

export const AccessLogTable: React.FC<AccessLogTableProps> = ({ 
  logs, 
  loading, 
  pagination,
  onPageChange
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handlePreviousPage = () => {
    if (pagination.current_page > 1 && onPageChange) {
      onPageChange(pagination.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.current_page < pagination.last_page && onPageChange) {
      onPageChange(pagination.current_page + 1);
    }
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const start = Math.max(1, pagination.current_page - 2);
    const end = Math.min(pagination.last_page, pagination.current_page + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white">
          <Clock className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" />
          Loading access logs...
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No access logs found</h3>
        <p>No access attempts match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RFID UID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Access Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Access Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {log.user?.name || 'Data pengguna tidak tersedia'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.user?.email || 'Email tidak tersedia'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                    {log.rfid_uid}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.room?.room_number ? `Kamar ${log.room.room_number}` : 
                   log.room?.id ? `ID: ${log.room.id}` : 
                   'Data kamar tidak tersedia'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge 
                    status={log.access_granted ? 'granted' : 'denied'}
                    icon={log.access_granted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  >
                    {log.access_granted ? 'Diizinkan' : 'Ditolak'}
                  </StatusBadge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(log.accessed_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.device_id || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.reason || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button 
            onClick={handlePreviousPage}
            disabled={pagination.current_page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          <button 
            onClick={handleNextPage}
            disabled={pagination.current_page === pagination.last_page}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
              </span> of{' '}
              <span className="font-medium">{pagination.total.toLocaleString()}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={handlePreviousPage}
                disabled={pagination.current_page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </button>
              
              {/* Page Numbers */}
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange && onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    pageNum === pagination.current_page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              {pagination.last_page > 5 && pagination.current_page < pagination.last_page - 2 && (
                <>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                  <button
                    onClick={() => onPageChange && onPageChange(pagination.last_page)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    {pagination.last_page}
                  </button>
                </>
              )}
              
              <button
                onClick={handleNextPage}
                disabled={pagination.current_page === pagination.last_page}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};