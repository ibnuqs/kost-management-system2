// File: src/pages/Tenant/components/feature/payments/PaymentHistoryTable.tsx (KODE YANG BENAR)

import React from 'react';
import { Payment } from '../../../types/payment';
import PaymentCard from './PaymentCard'; // Kita gunakan kembali PaymentCard yang sudah ada

interface PaymentHistoryTableProps {
  payments: Payment[];
  isLoading?: boolean;
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  isLoading = false,
}) => {
  if (isLoading) {
    // Tampilkan skeleton loading saat data diambil
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border animate-pulse h-48"></div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    // Tampilan jika tidak ada data pembayaran
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <div className="text-5xl mb-4">💳</div>
        <h3 className="text-xl font-semibold text-gray-800">Tidak Ada Pembayaran</h3>
        <p className="text-gray-500 mt-1">Anda belum melakukan pembayaran apapun.</p>
      </div>
    );
  }

  // Tampilkan daftar pembayaran menggunakan komponen PaymentCard yang sudah Anda buat
  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <PaymentCard key={payment.id} payment={payment} />
      ))}
    </div>
  );
};

export default PaymentHistoryTable;