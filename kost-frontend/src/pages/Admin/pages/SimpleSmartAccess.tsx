// File: src/pages/Admin/pages/SimpleSmartAccess.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Forms/Button';
import { 
  Shield, 
  Activity, 
  DoorOpen, 
  Users, 
  Eye,
  Plus,
  RotateCcw
} from 'lucide-react';
import { useRfidEvents } from '../../../hooks';
import { esp32Service } from '../services/esp32Service';
import { iotService } from '../services/iotService';
import { formatTimeForDisplay, parseTimestamp } from '../../../utils/dateUtils';
import type { RfidCard } from '../types/rfid';
import type { Room } from '../types/room';
import type { IoTDevice } from '../types/iot';

export const SimpleSmartAccess: React.FC = () => {
  const [activeView, setActiveView] = useState<'monitor' | 'control' | 'cards'>('monitor');
  const [cards, setCards] = useState<RfidCard[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time MQTT data
  const { recentScans, deviceStatuses, isConnected } = useRfidEvents();

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cardsData, roomsData, devicesResponse] = await Promise.all([
        esp32Service.getRfidCards().catch(() => []),
        iotService.getRooms().catch(() => []),
        iotService.getDevices().catch(() => ({ devices: [] }))
      ]);

      setCards(Array.isArray(cardsData) ? cardsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setDevices(Array.isArray(devicesResponse?.devices) ? devicesResponse.devices : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoorControl = async (deviceId: string, action: 'open' | 'close') => {
    try {
      const result = action === 'open' 
        ? await esp32Service.openDoor(deviceId, 'Manual control from simple dashboard')
        : await esp32Service.closeDoor(deviceId, 'Manual control from simple dashboard');
      
      if (result.success) {
        // Visual feedback
        console.log(`✅ Door ${action} command sent to ${deviceId}`);
      }
    } catch (error) {
      console.error(`❌ Door ${action} failed:`, error);
    }
  };

  const toggleCardStatus = async (card: RfidCard) => {
    try {
      await esp32Service.updateRfidCard(card.id, {
        ...card,
        status: card.status === 'active' ? 'inactive' : 'active'
      });
      loadData();
    } catch (error) {
      console.error('Error toggling card status:', error);
    }
  };

  // Quick stats calculation
  const stats = {
    totalCards: cards.length,
    activeCards: cards.filter(c => c.status === 'active').length,
    onlineDevices: devices.filter(d => d.status === 'online').length,
    todayScans: recentScans.filter(s => 
      new Date(s.timestamp).toDateString() === new Date().toDateString()
    ).length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header dengan Real-time Status */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              🔐 Smart Access - Simple
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                MQTT {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <span className="text-sm text-gray-500">
                Last update: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cards</p>
                <p className="text-2xl font-bold">{stats.totalCards}</p>
                <p className="text-xs text-green-600">{stats.activeCards} active</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Devices</p>
                <p className="text-2xl font-bold">{devices.length}</p>
                <p className="text-xs text-green-600">{stats.onlineDevices} online</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today Scans</p>
                <p className="text-2xl font-bold">{stats.todayScans}</p>
                <p className="text-xs text-gray-500">Total access</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-bold text-green-600">
                  {isConnected ? 'Live' : 'Offline'}
                </p>
                <p className="text-xs text-gray-500">Real-time</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 flex gap-1">
          {[
            { id: 'monitor', label: '👁️ Live Monitor', icon: Eye },
            { id: 'control', label: '🚪 Door Control', icon: DoorOpen },
            { id: 'cards', label: '💳 RFID Cards', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
                activeView === tab.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          
          {/* Live Monitor */}
          {activeView === 'monitor' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Real-time Activity Monitor
              </h3>
              
              <div className="space-y-4">
                {/* Recent Scans */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {recentScans.length > 0 ? (
                    recentScans.slice(0, 10).map((scan, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        scan.access_granted 
                          ? 'bg-green-50 border-green-500' 
                          : 'bg-red-50 border-red-500'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {scan.access_granted ? '✅' : '❌'} {scan.user || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Card: {scan.uid} • {scan.device_id}
                            </p>
                            {scan.message && (
                              <p className="text-xs text-gray-500">{scan.message}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(scan.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Waiting for RFID scans...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Door Control */}
          {activeView === 'control' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-green-600" />
                Door Control Center
              </h3>
              
              <div className="grid gap-4">
                {devices.filter(device => device.device_type === 'door_lock').map(device => (
                  <div key={device.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{device.device_name}</h4>
                        <p className="text-sm text-gray-600">
                          {device.device_id} • Room: {device.room?.room_number || 'N/A'}
                        </p>
                        {device.last_seen_human && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last seen: {device.last_seen_human}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs mb-1 ${
                          device.status === 'online' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {device.status}
                        </div>
                        {device.last_seen && (
                          <div className="text-xs text-gray-400">
                            {(() => {
                              const date = parseTimestamp(device.last_seen);
                              return date ? formatTimeForDisplay(date) : 'Unknown';
                            })()} 
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDoorControl(device.device_id, 'open')}
                        disabled={device.status !== 'online'}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        🔓 Open Door
                      </Button>
                      <Button
                        onClick={() => handleDoorControl(device.device_id, 'close')}
                        disabled={device.status !== 'online'}
                        variant="outline"
                        className="flex-1"
                      >
                        🔒 Close Door
                      </Button>
                    </div>
                  </div>
                ))}
                
                {devices.filter(device => device.device_type === 'door_lock').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <DoorOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No door devices found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RFID Cards */}
          {activeView === 'cards' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  RFID Cards Management
                </h3>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Card
                </Button>
              </div>
              
              <div className="space-y-3">
                {cards.map(card => (
                  <div key={card.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{card.user?.name || 'Unknown User'}</h4>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            card.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {card.status}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          UID: {card.uid} • Room: {card.room?.room_number || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Device: {card.device_id || 'N/A'} • 
                          Access: {card.access_type || 'room_only'}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleCardStatus(card)}
                          variant="outline"
                          size="sm"
                          className={card.status === 'active' ? 'text-red-600' : 'text-green-600'}
                        >
                          {card.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {cards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No RFID cards found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Footer Status */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                🔄 Auto-refresh: 30s
              </span>
              <span className="text-gray-600">
                📡 Devices: {stats.onlineDevices}/{devices.length} online
              </span>
              <span className="text-gray-600">
                💳 Cards: {stats.activeCards}/{stats.totalCards} active
              </span>
            </div>
            <span className="text-gray-500">
              Updated: {new Date().toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};