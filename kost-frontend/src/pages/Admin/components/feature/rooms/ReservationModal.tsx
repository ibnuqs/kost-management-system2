// File: src/pages/Admin/components/feature/rooms/ReservationModal.tsx
import React, { useState } from 'react';
import { X, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { Room, RoomReservationData } from '../../../types/room';

interface ReservationModalProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
  onSubmit: (data: RoomReservationData) => void;
  loading?: boolean;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  room,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<RoomReservationData>({
    reason: '',
    hours: 24,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof RoomReservationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.hours || formData.hours < 1 || formData.hours > 72) {
      newErrors.hours = 'Durasi reservasi harus antara 1-72 jam';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit(formData);
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Reservasi Kamar {room.room_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {room.room_name} - Reservasi sementara
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi Reservasi (Jam) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={formData.hours}
                  onChange={(e) => handleChange('hours', parseInt(e.target.value) || 1)}
                  disabled={loading}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 ${
                    errors.hours ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.hours && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.hours}
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Maksimal 72 jam (3 hari). Default: 24 jam
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Reservasi
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  disabled={loading}
                  placeholder="Opsional: Alasan melakukan reservasi..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 resize-none"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Akan diset default jika dikosongkan
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Informasi Reservasi</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>• Kamar akan dikunci untuk penugasan tenant lain</p>
                  <p>• Reservasi akan otomatis dibatalkan setelah masa berlaku</p>
                  <p>• Anda dapat membatalkan atau mengkonfirmasi reservasi kapan saja</p>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Reservasi Kamar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};