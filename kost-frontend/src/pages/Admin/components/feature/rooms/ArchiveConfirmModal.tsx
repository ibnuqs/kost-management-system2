// File: src/pages/Admin/components/feature/rooms/ArchiveConfirmModal.tsx
import React, { useState } from 'react';
import { X, Archive, AlertTriangle } from 'lucide-react';
import type { Room } from '../../../types/room';

interface ArchiveConfirmModalProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
  onConfirm: (room: Room, reason?: string) => void;
}

export const ArchiveConfirmModal: React.FC<ArchiveConfirmModalProps> = ({
  isOpen,
  room,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    setLoading(true);
    try {
      await onConfirm(room, reason.trim() || undefined);
      onClose();
      setReason('');
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setReason('');
    }
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Archive className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Arsipkan Kamar {room.room_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {room.room_name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Warning */}
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-orange-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-orange-800">Perhatian</h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <p>
                      Kamar yang diarsipkan akan disembunyikan dari daftar utama dan tidak dapat ditugaskan ke penyewa baru. 
                      Anda dapat memulihkan kamar dari arsip kapan saja.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Pengarsipan (Opsional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                  placeholder="Contoh: Renovasi, perbaikan struktur, tidak digunakan sementara..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Alasan ini akan membantu Anda mengingat mengapa kamar diarsipkan
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengarsipkan...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  Arsipkan Kamar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:w-auto sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};