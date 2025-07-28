// File: src/pages/Admin/components/feature/rfid/WorkingAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { BarChart3, Activity, Clock, Shield, Filter, Search, Calendar } from 'lucide-react';
import { formatTimeForDisplay } from '../../../../../utils/dateUtils';

interface AccessLog {
  id: number;
  device_id: string;
  rfid_uid: string;
  access_granted: boolean;
  reason: string;
  accessed_at: string;
  room_id?: number;
  user?: {
    name: string;
    email: string;
  };
  room?: {
    room_number: string;
    room_name: string;
  };
}

export const WorkingAnalytics: React.FC = () => {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAccess: 0,
    successfulAccess: 0,
    failedAccess: 0,
    todayAccess: 0
  });

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

  useEffect(() => {
    loadAccessLogs();
  }, []);

  // Apply filters whenever filters change or logs are updated
  useEffect(() => {
    applyFilters();
  }, [accessLogs, filters]);

  // Apply pagination whenever filtered logs or pagination settings change
  useEffect(() => {
    applyPagination();
  }, [filteredLogs, pagination.currentPage, pagination.perPage]);

  const loadAccessLogs = async () => {
    try {
      setLoading(true);
      
      // Try to load from access logs service - get more data for client-side pagination
      const { accessLogService } = await import('../../../services/accessLogService');
      const response = await accessLogService.getLogs({ per_page: 500 }); // Get more data (backend max: 500)
      
      console.log('📊 Access logs response:', response);
      
      if (response?.logs && Array.isArray(response.logs)) {
        setAccessLogs(response.logs);
      } else {
        console.warn('No access logs data available');
        setAccessLogs([]);
      }
    } catch (error) {
      console.error('Error loading access logs:', error);
      setAccessLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
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
          case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return logDate >= yesterday && logDate < today;
          case '7days':
            const week = new Date(today);
            week.setDate(week.getDate() - 7);
            return logDate >= week;
          case '30days':
            const month = new Date(today);
            month.setDate(month.getDate() - 30);
            return logDate >= month;
          case 'custom':
            if (filters.customStartDate && filters.customEndDate) {
              const start = new Date(filters.customStartDate);
              const end = new Date(filters.customEndDate);
              end.setHours(23, 59, 59, 999); // End of day
              return logDate >= start && logDate <= end;
            }
            return true;
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
      filtered = filtered.filter(log => 
        log.room_id === parseInt(filters.roomId)
      );
    }

    // Search filter (RFID UID, User name, Reason)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.rfid_uid.toLowerCase().includes(searchLower) ||
        log.user?.name.toLowerCase().includes(searchLower) ||
        log.reason.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(filtered);

    // Calculate stats based on filtered data
    const total = filtered.length;
    const successful = filtered.filter(log => log.access_granted).length;
    const failed = total - successful;
    const today = filtered.filter(log => {
      const logDate = new Date(log.accessed_at);
      const todayDate = new Date();
      return logDate.toDateString() === todayDate.toDateString();
    }).length;
    
    setStats({
      totalAccess: total,
      successfulAccess: successful,
      failedAccess: failed,
      todayAccess: today
    });
  };

  const applyPagination = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.perPage;
    const endIndex = startIndex + pagination.perPage;
    const currentPageLogs = filteredLogs.slice(startIndex, endIndex);
    
    setPaginatedLogs(currentPageLogs);
    
    // Update total pages
    const totalPages = Math.ceil(filteredLogs.length / pagination.perPage);
    setPagination(prev => ({ ...prev, totalPages }));
  };

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading access logs...</p>
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
          📊 Log Akses & Analytics
        </h2>
        <p className="text-sm text-gray-600">Historical access data and analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Akses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAccess}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayAccess}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
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
              Filters & Search
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📅 Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ✅ Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="granted">Granted Only</option>
                  <option value="denied">Denied Only</option>
                </select>
              </div>

              {/* Room Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏠 Room
                </label>
                <select
                  value={filters.roomId}
                  onChange={(e) => setFilters({...filters, roomId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Rooms</option>
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
                  🔍 Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    placeholder="RFID UID, User, Reason..."
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
                    Start Date
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
                    End Date
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
                  🔄 Reset Filters
                </button>
              </div>
              
              {/* Per Page Selector */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show</span>
                <select
                  value={pagination.perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </select>
                <span>per page</span>
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
                Access Logs
              </h3>
              <div className="text-sm text-gray-600 mt-1">
                {(() => {
                  const { start, end } = getPaginationInfo();
                  return filteredLogs.length > 0 
                    ? `Showing ${start}-${end} of ${filteredLogs.length} logs`
                    : `${filteredLogs.length} logs found`;
                })()}
                {filteredLogs.length !== accessLogs.length && (
                  <span className="text-orange-600 ml-1">(filtered from {accessLogs.length} total)</span>
                )}
              </div>
            </div>
            <button
              onClick={loadAccessLogs}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <div>
                {accessLogs.length === 0 
                  ? 'No access logs available' 
                  : 'No logs match the current filters'
                }
              </div>
              {accessLogs.length > 0 && filteredLogs.length === 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Device</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">RFID UID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Reason</th>
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
                          <span className="text-gray-400 italic">No room</span>
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
                          {log.access_granted ? '✅ Granted' : '❌ Denied'}
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
                  return `Showing ${start}-${end} of ${filteredLogs.length} logs`;
                })()}
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⏮️ First
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⬅️ Prev
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
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next ➡️
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last ⏭️
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};