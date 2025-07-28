// File: src/pages/Admin/components/feature/rfid/RfidFormNew.tsx
import React, { useState, useEffect } from 'react';
import { X, CreditCard, User, Home, Save, AlertCircle, Scan } from 'lucide-react';
import type { RfidCard, RfidFormData } from '../../../types/rfid';
import api from '../../../../../utils/api';
import { RfidScanModal } from './RfidScanModal';

interface RfidFormProps {
  isOpen: boolean;
  card?: RfidCard | null;
  onClose: () => void;
  onSubmit: (data: RfidFormData) => void;
}

export const RfidFormNew: React.FC<RfidFormProps> = ({
  isOpen,
  card,
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
      const tenantsResponse = await api.get('/admin/tenants');

      if (tenantsResponse?.data.success) {
        setTenants(tenantsResponse.data.data || []);
      } else {
        setTenants([]);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      setTenants([]);
    } finally {
      setLoadingData(false);
    }
  };

  // Initialize form when opened
  useEffect(() => {
    if (isOpen) {
      loadFormData();
      
      if (card) {
        setFormData({
          uid: card.uid,
          tenant_id: card.tenant_id || undefined,
          card_type: card.card_type || 'primary'
        });
      } else {
        setFormData({
          uid: '',
          tenant_id: undefined,
          card_type: 'primary'
        });
      }
      setUidError('');
      setShowScanModal(false);
    }
  }, [isOpen, card]);

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
        const response = await api.get(`/admin/rfid/check-card/${uid}`);
        if (response.data.exists) {
          setUidError('UID sudah digunakan oleh kartu lain');
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
    
    if (!formData.tenant_id) {
      alert('Pilih tenant terlebih dahulu');
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

            {/* Tenant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Tenant <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={formData.tenant_id || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tenant_id: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  disabled={loading || loadingData}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih tenant...</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.user?.name || 'Unknown'} - Kamar {tenant.room?.room_number || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Kartu akan mengikuti kamar tenant yang dipilih
              </p>
            </div>

            {/* Card Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Kartu
              </label>
              <div className="space-y-2">
                {['primary', 'backup', 'temporary'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="card_type"
                      value={type}
                      checked={formData.card_type === type}
                      onChange={(e) => setFormData(prev => ({ ...prev, card_type: e.target.value }))}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {type === 'primary' && 'Kartu Utama'}
                      {type === 'backup' && 'Kartu Cadangan'}
                      {type === 'temporary' && 'Kartu Sementara'}
                    </span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Kartu utama akan menonaktifkan kartu utama lama jika ada
              </p>
            </div>

            {/* Summary */}
            {formData.uid && formData.tenant_id && (
              <div className="bg-gray-50 rounded-lg p-3 border">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Ringkasan:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>UID: <span className="font-mono text-gray-900">{formData.uid}</span></div>
                  <div>Tenant: {tenants.find(t => t.id === formData.tenant_id)?.user?.name}</div>
                  <div>Kamar: {tenants.find(t => t.id === formData.tenant_id)?.room?.room_number}</div>
                  <div>Tipe: {formData.card_type}</div>
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