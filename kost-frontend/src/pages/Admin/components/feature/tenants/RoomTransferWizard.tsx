// File: src/pages/Admin/components/feature/tenants/RoomTransferWizard.tsx
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Home, DollarSign, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { roomService } from '../../../services/roomService';
import { tenantService } from '../../../services/tenantService';
import type { Tenant } from '../../../types/tenant';
import type { Room } from '../../../types/room';

interface RoomTransferWizardProps {
  isOpen: boolean;
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface TransferData {
  targetRoomId: string;
  transferDate: string;
  notes: string;
}

interface BillingCalculation {
  currentRent: number;
  newRent: number;
  rentDifference: number;
  effectiveDate: string;
  proRataAdjustment: number;
}

export const RoomTransferWizard: React.FC<RoomTransferWizardProps> = ({
  isOpen,
  tenant,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [transferData, setTransferData] = useState<TransferData>({
    targetRoomId: '',
    transferDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [billingCalculation, setBillingCalculation] = useState<BillingCalculation | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Load available rooms
  useEffect(() => {
    if (isOpen && currentStep === 1) {
      loadAvailableRooms();
    }
  }, [isOpen, currentStep]);

  // Calculate billing when room is selected
  useEffect(() => {
    if (transferData.targetRoomId && tenant) {
      calculateBilling();
    }
  }, [transferData.targetRoomId, transferData.transferDate, tenant]);

  const loadAvailableRooms = async () => {
    try {
      setLoadingRooms(true);
      const response = await roomService.getRooms({ 
        status: 'available',
        per_page: 100 
      });
      setAvailableRooms(response.rooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast.error('Gagal memuat daftar kamar');
    } finally {
      setLoadingRooms(false);
    }
  };

  const calculateBilling = () => {
    if (!tenant || !transferData.targetRoomId) return;

    const targetRoom = availableRooms.find(room => room.id.toString() === transferData.targetRoomId);
    if (!targetRoom) return;

    const currentRent = parseFloat(tenant.monthly_rent || '0');
    const newRent = parseFloat(targetRoom.monthly_price);
    const rentDifference = newRent - currentRent;

    // Simple pro-rata calculation (can be enhanced later)
    const transferDate = new Date(transferData.transferDate);
    const daysInMonth = new Date(transferDate.getFullYear(), transferDate.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - transferDate.getDate() + 1;
    const proRataAdjustment = (rentDifference / daysInMonth) * remainingDays;

    setBillingCalculation({
      currentRent,
      newRent,
      rentDifference,
      effectiveDate: transferData.transferDate,
      proRataAdjustment
    });

    setSelectedRoom(targetRoom);
  };

  const handleRoomSelect = (roomId: string) => {
    setTransferData(prev => ({ ...prev, targetRoomId: roomId }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!tenant || !transferData.targetRoomId) return;

    try {
      setSubmitting(true);
      
      // Update tenant with new room
      await tenantService.updateTenant(tenant.id, {
        name: tenant.user.name,
        email: tenant.user.email,
        phone: tenant.user.phone || '',
        room_id: transferData.targetRoomId,
        tenant_code: tenant.tenant_code || '',
        monthly_rent: selectedRoom?.monthly_price.toString() || tenant.monthly_rent,
        start_date: tenant.start_date.split('T')[0],
        status: tenant.status
      });

      toast.success('Penyewa berhasil dipindahkan ke kamar baru');
      onSuccess();
      onClose();
      resetWizard();
      
    } catch (error: any) {
      console.error('Failed to transfer room:', error);
      toast.error(error.message || 'Gagal memindahkan penyewa');
    } finally {
      setSubmitting(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setTransferData({
      targetRoomId: '',
      transferDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setBillingCalculation(null);
    setSelectedRoom(null);
  };

  const handleClose = () => {
    onClose();
    resetWizard();
  };

  if (!isOpen || !tenant) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const steps = [
    { number: 1, title: 'Pilih Kamar Tujuan', icon: Home },
    { number: 2, title: 'Konfirmasi Billing', icon: DollarSign },
    { number: 3, title: 'Konfirmasi Transfer', icon: CheckCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transfer Kamar Penyewa</h2>
            <p className="text-sm text-gray-600 mt-1">
              {tenant.user.name} - Kamar {tenant.room.room_number}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Room Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Kamar Tujuan</h3>
              
              {loadingRooms ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Memuat daftar kamar...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleRoomSelect(room.id.toString())}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        transferData.targetRoomId === room.id.toString()
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          Kamar {room.room_number}
                        </h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Tersedia
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{room.room_name}</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(parseFloat(room.monthly_price))}
                        <span className="text-xs text-gray-500 font-normal">/bulan</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {availableRooms.length === 0 && !loadingRooms && (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada kamar yang tersedia saat ini</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Billing Calculation */}
          {currentStep === 2 && billingCalculation && selectedRoom && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kalkulasi Billing</h3>
              
              <div className="space-y-6">
                {/* Current vs New Room */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Kamar Saat Ini</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-600">Kamar:</span> {tenant.room.room_number}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Sewa:</span> {formatCurrency(billingCalculation.currentRent)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Kamar Baru</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-gray-600">Kamar:</span> {selectedRoom.room_number}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Sewa:</span> {formatCurrency(billingCalculation.newRent)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Billing Impact */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Dampak Billing</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Selisih Harga Sewa:</span>
                      <span className={`font-semibold ${
                        billingCalculation.rentDifference >= 0 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {billingCalculation.rentDifference >= 0 ? '+' : ''}
                        {formatCurrency(billingCalculation.rentDifference)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tanggal Efektif:</span>
                      <span className="font-medium">
                        {new Date(billingCalculation.effectiveDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    {Math.abs(billingCalculation.proRataAdjustment) > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-600">Penyesuaian Pro-rata:</span>
                        <span className={`font-semibold ${
                          billingCalculation.proRataAdjustment >= 0 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {billingCalculation.proRataAdjustment >= 0 ? '+' : ''}
                          {formatCurrency(billingCalculation.proRataAdjustment)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transfer Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Transfer
                  </label>
                  <input
                    type="date"
                    value={transferData.transferDate}
                    onChange={(e) => setTransferData(prev => ({ ...prev, transferDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && selectedRoom && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Transfer</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-semibold text-yellow-800">Perhatian</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Transfer kamar akan mengubah tagihan penyewa dan status kedua kamar. 
                      Pastikan semua informasi sudah benar sebelum melanjutkan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Ringkasan Transfer</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Penyewa:</span>
                      <span className="font-medium">{tenant.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dari Kamar:</span>
                      <span className="font-medium">{tenant.room.room_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ke Kamar:</span>
                      <span className="font-medium">{selectedRoom.room_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal Transfer:</span>
                      <span className="font-medium">
                        {new Date(transferData.transferDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    {billingCalculation && billingCalculation.rentDifference !== 0 && (
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Perubahan Sewa:</span>
                        <span className={`font-semibold ${
                          billingCalculation.rentDifference >= 0 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(billingCalculation.currentRent)} → {formatCurrency(billingCalculation.newRent)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={transferData.notes}
                    onChange={(e) => setTransferData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Tambahkan catatan untuk transfer ini..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Kembali
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !transferData.targetRoomId}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Lanjut
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Memproses...' : 'Transfer Kamar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomTransferWizard;