import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Eye,
  Settings,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card } from '../../ui';
import { paymentService } from '../../../services';
import api, { endpoints } from '../../../../../utils/api';
import type { AdminPayment as Payment } from '../../../types';

interface StuckPayment extends Payment {
  stuck_duration: number; // in hours
  last_sync_attempt?: string;
  auto_sync_failed: boolean;
}

interface StuckPaymentDetectorProps {
  onViewPayment: (payment: Payment) => void;
  onSyncPayment: (id: number) => void;
  onManualOverride: (payment: Payment) => void;
  onBulkSync?: (paymentIds: number[]) => void;
}

export const StuckPaymentDetector: React.FC<StuckPaymentDetectorProps> = ({
  onViewPayment,
  onSyncPayment,
  onManualOverride,
  onBulkSync
}) => {
  const [stuckPayments, setStuckPayments] = useState<StuckPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoSyncing, setAutoSyncing] = useState<number[]>([]);

  useEffect(() => {
    const fetchStuckPayments = async () => {
      setLoading(true);
      try {
        const response = await api.get(endpoints.admin.payments.stuck);
        setStuckPayments(response.data.data || []);
      } catch (error) {
        console.error('Error fetching stuck payments:', error);
        setStuckPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStuckPayments();
  }, []);

  const handleAutoSync = async (paymentId: number) => {
    setAutoSyncing(prev => [...prev, paymentId]);
    try {
      await onSyncPayment(paymentId);
      // Remove from stuck payments if sync successful
      setStuckPayments(prev => prev.filter(p => p.id !== paymentId));
    } catch (error) {
      // Keep in stuck payments and mark as failed
      setStuckPayments(prev => 
        prev.map(p => 
          p.id === paymentId 
            ? { ...p, auto_sync_failed: true, last_sync_attempt: new Date().toISOString() }
            : p
        )
      );
    } finally {
      setAutoSyncing(prev => prev.filter(id => id !== paymentId));
    }
  };

  const handleBulkAutoSync = async () => {
    if (!onBulkSync) return;
    const paymentIds = stuckPayments.map(p => p.id);
    setAutoSyncing(paymentIds);
    try {
      await onBulkSync(paymentIds);
      setStuckPayments([]);
    } catch (error) {
      // Handle partial success
    } finally {
      setAutoSyncing([]);
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours} jam`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days} hari ${remainingHours} jam`;
  };

  const getSeverityColor = (hours: number) => {
    if (hours >= 24) return 'red'; // 1+ days
    if (hours >= 6) return 'orange'; // 6+ hours
    return 'yellow'; // less than 6 hours
  };

  const getSeverityColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'orange':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (stuckPayments.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center text-green-600">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          <span className="font-medium">Tidak ada pembayaran yang terjebak di status pending</span>
        </div>
        <p className="text-sm text-gray-500 text-center mt-2">
          Semua pembayaran diproses dengan normal
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-orange-900">
              Pembayaran Terjebat Pending
            </h3>
            <span className="ml-2 px-2 py-1 bg-orange-200 text-orange-800 text-xs font-medium rounded">
              {stuckPayments.length} item
            </span>
          </div>
          
          {onBulkSync && stuckPayments.length > 1 && (
            <button
              onClick={handleBulkAutoSync}
              disabled={autoSyncing.length > 0}
              className="inline-flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {autoSyncing.length > 0 ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Semua
                </>
              )}
            </button>
          )}
        </div>
        
        <p className="text-sm text-orange-700 mt-2">
          Pembayaran yang terjebak di status pending lebih dari 6 jam dan memerlukan perhatian manual
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {stuckPayments.map((payment) => {
            const severity = getSeverityColor(payment.stuck_duration);
            const isAutoSyncing = autoSyncing.includes(payment.id);
            
            return (
              <div 
                key={payment.id}
                className={`p-4 rounded-lg border-2 ${getSeverityColorClasses(severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-semibold text-sm">
                        {payment.order_id}
                      </span>
                      <span className="ml-2 text-xs">
                        • {payment.tenant?.user?.name}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs mb-3">
                      <div>
                        <span className="font-medium">Terjebak: </span>
                        {formatDuration(payment.stuck_duration)}
                      </div>
                      <div>
                        <span className="font-medium">Jumlah: </span>
                        Rp {parseInt(payment.amount).toLocaleString('id-ID')}
                      </div>
                      <div>
                        <span className="font-medium">Bulan: </span>
                        {payment.payment_month}
                      </div>
                    </div>

                    {payment.auto_sync_failed && (
                      <div className="flex items-center text-xs text-red-600 mb-2">
                        <XCircle className="w-3 h-3 mr-1" />
                        Auto-sync terakhir gagal pada {new Date(payment.last_sync_attempt!).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onViewPayment(payment)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Lihat detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleAutoSync(payment.id)}
                      disabled={isAutoSyncing}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                      title="Sync status"
                    >
                      {isAutoSyncing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onManualOverride(payment)}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                      title="Manual override"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Tingkat Keparahan:</h4>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-200 rounded mr-1"></div>
              <span>Perhatian (&lt; 6 jam)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-200 rounded mr-1"></div>
              <span>Mendesak (6-24 jam)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-200 rounded mr-1"></div>
              <span>Kritis (&gt; 24 jam)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};