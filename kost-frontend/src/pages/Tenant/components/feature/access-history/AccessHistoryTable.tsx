// File: src/pages/Tenant/components/feature/access-history/AccessHistoryTable.tsx

import React from 'react';
import { Key, AlertCircle, CheckCircle } from 'lucide-react';
import { AccessLog } from '../../../types/access';
import { formatDateTime } from '../../../utils/formatters';
import { mergeClasses } from '../../../utils/helpers';
import { StatusBadge } from '../../ui/Status';

// [PERBAIKAN]: Menambahkan `isLoading?: boolean` pada interface props.
interface AccessHistoryTableProps {
  accessLogs: AccessLog[];
  isLoading?: boolean;
  className?: string;
}

const AccessHistoryTable: React.FC<AccessHistoryTableProps> = ({
  accessLogs,
  isLoading = false,
  className = '',
}) => {
  // Menampilkan skeleton loading saat data sedang diambil
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // Menampilkan pesan jika tidak ada data
  if (accessLogs.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <Key className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">Tidak Ada Riwayat Akses</h3>
        <p className="text-gray-500 mt-1">Tidak ditemukan log akses untuk akun Anda.</p>
      </div>
    );
  }

  // Menampilkan daftar riwayat akses
  return (
    <div className={mergeClasses("w-full", className)}>
      {/* Remove negative margins and use simpler layout */}
      <div className="space-y-2 sm:space-y-3">
            {accessLogs.map((log) => {
              // Handle both backend structures (access_granted vs status)
              const isGranted = log.access_granted ?? (log.status === 'success');
              const Icon = isGranted ? CheckCircle : AlertCircle;
              const iconColor = isGranted ? 'text-green-500' : 'text-red-500';

              // Format waktu yang lebih bersih
              const accessTime = log.access_time || log.accessed_at;
              const timeFormatted = formatDateTime(accessTime);
              
              // Dapatkan informasi kamar yang lebih bersih
              const roomInfo = log.room?.room_number || log.location || log.room_number || '-';
              
              // Status text yang lebih konsisten
              const statusText = isGranted ? 'Berhasil' : 'Ditolak';
              
              return (
                <div key={log.id} className={mergeClasses(
                  "bg-gray-50 rounded-lg border transition-all duration-200",
                  "hover:bg-white hover:shadow-sm",
                  isGranted ? "border-green-100" : "border-red-100"
                )}>
                  <div className="p-3 sm:p-4">
                    {/* Mobile-first layout */}
                    <div className="space-y-2">
                      {/* Header row - Status + Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={mergeClasses(
                            "p-1.5 rounded-full flex-shrink-0",
                            isGranted ? "bg-green-50" : "bg-red-50"
                          )}>
                            <Icon className={mergeClasses("w-4 h-4", iconColor)} />
                          </div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            {statusText}
                          </h4>
                        </div>
                        
                        <StatusBadge 
                          status={isGranted ? 'success' : 'error'}
                          label={statusText}
                        />
                      </div>
                      
                      {/* Info row - Room + Time */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                        <span className="text-gray-600 font-medium">
                          Kamar {roomInfo}
                        </span>
                        <span className="hidden sm:inline text-gray-400">•</span>
                        <span className="text-gray-500 text-xs sm:text-sm">
                          {timeFormatted}
                        </span>
                      </div>
                      
                      {/* Alasan penolakan - Mobile optimized */}
                      {log.reason && !isGranted && (
                        <div className="bg-red-50 border border-red-100 rounded-md p-2">
                          <p className="text-xs text-red-700">
                            <span className="font-medium">Alasan:</span> {log.reason}
                          </p>
                        </div>
                      )}
                      
                      {/* Info tambahan - Collapsed on mobile */}
                      {isGranted && (log.access_type || log.device_id) && (
                        <div className="text-xs text-gray-400 pt-1 border-t border-gray-100">
                          {log.access_type && <span>Tipe: {log.access_type}</span>}
                          {log.device_id && log.access_type && <span className="hidden sm:inline"> • </span>}
                          {log.device_id && (
                            <span className={log.access_type ? "block sm:inline" : ""}>
                              {log.access_type && <br className="sm:hidden" />}
                              Device: {log.device_id}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default AccessHistoryTable;
