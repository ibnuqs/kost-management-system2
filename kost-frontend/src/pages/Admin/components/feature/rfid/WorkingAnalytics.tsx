// File: src/pages/Admin/components/feature/rfid/WorkingAnalytics.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { BarChart3, Activity, Clock, Shield, Filter, Search, ChevronFirst, ChevronLeft, ChevronRight, ChevronLast } from 'lucide-react';
import { formatTimeForDisplay } from '../../../../../utils/dateUtils';
import { AccessLog } from '../../../types/accessLog';
import { useRfidEvents } from '../../../../../hooks';

export const WorkingAnalytics: React.FC = () => {
  // Component initialization - debug logs removed for production
  useEffect(() => {
    // Component mounted and ready to receive MQTT data
    return () => {
      // Component unmounting - cleanup
    };
  }, []);
  
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAccess: 0,
    successfulAccess: 0,
    failedAccess: 0,
    todayAccess: 0
  });

  // Add caching for faster subsequent loads
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  const CACHE_DURATION = 30000; // 30 seconds cache

  // Get MQTT real-time data
  const { recentScans } = useRfidEvents();
  
  // Listen for manual door control events
  useEffect(() => {
    const handleManualDoorLog = (event: CustomEvent) => {
      // Manual door log event received
      
      // Add the manual log to our access logs
      const manualLog: AccessLog = {
        id: event.detail.id,
        rfid_uid: event.detail.uid,
        device_id: event.detail.device_id,
        access_granted: event.detail.access_granted,
        reason: event.detail.reason,
        accessed_at: event.detail.accessed_at,
        tenant_name: event.detail.user_name,
        room_number: event.detail.room_number,
        user: event.detail.user,
        room: event.detail.room_number ? {
          id: 0,
          room_number: event.detail.room_number,
          room_name: `Room ${event.detail.room_number}`
        } : undefined
      };
      
      setAccessLogs(prev => {
        const updated = [manualLog, ...prev];
        // Updated logs with manual entry
        return updated;
      });
    };
    
    window.addEventListener('manual-door-log', handleManualDoorLog as EventListener);
    
    return () => {
      window.removeEventListener('manual-door-log', handleManualDoorLog as EventListener);
    };
  }, []);

  // Filter states
  const [filters, setFilters] = useState({
    dateRange: 'all', // all, today, yesterday, 7days, 30days, custom
    status: 'all', // all, granted, denied
    roomId: '',
    search: '',
    customStartDate: '',
    customEndDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 25,
    totalPages: 1
  });

  // Paginated data
  const [paginatedLogs, setPaginatedLogs] = useState<AccessLog[]>([]);

  // Define loadAccessLogs first - optimized for speed
  const loadAccessLogs = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Skip loading if recently loaded (unless forced refresh)
    if (!forceRefresh && now - lastLoadTime < CACHE_DURATION && accessLogs.length > 0) {
      return;
    }

    try {
      setLoading(true);
      
      // Convert MQTT real-time scans FIRST (instant, no API call needed)
      // Processing MQTT scans data
      
      const mqttLogs: AccessLog[] = (recentScans || []).map(scan => {
        const log = {
          id: scan.id,
          rfid_uid: scan.uid,
          device_id: scan.device_id,
          access_granted: scan.access_granted ?? true,
          reason: scan.message || 'Real-time access',
          accessed_at: new Date(scan.timestamp).toISOString(),
          tenant_name: scan.user_name,
          room_number: scan.room_number,
          user: scan.user ? {
            id: 0,
            name: scan.user.name,
            email: scan.user.email
          } : undefined,
          room: scan.room_number ? {
            id: 0,
            room_number: scan.room_number,
            room_name: `Room ${scan.room_number}`
          } : undefined
        };
        return log;
      });

      // Show MQTT data immediately if available
      if (mqttLogs.length > 0) {
        setAccessLogs(mqttLogs);
        setLoading(false); // Hide spinner immediately
      }

      // Parallel backend loading with timeout
      const backendPromise = Promise.race([
        (async () => {
          const { accessLogService } = await import('../../../services/accessLogService');
          return await accessLogService.getLogs({ per_page: 100 }); // Balanced performance and data coverage
        })(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000) // 5s timeout
        )
      ]) as Promise<any>;

      try {
        const response = await backendPromise;
        let backendLogs: AccessLog[] = [];
        if (response?.logs && Array.isArray(response.logs)) {
          backendLogs = response.logs;
        }

        // Only combine if we got backend data
        if (backendLogs.length > 0) {
          const combinedLogs = [...mqttLogs, ...backendLogs];
          const uniqueLogs = combinedLogs.filter((log, index, self) => 
            index === self.findIndex(l => l.id === log.id)
          );
          uniqueLogs.sort((a, b) => new Date(b.accessed_at).getTime() - new Date(a.accessed_at).getTime());
          setAccessLogs(uniqueLogs);
        }
      } catch {
        // Backend timeout - continue with MQTT data only
      }

      setLastLoadTime(now);
    } catch {
      // Complete fallback: show MQTT data only
      const mqttLogs: AccessLog[] = (recentScans || []).map(scan => ({
        id: scan.id,
        rfid_uid: scan.uid,
        device_id: scan.device_id,  
        access_granted: scan.access_granted ?? true,
        reason: scan.message || 'Real-time access',
        accessed_at: new Date(scan.timestamp).toISOString(),
        tenant_name: scan.user_name,
        room_number: scan.room_number,
        user: scan.user ? {
          id: 0,
          name: scan.user.name,
          email: scan.user.email
        } : undefined,
        room: scan.room_number ? {
          id: 0,
          room_number: scan.room_number,
          room_name: `Room ${scan.room_number}`
        } : undefined
      }));
      setAccessLogs(mqttLogs);
    } finally {
      setLoading(false);
    }
  }, [recentScans, lastLoadTime, accessLogs.length]);

  // Define filter and pagination functions after loadAccessLogs
  const applyFilters = useCallback(() => {
    let filtered = [...accessLogs];

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(log => {
        const logDate = new Date(log.accessed_at);
        
        switch (filters.dateRange) {
          case 'today':
            return logDate >= today;
          case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return logDate >= yesterday && logDate < today;
          }
          case '7days': {
            const week = new Date(today);
            week.setDate(week.getDate() - 7);
            return logDate >= week;
          }
          case '30days': {
            const month = new Date(today);
            month.setDate(month.getDate() - 30);
            return logDate >= month;
          }
          default:
            return true;
        }
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => {
        if (filters.status === 'granted') return log.access_granted;
        if (filters.status === 'denied') return !log.access_granted;
        return true;
      });
    }

    // Room filter
    if (filters.roomId) {
      filtered = filtered.filter(log => log.room_id?.toString() === filters.roomId);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.tenant_name?.toLowerCase().includes(searchLower) ||
        log.room_number?.toLowerCase().includes(searchLower) ||
        log.uid?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(filtered);
    
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [accessLogs, filters]);

  const applyPagination = useCallback(() => {
    // Optimize: Only calculate if there are logs to paginate
    if (filteredLogs.length === 0) {
      setPaginatedLogs([]);
      setPagination(prev => ({ ...prev, totalPages: 1 }));
      return;
    }

    const startIndex = (pagination.currentPage - 1) * pagination.perPage;
    const endIndex = startIndex + pagination.perPage;
    const currentPageLogs = filteredLogs.slice(startIndex, endIndex);
    
    setPaginatedLogs(currentPageLogs);
    
    // Update total pages only if changed
    const totalPages = Math.ceil(filteredLogs.length / pagination.perPage);
    if (pagination.totalPages !== totalPages) {
      setPagination(prev => ({ ...prev, totalPages }));
    }
  }, [filteredLogs, pagination.currentPage, pagination.perPage, pagination.totalPages]);

  useEffect(() => {
    loadAccessLogs();
  }, [loadAccessLogs]);



  // Apply filters whenever filters change or logs are updated
  useEffect(() => {
    applyFilters();
  }, [accessLogs, filters, applyFilters]);

  // Update stats whenever access logs change
  useEffect(() => {
    const totalAccess = accessLogs.length;
    const successfulAccess = accessLogs.filter(log => {
      return log.access_granted === true || log.access_granted === 'true' || log.access_granted === 1 || log.access_granted === '1';
    }).length;
    const failedAccess = totalAccess - successfulAccess;
    
    const today = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
    const todayAccess = accessLogs.filter(log => 
      new Date(log.accessed_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' }) === today
    ).length;

    setStats({
      totalAccess,
      successfulAccess,
      failedAccess,
      todayAccess
    });
  }, [accessLogs]);

  // Apply pagination whenever filtered logs or pagination settings change
  useEffect(() => {
    applyPagination();
  }, [filteredLogs, pagination.currentPage, pagination.perPage, applyPagination]);

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      status: 'all',
      roomId: '',
      search: '',
      customStartDate: '',
      customEndDate: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPagination(prev => ({ 
      ...prev, 
      perPage: newPerPage, 
      currentPage: 1 // Reset to first page when changing per page
    }));
  };

  const getUniqueRooms = () => {
    const uniqueRooms = accessLogs
      .filter(log => log.room && log.room.room_number)
      .map(log => ({
        id: log.room_id,
        room_number: log.room?.room_number,
        room_name: log.room?.room_name
      }))
      .filter((room, index, self) => 
        index === self.findIndex(r => r.id === room.id)
      )
      .sort((a, b) => {
        // Sort by room number
        const aNum = parseInt(a.room_number || '0');
        const bNum = parseInt(b.room_number || '0');
        return aNum - bNum;
      });
    
    return uniqueRooms;
  };

  const getPaginationInfo = () => {
    const start = (pagination.currentPage - 1) * pagination.perPage + 1;
    const end = Math.min(pagination.currentPage * pagination.perPage, filteredLogs.length);
    return { start, end };
  };

  if (loading && accessLogs.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-7 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Loading Message */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 mb-2">Memuat data real-time...</p>
                <p className="text-sm text-gray-500">Data MQTT dimuat instan • Data backend mungkin butuh waktu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          Log Akses & Analytics
        </h2>
        <p className="text-sm text-gray-600">Data akses historis dan log MQTT real-time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Berhasil</p>
                <p className="text-2xl font-bold text-green-600">{stats.successfulAccess}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gagal</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedAccess}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-600" />
              Filter & Pencarian
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
{showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
            </button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rentang Tanggal
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Waktu</option>
                  <option value="today">Hari Ini</option>
                  <option value="yesterday">Kemarin</option>
                  <option value="7days">7 Hari Terakhir</option>
                  <option value="30days">30 Hari Terakhir</option>
                  <option value="custom">Rentang Kustom</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="granted">Berhasil Saja</option>
                  <option value="denied">Ditolak Saja</option>
                </select>
              </div>

              {/* Room Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kamar
                </label>
                <select
                  value={filters.roomId}
                  onChange={(e) => setFilters({...filters, roomId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Kamar</option>
                  {getUniqueRooms().map(room => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} - {room.room_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pencarian
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    placeholder="RFID UID, Pengguna, Alasan..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={filters.customStartDate}
                    onChange={(e) => setFilters({...filters, customStartDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={filters.customEndDate}
                    onChange={(e) => setFilters({...filters, customEndDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
Reset Filter
                </button>
              </div>
              
              {/* Per Page Selector */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Tampilkan</span>
                <select
                  value={pagination.perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>per halaman</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Access Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Log Akses
              </h3>
              <div className="text-sm text-gray-600 mt-1">
                {(() => {
                  const { start, end } = getPaginationInfo();
                  return filteredLogs.length > 0 
                    ? `Menampilkan ${start}-${end} dari ${filteredLogs.length} log`
                    : `${filteredLogs.length} log ditemukan`;
                })()}
                {filteredLogs.length !== accessLogs.length && (
                  <span className="text-orange-600 ml-1">(difilter dari {accessLogs.length} total)</span>
                )}
              </div>
            </div>
            <button
              onClick={() => loadAccessLogs(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
Segarkan
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <div>
                {accessLogs.length === 0 
                  ? 'Tidak ada log akses tersedia' 
                  : 'Tidak ada log yang sesuai dengan filter saat ini'
                }
              </div>
              {accessLogs.length > 0 && filteredLogs.length === 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Waktu</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Perangkat</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Kamar</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">RFID UID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Pengguna</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Alasan</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm font-mono">
                          {formatTimeForDisplay(log.accessed_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.accessed_at).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">{log.device_id}</span>
                      </td>
                      <td className="py-3 px-4">
                        {log.room ? (
                          <div>
                            <div className="font-medium">{log.room.room_number}</div>
                            <div className="text-xs text-gray-500">{log.room.room_name}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Tidak ada kamar</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">{log.rfid_uid}</span>
                      </td>
                      <td className="py-3 px-4">
                        {log.user ? (
                          <div>
                            <div className="font-medium">{log.user.name}</div>
                            <div className="text-xs text-gray-500">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">System</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.access_granted
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
{log.access_granted ? 'Berhasil' : 'Ditolak'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{log.reason}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {filteredLogs.length > pagination.perPage && (
            <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-t border-gray-200 pt-4">
              {/* Pagination Info */}
              <div className="text-sm text-gray-600">
                {(() => {
                  const { start, end } = getPaginationInfo();
                  return `Menampilkan ${start}-${end} dari ${filteredLogs.length} log`;
                })()}
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ChevronFirst className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const { currentPage, totalPages } = pagination;
                    const pages = [];
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, currentPage + 2);
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-3 py-1 text-sm border rounded ${
                            i === currentPage
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ChevronLast className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};