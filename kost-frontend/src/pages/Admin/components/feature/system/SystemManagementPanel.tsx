// File: src/pages/Admin/components/feature/system/SystemManagementPanel.tsx
import React, { useState } from 'react';
import { 
  Settings, 
  Play, 
  RefreshCw, 
  Users, 
  Calendar, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { reservationService } from '../../../services/reservationService';

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: Record<string, unknown>; // For system-health check, it returns data
}

interface SystemManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemManagementPanel: React.FC<SystemManagementPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, ActionResult>>({});

  const setActionLoading = (action: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [action]: isLoading }));
  };

  const setActionResult = (action: string, result: ActionResult) => {
    setResults(prev => ({ ...prev, [action]: result }));
  };

  const handleAction = async (action: string, apiCall: () => Promise<unknown>) => {
    setActionLoading(action, true);
    try {
      const result = await apiCall();
      setActionResult(action, result);
    } catch (error: unknown) {
      setActionResult(action, {
        success: false,
        error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error).message || 'Terjadi kesalahan'
      });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Panel Manajemen Sistem
                  </h3>
                  <p className="text-sm text-gray-500">
                    Kelola pembayaran, tenant, dan sistem otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Management */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Manajemen Pembayaran
                </h4>
                
                <div className="space-y-3">
                  <div>
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
                      Generate Pembayaran Bulanan
                    </button>
                    {renderActionResult('generate-payments')}
                  </div>

                  <div>
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
                      Proses Status Pembayaran
                    </button>
                    {renderActionResult('process-payment-status')}
                  </div>
                </div>
              </div>

              {/* Tenant Management */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Manajemen Tenant
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <button
                      onClick={() => handleAction('update-all-tenants-access', () => 
                        reservationService.updateAllTenantsAccess()
                      )}
                      disabled={loading['update-all-tenants-access']}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                    >
                      {loading['update-all-tenants-access'] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Update Akses Semua Tenant
                    </button>
                    {renderActionResult('update-all-tenants-access')}
                  </div>
                </div>
              </div>

              {/* System Cleanup */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Pembersihan Sistem
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <button
                      onClick={() => handleAction('cleanup-reservations', () => 
                        reservationService.cleanupExpiredReservations({ dry_run: false })
                      )}
                      disabled={loading['cleanup-reservations']}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-sm"
                    >
                      {loading['cleanup-reservations'] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Bersihkan Reservasi Kedaluwarsa
                    </button>
                    {renderActionResult('cleanup-reservations')}
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-600" />
                  Status Sistem
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <button
                      onClick={() => handleAction('system-health', () => 
                        reservationService.getSystemHealth()
                      )}
                      disabled={loading['system-health']}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors text-sm"
                    >
                      {loading['system-health'] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Activity className="w-4 h-4" />
                      )}
                      Cek Kesehatan Sistem
                    </button>
                    {renderActionResult('system-health')}
                    
                    {/* Show health details if available */}
                    {results['system-health']?.success && (
                      <div className="mt-2 p-2 bg-white rounded border text-xs">
                        <div className="font-medium mb-1">
                          Status: {results['system-health'].data.overall_status}
                        </div>
                        <div className="text-gray-600">
                          Database: {results['system-health'].data.health_checks.database.status}<br/>
                          Payments: {results['system-health'].data.health_checks.payments.status}<br/>
                          Tenants: {results['system-health'].data.health_checks.tenants.status}<br/>
                          Commands: {results['system-health'].data.health_checks.commands.status}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Peringatan:</p>
                  <p>Operasi ini akan mempengaruhi sistem secara langsung. Pastikan Anda memahami konsekuensi dari setiap tindakan sebelum menjalankannya.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};