// File: src/pages/Admin/pages/RfidManagement.tsx
import React, { useState, useEffect } from 'react';
import { useRfid } from '../hooks';
import {
  RfidTable,
  RfidScanner,
  DoorControl,
  RfidForm,
  RfidStats,
  RfidDeviceUpdater
} from '../components/feature/rfid';
import { PageHeader } from '../components/layout';
import { Card } from '../components/ui';
import { Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { esp32Service } from '../services/esp32Service';
import type { RfidCard, RfidFormData } from '../types/rfid';
import type { ESP32Device } from '../services/esp32Service';

const RfidManagement: React.FC = () => {
  console.log('🏗️ RfidManagement component mounting...');
  
  const {
    cards,
    users,
    rooms,
    loading,
    error,
    registerCard,
    assignCard,
    toggleCardStatus,
    deleteCard,
    refresh
  } = useRfid();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<RfidCard | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [devices, setDevices] = useState<ESP32Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Load ESP32 devices for device assignment dropdown
  const loadDevices = async () => {
    setLoadingDevices(true);
    try {
      console.log('🔄 Loading ESP32 devices...');
      const devicesList = await esp32Service.getDevices();
      console.log('📡 ESP32 Service result:', devicesList);
      
      if (devicesList && devicesList.length > 0) {
        setDevices(devicesList);
        console.log('✅ Loaded ESP32 devices for RFID form:', {
          total: devicesList.length,
          devices: devicesList.map(d => ({
            id: d.id,
            device_id: d.device_id,
            device_name: d.device_name,
            device_type: d.device_type,
            room_id: d.room_id,
            status: d.status
          }))
        });
      } else {
        console.warn('⚠️ No devices returned from API');
        setDevices([]);
      }
    } catch (error) {
      console.error('❌ Failed to load ESP32 devices:', error);
      setDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    console.log('🚀 RfidManagement useEffect triggered!');
    loadDevices();
  }, []);

  const handleCardRegistered = async () => {
    // Refresh data when card is registered
    refresh();
  };

  const handleRegisterCard = async (uid: string) => {
    try {
      await registerCard(uid);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAssignCard = async (data: RfidFormData) => {
    if (!selectedCard) return;
    try {
      await assignCard(selectedCard.id, data.user_id, data.room_id);
      setShowForm(false);
      setSelectedCard(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleFormSubmit = async (data: RfidFormData) => {
    if (selectedCard) {
      // Edit existing card
      await handleAssignCard(data);
    } else {
      // Register new card
      await handleRegisterCard(data.uid);
    }
  };

  const filteredCards = cards.filter(card =>
    [card.uid, card.user?.name, card.user?.email, card.room?.room_number]
      .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: cards.length,
    active: cards.filter(c => c.status === 'active').length,
    assigned: cards.filter(c => c.user_id).length,
    unassigned: cards.filter(c => !c.user_id).length,
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="RFID & Access Control"
        description="Manage RFID cards and control door access in real-time"
        actions={[
          {
            label: 'Add Card',
            onClick: () => setShowForm(true),
            variant: 'primary'
          },
          {
            label: 'Refresh',
            onClick: refresh,
            variant: 'secondary'
          }
        ]}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel Toggle */}
      <Card>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Settings size={20}/>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Control Panel</h3>
              <p className="text-sm text-slate-500">Live scanner and remote door tools</p>
            </div>
          </div>
          <button 
            onClick={() => setShowControls(!showControls)} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <span>{showControls ? 'Hide' : 'Show'}</span>
            {showControls ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </Card>

      {/* Scanner and Door Control */}
      {showControls && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RfidScanner onCardRegistered={handleCardRegistered} />
          <DoorControl />
        </div>
      )}

      {/* Device ID Updater */}
      <RfidDeviceUpdater />

      {/* RFID Cards Table */}
      <Card>
        <RfidStats stats={stats} />
        
        <RfidTable
          cards={filteredCards}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEdit={(card) => {
            setSelectedCard(card);
            setShowForm(true);
          }}
          onToggleStatus={toggleCardStatus}
          onDelete={deleteCard}
        />
      </Card>

      {/* RFID Form Modal */}
      <RfidForm
        isOpen={showForm}
        card={selectedCard}
        users={users}
        rooms={rooms}
        devices={devices}
        onClose={() => {
          setShowForm(false);
          setSelectedCard(null);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default RfidManagement;