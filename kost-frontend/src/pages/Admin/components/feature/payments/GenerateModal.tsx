import React, { useState } from 'react';
import { Calendar, Plus, AlertTriangle, Users, Receipt } from 'lucide-react';
import { Modal } from '../../ui';

export const GenerateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (month: string) => void;
}> = ({ isOpen, onClose, onGenerate }) => {
  const [month, setMonth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async () => {
    if (month && !isLoading) {
      setIsLoading(true);
      try {
        await onGenerate(month);
        setMonth('');
        onClose();
      } catch {
        // Error is handled by the parent component
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setMonth('');
      onClose();
    }
  };

  // Get current month as minimum value
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Format selected month for display
  const formatSelectedMonth = (monthValue: string) => {
    if (!monthValue) return '';
    return new Date(monthValue + '-01').toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Generate Tagihan Bulanan">
      <div className="p-6">
        {/* Warning Notice */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-yellow-800">Perhatian</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Proses ini akan membuat tagihan pembayaran untuk <strong>SEMUA penyewa aktif</strong> pada bulan yang dipilih. 
                Pastikan bulan yang dipilih belum pernah di-generate sebelumnya.
              </p>
            </div>
          </div>
        </div>

        {/* Month Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Bulan Pembayaran
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            min={currentMonth}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            Pilih bulan untuk generate tagihan pembayaran
          </p>
          
          {month && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Bulan terpilih:</strong> {formatSelectedMonth(month)}
              </p>
            </div>
          )}
        </div>

        {/* Process Info */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Yang akan dilakukan:</h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              Generate tagihan untuk semua penyewa aktif
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Receipt className="h-4 w-4 mr-2 text-green-500" />
              Buat kode pembayaran unik untuk setiap tagihan
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-purple-500" />
              Set tanggal jatuh tempo sesuai aturan sistem
            </div>
          </div>
        </div>
        
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
            onClick={handleSubmit}
            disabled={!month || isLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Memproses...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Generate Tagihan
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};