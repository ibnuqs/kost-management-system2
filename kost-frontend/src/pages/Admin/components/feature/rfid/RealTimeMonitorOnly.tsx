// File: src/pages/Admin/components/feature/rfid/RealTimeMonitorOnly.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import { useRfidRealtime } from '../../../hooks/useRfidRealtime';
import { Activity, Wifi, Database, Eye, EyeOff } from 'lucide-react';

export const RealTimeMonitorOnly: React.FC = () => {
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [showSystemInfo, setShowSystemInfo] = useState(true);

  // Use the fixed hook without infinite loops
  const {
    isConnected,
    connectionStatus,
    allEvents,
    onlineDevices,
    deviceCount,
    todayStats,
    refreshData
  } = useRfidRealtime();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m yang lalu`;
    return `${Math.floor(minutes / 60)}h yang lalu`;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            ⚡ Real-time Monitor
          </h2>
          <p className="text-sm text-gray-600">Live monitoring RFID activity - tanpa kontrol manual</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'compact' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="text-xs"
          >
            📱 Compact
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('detailed')}
            className="text-xs"
          >
            📋 Detailed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSystemInfo(!showSystemInfo)}
            className="text-xs"
          >
            {showSystemInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Real-time Stats - Focused on monitoring only */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                <Wifi className={`w-5 h-5 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <div className={`text-lg font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'LIVE' : 'OFF'}
                </div>
                <div className="text-xs text-gray-500">Connection</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{todayStats.totalScans}</div>
                <div className="text-xs text-gray-500">Scans Hari Ini</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <span className="text-lg">✅</span>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{todayStats.granted}</div>
                <div className="text-xs text-gray-500">Akses Berhasil</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <span className="text-lg">❌</span>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{todayStats.denied}</div>
                <div className="text-xs text-gray-500">Akses Ditolak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <span className="text-lg">🔧</span>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{deviceCount}</div>
                <div className="text-xs text-gray-500">Devices Online</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Live Activity Feed - Main Focus */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  🔴 Live Activity Stream
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Database className="w-4 h-4" />
                  <span>{allEvents.length} events</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {allEvents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">📡</div>
                  <div className="text-lg font-medium">Waiting for RFID Activity...</div>
                  <div className="text-sm">Scan kartu RFID untuk melihat aktivitas real-time</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allEvents.slice(0, viewMode === 'compact' ? 10 : 20).map((event, index) => (
                    <div key={`${event.uid}-${event.timestamp}`} 
                         className={`p-3 rounded-lg border-l-4 transition-all hover:shadow-sm ${
                           event.access_granted === true ? 'border-green-500 bg-green-50' :
                           event.access_granted === false ? 'border-red-500 bg-red-50' :
                           'border-blue-500 bg-blue-50'
                         } ${index === 0 && event.source === 'mqtt' ? 'ring-2 ring-blue-200' : ''}`}>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-2xl flex-shrink-0">
                            {event.access_granted === true ? '🔓' :
                             event.access_granted === false ? '🔒' : '💳'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">
                                {event.user_name || `UID: ${event.uid.slice(-6)}`}
                              </span>
                              {event.room_number && (
                                <span className="text-xs px-2 py-1 bg-white rounded-full border">
                                  {event.room_number}
                                </span>
                              )}
                              {event.source === 'mqtt' && (
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Real-time"></span>
                              )}
                            </div>
                            
                            {viewMode === 'detailed' && (
                              <div className="text-xs text-gray-600 space-y-1">
                                <div>Device: {event.device_id}</div>
                                <div>Time: {formatTime(event.timestamp)}</div>
                                {event.message && <div>Reason: {event.message}</div>}
                              </div>
                            )}
                            
                            {viewMode === 'compact' && (
                              <div className="text-xs text-gray-500">
                                {event.device_id} • {formatTime(event.timestamp)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="text-xs text-gray-400">
                            {formatRelativeTime(event.timestamp)}
                          </div>
                          {event.access_granted !== undefined && (
                            <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                              event.access_granted 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-red-200 text-red-800'
                            }`}>
                              {event.access_granted ? 'GRANTED' : 'DENIED'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Information Panel */}
        <div className="space-y-4">
          {showSystemInfo && (
            <>
              {/* Device Status */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold">🔧 Device Status</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  {onlineDevices.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-3xl mb-2">📱</div>
                      <div className="text-sm">No devices detected</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {onlineDevices.slice(0, 5).map(device => (
                        <div key={device.device_id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <div className="text-sm font-medium truncate">
                              {device.device_id}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {device.last_seen.toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Connection Health */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold">📡 Connection Health</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">MQTT Status</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {connectionStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database Sync</span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Hour Activity</span>
                      <span className="font-medium">{todayStats.lastHourActivity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">
                        {todayStats.totalScans > 0 
                          ? Math.round((todayStats.granted / todayStats.totalScans) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Quick Actions - Monitor Only */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  className="w-full text-xs"
                >
                  🔄 Refresh Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/admin/access-logs', '_blank')}
                  className="w-full text-xs"
                >
                  📊 Full Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Info */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Mode: Real-time monitoring only</span>
              <span>•</span>
              <span>Events: {allEvents.length}</span>
              <span>•</span>
              <span>Updated: {new Date().toLocaleTimeString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};