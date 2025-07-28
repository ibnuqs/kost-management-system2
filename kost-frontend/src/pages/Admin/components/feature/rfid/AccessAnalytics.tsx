// File: src/pages/Admin/components/feature/rfid/AccessAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import api from '../../../../../utils/api';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  Home, 
  Download,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';

interface AccessLog {
  id: number;
  timestamp: string;
  card_uid: string;
  device_id: string;
  room_id: number;
  user_id?: number;
  access_granted: boolean;
  access_type: 'rfid_scan' | 'manual_admin' | 'emergency';
  failure_reason?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  room?: {
    id: number;
    room_number: string;
  };
  device?: {
    id: number;
    device_name: string;
  };
}

interface AnalyticsStats {
  total_access_today: number;
  success_rate_today: number;
  unique_users_today: number;
  most_active_room: string;
  peak_hour: string;
  failed_attempts_today: number;
}

interface AccessAnalyticsProps {
  // Props if needed from parent
}

export const AccessAnalytics: React.FC<AccessAnalyticsProps> = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    total_access_today: 0,
    success_rate_today: 0,
    unique_users_today: 0,
    most_active_room: '-',
    peak_hour: '-',
    failed_attempts_today: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [filterUser, setFilterUser] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'granted' | 'denied'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [dateRange, filterUser, filterRoom, filterStatus]);

  // Check if backend is available
  const checkBackendAvailability = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://148.230.96.228:8000/api';
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Build filters for API request
      const filters = {
        access_granted: filterStatus,
        search: searchTerm,
        user_id: filterUser || undefined,
        room_id: filterRoom || undefined,
        date_from: dateRange === 'today' ? new Date().toISOString().split('T')[0] : 
                   dateRange === 'week' ? new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0] :
                   dateRange === 'month' ? new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0] : undefined,
        date_to: dateRange !== 'custom' ? new Date().toISOString().split('T')[0] : undefined,
        per_page: 50
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );

      // Make parallel API calls using the configured api instance
      const [logsResponse, statsResponse] = await Promise.all([
        api.get('/admin/access-logs', { params: filters }),
        api.get('/admin/access-logs/statistics', { 
          params: {
            date_from: filters.date_from || '',
            date_to: filters.date_to || ''
          }
        })
      ]);

      const logsData = logsResponse.data;
      const statsData = statsResponse.data;


      // Transform API data to match component format
      const transformedLogs = (logsData.data || []).map((log: any) => ({
        id: log.id,
        timestamp: log.accessed_at || log.created_at || new Date().toISOString(),
        card_uid: log.rfid_uid || log.card_uid || 'Unknown',
        device_id: log.device_id || 'Unknown',
        room_id: log.room_id,
        user_id: log.user_id,
        access_granted: Boolean(log.access_granted),
        access_type: log.rfid_uid === 'MANUAL_COMMAND' ? 'manual_admin' : 'rfid_scan',
        failure_reason: log.reason || (log.access_granted ? undefined : 'Access denied'),
        user: log.user ? {
          id: log.user.id,
          name: log.user.name,
          email: log.user.email || ''
        } : undefined,
        room: log.room ? {
          id: log.room.id,
          room_number: log.room.room_number
        } : log.room_id ? {
          id: log.room_id,
          room_number: log.room_id === 1 ? 'A01' : 
                      log.room_id === 7 ? 'B03' : 
                      `Room ${log.room_id}`
        } : undefined,
        device: {
          id: 1,
          device_name: log.device_id || 'Unknown Device'
        }
      }));

      // Transform stats data  
      const apiStats = statsData.data || {};
      const transformedStats = {
        total_access_today: apiStats.total_attempts || 0,
        success_rate_today: apiStats.access_rate || 0,
        unique_users_today: apiStats.unique_users || 0,
        most_active_room: apiStats.top_rooms?.[0]?.room_number || '-',
        peak_hour: apiStats.hourly_distribution?.find(h => h.count > 0)?.hour || '-',
        failed_attempts_today: apiStats.denied_access || 0
      };

      setLogs(transformedLogs);
      setStats(transformedStats);
      
    } catch (error) {
      // Set empty data if backend not available
      setLogs([]);
      setStats({
        total_access_today: 0,
        success_rate_today: 0,
        unique_users_today: 0,
        most_active_room: '-',
        peak_hour: '-',
        failed_attempts_today: 0
      });
    } finally {
      setLoading(false);
    }
  };


  const calculateStats = (logs: AccessLog[]): AnalyticsStats => {
    const today = new Date().toDateString();
    const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
    
    const totalToday = todayLogs.length;
    const successToday = todayLogs.filter(log => log.access_granted).length;
    const failedToday = totalToday - successToday;
    const successRate = totalToday > 0 ? Math.round((successToday / totalToday) * 100) : 0;
    
    // Unique users today
    const uniqueUsers = new Set(todayLogs.filter(log => log.user_id).map(log => log.user_id)).size;
    
    // Most active room
    const roomCounts = logs.reduce((acc, log) => {
      const roomKey = log.room?.room_number || 'Unknown';
      acc[roomKey] = (acc[roomKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostActiveRoom = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    
    // Peak hour
    const hourCounts = logs.reduce((acc, log) => {
      const hour = new Date(log.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    
    return {
      total_access_today: totalToday,
      success_rate_today: successRate,
      unique_users_today: uniqueUsers,
      most_active_room: mostActiveRoom,
      peak_hour: peakHour !== '-' ? `${peakHour}:00` : '-',
      failed_attempts_today: failedToday
    };
  };

  const formatDate = (dateString: string) => {
    // Handle Excel serial date format (like 45841,72942)
    if (dateString && dateString.includes(',')) {
      const parts = dateString.split(',');
      if (parts.length === 2) {
        const excelDate = parseFloat(parts[0]);
        const timeDecimal = parseFloat('0.' + parts[1]);
        
        // Convert Excel date to JavaScript date
        const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
        
        // Add time portion
        const hours = Math.floor(timeDecimal * 24);
        const minutes = Math.floor((timeDecimal * 24 - hours) * 60);
        jsDate.setHours(hours, minutes);
        
        return jsDate.toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
    
    // Handle normal ISO date format
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (granted: boolean) => {
    return granted ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✅ Diizinkan
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ❌ Ditolak
      </span>
    );
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      // Build export parameters
      const exportParams = {
        date_from: dateRange === 'today' ? new Date().toISOString().split('T')[0] : 
                   dateRange === 'week' ? new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0] :
                   dateRange === 'month' ? new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0] : 
                   new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0],
        format: format
      };

      const response = await fetch('/api/admin/access-logs/export?' + new URLSearchParams(exportParams), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const exportData = await response.json();
      
      if (exportData.success && exportData.data) {
        // Create download link for CSV
        if (format === 'csv') {
          const csvContent = exportData.data.export_data.map(row => 
            Object.values(row).map(value => 
              typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            ).join(',')
          ).join('\n');
          
          const headers = Object.keys(exportData.data.export_data[0] || {}).join(',');
          const fullCsv = headers + '\n' + csvContent;
          
          const blob = new Blob([fullCsv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = exportData.data.filename || `access_logs_${format}_${new Date().toISOString().split('T')[0]}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
        } else {
          // For PDF, handle differently or show coming soon
          alert(`Export ${format.toUpperCase()} berhasil! ${exportData.data.records_count} record diekspor.`);
        }
      } else {
        throw new Error(exportData.message || 'Export failed');
      }
      
    } catch (error) {
      // Fallback: Generate CSV from current filtered data
      if (format === 'csv' && filteredLogs.length > 0) {
        const csvData = filteredLogs.map(log => ({
          'ID': log.id,
          'Timestamp': formatDate(log.timestamp),
          'User': log.user?.name || 'Unknown',
          'Card UID': log.card_uid,
          'Room': log.room?.room_number || 'N/A',
          'Device': log.device?.device_name || log.device_id,
          'Access Granted': log.access_granted ? 'Yes' : 'No',
          'Reason': log.failure_reason || 'Success'
        }));
        
        const csvContent = csvData.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          ).join(',')
        ).join('\n');
        
        const headers = Object.keys(csvData[0] || {}).join(',');
        const fullCsv = headers + '\n' + csvContent;
        
        const blob = new Blob([fullCsv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert(`Export ${format.toUpperCase()} gagal`);
      }
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterStatus !== 'all' && 
        ((filterStatus === 'granted' && !log.access_granted) || 
         (filterStatus === 'denied' && log.access_granted))) {
      return false;
    }
    
    if (searchTerm && 
        !log.card_uid.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.room?.room_number.includes(searchTerm)) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Akses Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_access_today}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tingkat Berhasil</p>
                <p className="text-2xl font-bold text-green-600">{stats.success_rate_today}%</p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pengguna Unik</p>
                <p className="text-2xl font-bold text-purple-600">{stats.unique_users_today}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kamar Teraktif</p>
                <p className="text-lg font-bold text-orange-600">{stats.most_active_room}</p>
              </div>
              <Home className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jam Puncak</p>
                <p className="text-lg font-bold text-indigo-600">{stats.peak_hour}</p>
              </div>
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gagal Hari Ini</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed_attempts_today}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama, kartu, kamar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Waktu</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
                <option value="custom">Kustom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="granted">Diizinkan</option>
                <option value="denied">Ditolak</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">📋 Log Akses ({filteredLogs.length} entri)</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kartu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kamar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alasan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.slice(0, 50).map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.user?.name || (log.access_type === 'manual_admin' ? 'Admin' : 'Tidak Dikenal')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.user?.email || (log.access_type === 'manual_admin' ? 'Manual Control' : 'No email')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {log.card_uid}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.room?.room_number ? `Kamar ${log.room.room_number}` : 'Manual/Sistem'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(log.access_granted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.failure_reason || (log.access_granted ? 'Akses berhasil' : '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};