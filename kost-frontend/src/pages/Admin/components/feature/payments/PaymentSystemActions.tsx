// File: src/pages/Admin/components/feature/payments/PaymentSystemActions.tsx
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { 
  Settings, 
  Play, 
  RefreshCw, 
  Calendar, 
  Activity,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { reservationService } from '../../../services/reservationService';

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface PaymentSystemActionsProps {
  onRefresh?: () => void;
}

export const PaymentSystemActions: React.FC<PaymentSystemActionsProps> = ({
  onRefresh
}) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, ActionResult>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const setActionLoading = (action: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [action]: isLoading }));
  };

  const setActionResult = (action: string, result: ActionResult) => {
    setResults(prev => ({ ...prev, [action]: result }));
  };

  const handleAction = async (action: string, apiCall: () => Promise<ActionResult>) => {
    setActionLoading(action, true);
    try {
      const result = await apiCall();
      setActionResult(action, result);
      
      // Refresh data if callback provided
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        setActionResult(action, {
          success: false,
          error: error.response.data.message
        });
      } else if (error instanceof Error) {
        setActionResult(action, {
          success: false,
          error: error.message
        });
      } else {
        setActionResult(action, {
          success: false,
          error: 'Terjadi kesalahan'
        });
      }
    } finally {
      setActionLoading(action, false);
    }
  };

  const renderActionResult = (action: string) => {
    const result = results[action];
    if (!result) return null;

    return (
      <div className={`mt-2 p-2 rounded text-xs ${ 
        result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        {result.success ? (
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {result.message || 'Berhasil'}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {result.error || 'Gagal'}
          </div>
        )}
      </div>
    );
  };

  const clearResults = () => {
    setResults({});
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
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
        
        <div className="flex items-center gap-2">
          {Object.keys(results).length > 0 && (
            <button
              onClick={clearResults}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Clear Results"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Tutup
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Buka
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Generate Monthly Payments */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Generate Pembayaran Bulanan
              </h4>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleAction('generate-payments', () => 
                    reservationService.generateMonthlyPayments({ dry_run: false })
                  )}
                  disabled={loading['generate-payments']}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
                >
                  {loading['generate-payments'] ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Generate Pembayaran Bulan Ini
                </button>
                {renderActionResult('generate-payments')}
              </div>
            </div>

            {/* Process Payment Status */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-600" />
                Proses Status Pembayaran
              </h4>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleAction('process-payment-status', () => 
                    reservationService.processPaymentStatus({ grace_days: 7, dry_run: false })
                  )}
                  disabled={loading['process-payment-status']}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400 transition-colors text-sm"
                >
                  {loading['process-payment-status'] ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  Update Status Pembayaran
                </button>
                {renderActionResult('process-payment-status')}
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">Peringatan:</p>
                <p>Operasi ini akan mempengaruhi sistem pembayaran secara langsung. Pastikan Anda memahami konsekuensi sebelum menjalankan.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentSystemActions;