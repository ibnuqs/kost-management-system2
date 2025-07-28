import React, { useState } from 'react';
import { Calendar, DollarSign, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal } from '../../ui';
import { Tenant } from '../../../types/tenant';

interface GeneratePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onGenerate: (data: {
    tenant_id: number;
    payment_month: string;
    prorate_from_date?: string;
    send_notification: boolean;
  }) => Promise<void>;
  loading: boolean;
}

export const GeneratePaymentModal: React.FC<GeneratePaymentModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onGenerate,
  loading
}) => {
  const [paymentMonth, setPaymentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [prorateFromDate, setProrateFromDate] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [useProrating, setUseProrating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenant) return;

    const data = {
      tenant_id: tenant.id,
      payment_month: paymentMonth,
      send_notification: sendNotification,
      ...(useProrating && prorateFromDate && { prorate_from_date: prorateFromDate })
    };

    await onGenerate(data);
  };

  const calculateProratedAmount = () => {
    if (!useProrating || !prorateFromDate || !tenant) return null;

    const monthStart = new Date(paymentMonth + '-01');
    const prorateDate = new Date(prorateFromDate);
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - prorateDate.getDate() + 1;
    
    const dailyRate = tenant.monthly_rent / daysInMonth;
    const proratedAmount = dailyRate * remainingDays;

    return {
      originalAmount: tenant.monthly_rent,
      proratedAmount: Math.round(proratedAmount),
      remainingDays,
      daysInMonth
    };
  };

  const proratedCalculation = calculateProratedAmount();

  if (!tenant) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Payment Manual">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tenant Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <User className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Penyewa</span>
          </div>
          <div className="ml-6">
            <p className="font-semibold text-gray-900">{tenant.user.name}</p>
            <p className="text-sm text-gray-600">Room {tenant.room.room_number} - {tenant.room.room_name}</p>
            <p className="text-sm text-gray-600">Sewa bulanan: Rp {tenant.monthly_rent.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Payment Month */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bulan Pembayaran
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="month"
              value={paymentMonth}
              onChange={(e) => setPaymentMonth(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Prorating Option */}
        <div>
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="useProrating"
              checked={useProrating}
              onChange={(e) => setUseProrating(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="useProrating" className="ml-2 text-sm font-medium text-gray-700">
              Gunakan prorata (untuk penyewa yang masuk di tengah bulan)
            </label>
          </div>

          {useProrating && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai Sewa
                </label>
                <input
                  type="date"
                  value={prorateFromDate}
                  onChange={(e) => setProrateFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required={useProrating}
                />
              </div>

              {proratedCalculation && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Perhitungan Prorata</span>
                  </div>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>Sewa per bulan: Rp {proratedCalculation.originalAmount.toLocaleString('id-ID')}</p>
                    <p>Hari tersisa: {proratedCalculation.remainingDays} dari {proratedCalculation.daysInMonth} hari</p>
                    <p className="font-semibold">
                      Jumlah prorata: Rp {proratedCalculation.proratedAmount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notification Option */}
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendNotification"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="sendNotification" className="ml-2 text-sm font-medium text-gray-700">
              Kirim notifikasi ke penyewa
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Notifikasi akan dikirim langsung via in-app notification
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-800 font-medium">Perhatian</p>
              <p className="text-yellow-700 mt-1">
                Pastikan tidak ada payment yang sudah dibuat untuk bulan ini. 
                Sistem akan menolak jika ada duplikasi.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Membuat...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Generate Payment
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};