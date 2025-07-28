// File: src/pages/Admin/pages/SmartAccessManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Forms/Button';
import { 
  RfidTable, 
  RfidStats
} from '../components/feature/rfid';
import { RfidFormNew } from '../components/feature/rfid/RfidFormNew';
import { SafeRealTimeMonitor } from '../components/feature/rfid/SafeRealTimeMonitor';
import { SimpleDoorControl } from '../components/feature/rfid/SimpleDoorControl';
import { WorkingAnalytics } from '../components/feature/rfid/WorkingAnalytics';
import { AdminDoorControl } from '../components/feature/rfid/AdminDoorControl';
import { RfidScanner } from '../components/feature/rfid/RfidScanner';
import { Shield, CreditCard, Activity, DoorOpen, BarChart3 } from 'lucide-react';
import { useRfidEvents } from '../../../hooks';
import { esp32Service } from '../services/esp32Service';
import { iotService } from '../services/iotService';
import api from '../../../utils/api';
import type { RfidCard, RfidFormData } from '../types/rfid';
import type { Room } from '../types/room';
import type { IoTDevice } from '../types/iot';

type TabType = 'cards' | 'monitor' | 'door-control' | 'logs';

export const SmartAccessManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('monitor');
  const [showCardForm, setShowCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState<RfidCard | null>(null);
  const [cards, setCards] = useState<RfidCard[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    inactiveCards: 0,
    accessGrantedToday: 0,
    accessDeniedToday: 0,
    totalAccessToday: 0,
    successRate: 0
  });

  // Real-time MQTT data
  const { recentScans, deviceStatuses, isConnected } = useRfidEvents();

  useEffect(() => {
    loadData();
  }, []);

  // Update stats when MQTT data changes  
  useEffect(() => {
    console.log('🔍 SmartAccess: MQTT data update:', {
      recentScans: recentScans?.length || 0,
      isArray: Array.isArray(recentScans),
      firstScan: recentScans?.[0]
    });
    
    // Load from backend if no MQTT data available
    const loadAccessStats = async () => {
      try {
        // Try to get access logs from backend as fallback
        const { accessLogService } = await import('../services/accessLogService');
        const response = await accessLogService.getLogs({ per_page: 50 });
        
        if (response?.logs && Array.isArray(response.logs)) {
          const todayScans = response.logs.filter(log => 
            new Date(log.accessed_at).toDateString() === new Date().toDateString()
          );
          const grantedToday = todayScans.filter(log => log.access_granted).length;
          const totalAccessToday = todayScans.length;
          const successRate = totalAccessToday > 0 ? Math.round((grantedToday / totalAccessToday) * 100) : 0;

          console.log('📊 SmartAccess: Backend access stats:', {
            todayScans: todayScans.length,
            grantedToday,
            totalAccessToday,
            successRate
          });

          setStats(prev => ({
            ...prev,
            accessGrantedToday: grantedToday,
            totalAccessToday,
            successRate
          }));
        }
      } catch (error) {
        console.warn('⚠️ Could not load access stats from backend:', error);
        // Keep default stats - let backend provide real data
        console.log('📊 Using default access stats - no backend data available');
      }
    };
    
    if (recentScans && Array.isArray(recentScans) && recentScans.length > 0) {
      // Use MQTT data if available
      const todayScans = recentScans.filter(s => 
        new Date(s.timestamp).toDateString() === new Date().toDateString()
      );
      const grantedToday = todayScans.filter(s => s.access_granted).length;
      const totalAccessToday = todayScans.length;
      const successRate = totalAccessToday > 0 ? Math.round((grantedToday / totalAccessToday) * 100) : 0;

      console.log('📊 SmartAccess: MQTT access stats:', {
        todayScans: todayScans.length,
        grantedToday,
        totalAccessToday,
        successRate
      });

      setStats(prev => ({
        ...prev,
        accessGrantedToday: grantedToday,
        totalAccessToday,
        successRate
      }));
    } else {
      // Fallback to backend data
      console.log('⚠️ No MQTT data, loading from backend...');
      loadAccessStats();
    }
  }, [recentScans]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load cards and rooms first (priority data)
      console.log('🔄 Loading RFID data...');
      
      const [cardsData, roomsData] = await Promise.all([
        esp32Service.getRfidCards(),
        iotService.getRooms()
      ]);

      console.log('📋 Cards loaded:', cardsData?.length || 0);
      console.log('🏠 Rooms loaded:', roomsData?.length || 0);

      setCards(Array.isArray(cardsData) ? cardsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);

      // Load devices from correct API endpoint
      try {
        console.log('📡 Loading devices...');
        const devicesResponse = await iotService.getDevices();
        const devicesData = devicesResponse?.devices || [];
        setDevices(Array.isArray(devicesData) ? devicesData : []);
        console.log('📡 Devices loaded:', devicesData?.length || 0);
        
      } catch (deviceError) {
        console.warn('⚠️ Device loading failed, continuing without them:', deviceError);
        setDevices([]);
      }

      // Update card stats only (access stats will be updated by MQTT useEffect)
      const totalCards = Array.isArray(cardsData) ? cardsData.length : 0;
      const activeCount = Array.isArray(cardsData) ? cardsData.filter(c => c.status === 'active').length : 0;
      const inactiveCount = totalCards - activeCount;

      setStats(prev => ({
        ...prev,
        totalCards,
        activeCards: activeCount,
        inactiveCards: inactiveCount
      }));

    } catch (error) {
      console.error('❌ SmartAccessManagement: Error loading data:', error);
      
      // Try to load at least cards even if other data fails
      try {
        console.log('🔄 Fallback: Loading cards only...');
        const fallbackCards = await esp32Service.getRfidCards();
        setCards(Array.isArray(fallbackCards) ? fallbackCards : []);
        console.log('✅ Fallback cards loaded:', fallbackCards?.length || 0);
      } catch (fallbackError) {
        console.error('❌ Even fallback failed:', fallbackError);
        setCards([]);
      }
      
      // Set empty arrays for failed data
      setRooms([]);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSubmit = async (data: RfidFormData) => {
    console.log('📝 Submitting RFID card data:', data);
    
    try {
      let result;
      
      if (selectedCard) {
        // Update existing card - merge with existing card data to preserve status
        const updateData = {
          ...selectedCard,
          ...data,
          status: data.status || selectedCard.status || 'active'
        };
        console.log('🔄 Updating card:', updateData);
        result = await esp32Service.updateRfidCard(selectedCard.id, updateData);
      } else {
        // Create new card
        const createData = {
          ...data,
          status: data.status || 'active'
        };
        console.log('✨ Creating new card:', createData);
        result = await esp32Service.createRfidCard(createData);
      }
      
      if (result !== null) {
        console.log('✅ Card operation successful:', result);
        setShowCardForm(false);
        setSelectedCard(null);
        loadData();
      } else {
        console.error('❌ Card operation failed: null result');
        alert('Failed to save RFID card. Please check the console for details.');
      }
    } catch (error) {
      console.error('❌ Error saving card:', error);
      alert(`Error saving card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditCard = (card: RfidCard) => {
    setSelectedCard(card);
    setShowCardForm(true);
  };

  const handleDeleteCard = async (cardId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kartu ini?')) {
      try {
        await esp32Service.deleteRfidCard(cardId);
        loadData();
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const tabs = [
    { id: 'monitor' as TabType, label: '⚡ Monitor Langsung', description: 'Pemindaian RFID real-time', icon: Activity },
    { id: 'cards' as TabType, label: '💳 Kartu RFID', description: 'Kelola kartu akses', icon: CreditCard },
    { id: 'door-control' as TabType, label: '🚪 Kontrol Pintu', description: 'Akses pintu manual', icon: DoorOpen },
    { id: 'logs' as TabType, label: '📊 Log Akses', description: 'Monitoring aktivitas', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              🔐 Manajemen Akses Pintar
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              Sistem kontrol akses RFID, manajemen pintu, dan monitoring lengkap
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={loadData}
              disabled={loading}
              className="text-xs lg:text-sm"
            >
              🔄 Segarkan
            </Button>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Kartu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kartu Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCards}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kartu Nonaktif</p>
                <p className="text-2xl font-bold text-gray-500">{stats.inactiveCards}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <CreditCard className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Akses Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAccessToday}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tingkat Berhasil</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Koneksi</p>
                <p className={`text-lg font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Terhubung' : 'Terputus'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className={`w-6 h-6 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Tabs */}
          <div className="hidden md:flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 p-4 text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 border-b-2 border-blue-500'
                      : 'hover:bg-gray-50 border-b-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activeTab === tab.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <div className={`font-medium ${
                        activeTab === tab.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {tab.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Mobile Tabs */}
          <div className="md:hidden p-4">
            <div className="relative">
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value as TabType)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                {tabs.map(tab => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label} - {tab.description}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'monitor' && (
            <div className="animate-fadeIn">
              {/* Real-time monitoring + Live activity only */}
              <SafeRealTimeMonitor />
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="animate-fadeIn">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        💳 Manajemen Kartu RFID
                      </h3>
                      <p className="text-gray-600 mt-1">Tambah, edit, dan kelola kartu akses</p>
                    </div>
                    <Button
                      onClick={() => setShowCardForm(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Tambah Kartu Baru
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <RfidTable 
                    cards={cards.filter(card => 
                      !searchTerm || 
                      card.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      card.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      card.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      card.room?.room_number?.toString().includes(searchTerm)
                    )}
                    loading={loading}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}
                    onToggleStatus={async (cardId) => {
                      const card = cards.find(c => c.id === cardId);
                      if (card) {
                        await esp32Service.updateRfidCard(card.id, {
                          ...card,
                          status: card.status === 'active' ? 'inactive' : 'active'
                        });
                        loadData();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'door-control' && (
            <div className="animate-fadeIn">
              {/* Manual control + Emergency access only */}
              <SimpleDoorControl 
                rooms={rooms}
                devices={devices}
                onDoorControl={async (request) => {
                  // Find device_id for the room (same logic as RFID cards)
                  const room = rooms.find(r => r.id === request.room_id);
                  if (!room) {
                    alert('❌ Room not found');
                    return false;
                  }
                  
                  // Find IoT device for this room
                  const device = devices.find(d => d.room_id === room.id);
                  const deviceId = device ? device.device_id : `ESP32-RFID-${String(room.id).padStart(2, '0')}`;
                  
                  // Try ESP32 service first (recommended approach)
                  try {
                    const result = request.action === 'open_door'
                      ? await esp32Service.openDoor(deviceId, request.reason || 'Admin manual control')
                      : await esp32Service.closeDoor(deviceId, request.reason || 'Admin manual control');
                    
                    if (result && (result.success || result.status === 'sent')) {
                      alert(`✅ Door ${request.action.replace('_', ' ')} command sent successfully!`);
                      return true;
                    }
                  } catch (error) {
                    console.warn('ESP32 service failed, trying MQTT fallback:', error);
                  }
                  
                  // Fallback to direct MQTT with dynamic device_id
                  try {
                    if ((window as any).mqttService && (window as any).mqttService.publish) {
                      const command = {
                        command: request.action,
                        device_id: deviceId,
                        timestamp: Date.now(),
                        reason: request.reason || 'Admin manual control',
                        from: 'admin_dashboard'
                      };
                      
                      const success = (window as any).mqttService.publish('rfid/command', JSON.stringify(command));
                      
                      if (success) {
                        alert(`📡 MQTT door ${request.action.replace('_', ' ')} command sent!`);
                        return true;
                      }
                    }
                  } catch (mqttError) {
                    console.error('MQTT fallback failed:', mqttError);
                  }
                  
                  // Final fallback: API call with dynamic device_id
                  try {
                    const response = await api.post('/test-door-control-frontend', {
                      device_id: deviceId,
                      command: request.action,
                      reason: request.reason || 'Admin manual control via API fallback'
                    });
                    
                    if (response.data.success) {
                      alert(`🌐 API door ${request.action.replace('_', ' ')} command sent!`);
                      return true;
                    }
                  } catch (apiError) {
                    console.error('API fallback failed:', apiError);
                  }
                  
                  alert('❌ Door control failed. All methods failed.');
                  return false;
                }}
              />
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="animate-fadeIn">
              {/* Historical data + Detailed analytics only */}
              <WorkingAnalytics />
            </div>
          )}
        </div>

        {/* RFID Card Form Modal */}
        <RfidFormNew
          isOpen={showCardForm}
          card={selectedCard}
          onClose={() => {
            setShowCardForm(false);
            setSelectedCard(null);
          }}
          onSubmit={handleCardSubmit}
        />

        {/* Enhanced System Status Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="grid grid-cols-2 lg:flex lg:items-center gap-4 lg:gap-8">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  MQTT {isConnected ? 'Terhubung' : 'Terputus'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${deviceStatuses?.size > 0 ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {deviceStatuses?.size || 0} ESP32 Aktif
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stats.activeCards > 0 ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {stats.activeCards} Kartu Aktif
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${recentScans?.length > 0 ? 'bg-orange-400' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {recentScans?.length || 0} Pemindaian Terkini
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center lg:text-right">
              Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};