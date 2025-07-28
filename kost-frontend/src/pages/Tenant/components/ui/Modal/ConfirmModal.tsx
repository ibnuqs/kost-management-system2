// File: src/pages/Tenant/components/ui/Modal/ConfirmModal.tsx
import React from 'react';
import { AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from '../Buttons/Button';
import { mergeClasses } from '../../../utils/helpers';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  showIcon?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  showIcon = true,
}) => {
  const typeConfig = {
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      confirmVariant: 'primary' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      confirmVariant: 'warning' as const,
    },
    danger: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmVariant: 'danger' as const,
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      confirmVariant: 'success' as const,
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <div className="text-center">
        {showIcon && (
          <div className={mergeClasses(
            'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
            config.iconBg
          )}>
            <Icon className={mergeClasses('w-8 h-8', config.iconColor)} />
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {title}
        </h3>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            fullWidth
            className="order-2 sm:order-1"
          >
            {cancelText}
          </Button>

          <Button
            variant={config.confirmVariant}
            onClick={onConfirm}
            loading={loading}
            fullWidth
            className="order-1 sm:order-2"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;