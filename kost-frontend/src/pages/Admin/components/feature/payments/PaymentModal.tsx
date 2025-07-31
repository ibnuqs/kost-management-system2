import React, { useState } from 'react';
import { RefreshCw, User, Mail, CreditCard, Calendar, DollarSign, Hash, Clock } from 'lucide-react';
import type { AdminPayment as Payment } from '../../../types';
import { Modal } from '../../ui';

export const PaymentModal: React.FC<{
  isOpen: boolean;
  payment: Payment | null;
  onClose: () => void;
  onSyncPayment: (id: number) => void;
}> = ({ isOpen, payment, onClose, onSyncPayment }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  if (!payment) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncPayment(payment.id);
    } catch {
      // Error handled by parent
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Tidak tersedia';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'Lunas';
      case 'pending':
        return 'Menunggu';
      case 'failed':
        return 'Gagal';
      case 'expired':
        return 'Kedaluwarsa';
      case 'overdue':
        return 'Terlambat';
      default:
        return status || 'Tidak diketahui';
    }
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseInt(amount) : amount;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pembayaran" maxWidth="2xl">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Information */}
          <div className="space-y-4">
            <h4 className="flex items-center font-semibold text-gray-900 text-lg mb-4">
              <CreditCard className="w-5 h-5 mr-2" />
              Informasi Pembayaran
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Hash className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">ID Pesanan:</span>
                </div>
                <span className="font-mono text-sm font-medium">{payment.order_id}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Jumlah:</span>
                </div>
                <span className="font-semibold text-lg">{formatCurrency(payment.amount)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Bulan Bayar:</span>
                </div>
                <span className="font-medium">{payment.payment_month}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(payment.status)}`}>
                  {getStatusText(payment.status)}
                </span>
              </div>

              {payment.payment_method && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Metode Bayar:</span>
                  <span className="font-medium capitalize">{payment.payment_method}</span>
                </div>
              )}

              {payment.transaction_id && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">ID Transaksi:</span>
                  <span className="font-mono text-sm">{payment.transaction_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tenant Information */}
          <div className="space-y-4">
            <h4 className="flex items-center font-semibold text-gray-900 text-lg mb-4">
              <User className="w-5 h-5 mr-2" />
              Informasi Penyewa
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Nama:</span>
                </div>
                <span className="font-medium">{payment.tenant?.user?.name || 'Tidak diketahui'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Email:</span>
                </div>
                <span className="font-medium">{payment.tenant?.user?.email || 'Tidak ada email'}</span>
              </div>

              {payment.tenant?.user?.phone && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Telepon:</span>
                  <span className="font-medium">{payment.tenant.user.phone}</span>
                </div>
              )}

              {payment.tenant?.monthly_rent && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Sewa Bulanan:</span>
                  <span className="font-semibold">{formatCurrency(payment.tenant.monthly_rent)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="flex items-center font-medium text-gray-900 mb-3">
            <Clock className="w-4 h-4 mr-2" />
            Timeline Pembayaran
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Dibuat:</span>
              <span>{formatDate(payment.created_at)}</span>
            </div>
            {payment.paid_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Dibayar:</span>
                <span className="text-green-600 font-medium">{formatDate(payment.paid_at)}</span>
              </div>
            )}
            {payment.failed_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Gagal:</span>
                <span className="text-red-600 font-medium">{formatDate(payment.failed_at)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Terakhir Diperbarui:</span>
              <span>{formatDate(payment.updated_at)}</span>
            </div>
            {payment.failure_reason && (
              <div className="mt-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                <span className="text-red-700 text-xs font-medium">
                  Alasan Gagal: {payment.failure_reason}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Payment Info */}
        {(payment.snap_token || payment.transaction_id) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Detail Teknis</h5>
            <div className="space-y-2 text-sm">
              {payment.snap_token && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Snap Token:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {payment.snap_token.substring(0, 20)}...
                  </span>
                </div>
              )}
              {payment.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Transaksi:</span>
                  <span className="font-mono text-xs">{payment.transaction_id}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSyncing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyinkronkan...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sinkronisasi Status
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};