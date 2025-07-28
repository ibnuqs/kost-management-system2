import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  AlertTriangle, 
  Users, 
  Receipt, 
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../../ui';

interface PreCheckResult {
  valid: boolean;
  activeTenantsCount: number;
  duplicatePayments: number;
  invalidData: number;
  warnings: string[];
  errors: string[];
}

interface GeneratePaymentModalAdvancedProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (month: string) => void;
  onPreCheck?: (month: string) => Promise<PreCheckResult>;
}

export const GeneratePaymentModalAdvanced: React.FC<GeneratePaymentModalAdvancedProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate,
  onPreCheck 
}) => {
  const [month, setMonth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPre, setIsCheckingPre] = useState(false);
  const [preCheckResult, setPreCheckResult] = useState<PreCheckResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleSubmit = async () => {
    if (month && !isLoading) {
      setIsLoading(true);
      try {
        await onGenerate(month);
        setMonth('');
        setPreCheckResult(null);
        setShowConfirm(false);
        onClose();
      } catch (error) {
        // Error is handled by the parent component
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePreCheck = async () => {
    if (!month || !onPreCheck) return;
    
    setIsCheckingPre(true);
    try {
      const result = await onPreCheck(month);
      setPreCheckResult(result);
      if (result.valid && result.errors.length === 0) {
        setShowConfirm(true);
      }
    } catch (error) {
      console.error('Pre-check failed:', error);
      setPreCheckResult({
        valid: false,
        activeTenantsCount: 0,
        duplicatePayments: 0,
        invalidData: 0,
        warnings: [],
        errors: ['Gagal melakukan pengecekan validasi. Silakan coba lagi.']
      });
    } finally {
      setIsCheckingPre(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isCheckingPre) {
      setMonth('');
      setPreCheckResult(null);
      setShowConfirm(false);
      onClose();
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPreCheckResult(null);
      setShowConfirm(false);
    }
  }, [isOpen]);

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

  const canProceed = preCheckResult?.valid && preCheckResult.errors.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Generate Tagihan Bulanan - Advanced" maxWidth="2xl">
      <div className="p-6">
        {/* Month Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Bulan Pembayaran
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPreCheckResult(null);
              setShowConfirm(false);
            }}
            min={currentMonth}
            disabled={isLoading || isCheckingPre}
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

        {/* Pre-check Button */}
        {month && !preCheckResult && (
          <div className="mb-6">
            <button
              onClick={handlePreCheck}
              disabled={isCheckingPre}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCheckingPre ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memeriksa Validasi...
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Lakukan Pengecekan Validasi
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Sistem akan memeriksa data tenant dan mencegah duplikasi
            </p>
          </div>
        )}

        {/* Pre-check Results */}
        {preCheckResult && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg border ${
              preCheckResult.valid && preCheckResult.errors.length === 0
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center mb-3">
                {preCheckResult.valid && preCheckResult.errors.length === 0 ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="text-sm font-semibold text-green-800">Validasi Berhasil</h4>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="text-sm font-semibold text-red-800">Validasi Gagal</h4>
                  </>
                )}
              </div>

              {/* Validation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded border">
                  <Users className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <div className="text-lg font-bold text-gray-900">{preCheckResult.activeTenantsCount}</div>
                  <div className="text-xs text-gray-600">Tenant Aktif</div>
                </div>

                <div className="text-center p-3 bg-white rounded border">
                  <Receipt className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                  <div className="text-lg font-bold text-gray-900">{preCheckResult.duplicatePayments}</div>
                  <div className="text-xs text-gray-600">Duplikasi Ditemukan</div>
                </div>

                <div className="text-center p-3 bg-white rounded border">
                  <AlertTriangle className="w-5 h-5 mx-auto text-red-600 mb-1" />
                  <div className="text-lg font-bold text-gray-900">{preCheckResult.invalidData}</div>
                  <div className="text-xs text-gray-600">Data Tidak Valid</div>
                </div>
              </div>

              {/* Errors */}
              {preCheckResult.errors.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-red-800 mb-2">Kesalahan yang Harus Diperbaiki:</h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    {preCheckResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <XCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {preCheckResult.warnings.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-yellow-800 mb-2">Peringatan:</h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {preCheckResult.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Section */}
        {showConfirm && canProceed && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-800">Konfirmasi Generate Tagihan</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Sistem akan membuat <strong>{preCheckResult?.activeTenantsCount} tagihan baru</strong> untuk bulan {formatSelectedMonth(month)}. 
                  Proses ini tidak dapat dibatalkan setelah dimulai.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Process Info */}
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Yang akan dilakukan sistem:</h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 text-blue-500" />
              Validasi status tenant aktif
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Receipt className="h-4 w-4 mr-2 text-green-500" />
              Cek duplikasi tagihan untuk periode yang sama
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-purple-500" />
              Generate tagihan dengan nominal sesuai kontrak
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-500" />
              Set tanggal jatuh tempo otomatis
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isLoading || isCheckingPre}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Batal
          </button>
          
          {!showConfirm ? (
            <button
              onClick={handlePreCheck}
              disabled={!month || isCheckingPre || isLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCheckingPre ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memeriksa...
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Periksa Validasi
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed || isLoading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate {preCheckResult?.activeTenantsCount} Tagihan
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};