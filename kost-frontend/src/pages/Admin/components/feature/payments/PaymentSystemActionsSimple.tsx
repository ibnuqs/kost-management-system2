// File: src/pages/Admin/components/feature/payments/PaymentSystemActionsSimple.tsx
import React from 'react';
import { Settings } from 'lucide-react';

export const PaymentSystemActionsSimple: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Manajemen Sistem Pembayaran
          </h3>
          <p className="text-sm text-gray-500">
            Kelola pembayaran bulanan dan status otomatis
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">
            Generate Pembayaran Bulanan
          </h4>
          <button className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
            Generate Pembayaran Bulan Ini
          </button>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-3">
            Proses Status Pembayaran
          </h4>
          <button className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm">
            Update Status Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSystemActionsSimple;