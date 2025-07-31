// File: src/pages/Tenant/pages/AccessHistory.tsx

import React, { useState, useEffect } from 'react';
import { Key, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAccessHistory, useAccessStats } from '../hooks/useAccessHistory';
import { AccessHistoryTable, AccessFilters, AccessStatistics } from '../components/feature/access-history';
import { PageHeader } from '../components/layout/Header';
import { Button } from '../components/ui/Buttons';
import { mergeClasses } from '../utils/helpers';

const AccessHistory: React.FC = () => {
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Menggunakan hook untuk mengambil data riwayat akses
  const {
    accessLogs,
    pagination,
    isLoading: isLoadingHistory,
    isError,
    error,
    refreshAccessHistory,
  } = useAccessHistory({
    ...filters,
    page: currentPage,
    per_page: 10,
  });

  // Menggunakan hook untuk mengambil data statistik
  const { stats, isLoading: isLoadingStats } = useAccessStats();

  // Reset halaman saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handler untuk update filter
  const handleFiltersChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // --- DEBUGGING LOGS ---
  useEffect(() => {
    console.group('[AccessHistory Debug]');
    console.log('Current Filters:', filters);
    console.log('History Hook:', {
        accessLogs,
        pagination,
        isLoading: isLoadingHistory,
        isError,
    });
    console.log('Stats Hook:', {
        stats,
        isLoading: isLoadingStats,
    });
    console.groupEnd();
  }, [filters, accessLogs, pagination, isLoadingHistory, isError, stats, isLoadingStats]);
  // --- END DEBUGGING LOGS ---


  if (isError) {
    // --- DEBUGGING LOG UNTUK ERROR ---
    console.error('[AccessHistory] An error occurred:', error);
    // --- END DEBUGGING LOG ---
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Gagal Memuat Riwayat Akses
        </h2>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.'}
        </p>
        <Button onClick={() => refreshAccessHistory()} variant="primary">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container dengan padding yang responsive */}
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <PageHeader
            title="Riwayat Akses"
            subtitle={`${pagination?.total || 0} log ditemukan`}
            icon={Key}
          />

          {/* Komponen Statistik */}
          <AccessStatistics stats={stats} isLoading={isLoadingStats} />
          
          <div className="bg-white rounded-lg sm:rounded-xl border overflow-hidden">
              {/* Header dengan aksi - Mobile optimized */}
              <div className="p-3 sm:p-4 lg:p-6 border-b bg-gray-50/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Log Akses</h3>
                  
                  {/* Button group - Stack on mobile */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Filter}
                      onClick={() => setShowFilters(!showFilters)}
                      className="w-full sm:w-auto text-sm"
                    >
                      <span className="sm:hidden">Filter</span>
                      <span className="hidden sm:inline">
                        {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
                      </span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => refreshAccessHistory()}
                      loading={isLoadingHistory}
                      className="w-full sm:w-auto text-sm"
                    >
                      <span className="sm:hidden">Refresh</span>
                      <span className="hidden sm:inline">Muat Ulang</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Panel Filter - Mobile optimized */}
              {showFilters && (
                <div className="p-3 sm:p-4 lg:p-6 border-b bg-gray-50/25">
                  <AccessFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClear={() => {
                      setFilters({});
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}

              {/* Tabel Riwayat Akses - No extra padding, handled in table */}
              <div className="p-3 sm:p-4 lg:p-6">
                <AccessHistoryTable
                  accessLogs={accessLogs}
                  isLoading={isLoadingHistory}
                />
              </div>
          </div>

          {/* Pagination - Mobile optimized */}
          {pagination && pagination.last_page > 1 && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Info pagination - Responsive text */}
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    <span className="hidden sm:inline">
                      Menampilkan <span className="font-medium">{pagination.from || 1}</span> sampai{' '}
                      <span className="font-medium">{pagination.to || pagination.per_page}</span> dari{' '}
                      <span className="font-medium">{pagination.total}</span> data
                    </span>
                    <span className="sm:hidden">
                      {pagination.from || 1}-{pagination.to || pagination.per_page} dari {pagination.total}
                    </span>
                  </div>
              
                  {/* Pagination controls - Mobile optimized */}
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    {/* Previous button - Mobile optimized */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(Math.max(1, currentPage - 1));
                      }}
                      disabled={currentPage <= 1 || isLoadingHistory}
                      icon={ChevronLeft}
                      className="px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </Button>
                    
                    {/* Page numbers - Simplified for mobile */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages: React.ReactElement[] = [];
                        const totalPages = pagination.last_page;
                        const current = pagination.current_page;
                        
                        // Mobile: Show fewer pages
                        const isMobile = window.innerWidth < 640;
                        const maxVisiblePages = isMobile ? 3 : 5;
                        
                        if (totalPages <= maxVisiblePages) {
                          // Show all pages if few enough
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                disabled={isLoadingHistory}
                                className={mergeClasses(
                                  "px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md border transition-colors min-w-[28px] sm:min-w-[32px]",
                                  i === current
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "hover:bg-gray-50 border-gray-200"
                                )}
                              >
                                {i}
                              </button>
                            );
                          }
                        } else {
                          // Show smart pagination
                          
                          // First page
                          if (current > 2) {
                            pages.push(
                              <button
                                key={1}
                                onClick={() => setCurrentPage(1)}
                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md border hover:bg-gray-50 min-w-[28px] sm:min-w-[32px]"
                                disabled={isLoadingHistory}
                              >
                                1
                              </button>
                            );
                            if (current > 3 && !isMobile) {
                              pages.push(<span key="dots1" className="px-1 sm:px-2 text-gray-400 text-xs">...</span> as React.ReactElement);
                            }
                          }
                          
                          // Pages around current
                          const start = Math.max(1, current - (isMobile ? 0 : 1));
                          const end = Math.min(totalPages, current + (isMobile ? 0 : 1));
                          
                          for (let i = start; i <= end; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                disabled={isLoadingHistory}
                                className={mergeClasses(
                                  "px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md border transition-colors min-w-[28px] sm:min-w-[32px]",
                                  i === current
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "hover:bg-gray-50 border-gray-200"
                                )}
                              >
                                {i}
                              </button>
                            );
                          }
                          
                          // Last page
                          if (current < totalPages - 1) {
                            if (current < totalPages - 2 && !isMobile) {
                              pages.push(<span key="dots2" className="px-1 sm:px-2 text-gray-400 text-xs">...</span> as React.ReactElement);
                            }
                            pages.push(
                              <button
                                key={totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md border hover:bg-gray-50 min-w-[28px] sm:min-w-[32px]"
                                disabled={isLoadingHistory}
                              >
                                {totalPages}
                              </button>
                            );
                          }
                        }
                        
                        return pages;
                      })()}
                    </div>
                    
                    {/* Next button - Mobile optimized */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(Math.min(pagination.last_page, currentPage + 1));
                      }}
                      disabled={currentPage >= pagination.last_page || isLoadingHistory}
                      icon={ChevronRight}
                      iconPosition="right"
                      className="px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessHistory;
