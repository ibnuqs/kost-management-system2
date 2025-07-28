// File: src/pages/Admin/components/feature/rooms/TenantAssignmentWizard.tsx
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, User, DollarSign, Calendar, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { tenantService } from '../../../services/tenantService';
import type { Room } from '../../../types/room';

interface TenantAssignmentWizardProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface AssignmentData {
  tenantType: 'existing' | 'new';
  existingTenantId: string;
  newTenantData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  };
  tenantCode: string;
  monthlyRent: string;
  startDate: string;
  notes: string;
}

interface AvailableTenant {
  id: number;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  tenant_code: string;
  status: string;
}

export const TenantAssignmentWizard: React.FC<TenantAssignmentWizardProps> = ({
  isOpen,
  room,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [availableTenants, setAvailableTenants] = useState<AvailableTenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTenant, setSearchTenant] = useState('');
  
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    tenantType: 'new',
    existingTenantId: '',
    newTenantData: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: ''
    },
    tenantCode: '',
    monthlyRent: room?.monthly_price.toString() || '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Load available tenants (moved out or new)
  useEffect(() => {
    if (isOpen && assignmentData.tenantType === 'existing') {
      loadAvailableTenants();
    }
  }, [isOpen, assignmentData.tenantType]);

  // Update monthly rent when room changes
  useEffect(() => {
    if (room) {
      setAssignmentData(prev => ({
        ...prev,
        monthlyRent: room.monthly_price.toString()
      }));
    }
  }, [room]);

  const loadAvailableTenants = async () => {
    try {
      setLoadingTenants(true);
      // Get tenants with moved_out status - they can be reassigned
      const response = await tenantService.getTenants({ 
        status: 'moved_out',
        per_page: 100 
      });
      setAvailableTenants(response.tenants);
    } catch (error) {
      console.error('Failed to load tenants:', error);
      toast.error('Gagal memuat daftar penyewa');
    } finally {
      setLoadingTenants(false);
    }
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

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Tenant Selection
        if (assignmentData.tenantType === 'existing') {
          return !!assignmentData.existingTenantId;
        } else {
          return !!(
            assignmentData.newTenantData.name &&
            assignmentData.newTenantData.email &&
            assignmentData.newTenantData.password &&
            assignmentData.newTenantData.password_confirmation &&
            assignmentData.newTenantData.password === assignmentData.newTenantData.password_confirmation
          );
        }
      case 2: // Contract Terms
        return !!(
          assignmentData.monthlyRent &&
          assignmentData.startDate &&
          parseFloat(assignmentData.monthlyRent) > 0
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!room) return;

    try {
      setSubmitting(true);
      
      if (assignmentData.tenantType === 'existing') {
        // Update existing tenant with new room
        const selectedTenant = availableTenants.find(t => t.id.toString() === assignmentData.existingTenantId);
        if (!selectedTenant) throw new Error('Penyewa tidak ditemukan');
        
        await tenantService.updateTenant(selectedTenant.id, {
          name: selectedTenant.user.name,
          email: selectedTenant.user.email,
          phone: selectedTenant.user.phone || '',
          room_id: room.id.toString(),
          tenant_code: assignmentData.tenantCode || selectedTenant.tenant_code,
          monthly_rent: assignmentData.monthlyRent,
          start_date: assignmentData.startDate,
          status: 'active'
        });
      } else {
        // Create new tenant
        await tenantService.createTenant({
          name: assignmentData.newTenantData.name,
          email: assignmentData.newTenantData.email,
          phone: assignmentData.newTenantData.phone,
          password: assignmentData.newTenantData.password,
          password_confirmation: assignmentData.newTenantData.password_confirmation,
          room_id: room.id.toString(),
          tenant_code: assignmentData.tenantCode,
          monthly_rent: assignmentData.monthlyRent,
          start_date: assignmentData.startDate,
          status: 'active'
        });
      }

      toast.success(`Penyewa berhasil ditempatkan di ${room.room_number}`);
      onSuccess();
      onClose();
      resetWizard();
      
    } catch (error: any) {
      console.error('Failed to assign tenant:', error);
      toast.error(error.message || 'Gagal menempatkan penyewa');
    } finally {
      setSubmitting(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setAssignmentData({
      tenantType: 'new',
      existingTenantId: '',
      newTenantData: {
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: ''
      },
      tenantCode: '',
      monthlyRent: room?.monthly_price.toString() || '',
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setSearchTenant('');
  };

  const handleClose = () => {
    onClose();
    resetWizard();
  };

  if (!isOpen || !room) return null;

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseFloat(amount.toString()));
  };

  const steps = [
    { number: 1, title: 'Pilih Penyewa', icon: User },
    { number: 2, title: 'Atur Kontrak', icon: DollarSign },
    { number: 3, title: 'Konfirmasi', icon: CheckCircle }
  ];

  const filteredTenants = availableTenants.filter(tenant =>
    tenant.user.name.toLowerCase().includes(searchTenant.toLowerCase()) ||
    tenant.user.email.toLowerCase().includes(searchTenant.toLowerCase()) ||
    tenant.tenant_code?.toLowerCase().includes(searchTenant.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tempatkan Penyewa</h2>
            <p className="text-sm text-gray-600 mt-1">
              Kamar {room.room_number} - {room.room_name}
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
                    ? 'bg-green-600 border-green-600 text-white' 
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
                    currentStep >= step.number ? 'text-green-900' : 'text-gray-500'
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
          {/* Step 1: Tenant Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Jenis Penyewa</h3>
              
              {/* Tenant Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                  onClick={() => setAssignmentData(prev => ({ ...prev, tenantType: 'new', existingTenantId: '' }))}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    assignmentData.tenantType === 'new'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Penyewa Baru</h4>
                  <p className="text-sm text-gray-600">Buat akun penyewa baru</p>
                </div>

                <div
                  onClick={() => setAssignmentData(prev => ({ ...prev, tenantType: 'existing', existingTenantId: '' }))}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    assignmentData.tenantType === 'existing'
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Penyewa Lama</h4>
                  <p className="text-sm text-gray-600">Pilih dari mantan penyewa</p>
                </div>
              </div>

              {/* New Tenant Form */}
              {assignmentData.tenantType === 'new' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Data Penyewa Baru</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={assignmentData.newTenantData.name}
                        onChange={(e) => setAssignmentData(prev => ({
                          ...prev,
                          newTenantData: { ...prev.newTenantData, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={assignmentData.newTenantData.email}
                        onChange={(e) => setAssignmentData(prev => ({
                          ...prev,
                          newTenantData: { ...prev.newTenantData, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        value={assignmentData.newTenantData.phone}
                        onChange={(e) => setAssignmentData(prev => ({
                          ...prev,
                          newTenantData: { ...prev.newTenantData, phone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={assignmentData.newTenantData.password}
                        onChange={(e) => setAssignmentData(prev => ({
                          ...prev,
                          newTenantData: { ...prev.newTenantData, password: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Minimal 6 karakter"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={assignmentData.newTenantData.password_confirmation}
                        onChange={(e) => setAssignmentData(prev => ({
                          ...prev,
                          newTenantData: { ...prev.newTenantData, password_confirmation: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ulangi password"
                      />
                      {assignmentData.newTenantData.password && 
                       assignmentData.newTenantData.password_confirmation && 
                       assignmentData.newTenantData.password !== assignmentData.newTenantData.password_confirmation && (
                        <p className="text-red-500 text-sm mt-1">Password tidak cocok</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Tenant Selection */}
              {assignmentData.tenantType === 'existing' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Pilih Mantan Penyewa</h4>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Cari nama, email, atau kode penyewa..."
                      value={searchTenant}
                      onChange={(e) => setSearchTenant(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {loadingTenants ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Memuat daftar penyewa...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                      {filteredTenants.map((tenant) => (
                        <div
                          key={tenant.id}
                          onClick={() => setAssignmentData(prev => ({ ...prev, existingTenantId: tenant.id.toString() }))}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                            assignmentData.existingTenantId === tenant.id.toString()
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-semibold text-gray-900">{tenant.user.name}</h5>
                              <p className="text-sm text-gray-600">{tenant.user.email}</p>
                              {tenant.tenant_code && (
                                <p className="text-xs text-gray-500 font-mono">{tenant.tenant_code}</p>
                              )}
                            </div>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              Mantan Penyewa
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredTenants.length === 0 && !loadingTenants && (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTenant ? 'Tidak ada penyewa yang cocok dengan pencarian' : 'Tidak ada mantan penyewa tersedia'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Contract Terms */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Atur Kontrak Sewa</h3>
              
              <div className="space-y-6">
                {/* Room Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Informasi Kamar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Nomor Kamar:</span>
                      <p className="font-medium">{room.room_number}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Nama Kamar:</span>
                      <p className="font-medium">{room.room_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Harga Standar:</span>
                      <p className="font-medium">{formatCurrency(room.monthly_price)}</p>
                    </div>
                  </div>
                </div>

                {/* Contract Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Penyewa (Opsional)
                    </label>
                    <input
                      type="text"
                      value={assignmentData.tenantCode}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, tenantCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Otomatis jika kosong"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Mulai Sewa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={assignmentData.startDate}
                      onChange={(e) => setAssignmentData(prev => ({ ...prev, startDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Sewa Bulanan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                      <input
                        type="text"
                        value={assignmentData.monthlyRent ? parseFloat(assignmentData.monthlyRent).toLocaleString('id-ID') : ''}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/[^\d]/g, '');
                          setAssignmentData(prev => ({ ...prev, monthlyRent: numericValue }));
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Harga dapat disesuaikan dari harga standar jika diperlukan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Penempatan</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-semibold text-blue-800">Perhatian</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Penempatan penyewa akan mengubah status kamar menjadi "Terisi" dan memulai periode sewa.
                      Pastikan semua informasi sudah benar sebelum melanjutkan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Ringkasan Penempatan</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kamar:</span>
                      <span className="font-medium">{room.room_number} - {room.room_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Penyewa:</span>
                      <span className="font-medium">
                        {assignmentData.tenantType === 'new' 
                          ? assignmentData.newTenantData.name
                          : availableTenants.find(t => t.id.toString() === assignmentData.existingTenantId)?.user.name
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">
                        {assignmentData.tenantType === 'new' 
                          ? assignmentData.newTenantData.email
                          : availableTenants.find(t => t.id.toString() === assignmentData.existingTenantId)?.user.email
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harga Sewa:</span>
                      <span className="font-medium">{formatCurrency(assignmentData.monthlyRent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal Mulai:</span>
                      <span className="font-medium">
                        {new Date(assignmentData.startDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    {assignmentData.tenantCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kode Penyewa:</span>
                        <span className="font-medium font-mono">{assignmentData.tenantCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={assignmentData.notes}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Tambahkan catatan untuk penempatan ini..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                disabled={!validateCurrentStep()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Lanjut
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !validateCurrentStep()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Memproses...' : 'Tempatkan Penyewa'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantAssignmentWizard;