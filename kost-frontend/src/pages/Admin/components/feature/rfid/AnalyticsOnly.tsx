// File: src/pages/Admin/components/feature/rfid/AnalyticsOnly.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import type { AccessLog } from '../../../types/accessLog';
// import { useAccessLogs } from '../../../hooks/useAccessLogs';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Filter,
  TrendingUp,
  Users,
  Clock,
  Shield,
  AlertTriangle,
  FileText,
  Search,
  RefreshCw
} from 'lucide-react';

interface DateRange {
  start: string;
  end: string;
}

interface AnalyticsStats {
  totalAccess: number;
  successRate: number;
  uniqueUsers: number;
  peakHour: string;
  mostActiveRoom: string;
  securityAlerts: number;
}

export const AnalyticsOnly: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [filterUser, setFilterUser] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'granted' | 'denied'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('analytics');
  const [stats, setStats] = useState<AnalyticsStats>({
    totalAccess: 0,
    successRate: 0,
    uniqueUsers: 0,
    peakHour: '00:00',
    mostActiveRoom: 'N/A',
    securityAlerts: 0
  });

  // Simple mock data for now
  const accessLogsData = { logs: [] as AccessLog[], total: 0 };
  const isLoading = false;
  const refetch = () => console.log('Refreshing data...');

  // Calculate analytics from data
  useEffect(() => {
    if (accessLogsData?.logs) {
      const logs = accessLogsData.logs;
      
      // Filter logs based on search criteria
      const filteredLogs = logs.filter(log => {
        const userMatch = !filterUser || log.user?.name?.toLowerCase().includes(filterUser.toLowerCase());
        const roomMatch = !filterRoom || log.room?.room_number?.toLowerCase().includes(filterRoom.toLowerCase());
        return userMatch && roomMatch;
      });

      // Calculate statistics
      const totalAccess = filteredLogs.length;
      const grantedAccess = filteredLogs.filter(log => log.access_granted).length;
      const successRate = totalAccess > 0 ? Math.round((grantedAccess / totalAccess) * 100) : 0;
      const uniqueUsers = new Set(filteredLogs.map(log => log.user_id).filter(Boolean)).size;
      
      // Find peak hour
      const hourCounts = filteredLogs.reduce((acc, log) => {
        const hour = new Date(log.accessed_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      const peakHour = Object.keys(hourCounts).reduce((a, b) => 
        hourCounts[Number(a)] > hourCounts[Number(b)] ? a : b, '0'
      );

      // Find most active room
      const roomCounts = filteredLogs.reduce((acc, log) => {
        const room = log.room?.room_number || 'Unknown';
        acc[room] = (acc[room] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostActiveRoom = Object.keys(roomCounts).reduce((a, b) => 
        roomCounts[a] > roomCounts[b] ? a : b, 'N/A'
      );

      // Count security alerts (denied access)
      const securityAlerts = filteredLogs.filter(log => !log.access_granted).length;

      setStats({
        totalAccess,
        successRate,
        uniqueUsers,
        peakHour: `${String(peakHour).padStart(2, '0')}:00`,
        mostActiveRoom,
        securityAlerts
      });
    }
  }, [accessLogsData, filterUser, filterRoom]);

  const handleExport = () => {
    if (!accessLogsData?.logs) return;
    
    const csvContent = [
      ['Date', 'Time', 'User', 'Room', 'RFID UID', 'Device ID', 'Status', 'Reason'].join(','),
      ...accessLogsData.logs.map(log => [
        new Date(log.accessed_at).toLocaleDateString(),
        new Date(log.accessed_at).toLocaleTimeString(),
        log.user?.name || 'Unknown',
        log.room?.room_number || 'N/A',
        log.rfid_uid,
        log.device_id,
        log.access_granted ? 'Granted' : 'Denied',
        log.reason || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access_logs_${dateRange.start}_to_${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (granted: boolean) => {
    return granted ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  // Quick date range presets
  const datePresets = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 }
  ];

  const setDatePreset = (days: number) => {
    const end = new Date().toISOString().split('T')[0];
    const start = days === 0 
      ? end 
      : new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setDateRange({ start, end });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            📊 Access Analytics & History
          </h2>
          <p className="text-sm text-gray-600">Historical data analysis dan detailed reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'analytics' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('analytics')}
            className="text-xs"
          >
            📈 Analytics
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="text-xs"
          >
            📋 Table
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!accessLogsData?.logs?.length}
            className="text-xs"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">🔍 Data Filters</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {/* Date Range */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-1 mt-2">
                {datePresets.map(preset => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => setDatePreset(preset.days)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
              <input
                type="text"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                placeholder="Search user..."
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Room Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
              <input
                type="text"
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                placeholder="Search room..."
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="granted">Granted</option>
                <option value="denied">Denied</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-end">
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isLoading ? 'Loading...' : 'Apply'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{stats.totalAccess}</div>
                    <div className="text-xs text-gray-500">Total Access</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{stats.successRate}%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">{stats.uniqueUsers}</div>
                    <div className="text-xs text-gray-500">Unique Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-100">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{stats.peakHour}</div>
                    <div className="text-xs text-gray-500">Peak Hour</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-indigo-100">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-indigo-600">{stats.mostActiveRoom}</div>
                    <div className="text-xs text-gray-500">Most Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">{stats.securityAlerts}</div>
                    <div className="text-xs text-gray-500">Security Alerts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">📈 Access Trends</h3>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <div>Access trends chart</div>
                    <div className="text-sm">Coming soon</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">🕐 Hourly Distribution</h3>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2" />
                    <div>Hourly distribution chart</div>
                    <div className="text-sm">Coming soon</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              📋 Access Log Details
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading access logs...</span>
              </div>
            ) : !accessLogsData?.logs?.length ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <div className="text-lg font-medium">No access logs found</div>
                <div className="text-sm">Try adjusting your filter criteria</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-medium text-gray-700">Date & Time</th>
                      <th className="text-left p-3 font-medium text-gray-700">User</th>
                      <th className="text-left p-3 font-medium text-gray-700">Room</th>
                      <th className="text-left p-3 font-medium text-gray-700">RFID UID</th>
                      <th className="text-left p-3 font-medium text-gray-700">Device</th>
                      <th className="text-left p-3 font-medium text-gray-700">Status</th>
                      <th className="text-left p-3 font-medium text-gray-700">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessLogsData.logs
                      .filter(log => {
                        const userMatch = !filterUser || log.user?.name?.toLowerCase().includes(filterUser.toLowerCase());
                        const roomMatch = !filterRoom || log.room?.room_number?.toLowerCase().includes(filterRoom.toLowerCase());
                        return userMatch && roomMatch;
                      })
                      .map(log => (
                        <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3">
                            <div>{new Date(log.accessed_at).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.accessed_at).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{log.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{log.user?.email}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {log.room?.room_number || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {log.rfid_uid}
                            </code>
                          </td>
                          <td className="p-3">
                            <span className="text-xs">{log.device_id}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.access_granted)}`}>
                              {log.access_granted ? 'Granted' : 'Denied'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-gray-600">{log.reason || 'N/A'}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Period: {dateRange.start} to {dateRange.end}</span>
              <span>•</span>
              <span>Total records: {accessLogsData?.total || 0}</span>
              <span>•</span>
              <span>Filtered: {stats.totalAccess}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};