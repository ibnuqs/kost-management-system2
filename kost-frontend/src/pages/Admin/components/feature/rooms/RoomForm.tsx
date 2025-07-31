// File: src/pages/Admin/components/feature/rooms/RoomForm.tsx
import React, { useState, useEffect } from 'react';
import { X, Home, Tag, DollarSign, Settings, Save, AlertCircle, Archive } from 'lucide-react';
import { DangerousActionModal } from '../../ui';
import type { RoomFormData, Room } from '../../../types/room';

interface RoomFormProps {
  isOpen: boolean;
  room?: RoomFormData | Room | Record<string, unknown>; // Support both RoomFormData and Room objects
  onClose: () => void;
  onSubmit: (data: RoomFormData) => void;
  onArchive?: (room: Room) => void;
  title: string;
}

interface FormErrors {
  room_number?: string;
  room_name?: string;
  monthly_price?: string;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  isOpen,
  room,
  onClose,
  onSubmit,
  onArchive,
  title
}) => {
  const [formData, setFormData] = useState<RoomFormData>({
    room_number: '',
    room_name: '',
    monthly_price: '',
    status: 'available',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null);

  // Initialize form data when modal opens or room changes
  useEffect(() => {
    if (isOpen) {
      if (room) {
        setFormData({
          room_number: room.room_number || '',
          room_name: room.room_name || '',
          monthly_price: room.monthly_price || '',
          status: room.status || 'available',
        });
      } else {
        setFormData({
          room_number: '',
          room_name: '',
          monthly_price: '',
          status: 'available',
        });
      }
      setErrors({});
    }
  }, [isOpen, room]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Nomor kamar diperlukan';
    } else if (formData.room_number.length < 2) {
      newErrors.room_number = 'Nomor kamar minimal 2 karakter';
    }

    if (!formData.room_name.trim()) {
      newErrors.room_name = 'Nama kamar diperlukan';
    } else if (formData.room_name.length < 3) {
      newErrors.room_name = 'Nama kamar minimal 3 karakter';
    }

    const priceStr = String(formData.monthly_price || '').trim();
    if (!priceStr) {
      newErrors.monthly_price = 'Harga bulanan diperlukan';
    } else {
      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) {
        newErrors.monthly_price = 'Masukkan harga yang valid';
      } else if (price < 100000) {
        newErrors.monthly_price = 'Harga terlalu rendah (minimum Rp 100.000)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof RoomFormData, value: string) => {
    // Special handling for status changes in edit mode
    if (field === 'status' && isEditMode && room?.tenant && room.status === 'occupied') {
      if (value === 'available' || value === 'maintenance') {
        setPendingStatusChange(value);
        setShowStatusChangeModal(true);
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const handleStatusChangeConfirm = () => {
    if (pendingStatusChange) {
      setFormData(prev => ({ ...prev, status: pendingStatusChange as 'available' | 'occupied' | 'maintenance' }));
    }
    setShowStatusChangeModal(false);
    setPendingStatusChange(null);
  };
  
  const handleStatusChangeCancel = () => {
    setShowStatusChangeModal(false);
    setPendingStatusChange(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch {
      // Error handled by parent component
    } finally {
      setLoading(false);
    }
  };

  // Format price input
  const handlePriceChange = (value: string) => {
    // Remove non-numeric characters except dots
    const cleanValue = value.replace(/[^\d.]/g, '');
    handleChange('monthly_price', cleanValue);
  };

  // Format price display
  const formatPriceDisplay = (price: string): string => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    return numPrice.toLocaleString('id-ID');
  };

  if (!isOpen) return null;

  const isEditMode = !!room;
  const isOccupied = room?.status === 'occupied' && room?.tenant;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isEditMode ? 'Perbarui informasi kamar' : 'Tambahkan kamar baru ke properti Anda'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Room Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Kamar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) => handleChange('room_number', e.target.value)}
                    disabled={loading || (isEditMode && isOccupied)}
                    placeholder="contoh: 101, A1, Studio-1"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                      errors.room_number ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.room_number && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.room_number}
                  </div>
                )}
              </div>

              {/* Room Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kamar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={formData.room_name}
                    onChange={(e) => handleChange('room_name', e.target.value)}
                    disabled={loading || (isEditMode && isOccupied)}
                    placeholder="contoh: Kamar Standard, Suite Deluxe, Apartemen Studio"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                      errors.room_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.room_name && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.room_name}
                  </div>
                )}
              </div>

              {/* Monthly Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Bulanan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={formData.monthly_price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    disabled={loading || (isEditMode && isOccupied)}
                    placeholder="1500000"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                      errors.monthly_price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    IDR
                  </div>
                </div>
                {formData.monthly_price && !errors.monthly_price && (
                  <p className="mt-1 text-sm text-gray-600">
                    Rp {formatPriceDisplay(formData.monthly_price)}
                  </p>
                )}
                {errors.monthly_price && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.monthly_price}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Kamar
                </label>
                <div className="relative">
                  <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as 'available' | 'occupied' | 'maintenance')}
                    disabled={loading || (isEditMode && isOccupied)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="available">Tersedia</option>
                    <option value="occupied">Terisi</option>
                    <option value="maintenance">Dalam Perawatan</option>
                  </select>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Atur status saat ini untuk kamar ini
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            {/* Main Actions */}
            <div className="sm:flex sm:flex-row-reverse gap-3">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || Object.keys(errors).length > 0 || (isEditMode && isOccupied)}
                className="w-full inline-flex justify-center items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEditMode ? 'Memperbarui...' : 'Membuat...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEditMode ? 'Perbarui Kamar' : 'Buat Kamar'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Batal
              </button>
            </div>
            
            {/* Archive Action - Only show for empty rooms in edit mode */}
            {isEditMode && onArchive && !isOccupied && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Arsipkan Kamar</h4>
                    <p className="text-sm text-amber-600">Kamar akan disimpan dalam arsip dan dapat dipulihkan</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowArchiveModal(true)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-amber-300 rounded-md text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Archive className="h-4 w-4" />
                    Arsipkan Kamar
                  </button>
                </div>
              </div>
            )}
            
            {/* Warning for occupied rooms */}
            {isEditMode && isOccupied && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Kamar Sedang Terisi</h4>
                      <p className="text-sm text-blue-600 mt-1">
                        Kamar ini sedang ditempati oleh <strong>{room?.tenant?.user?.name || 'penyewa'}</strong>. 
                        Untuk mengubah data kamar, lakukan move-out penyewa terlebih dahulu di halaman Manajemen Penyewa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      <DangerousActionModal
        isOpen={showArchiveModal}
        title="Arsipkan Kamar"
        message={`Apakah Anda yakin ingin mengarsipkan kamar ${formData.room_number}? Kamar akan disimpan dalam arsip dan dapat dipulihkan kembali jika diperlukan.`}
        dangerLevel="medium"
        onConfirm={async () => {
          if (onArchive && room) {
            await onArchive(room as Room);
            setShowArchiveModal(false);
            onClose();
          }
        }}
        onCancel={() => setShowArchiveModal(false)}
      />
      
      {/* Status Change Confirmation Modal */}
      <DangerousActionModal
        isOpen={showStatusChangeModal}
        title="Ubah Status Kamar"
        message={`Mengubah status kamar dari "Terisi" menjadi "${pendingStatusChange === 'available' ? 'Tersedia' : 'Perawatan'}" akan mempengaruhi penyewa saat ini (${room?.tenant?.user?.name || 'Penyewa'}). Pastikan proses move-out atau perpindahan telah dilakukan terlebih dahulu. Lanjutkan?`}
        dangerLevel="high"
        onConfirm={handleStatusChangeConfirm}
        onCancel={handleStatusChangeCancel}
      />
    </div>
  );
};