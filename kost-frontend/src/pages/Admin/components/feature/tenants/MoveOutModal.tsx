// File: src/pages/Admin/components/feature/tenants/MoveOutModal.tsx
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, UserX, Calendar, AlertTriangle, Calculator, DollarSign, CheckCircle } from 'lucide-react';
import { Input } from '../../ui/Forms/Input';
import type { Tenant, MoveOutData } from '../../../types/tenant';

interface BillingCalculation {
  daysInMonth: number;
  remainingDays: number;
  dailyRate: number;
  proRataRefund: number;
  depositRefund: number;
  totalRefund: number;
}

interface MoveOutModalProps {
  isOpen: boolean;
  tenant?: Tenant | null;
  onClose: () => void;
  onSubmit: (data: MoveOutData & { billing_calculation?: BillingCalculation }) => Promise<void>;
}

export const MoveOutWizard: React.FC<MoveOutModalProps> = ({ 
  isOpen, 
  tenant, 
  onClose, 
  onSubmit 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<MoveOutData>({
    move_out_date: '',
    reason: ''
  });
  
  const [billingCalculation, setBillingCalculation] = useState<BillingCalculation | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        move_out_date: new Date().toISOString().split('T')[0],
        reason: ''
      });
      setErrors({});
      setBillingCalculation(null);
    }
  }, [isOpen]);

  // Calculate billing when move out date changes
  useEffect(() => {
    if (formData.move_out_date && tenant) {
      calculateBilling();
    }
  }, [formData.move_out_date, tenant]);

  const calculateBilling = () => {
    if (!formData.move_out_date || !tenant) return;

    const moveOutDate = new Date(formData.move_out_date);
    const monthlyRent = parseFloat(tenant.monthly_rent);
    
    // Get the current month's billing period
    const currentMonth = new Date(moveOutDate.getFullYear(), moveOutDate.getMonth(), 1);
    const nextMonth = new Date(moveOutDate.getFullYear(), moveOutDate.getMonth() + 1, 1);
    const daysInMonth = Math.floor((nextMonth.getTime() - currentMonth.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate remaining days in the month after move out
    const remainingDays = daysInMonth - moveOutDate.getDate();
    const dailyRate = monthlyRent / daysInMonth;
    
    // Pro-rata refund for unused days
    const proRataRefund = dailyRate * remainingDays;
    
    // Standard deposit is 1 month rent
    const depositRefund = monthlyRent;
    
    const totalRefund = proRataRefund + depositRefund;

    setBillingCalculation({
      daysInMonth,
      remainingDays,
      dailyRate,
      proRataRefund,
      depositRefund,
      totalRefund
    });
  };

  const handleChange = (key: keyof MoveOutData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Move out date validation
      if (!formData.move_out_date) {
        newErrors.move_out_date = 'Tanggal move out wajib diisi';
      } else {
        const moveOutDate = new Date(formData.move_out_date);
        const today = new Date();
        const startDate = new Date(tenant?.start_date || '');
        
        // Cannot be in the future
        if (moveOutDate > today) {
          newErrors.move_out_date = 'Tanggal move out tidak boleh di masa depan';
        }
        
        // Cannot be before start date
        if (moveOutDate < startDate) {
          newErrors.move_out_date = 'Tanggal move out tidak boleh sebelum tanggal mulai sewa';
        }
      }
    }

    if (step === 3) {
      // Reason validation
      if (formData.reason.length > 500) {
        newErrors.reason = 'Alasan maksimal 500 karakter';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        billing_calculation: billingCalculation || undefined
      });
    } catch (error) {
      console.error('Move out submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setFormData({
      move_out_date: '',
      reason: ''
    });
    setErrors({});
    setBillingCalculation(null);
  };

  const handleClose = () => {
    onClose();
    resetWizard();
  };

  if (!isOpen || !tenant) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateTenancyDuration = () => {
    const start = new Date(tenant.start_date);
    const end = new Date(formData.move_out_date || new Date());
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    if (months > 0) {
      return `${months} bulan ${days} hari`;
    }
    return `${diffDays} hari`;
  };

  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0]; // Today
  };

  const getMinDate = () => {
    return tenant.start_date.split('T')[0]; // Start date
  };

  const steps = [
    { number: 1, title: 'Tanggal Move Out', icon: Calendar },
    { number: 2, title: 'Kalkulasi Billing', icon: Calculator },
    { number: 3, title: 'Konfirmasi Move Out', icon: CheckCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Move Out Penyewa</h2>
            <p className="text-sm text-gray-600 mt-1">
              {tenant.user.name} - Kamar {tenant.room.room_number}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/50 transition-colors"
            disabled={submitting}
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
          {/* Step 1: Move Out Date */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Tanggal Move Out</h3>
              
              {/* Tenant Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Informasi Penyewa</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nama:</span>
                    <div className="font-medium text-gray-900">{tenant.user.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium text-gray-900">{tenant.user.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Kamar:</span>
                    <div className="font-medium text-gray-900">{tenant.room.room_number} - {tenant.room.room_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Mulai Sewa:</span>
                    <div className="font-medium text-gray-900">{formatDate(tenant.start_date)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Sewa Bulanan:</span>
                    <div className="font-medium text-gray-900">{formatCurrency(parseFloat(tenant.monthly_rent))}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className="font-medium text-gray-900">{tenant.status}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Tanggal Move Out"
                  type="date"
                  value={formData.move_out_date}
                  onChange={(e) => handleChange('move_out_date', e.target.value)}
                  error={errors.move_out_date}
                  required
                  min={getMinDate()}
                  max={getMaxDate()}
                />

                {formData.move_out_date && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Durasi Sewa: {calculateTenancyDuration()}
                        </p>
                        <p className="text-xs text-blue-700">
                          Tanggal move out: {formatDate(formData.move_out_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Billing Calculation */}
          {currentStep === 2 && billingCalculation && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kalkulasi Billing</h3>
              
              <div className="space-y-6">
                {/* Current Rent Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Informasi Sewa Saat Ini</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sewa Bulanan:</span>
                      <div className="font-medium text-gray-900">{formatCurrency(parseFloat(tenant.monthly_rent))}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Tanggal Move Out:</span>
                      <div className="font-medium text-gray-900">{formatDate(formData.move_out_date)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Durasi Sewa:</span>
                      <div className="font-medium text-gray-900">{calculateTenancyDuration()}</div>
                    </div>
                  </div>
                </div>

                {/* Billing Calculation */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center mb-4">
                    <Calculator className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-900">Perhitungan Pengembalian</h4>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hari dalam bulan:</span>
                      <span className="font-medium">{billingCalculation.daysInMonth} hari</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hari tersisa setelah move out:</span>
                      <span className="font-medium">{billingCalculation.remainingDays} hari</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarif harian:</span>
                      <span className="font-medium">{formatCurrency(billingCalculation.dailyRate)}</span>
                    </div>
                    
                    <div className="border-t border-green-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund pro-rata sewa:</span>
                        <span className="font-medium text-green-700">
                          {formatCurrency(billingCalculation.proRataRefund)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pengembalian deposit:</span>
                        <span className="font-medium text-green-700">
                          {formatCurrency(billingCalculation.depositRefund)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-green-300 pt-3">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold text-green-900">Total Pengembalian:</span>
                        <span className="font-bold text-green-900">
                          {formatCurrency(billingCalculation.totalRefund)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Catatan Perhitungan:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Perhitungan berdasarkan sewa bulanan sebesar {formatCurrency(parseFloat(tenant.monthly_rent))}</li>
                        <li>Deposit diasumsikan sebesar 1 bulan sewa (sesuaikan jika berbeda)</li>
                        <li>Pastikan tidak ada tunggakan pembayaran sebelum move out</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Move Out</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-semibold text-yellow-800">Perhatian</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Proses move out akan mengubah status penyewa menjadi "moved out" dan tidak dapat dibatalkan. 
                      Kamar akan tersedia untuk penyewa baru.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Ringkasan Move Out</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Penyewa:</span>
                      <span className="font-medium">{tenant.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kamar:</span>
                      <span className="font-medium">{tenant.room.room_number} - {tenant.room.room_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal Move Out:</span>
                      <span className="font-medium">{formatDate(formData.move_out_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durasi Sewa:</span>
                      <span className="font-medium">{calculateTenancyDuration()}</span>
                    </div>
                    {billingCalculation && (
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Total Pengembalian:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(billingCalculation.totalRefund)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Move Out <span className="text-gray-400">(Opsional)</span>
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    rows={4}
                    maxLength={500}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.reason ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Contoh: kontrak berakhir, pindah kerja, dll."
                    disabled={submitting}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.reason && (
                      <p className="text-sm text-red-600">{errors.reason}</p>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {formData.reason.length}/500 karakter
                    </p>
                  </div>
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
                disabled={currentStep === 1 && !formData.move_out_date}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Lanjut
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {submitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {submitting ? 'Memproses...' : 'Move Out Penyewa'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoveOutWizard;