import React, { useState } from 'react';
import { 
  AlertTriangle, 
  User, 
  CreditCard, 
  MessageSquare,
  Save,
  X,
  Lock,
  Shield
} from 'lucide-react';
import { Modal } from '../../ui';
import type { AdminPayment as Payment } from '../../../types';

interface ManualOverrideModalProps {
  isOpen: boolean;
  payment: Payment | null;
  onClose: () => void;
  onOverride: (paymentId: number, newStatus: string, reason: string) => void;
}

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Menunggu', color: 'yellow' },
  { value: 'paid', label: 'Lunas', color: 'green' },
  { value: 'failed', label: 'Gagal', color: 'red' },
  { value: 'overdue', label: 'Terlambat', color: 'orange' },
  { value: 'cancelled', label: 'Dibatalkan', color: 'gray' }
];

export const ManualOverrideModal: React.FC<ManualOverrideModalProps> = ({ 
  isOpen, 
  payment, 
  onClose, 
  onOverride 
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (!payment || !newStatus || !reason.trim()) return;
    
    setIsLoading(true);
    try {
      await onOverride(payment.id, newStatus, reason.trim());
      handleClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNewStatus('');
      setReason('');
      setShowConfirm(false);
      onClose();
    }
  };

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    setShowConfirm(false);
  };

  const handleProceed = () => {
    if (newStatus && reason.trim()) {
      setShowConfirm(true);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseInt(amount) : amount;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const getStatusColor = (status: string) => {
    const statusConfig = PAYMENT_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  };

  const getStatusLabel = (status: string) => {
    const statusConfig = PAYMENT_STATUSES.find(s => s.value === status);
    return statusConfig?.label || status;
  };

  const getStatusColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'gray':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!payment) return null;

  const isStatusChanged = newStatus && newStatus !== payment.status;
  const isHighRiskChange = (payment.status === 'paid' && newStatus !== 'paid') || 
                          (payment.status === 'failed' && newStatus === 'paid');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Manual Override Status Pembayaran" maxWidth="2xl">
      <div className="p-6">
        {/* Warning Header */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <Shield className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">Override Manual - Admin Only</h4>
              <p className="text-sm text-red-700 mt-1">
                Fitur ini untuk mengatasi kasus khusus dimana sistem tidak dapat update status otomatis. 
                <strong> Semua perubahan akan dicatat untuk audit.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Info Pembayaran
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono">{payment.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Jumlah:</span>
                <span className="font-semibold">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bulan:</span>
                <span>{payment.payment_month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status Saat Ini:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColorClasses(getStatusColor(payment.status))}`}>
                  {getStatusLabel(payment.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Info Tenant
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama:</span>
                <span>{payment.tenant?.user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>{payment.tenant?.user?.email || 'N/A'}</span>
              </div>
              {payment.tenant?.user?.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Telepon:</span>
                  <span>{payment.tenant.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {!showConfirm ? (
          <>
            {/* Status Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pilih Status Baru
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PAYMENT_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={status.value === payment.status}
                    className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      status.value === payment.status
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : newStatus === status.value
                        ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                        : `border-gray-200 hover:border-${status.color}-300 hover:bg-${status.color}-50`
                    }`}
                  >
                    {status.label}
                    {status.value === payment.status && (
                      <span className="block text-xs text-gray-500 mt-1">(Saat ini)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="inline w-4 h-4 mr-1" />
                Alasan Override <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jelaskan alasan mengapa status pembayaran perlu diubah secara manual..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimal 10 karakter. Alasan ini akan disimpan untuk keperluan audit.
              </p>
            </div>

            {/* High Risk Warning */}
            {isHighRiskChange && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800">Perubahan Berisiko Tinggi</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Anda akan mengubah status dari "{getStatusLabel(payment.status)}" ke "{getStatusLabel(newStatus)}". 
                      Pastikan Anda memiliki dokumentasi yang cukup untuk perubahan ini.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleProceed}
                disabled={!isStatusChanged || reason.trim().length < 10 || isLoading}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Lock className="w-4 h-4 mr-2" />
                Lanjutkan Override
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-semibold text-red-800 mb-3">Konfirmasi Override Manual</h4>
              <div className="text-sm text-red-700 space-y-2">
                <p><strong>Payment:</strong> {payment.order_id}</p>
                <p><strong>Status:</strong> {getStatusLabel(payment.status)} → {getStatusLabel(newStatus)}</p>
                <p><strong>Alasan:</strong> {reason}</p>
              </div>
              <p className="text-sm text-red-700 mt-3 font-medium">
                ⚠️ Tindakan ini tidak dapat dibatalkan dan akan dicatat dalam audit log.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-4 h-4 mr-2 inline" />
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Ya, Override Status
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};