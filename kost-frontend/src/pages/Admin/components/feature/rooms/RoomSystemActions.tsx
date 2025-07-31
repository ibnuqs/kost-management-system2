// File: src/pages/Admin/components/feature/rooms/RoomSystemActions.tsx
import React, { useState } from 'react';
import { 
  Settings, 
  RefreshCw, 
  Clock,
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

interface RoomSystemActionsProps {
  onRefresh?: () => void;
}

export const RoomSystemActions: React.FC<RoomSystemActionsProps> = ({
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
      setActionResult(action, {
        success: false,
        error: (error as Record<string, unknown>)?.response?.data?.message as string || (error as Error).message || 'Terjadi kesalahan'
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

  const clearResults = () => {
    setResults({});
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Manajemen Sistem Kamar
            </h3>
            <p className="text-sm text-gray-500">
              Kelola reservasi dan status kamar otomatis
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
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-4">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Pembersihan Reservasi
            </h4>
            
            <div className="space-y-3">
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
              
              <div className="text-xs text-purple-700 mt-2">
                <p><strong>Fungsi:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Menghapus reservasi yang sudah kedaluwarsa</li>
                  <li>Mengembalikan status kamar ke "available"</li>
                  <li>Membersihkan data reservasi yang tidak terpakai</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">Peringatan:</p>
                <p>Operasi ini akan menghapus reservasi yang kedaluwarsa dan mengubah status kamar secara otomatis.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoomSystemActions;