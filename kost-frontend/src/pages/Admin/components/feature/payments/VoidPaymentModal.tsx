import React, { useState } from 'react';
import { 
  XCircle, 
  AlertTriangle, 
  User, 
  CreditCard, 
  MessageSquare,
  Trash2,
  Shield,
  Clock
} from 'lucide-react';
import { Modal } from '../../ui';
import type { AdminPayment as Payment } from '../../../types';

interface VoidPaymentModalProps {
  isOpen: boolean;
  payment: Payment | null;
  onClose: () => void;
  onVoid: (paymentId: number, reason: string, voidType: 'void' | 'cancel') => void;
}

const VOID_REASONS = [
  'Tenant membatalkan sewa',
  'Tagihan dibuat duplikat',
  'Kesalahan nominal tagihan',
  'Kesalahan periode tagihan',
  'Tenant pindah kamar sebelum tagihan dibayar',
  'Maintenance kamar extended',
  'Lainnya (tulis di keterangan)'
];

export const VoidPaymentModal: React.FC<VoidPaymentModalProps> = ({ 
  isOpen, 
  payment, 
  onClose, 
  onVoid 
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [voidType, setVoidType] = useState<'void' | 'cancel'>('void');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (!payment) return;
    
    const finalReason = selectedReason === 'Lainnya (tulis di keterangan)' 
      ? customReason.trim() 
      : selectedReason;
      
    if (!finalReason) return;
    
    setIsLoading(true);
    try {
      await onVoid(payment.id, finalReason, voidType);
      handleClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedReason('');
      setCustomReason('');
      setVoidType('void');
      setShowConfirm(false);
      onClose();
    }
  };

  const handleProceed = () => {
    const finalReason = selectedReason === 'Lainnya (tulis di keterangan)' 
      ? customReason.trim() 
      : selectedReason;
      
    if (finalReason && finalReason.length >= 10) {
      setShowConfirm(true);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseInt(amount) : amount;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const canProceed = () => {
    if (!selectedReason) return false;
    
    if (selectedReason === 'Lainnya (tulis di keterangan)') {
      return customReason.trim().length >= 10;
    }
    
    return true;
  };

  const getVoidTypeInfo = (type: 'void' | 'cancel') => {
    switch (type) {
      case 'void':
        return {
          title: 'Void Payment',
          description: 'Membatalkan tagihan yang sudah dibuat. Tagihan akan ditandai sebagai void dan tidak akan mempengaruhi laporan.',
          color: 'orange',
          icon: XCircle
        };
      case 'cancel':
        return {
          title: 'Cancel Payment',
          description: 'Membatalkan tagihan dan menghapusnya dari sistem. Aksi ini lebih permanen.',
          color: 'red',
          icon: Trash2
        };
    }
  };

  if (!payment) return null;

  const voidInfo = getVoidTypeInfo(voidType);
  const finalReason = selectedReason === 'Lainnya (tulis di keterangan)' 
    ? customReason.trim() 
    : selectedReason;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Void/Cancel Payment" maxWidth="2xl">
      <div className="p-6">
        {/* Warning Header */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <Shield className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">Tindakan Permanen</h4>
              <p className="text-sm text-red-700 mt-1">
                Void/Cancel payment adalah tindakan permanen yang akan mempengaruhi laporan keuangan. 
                <strong> Pastikan alasan yang diberikan jelas dan dapat dipertanggungjawabkan.</strong>
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
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                  {payment.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dibuat:</span>
                <span>{new Date(payment.created_at!).toLocaleDateString('id-ID')}</span>
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
            {/* Void Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pilih Jenis Aksi
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['void', 'cancel'] as const).map((type) => {
                  const info = getVoidTypeInfo(type);
                  const Icon = info.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setVoidType(type)}
                      className={`p-4 text-left rounded-lg border-2 transition-all ${
                        voidType === type
                          ? `border-${info.color}-500 bg-${info.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <Icon className={`w-5 h-5 mr-2 ${
                          voidType === type ? `text-${info.color}-600` : 'text-gray-600'
                        }`} />
                        <span className="font-medium">{info.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">{info.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pilih Alasan <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {VOID_REASONS.map((reason) => (
                  <label key={reason} className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="voidReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            {selectedReason === 'Lainnya (tulis di keterangan)' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="inline w-4 h-4 mr-1" />
                  Keterangan Detail <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Jelaskan alasan detail mengapa payment ini perlu di-void/cancel..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimal 10 karakter. Keterangan ini akan disimpan untuk keperluan audit.
                </p>
              </div>
            )}

            {/* Warning untuk status paid */}
            {payment.status === 'paid' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-800">Perhatian: Payment Sudah Lunas</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Payment ini sudah berstatus "paid". Void/cancel payment yang sudah lunas memerlukan 
                      proses refund manual dan koordinasi dengan tim finance.
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
                disabled={!canProceed() || isLoading}
                className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  voidType === 'void' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Lanjutkan {voidInfo.title}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation */}
            <div className={`mb-6 p-4 border-2 rounded-lg ${
              voidType === 'void' 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h4 className={`text-sm font-semibold mb-3 ${
                voidType === 'void' ? 'text-orange-800' : 'text-red-800'
              }`}>
                Konfirmasi {voidInfo.title}
              </h4>
              <div className={`text-sm space-y-2 ${
                voidType === 'void' ? 'text-orange-700' : 'text-red-700'
              }`}>
                <p><strong>Payment:</strong> {payment.order_id}</p>
                <p><strong>Aksi:</strong> {voidInfo.title}</p>
                <p><strong>Alasan:</strong> {finalReason}</p>
                <p><strong>Jumlah:</strong> {formatCurrency(payment.amount)}</p>
              </div>
              <p className={`text-sm font-medium mt-3 ${
                voidType === 'void' ? 'text-orange-700' : 'text-red-700'
              }`}>
                ⚠️ Tindakan ini tidak dapat dibatalkan dan akan dicatat dalam audit log.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  voidType === 'void' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    {voidType === 'void' ? <XCircle className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Ya, {voidInfo.title}
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