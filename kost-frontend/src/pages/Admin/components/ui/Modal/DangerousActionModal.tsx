// File: src/pages/Admin/components/ui/Modal/DangerousActionModal.tsx
import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DangerousActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  dangerLevel?: 'medium' | 'high' | 'critical';
}

export const DangerousActionModal: React.FC<DangerousActionModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  dangerLevel = 'medium'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
      onCancel(); // Close modal after success
    } catch (error) {
      // Error handled by parent component
    } finally {
      setIsProcessing(false);
    }
  };

  const getBorderColor = () => {
    switch (dangerLevel) {
      case 'critical': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      default: return 'border-yellow-500';
    }
  };

  const getIconColor = () => {
    switch (dangerLevel) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-yellow-600';
    }
  };

  const getConfirmButtonColor = () => {
    switch (dangerLevel) {
      case 'critical': return 'bg-red-600 hover:bg-red-700';
      case 'high': return 'bg-orange-600 hover:bg-orange-700';
      case 'medium': return 'bg-yellow-600 hover:bg-yellow-700';
      default: return 'bg-yellow-600 hover:bg-yellow-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md border-2 ${getBorderColor()}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className={`h-6 w-6 ${getIconColor()} mr-3`} />
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          <button 
            onClick={onCancel}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            {message}
          </p>
          
          {dangerLevel === 'critical' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Operasi ini TIDAK DAPAT DIBATALKAN dan akan mempengaruhi data secara permanen.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 ${getConfirmButtonColor()}`}
          >
            {isProcessing && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>
              {isProcessing ? 'Memproses...' : confirmText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DangerousActionModal;