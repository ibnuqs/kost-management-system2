// File: src/pages/Admin/components/feature/rfid/RfidForm.tsx
import React, { useState, useEffect } from 'react';
import { X, CreditCard, User, Home, Save, AlertCircle, Scan } from 'lucide-react';
import type { RfidCard, RfidFormData } from '../../../types/rfid';
import type { AdminUser as UserType } from '../../../types';
import type { Room } from '../../../types/room';
import type { IoTDevice } from '../../../types/iot';
import api from '../../../../../utils/api';
import { RfidScanModal } from './RfidScanModal';
import { esp32Service } from '../../../services/esp32Service';

interface RfidFormProps {
  isOpen: boolean;
  card?: RfidCard | null;
  users?: UserType[];
  rooms?: Room[];
  devices?: IoTDevice[];
  tenants?: any[];
  onClose: () => void;
  onSubmit: (data: RfidFormData) => void;
}

export const RfidForm: React.FC<RfidFormProps> = ({
  isOpen,
  card,
  users: propUsers,
  rooms: propRooms,
  devices,
  tenants: propTenants,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<RfidFormData>({
    uid: '',
    tenant_id: undefined,
    card_type: 'primary'
  });
  
  const [loading, setLoading] = useState(false);
  const [uidError, setUidError] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  // Load tenants data
  const loadFormData = async () => {
    setLoadingData(true);
    try {
      const tenantsResponse = await api.get('/admin/tenants').catch(() => null);

      if (tenantsResponse?.data.success) {
        setTenants(tenantsResponse.data.data || []);
      } else {
        setTenants([]);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      setTenants([]);
    } finally {
      setLoadingData(false);
    }
  };

  // Initialize form when opened
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 RfidForm opened with props:');
      console.log('👤 Users:', propUsers?.length || 0);
      console.log('🏠 Rooms:', propRooms?.length || 0);
      console.log('📡 Devices:', devices?.length || 0);
      console.log('📡 Device details:', devices?.map(d => ({ 
        device_id: d.device_id, 
        room_id: d.room_id, 
        device_name: d.device_name 
      })));
      
      // Use prop data or load from API
      if (propUsers?.length) setUsers(propUsers);
      if (propRooms?.length) setRooms(propRooms);
      
      if (!propUsers?.length || !propRooms?.length) {
        loadFormData();
      }
      
      if (card) {
        setFormData({
          uid: card.uid,
          user_id: card.user_id || undefined,
          room_id: card.room_id || undefined,
          device_id: card.device_id || undefined,
          access_type: 'room_only'
        });
      } else {
        setFormData({
          uid: '',
          user_id: undefined,
          room_id: undefined,
          device_id: undefined,
          access_type: 'room_only'
        });
      }
      setUidError('');
      setShowScanModal(false);
    }
  }, [isOpen, card, propUsers, propRooms, devices]);

  // Helper function to find device for a room
  const findDeviceForRoom = (roomId: number) => {
    if (!devices || devices.length === 0) {
      console.log('🔍 No devices available or devices is empty');
      console.log('📊 Devices state:', devices);
      return null;
    }
    
    console.log('🔍 Looking for device for room:', roomId);
    console.log('📡 Available devices:', devices);
    
    // Find device assigned to this specific room based on iot_devices.room_id
    const device = devices.find(device => {
      // Based on your data: iot_devices table has room_id column that references rooms.id
      const deviceRoomId = device.room_id; // Direct room_id from iot_devices
      const match = deviceRoomId === roomId || parseInt(deviceRoomId?.toString() || '0') === roomId;
      console.log(`📡 Device ${device.device_id}: room_id=${deviceRoomId}, looking for=${roomId}, match=${match}`);
      return match;
    });
    
    console.log('✅ Found device:', device);
    return device;
  };

  // Check if room has any device assigned
  const roomHasDevice = (roomId: number) => {
    return findDeviceForRoom(roomId) !== null;
  };

  // Auto-populate related fields when user is selected
  const handleUserChange = (userId: number | undefined) => {
    console.log('👤 User changed:', userId);
    setFormData(prev => ({ ...prev, user_id: userId }));
    
    if (userId) {
      const selectedUser = users.find(user => user.id === userId);
      console.log('👤 Selected user:', selectedUser);
      
      if (selectedUser?.tenant?.room_id) {
        const roomId = selectedUser.tenant.room_id;
        console.log('🏠 Room ID from tenant:', roomId);
        
        // Find device for this room (only real devices, no fake suggestions)
        const roomDevice = findDeviceForRoom(roomId);
        console.log('📡 Found device for room:', roomDevice);
        
        setFormData(prev => ({ 
          ...prev, 
          room_id: roomId,
          device_id: roomDevice?.device_id || undefined,
          access_type: 'room_only'
        }));
        
        console.log('✅ Auto-fill complete:', {
          room_id: roomId,
          device_id: roomDevice?.device_id || 'undefined',
          device_name: roomDevice?.device_name || 'no device'
        });
      } else {
        console.log('⚠️ User has no tenant or room_id');
      }
    } else {
      // Clear related fields when no user selected
      console.log('🔄 Clearing fields - no user selected');
      setFormData(prev => ({ 
        ...prev, 
        room_id: undefined,
        device_id: undefined
      }));
    }
  };

  const validateUid = async (uid: string): Promise<boolean> => {
    if (!uid.trim()) {
      setUidError('UID kartu harus diisi');
      return false;
    }
    if (uid.length < 4) {
      setUidError('UID kartu minimal 4 karakter');
      return false;
    }
    
    // Check for duplicate UID (only for new cards)
    if (!card) {
      try {
        const cards = await esp32Service.getRfidCards();
        const existingCard = cards.find(c => c.uid.toUpperCase() === uid.toUpperCase());
        
        if (existingCard) {
          const userName = existingCard.user?.name || 'Unknown';
          const roomNumber = existingCard.room?.room_number || 'No room';
          setUidError(`UID sudah digunakan oleh ${userName} (Kamar ${roomNumber})`);
          return false;
        }
      } catch (error) {
        console.warn('Could not check for duplicate UID:', error);
      }
    }
    
    setUidError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValidUid = await validateUid(formData.uid);
    if (!isValidUid) return;
    
    if (!formData.room_id) {
      alert('Pilih kamar terlebih dahulu');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUidChange = (value: string) => {
    setFormData(prev => ({ ...prev, uid: value }));
    if (uidError) setUidError('');
  };

  const handleCardScanned = (uid: string) => {
    setFormData(prev => ({ ...prev, uid }));
    if (uidError) setUidError('');
    setShowScanModal(false);
  };

  if (!isOpen) return null;

  const isEditMode = !!card;
  const isButtonDisabled = loading || !!uidError || !formData.uid.trim();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? 'Edit Kartu RFID' : 'Daftar Kartu RFID'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* UID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UID Kartu <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.uid}
                    onChange={(e) => handleUidChange(e.target.value.toUpperCase())}
                    disabled={isEditMode || loading}
                    placeholder="Contoh: ABCD1234"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      uidError ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => setShowScanModal(true)}
                    disabled={loading}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    <Scan className="h-4 w-4" />
                  </button>
                )}
              </div>
              {uidError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {uidError}
                </p>
              )}
              {!isEditMode && !uidError && formData.uid && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ UID valid: {formData.uid}
                </p>
              )}
            </div>

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penyewa (Opsional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={formData.user_id || ''}
                  onChange={(e) => handleUserChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  disabled={loading || loadingData}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih penyewa...</option>
                  {users.map(user => {
                    const hasRoom = user.tenant?.room_id;
                    const hasDevice = hasRoom ? roomHasDevice(user.tenant.room_id) : false;
                    return (
                      <option key={user.id} value={user.id}>
                        {user.name}
                        {user.tenant?.room ? ` - Kamar ${user.tenant.room.room_number}` : ''}
                        {hasDevice ? ' 📡' : hasRoom ? ' ⚠️' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                <p>Memilih penyewa akan mengisi kamar dan device secara otomatis</p>
                <div className="flex gap-4 mt-1">
                  <span>📡 = Ada device ESP32</span>
                  <span>⚠️ = Belum ada device</span>
                </div>
              </div>
            </div>

            {/* Access Type - Fixed to room_only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Akses
              </label>
              <div className="p-3 rounded-lg border border-blue-500 bg-blue-50">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm text-blue-700">Kamar Saja</span>
                </div>
                <p className="text-xs text-blue-600">Akses terbatas pada kamar yang ditentukan</p>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Setiap kartu RFID hanya dapat mengakses satu kamar spesifik
              </p>
            </div>

            {/* Room Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Kamar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.room_id || ''}
                    onChange={(e) => {
                      const roomId = e.target.value ? parseInt(e.target.value) : undefined;
                      if (roomId) {
                        const roomDevice = findDeviceForRoom(roomId);
                        setFormData(prev => ({ 
                          ...prev, 
                          room_id: roomId,
                          device_id: roomDevice?.device_id || undefined
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          room_id: undefined,
                          device_id: undefined
                        }));
                      }
                    }}
                    disabled={loading || loadingData || !!formData.user_id}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Pilih kamar...</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Kamar {room.room_number}
                        {room.tenant?.user ? ` - ${room.tenant.user.name}` : ' - Tersedia'}
                        {roomHasDevice(room.id) ? ' 📡' : ' ⚠️'}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.user_id && (
                  <p className="mt-1 text-xs text-blue-600">
                    ✓ Kamar otomatis terisi dari data penyewa
                  </p>
                )}
              </div>

            {/* Device ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device ESP32 (Opsional)
              </label>
              <div className="space-y-2">
                {formData.room_id && formData.device_id && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="font-medium text-green-700">Auto-detected: {formData.device_id}</span>
                      <span className="text-green-600">
                        {devices?.find(d => d.device_id === formData.device_id)?.device_name || 'ESP32 Device'}
                      </span>
                    </div>
                  </div>
                )}
                
                <input
                  type="text"
                  value={formData.device_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, device_id: e.target.value || undefined }))}
                  placeholder="Masukkan Device ID (contoh: ESP32-RFID-01)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <p className="text-xs text-gray-500">
                  Device ID akan terisi otomatis jika kamar memiliki device terdaftar. Anda juga bisa mengisi manual.
                </p>
                
                {formData.room_id && !findDeviceForRoom(formData.room_id) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-orange-700">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span>Kamar ini belum memiliki device ESP32 yang terdaftar di sistem</span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                      Silakan input Device ID secara manual atau tambahkan device ke sistem terlebih dahulu
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {formData.uid && (
              <div className="bg-gray-50 rounded-lg p-3 border">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Ringkasan:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>UID: <span className="font-mono text-gray-900">{formData.uid}</span></div>
                  <div>Penyewa: {formData.user_id ? users.find(u => u.id === formData.user_id)?.name : 'Tidak ada'}</div>
                  <div>Akses: Kamar Saja</div>
                  {formData.room_id && (
                    <div>Kamar: {rooms.find(r => r.id === formData.room_id)?.room_number}</div>
                  )}
                  {formData.device_id && (
                    <div className="flex items-center gap-1">
                      <span>Device:</span>
                      <span className="font-medium text-green-700">{formData.device_id}</span>
                      <span className="text-green-600">📡</span>
                    </div>
                  )}
                  {formData.room_id && !formData.device_id && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <span>Device: Belum ada ESP32 untuk kamar ini</span>
                      <span>⚠️</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isButtonDisabled}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditMode ? 'Update...' : 'Daftar...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? 'Update' : 'Daftar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RFID Scan Modal */}
      <RfidScanModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onCardScanned={handleCardScanned}
        scanTimeoutMs={30000}
      />
    </div>
  );
};