// File: src/pages/Admin/components/feature/rfid/SafeRealTimeMonitor.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import { Activity, Wifi, Database, Eye, EyeOff } from 'lucide-react';
import { accessLogService } from '../../../services/accessLogService';
import { useRfidEvents } from '../../../../../hooks/useRfidEvents';
import { formatTimestampWithRelative, parseTimestamp, formatTimeForDisplay, getRelativeTime, testTimestampParsing } from '../../../../../utils/dateUtils';

const SafeRealTimeMonitorInner: React.FC = () => {
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [showSystemInfo, setShowSystemInfo] = useState(true);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [todayStats, setTodayStats] = useState({
    totalScans: 0,
    granted: 0,
    denied: 0,
    lastHourActivity: 0
  });

  // Real-time MQTT data
  const { recentScans, deviceStatuses, isConnected, connectionStatus } = useRfidEvents();
  
  // Run timestamp parsing test on component mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      testTimestampParsing();
    }
  }, []);
  
  // Debug MQTT state with detailed logging
  useEffect(() => {
    console.log('🔍 MQTT Debug State:', {
      isConnected,
      connectionStatus,
      recentScansCount: recentScans?.length || 0,
      deviceStatusesCount: deviceStatuses?.size || 0,
      firstScan: recentScans?.[0] || 'none',
      allEventsCount: allEvents.length
    });
    
    // Deep debug for MQTT issues
    if (isConnected) {
      console.log('✅ MQTT Connected - ready for real-time data');
    } else {
      console.warn('❌ MQTT Not Connected:', connectionStatus);
    }
    
    if (recentScans && recentScans.length > 0) {
      console.log('📊 Recent MQTT scans received:', recentScans);
    }
  }, [isConnected, recentScans, deviceStatuses, connectionStatus, allEvents]);

  // Load initial data from backend, then switch to real-time MQTT updates
  useEffect(() => {
    console.log('🔄 Loading initial data + enabling real-time updates');
    
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load recent data from backend as starting point
        const response = await accessLogService.getLogs({ 
          per_page: 10  // Just get recent 10 events as baseline
        });
        
        if (response?.logs && Array.isArray(response.logs)) {
          const events = response.logs.map((log: any) => ({
            id: log.id,
            uid: log.rfid_uid,
            device_id: log.device_id,
            timestamp: new Date(log.accessed_at).getTime(),
            user_name: log.user?.name || 'Unknown User',
            room_number: log.room?.room_number || 'N/A',
            access_granted: log.access_granted,
            message: log.reason || (log.access_granted ? 'Access granted' : 'Access denied'),
            source: 'backend'
          }));
          
          setAllEvents(events);
          console.log(`📊 Loaded ${events.length} initial events from backend`);
          
          // Calculate initial stats
          const today = new Date().toDateString();
          const todayEvents = events.filter((event: any) => 
            new Date(event.timestamp).toDateString() === today
          );
          const granted = todayEvents.filter((event: any) => event.access_granted).length;
          const denied = todayEvents.filter((event: any) => !event.access_granted).length;
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          const lastHourActivity = events.filter((event: any) => 
            event.timestamp > oneHourAgo
          ).length;

          setTodayStats({
            totalScans: todayEvents.length,
            granted,
            denied,
            lastHourActivity
          });
        } else {
          console.log('ℹ️ No backend data, starting with empty state');
          setAllEvents([]);
          setTodayStats({
            totalScans: 0,
            granted: 0,
            denied: 0,
            lastHourActivity: 0
          });
        }
      } catch (error) {
        console.warn('⚠️ Backend not available, starting with empty state:', error);
        setAllEvents([]);
        setTodayStats({
          totalScans: 0,
          granted: 0,
          denied: 0,
          lastHourActivity: 0
        });
      } finally {
        setLoading(false);
        console.log('✅ Initial load complete, now listening for real-time MQTT updates');
      }
    };

    loadInitialData();
  }, []);

  // No auto-refresh - manual only

  // Process real-time MQTT data only - truly real-time
  useEffect(() => {
    if (recentScans && recentScans.length > 0) {
      // Convert MQTT events to our format and merge with existing events
      const mqttEvents = recentScans.map(scan => ({
        id: scan.id || `mqtt-${Date.now()}-${Math.random()}`,
        uid: scan.uid,
        device_id: scan.device_id,
        timestamp: scan.timestamp,
        user_name: scan.user_name || 'Unknown User',
        room_number: scan.room_number || 'N/A',
        access_granted: scan.access_granted,
        message: scan.message || (scan.access_granted ? 'Access granted' : 'Access denied'),
        source: 'live'
      }));

      // Merge with existing events, avoiding duplicates
      setAllEvents(prevEvents => {
        const existingIds = new Set(prevEvents.map(e => e.id));
        const newEvents = mqttEvents.filter(event => !existingIds.has(event.id));
        
        // Combine and sort by timestamp (newest first)
        const combined = [...newEvents, ...prevEvents]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50); // Keep only latest 50 events
        
        return combined;
      });

      // Update stats with real-time data
      const today = new Date().toDateString();
      const todayMqttEvents = mqttEvents.filter(event => 
        new Date(event.timestamp).toDateString() === today
      );
      
      if (todayMqttEvents.length > 0) {
        const granted = todayMqttEvents.filter(event => event.access_granted).length;
        const denied = todayMqttEvents.filter(event => !event.access_granted).length;
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const lastHourActivity = recentScans.filter(event => 
          event.timestamp > oneHourAgo
        ).length;

        setTodayStats(prev => ({
          totalScans: prev.totalScans + todayMqttEvents.length,
          granted: prev.granted + granted,
          denied: prev.denied + denied,
          lastHourActivity: lastHourActivity
        }));
      }
    }
  }, [recentScans]);
  
  // Device count for stats (if needed elsewhere)
  const deviceCount = deviceStatuses?.size || 0;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m yang lalu`;
    return `${Math.floor(minutes / 60)}h yang lalu`;
  };

  // Refresh only activity data - not the whole page
  const refreshActivityData = async () => {
    console.log('🔄 Refreshing activity data only...');
    setActivityLoading(true);
    
    try {
      // Load latest activity from backend
      const response = await accessLogService.getLogs({ 
        per_page: 15  // Get more recent events
      });
      
      if (response?.logs && Array.isArray(response.logs)) {
        const backendEvents = response.logs.map((log: any) => ({
          id: log.id,
          uid: log.rfid_uid,
          device_id: log.device_id,
          timestamp: new Date(log.accessed_at).getTime(),
          user_name: log.user?.name || 'Unknown User',
          room_number: log.room?.room_number || 'N/A',
          access_granted: log.access_granted,
          message: log.reason || (log.access_granted ? 'Access granted' : 'Access denied'),
          source: 'backend'
        }));
        
        // Merge with existing live events (keep live events at top)
        const liveEvents = allEvents.filter(e => e.source === 'live');
        const mergedEvents = [...liveEvents, ...backendEvents]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50); // Keep only latest 50
        
        setAllEvents(mergedEvents);
        
        // Update stats
        const today = new Date().toDateString();
        const todayEvents = mergedEvents.filter((event: any) => 
          new Date(event.timestamp).toDateString() === today
        );
        const granted = todayEvents.filter((event: any) => event.access_granted).length;
        const denied = todayEvents.filter((event: any) => !event.access_granted).length;
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const lastHourActivity = mergedEvents.filter((event: any) => 
          event.timestamp > oneHourAgo
        ).length;

        setTodayStats({
          totalScans: todayEvents.length,
          granted,
          denied,
          lastHourActivity
        });
        
        console.log(`✅ Activity refreshed: ${backendEvents.length} backend + ${liveEvents.length} live events`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to refresh activity:', error);
    } finally {
      setActivityLoading(false);
      setLastRefresh(Date.now());
    }
  };

  const refreshData = () => {
    refreshActivityData();
  };


  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            ⚡ Live Activity Monitor
          </h2>
          <p className="text-sm text-gray-600">Monitor aktivitas RFID secara real-time dengan auto-refresh</p>
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


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Live Activity Feed - Full Width */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    activityLoading ? 'bg-blue-500 animate-spin' : 
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  🔴 Live Activity Stream
                  {activityLoading && <span className="text-xs text-blue-600">Refreshing...</span>}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Database className="w-4 h-4" />
                  <span>{allEvents.length} events</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Last update: {new Date(lastRefresh).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshActivityData}
                    disabled={activityLoading}
                    className="text-xs ml-2"
                  >
                    {activityLoading ? '⏳' : '🔄'} Refresh Now
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">⏳</div>
                  <div className="text-lg font-medium">Loading recent activity...</div>
                  <div className="text-sm">Getting baseline data, then switching to real-time</div>
                </div>
              ) : allEvents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">{isConnected ? '👀' : '📡'}</div>
                  <div className="text-lg font-medium">
                    {isConnected ? 'Waiting for RFID activity...' : 'Connecting to MQTT...'}
                  </div>
                  <div className="text-sm">
                    {isConnected ? 'Real-time events will appear here instantly' : 'Check MQTT connection status'}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allEvents.slice(0, viewMode === 'compact' ? 10 : 20).map((event, index) => (
                    <div key={`event-${event.id}-${index}`} 
                         className={`p-3 rounded-lg border-l-4 transition-all hover:shadow-sm ${
                           event.access_granted === true ? 'border-green-500 bg-green-50' :
                           event.access_granted === false ? 'border-red-500 bg-red-50' :
                           'border-blue-500 bg-blue-50'
                         }`}>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-2xl flex-shrink-0">
                            {event.access_granted === true ? '🔓' :
                             event.access_granted === false ? '🔒' : '💳'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">
                                {event.user_name || event.tenant_name || `UID: ${event.uid.slice(-6)}`}
                              </span>
                              {event.room_number && (
                                <span className="text-xs px-2 py-1 bg-white rounded-full border">
                                  {event.room_number}
                                </span>
                              )}
                              <span className={`w-2 h-2 rounded-full ${
                                event.source === 'live' ? 'bg-green-400 animate-pulse' :
                                'bg-blue-400'
                              }`} title={
                                event.source === 'live' ? 'Live Data' :
                                'Database'
                              }></span>
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

              {/* Device Status - Improved Layout */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">🔧 Device Status</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isConnected ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      MQTT {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {(() => {
                      // Filter only real IoT devices, exclude frontend clients
                      const realDevices = deviceStatuses ? Array.from(deviceStatuses.entries())
                        .filter(([deviceId]) => 
                          // Only show ESP32/RFID devices, exclude frontend clients
                          (deviceId.startsWith('ESP32') || deviceId.includes('RFID')) &&
                          !deviceId.includes('frontend') &&
                          deviceId !== 'frontend-client'
                        ) : [];
                      
                      // Debug log device data
                      if (realDevices.length > 0 && process.env.NODE_ENV === 'development') {
                        console.group('🔧 MQTT Device Status Debug:');
                        realDevices.forEach(([id, device]) => {
                          console.log(`Device: ${id}`, {
                            status: device.status,
                            last_seen: device.last_seen,
                            last_seen_type: typeof device.last_seen,
                            wifi_connected: device.wifi_connected,
                            mqtt_connected: device.mqtt_connected,
                            full_device_data: device
                          });
                        });
                        console.groupEnd();
                      }

                      return realDevices.length > 0 ? (
                        realDevices.map(([deviceId, device]) => (
                          <div key={deviceId} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                  device.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                }`}></div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-semibold text-gray-900 truncate">
                                    {deviceId}
                                  </div>
                                  <div className={`text-xs font-medium ${
                                    device.status === 'online' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {device.status === 'online' ? 'Online' : 'Offline'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500 font-mono">
                                  {(() => {
                                    // Handle MQTT device timestamp - could be Date object or string
                                    if (device.last_seen) {
                                      // If it's already a Date object, use it directly
                                      if (device.last_seen instanceof Date) {
                                        const timeStr = formatTimeForDisplay(device.last_seen);
                                        const relativeStr = getRelativeTime(device.last_seen);
                                        return `${timeStr} (${relativeStr})`;
                                      }
                                      // Otherwise try to parse it
                                      const parsed = parseTimestamp(device.last_seen);
                                      if (parsed) {
                                        return formatTimestampWithRelative(device.last_seen);
                                      }
                                    }
                                    
                                    // Fallback: if device is online, show current time
                                    if (device.status === 'online') {
                                      return formatTimeForDisplay(new Date()) + ' (aktif sekarang)';
                                    }
                                    
                                    // Last fallback
                                    return 'Status tidak diketahui';
                                  })()
                                  }
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Last seen
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-3xl mb-3">📡</div>
                          <div className="text-sm font-medium text-gray-700 mb-1">No IoT devices detected</div>
                          <div className="text-xs text-gray-500">
                            {isConnected ? 'Waiting for ESP32/RFID devices...' : 'MQTT connection required'}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

            </>
          )}

        </div>
      </div>

      {/* Footer Info */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Mode: 📊 Manual refresh + 📡 MQTT live</span>
              <span>•</span>
              <span>Events: {allEvents.length}</span>
              <span>•</span>
              <span>Last update: {formatRelativeTime(lastRefresh)}</span>
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

// Error Boundary Component
class SafeRealTimeMonitorErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('SafeRealTimeMonitor Error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('SafeRealTimeMonitor Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-red-600">⚠️ Monitor Error</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-800 mb-2">
                  <strong>Real-time monitor encountered an error:</strong>
                </div>
                <div className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded">
                  {this.state.error?.message || 'Unknown error occurred'}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                    window.location.reload();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  🔄 Refresh Page
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                >
                  🔧 Try Again
                </Button>
              </div>
              
              <div className="text-xs text-gray-500">
                <strong>Possible causes:</strong> MQTT timestamp parsing issues, invalid data from ESP32 devices
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Main Export with Error Boundary
export const SafeRealTimeMonitor: React.FC = () => {
  return (
    <SafeRealTimeMonitorErrorBoundary>
      <SafeRealTimeMonitorInner />
    </SafeRealTimeMonitorErrorBoundary>
  );
};