// File: src/pages/Admin/components/feature/tenants/TenantWizard.tsx
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, User, Home, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '../../ui/Forms/Input';
import { Select } from '../../ui/Forms/Select';
import type { Tenant, TenantFormData } from '../../../types/tenant';
import type { Room } from '../../../types/room';
import { roomService } from '../../../services/roomService';

interface TenantWizardProps {
  isOpen: boolean;
  tenant?: Tenant | null;
  onClose: () => void;
  onSubmit: (data: TenantFormData) => Promise<void>;
}

export const TenantWizard: React.FC<TenantWizardProps> = ({
  isOpen,
  tenant,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    room_id: '',
    tenant_code: '',
    monthly_rent: '',
    start_date: '',
    status: 'active'
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Load available rooms
  useEffect(() => {
    if (isOpen && currentStep === 2) {
      loadAvailableRooms();
    }
  }, [isOpen, currentStep]);

  // Load form data if editing
  useEffect(() => {
    if (isOpen && tenant) {
      setFormData({
        name: tenant.user?.name || '',
        email: tenant.user?.email || '',
        phone: tenant.user?.phone || '',
        password: '',
        password_confirmation: '',
        room_id: tenant.room?.id?.toString() || '',
        tenant_code: tenant.tenant_code || '',
        monthly_rent: tenant.monthly_rent || '',
        start_date: tenant.start_date?.split('T')[0] || '',
        status: tenant.status || 'active'
      });
      if (tenant.room) {
        setSelectedRoom(tenant.room);
      }
    } else if (isOpen && !tenant) {
      // Reset form for new tenant
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        room_id: '',
        tenant_code: '',
        monthly_rent: '',
        start_date: new Date().toISOString().split('T')[0],
        status: 'active'
      });
      setSelectedRoom(null);
    }
  }, [isOpen, tenant]);

  const loadAvailableRooms = async () => {
    try {
      setLoadingRooms(true);
      const filters = tenant ? 
        { per_page: 100 } : // For editing, show all rooms
        { status: 'available', per_page: 100 }; // For new tenant, only available rooms
      
      const response = await roomService.getRooms(filters);
      setRooms(response.rooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast.error('Gagal memuat daftar kamar');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleChange = (key: keyof TenantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find(r => r.id.toString() === roomId);
    setSelectedRoom(room || null);
    setFormData(prev => ({ 
      ...prev, 
      room_id: roomId,
      monthly_rent: room?.monthly_price || ''
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Personal Information validation
      if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
      if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Format email tidak valid';
      }
      
      // Password validation only for new tenant
      if (!tenant) {
        if (!formData.password) newErrors.password = 'Password wajib diisi';
        if (formData.password && formData.password.length < 6) {
          newErrors.password = 'Password minimal 6 karakter';
        }
        if (formData.password !== formData.password_confirmation) {
          newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
        }
      }
    }

    if (step === 2) {
      // Room validation
      if (!formData.room_id) newErrors.room_id = 'Pilih kamar';
    }

    if (step === 3) {
      // Rental details validation
      if (!formData.start_date) newErrors.start_date = 'Tanggal mulai wajib diisi';
      if (!formData.monthly_rent) newErrors.monthly_rent = 'Sewa bulanan wajib diisi';
      
      const rentAmount = parseFloat(formData.monthly_rent);
      if (isNaN(rentAmount) || rentAmount <= 0) {
        newErrors.monthly_rent = 'Sewa bulanan harus berupa angka positif';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      setSubmitting(true);
      await onSubmit(formData);
      resetWizard();
      onClose();
    } catch (error: any) {
      console.error('Failed to submit tenant form:', error);
      // Errors are handled by the parent component
    } finally {
      setSubmitting(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      room_id: '',
      tenant_code: '',
      monthly_rent: '',
      start_date: '',
      status: 'active'
    });
    setSelectedRoom(null);
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetWizard();
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: 'Informasi Pribadi', icon: User },
    { number: 2, title: 'Pilih Kamar', icon: Home },
    { number: 3, title: 'Detail Sewa', icon: CreditCard }
  ];

  const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'suspended', label: 'Ditangguhkan' },
    { value: 'moved_out', label: 'Pindah' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {tenant ? 'Edit Penyewa' : 'Tambah Penyewa Baru'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {tenant ? `Edit data ${tenant.user?.name}` : 'Buat akun penyewa baru dengan wizard'}
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
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pribadi Penyewa</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  required
                  placeholder="Masukkan nama lengkap"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  required
                  placeholder="nama@email.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nomor Telepon"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  error={errors.phone}
                  placeholder="08xxxxxxxxxx"
                />
                <Input
                  label="Kode Penyewa (Opsional)"
                  value={formData.tenant_code}
                  onChange={(e) => handleChange('tenant_code', e.target.value)}
                  error={errors.tenant_code}
                  placeholder="Otomatis jika kosong"
                />
              </div>

              {!tenant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    error={errors.password}
                    required
                    placeholder="Minimal 6 karakter"
                  />
                  <Input
                    label="Konfirmasi Password"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                    required
                    placeholder="Ulangi password"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Room Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Kamar</h3>
              
              {loadingRooms ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Memuat daftar kamar...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleRoomSelect(room.id.toString())}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.room_id === room.id.toString()
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Kamar {room.room_number}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          room.status === 'available' ? 'bg-green-100 text-green-800' :
                          room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {room.status === 'available' ? 'Tersedia' :
                           room.status === 'occupied' ? 'Terisi' : 'Perawatan'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{room.room_name}</p>
                      <p className="text-lg font-bold text-green-600">
                        Rp {Number(room.monthly_price).toLocaleString()}/bulan
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {errors.room_id && (
                <p className="text-red-600 text-sm">{errors.room_id}</p>
              )}
            </div>
          )}

          {/* Step 3: Rental Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Kontrak Sewa</h3>
              
              {selectedRoom && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Kamar Terpilih</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Nomor: </span>
                      <span className="font-medium">{selectedRoom.room_number}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Nama: </span>
                      <span className="font-medium">{selectedRoom.room_name}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-blue-700">Harga: </span>
                      <span className="font-bold text-green-600">
                        Rp {Number(selectedRoom.monthly_price).toLocaleString()}/bulan
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tanggal Mulai Sewa"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  error={errors.start_date}
                  required
                />
                <Input
                  label="Sewa Bulanan (Rp)"
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) => handleChange('monthly_rent', e.target.value)}
                  error={errors.monthly_rent}
                  required
                  placeholder="1000000"
                />
              </div>

              <Select
                label="Status Penyewa"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={statusOptions}
                error={errors.status}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div>
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
          
          <div className="flex items-center gap-3">
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
                disabled={currentStep === 2 && !formData.room_id}
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
                  {submitting ? 'Menyimpan...' : tenant ? 'Update Penyewa' : 'Tambah Penyewa'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};