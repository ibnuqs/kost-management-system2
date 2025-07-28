// File: src/pages/Admin/pages/RfidRealTimeManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Forms/Button';
import { 
  RfidRealTimeMonitor, 
  RfidAccessControl,
  AdminDoorControl
} from '../components/feature/rfid';
import { SimpleRfidMonitor } from '../components/feature/rfid/SimpleRfidMonitor';
import { CompactRfidDashboard } from '../components/feature/rfid/CompactRfidDashboard';
import { ESP32Dashboard } from '../components/feature/iot';
import { useRfidEvents } from '../../../hooks';
import { esp32Service } from '../services/esp32Service';

type TabType = 'dashboard' | 'simple' | 'monitor' | 'access-control' | 'door-control' | 'devices';

export const RfidRealTimeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState({
    totalCards: 0,
    accessGrantedToday: 0,
    accessDeniedToday: 0,
    activeCards: 0
  });
  
  // Get real-time MQTT data
  const { recentScans, deviceStatuses, isConnected, connectionStatus } = useRfidEvents();

  // Update stats when data changes
  useEffect(() => {
    const updateStats = async () => {
      try {
        const cards = await esp32Service.getRfidCards();
        const accessAttempts = await esp32Service.getAccessAttempts(100);
        
        const today = new Date().toDateString();
        const todayAttempts = Array.isArray(accessAttempts) ? accessAttempts.filter(attempt => 
          new Date(attempt.timestamp).toDateString() === today
        ) : [];
        
        setStats({
          totalCards: Array.isArray(cards) ? cards.length : 0,
          activeCards: Array.isArray(cards) ? cards.filter(c => c.status === 'active').length : 0,
          accessGrantedToday: Array.isArray(todayAttempts) ? todayAttempts.filter(a => a.access_granted).length : 0,
          accessDeniedToday: Array.isArray(todayAttempts) ? todayAttempts.filter(a => !a.access_granted).length : 0
        });
      } catch (error) {
        console.error('Error updating stats:', error);
      }
    };
    
    updateStats();
    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, [recentScans]); // Update when new scans come in

  const tabs = [
    { id: 'dashboard' as TabType, label: '📊 Smart Dashboard', description: 'Compact view with DB integration' },
    { id: 'simple' as TabType, label: '⚡ Simple Monitor', description: 'Clean, focused real-time view' },
    { id: 'monitor' as TabType, label: '📡 Advanced Monitor', description: 'Detailed RFID scans and device status' },
    { id: 'access-control' as TabType, label: '🔐 Access Control', description: 'Manage RFID cards and permissions' },
    { id: 'door-control' as TabType, label: '🚪 Door Control', description: 'Manual door control by admin' },
    { id: 'devices' as TabType, label: '🔧 ESP32 Devices', description: 'Device management and control' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header - Improved */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">RFID Real-Time Management</h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Monitor and control your ESP32 RFID access system in real-time
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="text-xs lg:text-sm">
              📊 Export Logs
            </Button>
            <Button className="text-xs lg:text-sm">
              ⚙️ Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                  <span className="text-xl">{isConnected ? '📡' : '📵'}</span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className={`text-lg font-bold truncate ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'LIVE' : 'OFFLINE'}
                  </div>
                  <div className="text-xs font-medium text-gray-500">MQTT Status</div>
                  <div className="text-xs text-gray-400 truncate">
                    {isConnected ? 'Real-time active' : 'Not connected'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100">
                  <span className="text-xl">🔓</span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className="text-lg font-bold text-green-600">{stats.accessGrantedToday}</div>
                  <div className="text-xs font-medium text-gray-500">Access Granted</div>
                  <div className="text-xs text-gray-400">Today's scans</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100">
                  <span className="text-xl">🚫</span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className="text-lg font-bold text-red-600">{stats.accessDeniedToday}</div>
                  <div className="text-xs font-medium text-gray-500">Access Denied</div>
                  <div className="text-xs text-gray-400">Failed attempts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-purple-100">
                  <span className="text-xl">💳</span>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <div className="text-lg font-bold text-purple-600">{stats.activeCards}</div>
                  <div className="text-xs font-medium text-gray-500">RFID Cards</div>
                  <div className="text-xs text-gray-400">Active cards</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs - Mobile Friendly */}
        <Card>
          <CardHeader className="p-0">
            <div className="border-b border-gray-200">
              {/* Desktop Tabs */}
              <nav className="hidden md:flex space-x-8 p-4">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{tab.label}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {tab.description}
                    </div>
                  </button>
                ))}
              </nav>
              
              {/* Mobile Dropdown */}
              <div className="md:hidden p-4">
                <select 
                  value={activeTab} 
                  onChange={(e) => setActiveTab(e.target.value as TabType)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {tabs.map(tab => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label} - {tab.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tab Content - Better Spacing */}
        <div className="min-h-[500px]">
          {activeTab === 'dashboard' && (
            <div className="animate-fadeIn">
              <CompactRfidDashboard />
            </div>
          )}

          {activeTab === 'simple' && (
            <div className="animate-fadeIn">
              <SimpleRfidMonitor />
            </div>
          )}

          {activeTab === 'monitor' && (
            <div className="animate-fadeIn">
              <RfidRealTimeMonitor />
            </div>
          )}

          {activeTab === 'access-control' && (
            <div className="animate-fadeIn">
              <RfidAccessControl />
            </div>
          )}

          {activeTab === 'door-control' && (
            <div className="animate-fadeIn">
              <AdminDoorControl 
                rooms={[]} // Will be populated from API
                devices={[]} // Will be populated from MQTT/API
                onDoorControl={async (request) => {
                  console.log('🚪 Door control request received:', request);
                  
                  // Try ESP32 service first (recommended approach)
                  try {
                    const deviceId = 'ESP32-RFID-01'; // Default device for testing
                    console.log(`🔧 Using ESP32 service for room ${request.room_id} -> device ${deviceId}`);
                    
                    const result = request.action === 'open_door'
                      ? await esp32Service.openDoor(deviceId, request.reason || 'Admin manual control')
                      : await esp32Service.closeDoor(deviceId, request.reason || 'Admin manual control');
                    
                    if (result.success) {
                      console.log('✅ ESP32 service success:', result);
                      return true;
                    } else {
                      console.warn('⚠️ ESP32 service failed, trying MQTT fallback:', result);
                    }
                  } catch (error) {
                    console.warn('❌ ESP32 service error, trying MQTT fallback:', error);
                  }
                  
                  // Fallback to direct MQTT with fixed format
                  if (window.mqttService && window.mqttService.publish) {
                    // ESP32 expects device_id, not room_id
                    const command = {
                      command: request.action,
                      device_id: 'ESP32-RFID-01', // Map room to device_id
                      timestamp: Date.now(),
                      reason: request.reason || 'Admin manual control',
                      from: 'admin_dashboard'
                    };
                    
                    console.log('🚪 Door control command sent via MQTT:', command);
                    const success = window.mqttService.publish('rfid/command', JSON.stringify(command));
                    return success;
                  }
                  
                  console.error('❌ No available door control method');
                  return false;
                }}
              />
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="animate-fadeIn">
              <ESP32Dashboard />
            </div>
          )}
        </div>

        {/* System Status Footer - Responsive */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="grid grid-cols-2 lg:flex lg:items-center gap-3 lg:gap-6 text-xs lg:text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <span className="truncate">System {isConnected ? 'Online' : 'Offline'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
                  <span className="truncate">MQTT {isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${deviceStatuses?.size > 0 ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
                  <span className="truncate">{deviceStatuses?.size || 0} ESP32 Device{(deviceStatuses?.size || 0) !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${recentScans?.length > 0 ? 'bg-orange-400' : 'bg-gray-400'}`}></div>
                  <span className="truncate">{recentScans?.length || 0} Recent Scan{(recentScans?.length || 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 text-center lg:text-right">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};