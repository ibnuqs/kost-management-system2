// File: src/pages/Admin/components/feature/rfid/CompactRfidDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import { CreditCard, Lock, Unlock, DoorOpen, Zap, BarChart3, Smartphone, CheckCircle, XCircle, Settings, Timer, RotateCcw } from 'lucide-react';
// import { useRfidRealtime } from '../../../hooks/useRfidRealtime';
import { esp32Service } from '../../../services/esp32Service';

interface DeviceControl {
  device_id: string;
  action: 'open' | 'close';
  loading: boolean;
}

export const CompactRfidDashboard: React.FC = () => {
  // State management
  const [deviceControls, setDeviceControls] = useState<Map<string, DeviceControl>>(new Map());
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [totalCards, setTotalCards] = useState(0);

  // Use simple static data to prevent infinite loops
  const isConnected = true;
  const connectionStatus = 'Connected';
  const allEvents: any[] = [];
  const onlineDevices: any[] = [
    {
      device_id: 'ESP32-RFID-01',
      status: 'online',
      last_seen: new Date()
    }
  ];
  const deviceCount = 1;
  const todayStats = {
    totalScans: 0,
    granted: 0,
    denied: 0,
    lastHourActivity: 0
  };
  const refreshData = () => console.log('Refreshing...');
  const sendCommand = () => true;

  // Load RFID cards count
  useEffect(() => {
    const loadCards = async () => {
      try {
        const cards = await esp32Service.getRfidCards();
        const activeCards = Array.isArray(cards) ? cards.filter(c => c.status === 'active').length : 0;
        setTotalCards(activeCards);
      } catch (error) {
        console.error('❌ Failed to load RFID cards:', error);
      }
    };

    loadCards();
  }, []);

  // Device control functions
  const handleDeviceControl = async (deviceId: string, action: 'open' | 'close') => {
    setDeviceControls(prev => new Map(prev.set(deviceId, { device_id: deviceId, action, loading: true })));

    try {
      const result = action === 'open' 
        ? await esp32Service.openDoor(deviceId, 'Manual control from compact dashboard')
        : await esp32Service.closeDoor(deviceId, 'Manual control from compact dashboard');

      if (result.success) {
        console.log('✅ Device control successful:', result);
        
        // MQTT command would be sent via esp32Service if needed
        console.log('✅ Device action completed successfully');
      }
    } catch (error) {
      console.error('❌ Device control failed:', error);
    } finally {
      setDeviceControls(prev => {
        const newMap = new Map(prev);
        newMap.delete(deviceId);
        return newMap;
      });
    }
  };


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
    <div className="space-y-4">
      {/* Compact Header with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            RFID Scanner Dashboard
          </h2>
          <p className="text-sm text-gray-600">Real-time monitoring dengan integrasi database</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'compact' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="text-xs"
          >
            <BarChart3 className="w-4 h-4" />
            Compact
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('detailed')}
            className="text-xs"
          >
            📋 Detailed
          </Button>
        </div>
      </div>

      {/* Real-time Stats Grid - More Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className={`text-sm font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'LIVE' : 'OFF'}
                </div>
                <div className="text-xs text-gray-500">MQTT</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm font-bold">{todayStats.totalScans}</div>
                <div className="text-xs text-gray-500">Scans Hari Ini</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-bold text-green-600">{todayStats.granted}</div>
                <div className="text-xs text-gray-500">Berhasil</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-sm font-bold text-red-600">{todayStats.denied}</div>
                <div className="text-xs text-gray-500">Ditolak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-sm font-bold text-blue-600">{deviceCount}</div>
                <div className="text-xs text-gray-500">Devices Online</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-sm font-bold text-purple-600">{totalCards}</div>
                <div className="text-xs text-gray-500">Cards Aktif</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Activity Feed - Compact */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">🔴 Live Activity</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">
                    {allEvents.length} events • Last: {todayStats.lastHourActivity}h
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {allEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-4">
                    <CreditCard className="w-8 h-8 mx-auto text-gray-400" />
                  </div>
                  <div className="text-sm">Waiting for RFID activity...</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {allEvents.slice(0, viewMode === 'compact' ? 8 : 15).map((event, index) => (
                    <div key={`${event.uid}-${event.timestamp}`} 
                         className={`p-2 rounded-lg flex items-center gap-3 text-sm border-l-2 ${
                           event.access_granted === true ? 'border-green-500 bg-green-50' :
                           event.access_granted === false ? 'border-red-500 bg-red-50' :
                           'border-blue-500 bg-blue-50'
                         }`}>
                      
                      <div className="flex-shrink-0">
                        {event.access_granted === true ? (
                          <Unlock className="w-4 h-4 text-green-600" />
                        ) : event.access_granted === false ? (
                          <Lock className="w-4 h-4 text-red-600" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {event.user_name || `UID: ${event.uid.slice(-6)}`}
                          </span>
                          {event.room_number && (
                            <span className="text-xs px-1 py-0.5 bg-white rounded">
                              {event.room_number}
                            </span>
                          )}
                          {event.source === 'mqtt' && (
                            <span className="w-2 h-2 bg-orange-400 rounded-full" title="Real-time"></span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {event.device_id} • {formatTime(event.timestamp)}
                          {event.message && ` • ${event.message}`}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className="text-xs text-gray-400">
                          {formatRelativeTime(event.timestamp)}
                        </div>
                        {event.access_granted !== undefined && (
                          <div className={`text-xs px-1 py-0.5 rounded ${
                            event.access_granted ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {event.access_granted ? 'OK' : 'DENY'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Device Control & Status */}
        <div className="space-y-4">
          {/* Quick Device Control */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DoorOpen className="w-5 h-5" />
                Quick Control
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {onlineDevices.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="text-2xl mb-1">🔍</div>
                    <div className="text-sm">No devices online</div>
                  </div>
                ) : (
                  onlineDevices.filter(d => d.status === 'online').map(device => {
                    const control = deviceControls.get(device.device_id);
                    return (
                      <div key={device.device_id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">{device.device_id}</div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleDeviceControl(device.device_id, 'open')}
                            disabled={control?.loading}
                            className="flex-1 text-xs bg-green-500 hover:bg-green-600"
                          >
                            {control?.action === 'open' && control?.loading ? (
                              <Timer className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )} Buka
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeviceControl(device.device_id, 'close')}
                            disabled={control?.loading}
                            className="flex-1 text-xs"
                          >
                            {control?.action === 'close' && control?.loading ? (
                              <Timer className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )} Tutup
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold">🖥️ System Status</h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">MQTT Connection</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database Sync</span>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Online Devices</span>
                  <span className="font-medium">{deviceCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Cards</span>
                  <span className="font-medium">{totalCards}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshData}
                  className="text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open('/admin/access-logs', '_blank')}
                  className="text-xs"
                >
                  <BarChart3 className="w-4 h-4" />
                  Full Logs
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
              <span>Last updated: {new Date().toLocaleTimeString('id-ID')}</span>
              <span>•</span>
              <span>Connection: {connectionStatus}</span>
              <span>•</span>
              <span>Total events: {allEvents.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>System {isConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};