// File: src/pages/Admin/components/features/tenants/TenantForm.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../../ui/Forms/Input';
import { Select } from '../../ui/Forms/Select';
import type { Tenant, TenantFormData } from '../../../types/tenant';
import type { Room } from '../../../types/room';
import { roomService } from '../../../services/roomService';

interface TenantFormProps {
  isOpen: boolean;
  tenant?: Tenant | null;
  onClose: () => void;
  onSubmit: (data: TenantFormData) => Promise<void>;
}

export const TenantForm: React.FC<TenantFormProps> = ({ 
  isOpen, 
  tenant, 
  onClose, 
  onSubmit 
}) => {
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
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Muat data kamar saat modal dibuka
  useEffect(() => {
    const loadRooms = async () => {
      if (!isOpen) return;
      try {
        setLoadingRooms(true);
        
        // Jika edit mode, ambil semua kamar termasuk yang occupied
        // Jika create mode, hanya ambil yang available
        const filters = tenant ? 
          { per_page: 100 } : // Edit mode: ambil semua kamar
          { status: 'available', per_page: 100 }; // Create mode: hanya available
        
        const response = await roomService.getRooms(filters);
        
        // Filter kamar yang bisa dipilih
        let availableRooms = response.rooms;
        
        if (tenant) {
          // Edit mode: tampilkan kamar available + kamar current tenant
          availableRooms = response.rooms.filter(room => 
            room.status === 'available' || room.id === tenant.room_id
          );
          console.log('🏠 Edit mode - Available rooms:', availableRooms.length, 'Current tenant room ID:', tenant.room_id);
        } else {
          // Create mode: hanya kamar available
          availableRooms = response.rooms.filter(room => room.status === 'available');
          console.log('🏠 Create mode - Available rooms:', availableRooms.length);
        }
        
        setRooms(availableRooms);
      } catch (error) {
        console.error('Gagal memuat data kamar:', error);
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, [isOpen, tenant]);

  // Auto-fill harga sewa ketika kamar dipilih
  const handleRoomChange = (roomId: string) => {
    const selectedRoom = rooms.find(room => room.id.toString() === roomId);
    setFormData(prev => ({
      ...prev,
      room_id: roomId,
      monthly_rent: selectedRoom ? selectedRoom.monthly_price.toString() : ''
    }));
    
    // Clear error for monthly_rent if room is selected
    if (selectedRoom && errors.monthly_rent) {
      setErrors(prev => ({ ...prev, monthly_rent: '' }));
    }
  };

  // Isi form saat mengedit atau reset untuk membuat baru
  useEffect(() => {
    if (isOpen) {
      if (tenant) {
        // Edit mode: isi dengan data existing
        console.log('📝 Editing tenant:', {
          id: tenant.id,
          room_id: tenant.room_id,
          monthly_rent: tenant.monthly_rent,
          room_info: tenant.room
        });
        
        setFormData({
          name: tenant.user.name,
          email: tenant.user.email,
          phone: tenant.user.phone || '',
          password: '',
          password_confirmation: '',
          room_id: tenant.room_id.toString(),
          tenant_code: tenant.tenant_code || '',
          monthly_rent: tenant.monthly_rent || '',
          start_date: tenant.start_date.split('T')[0],
          status: tenant.status
        });
      } else {
        // Create mode: reset form
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
      }
      setErrors({});
    }
  }, [tenant, isOpen]);

  // Pastikan harga sewa sesuai dengan kamar yang dipilih
  useEffect(() => {
    if (formData.room_id && rooms.length > 0) {
      const selectedRoom = rooms.find(room => room.id.toString() === formData.room_id);
      console.log('💰 Room price sync:', {
        room_id: formData.room_id,
        selectedRoom: selectedRoom ? {
          id: selectedRoom.id,
          number: selectedRoom.room_number,
          price: selectedRoom.monthly_price
        } : null,
        current_monthly_rent: formData.monthly_rent,
        is_edit_mode: !!tenant
      });
      
      if (selectedRoom) {
        // Untuk mode create, selalu gunakan harga dari kamar
        // Untuk mode edit, gunakan harga dari data tenant yang sudah ada (tidak override)
        if (!tenant) {
          setFormData(prev => ({ 
            ...prev, 
            monthly_rent: selectedRoom.monthly_price.toString() 
          }));
        }
      }
    }
  }, [formData.room_id, rooms, tenant]);

  const handleChange = (key: keyof TenantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama harus diisi';
    if (!formData.email.trim()) newErrors.email = 'Email harus diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.room_id) newErrors.room_id = 'Kamar harus dipilih';
    if (!formData.start_date) newErrors.start_date = 'Tanggal mulai harus diisi';
    if (!formData.monthly_rent || formData.monthly_rent.toString().trim() === '' || formData.monthly_rent === '0') {
      newErrors.monthly_rent = 'Harga sewa harus diisi';
    } else if (isNaN(Number(formData.monthly_rent))) {
      newErrors.monthly_rent = 'Format harga tidak valid';
    } else if (Number(formData.monthly_rent) <= 0) {
      newErrors.monthly_rent = 'Harga sewa harus lebih dari 0';
    }

    if (!tenant) {
      if (!formData.password) newErrors.password = 'Password harus diisi';
      else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
      if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Gagal mengirim form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'suspended', label: 'Ditangguhkan' },
    { value: 'moved_out', label: 'Pindah' }
  ];

  const roomOptions = rooms.map(room => ({
    value: room.id.toString(),
    label: `Kamar ${room.room_number} - ${room.room_name} (Rp ${Number(room.monthly_price).toLocaleString()})`
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {tenant ? 'Ubah Penyewa' : 'Tambah Penyewa Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Lengkap" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} error={errors.name} required />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} error={errors.email} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nomor Telepon" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} error={errors.phone} />
            <Input label="Kode Penyewa (Opsional)" value={formData.tenant_code} onChange={(e) => handleChange('tenant_code', e.target.value)} error={errors.tenant_code} placeholder="Otomatis jika kosong" />
          </div>

          {!tenant && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Password" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} error={errors.password} required />
              <Input label="Konfirmasi Password" type="password" value={formData.password_confirmation} onChange={(e) => handleChange('password_confirmation', e.target.value)} error={errors.password_confirmation} required />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Kamar <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.room_id}
                onChange={(e) => handleRoomChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.room_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loadingRooms}
                required
              >
                <option value="">-- Pilih Kamar --</option>
                {rooms.map((room) => {
                  const isCurrentRoom = tenant && room.id === tenant.room_id;
                  const roomLabel = `${room.room_number} - ${room.room_name} (Rp ${parseInt(room.monthly_price).toLocaleString('id-ID')}/bulan)`;
                  const fullLabel = isCurrentRoom ? `${roomLabel} (Kamar Saat Ini)` : roomLabel;
                  
                  return (
                    <option key={room.id} value={room.id.toString()}>
                      {fullLabel}
                    </option>
                  );
                })}
              </select>
              {errors.room_id && (
                <p className="mt-1 text-sm text-red-600">{errors.room_id}</p>
              )}
              {loadingRooms && (
                <p className="mt-1 text-sm text-gray-500">Memuat data kamar...</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Sewa Bulanan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="text"
                  value={formData.monthly_rent ? Number(formData.monthly_rent).toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    // Remove all non-digit characters and convert back to number
                    const numericValue = e.target.value.replace(/[^\d]/g, '');
                    handleChange('monthly_rent', numericValue);
                  }}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.monthly_rent ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {tenant ? 'Harga dapat disesuaikan jika berbeda dari harga standar kamar' : 'Harga akan otomatis terisi sesuai kamar yang dipilih'}
              </p>
              {errors.monthly_rent && (
                <p className="mt-1 text-sm text-red-600">{errors.monthly_rent}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Tanggal Mulai" type="date" value={formData.start_date} onChange={(e) => handleChange('start_date', e.target.value)} error={errors.start_date} required />
            {tenant && (
                <Select label="Status" value={formData.status} onChange={(value) => handleChange('status', value as any)} options={statusOptions} error={errors.status} required />
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50" disabled={submitting}>
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
              {submitting ? 'Menyimpan...' : (tenant ? 'Perbarui Penyewa' : 'Tambah Penyewa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
