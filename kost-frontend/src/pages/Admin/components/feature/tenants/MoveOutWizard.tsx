// File: src/pages/Admin/components/feature/tenants/MoveOutWizard.tsx
import React, { useState } from 'react';
import { X, UserX, AlertTriangle, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Tenant, MoveOutData } from '../../../types/tenant';

interface MoveOutWizardProps {
  isOpen: boolean;
  tenant?: Tenant | null;
  onClose: () => void;
  onSubmit: (data: MoveOutData) => Promise<void>;
}

export const MoveOutWizard: React.FC<MoveOutWizardProps> = ({ 
  isOpen, 
  tenant, 
  onClose, 
  onSubmit 
}) => {
  const [moveOutDate, setMoveOutDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMoveOutDate(new Date().toISOString().split('T')[0]);
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen || !tenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moveOutDate) {
      toast.error('Tanggal move out harus diisi');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        move_out_date: moveOutDate,
        reason: reason.trim()
      });
      onClose();
      toast.success('Penyewa berhasil di-move out');
    } catch (error: unknown) {
      console.error('Move out error:', error);
      toast.error((error as Error).message || 'Gagal melakukan move out');
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-100 flex-shrink-0">
          <div className="flex items-center">
            <UserX className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Move Out Penyewa</h2>
              <p className="text-sm text-gray-600">
                {tenant.user.name} - Kamar {tenant.room.room_number}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form id="moveout-form" onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Tenant Info Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Informasi Penyewa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nama:</span>
                  <p className="font-medium">{tenant.user.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{tenant.user.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Kamar:</span>
                  <p className="font-medium">{tenant.room.room_number} - {tenant.room.room_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Mulai Sewa:</span>
                  <p className="font-medium">{formatDate(tenant.start_date)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Sewa Bulanan:</span>
                  <p className="font-medium">{formatCurrency(typeof tenant.monthly_rent === 'string' ? parseFloat(tenant.monthly_rent) : tenant.monthly_rent)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium capitalize">{tenant.status}</p>
                </div>
              </div>
            </div>

            {/* Move Out Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Move Out <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                min={tenant.start_date.split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tanggal tidak boleh lebih awal dari tanggal mulai sewa atau lebih dari hari ini
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Move Out (Opsional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Contoh: kontrak berakhir, pindah kerja, dll."
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length}/500 karakter
              </p>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">Perhatian</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Proses move out akan mengubah status penyewa menjadi "moved out" dan tidak dapat dibatalkan. 
                    Kamar akan tersedia untuk penyewa baru.
                  </p>
                </div>
              </div>
            </div>

            {/* Billing Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <DollarSign className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Informasi Billing</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Perhitungan pengembalian deposit dan sewa pro-rata akan diproses otomatis setelah move out. 
                    Pastikan semua pembayaran sudah lunas.
                  </p>
                </div>
              </div>
            </div>
          </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="moveout-form"
            disabled={submitting || !moveOutDate}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {submitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>
              {submitting ? 'Memproses...' : 'Konfirmasi Move Out'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveOutWizard;