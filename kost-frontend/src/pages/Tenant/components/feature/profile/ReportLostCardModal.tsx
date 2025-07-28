// File: src/pages/Tenant/components/feature/profile/ReportLostCardModal.tsx
import React, { useState } from 'react';
import { AlertTriangle, CreditCard, Calendar, Shield } from 'lucide-react';
import { useReportLostCard } from '../../../hooks/useRfidCards';
import { RfidCard } from '../../../types/rfid';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Buttons';
import { Textarea, Select } from '../../ui/Forms';
import { InfoCard } from '../../ui/Card';
import { formatDate } from '../../../utils/formatters';
import { validateRequired, validateTextLength } from '../../../utils/validators';

interface ReportLostCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card?: RfidCard;
  onSuccess?: () => void;
}

const ReportLostCardModal: React.FC<ReportLostCardModalProps> = ({
  isOpen,
  onClose,
  card,
  onSuccess,
}) => {
  const [reportType, setReportType] = useState<'lost' | 'stolen' | 'damaged' | 'not_working'>('lost');
  const [reason, setReason] = useState('');
  const [lastSeenDate, setLastSeenDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const reportLostCard = useReportLostCard();

  const reportTypeOptions = [
    { value: 'lost', label: 'Lost Card' },
    { value: 'stolen', label: 'Stolen Card' },
    { value: 'damaged', label: 'Damaged Card' },
    { value: 'not_working', label: 'Card Not Working' },
  ];

  const getReportTypeDescription = (type: string) => {
    switch (type) {
      case 'lost':
        return 'Report a card that you cannot locate or have misplaced.';
      case 'stolen':
        return 'Report a card that was stolen or taken without permission.';
      case 'damaged':
        return 'Report a card that is physically damaged or broken.';
      case 'not_working':
        return 'Report a card that is not working properly or being rejected.';
      default:
        return '';
    }
  };

  const getReasonPlaceholder = (type: string) => {
    switch (type) {
      case 'lost':
        return 'Describe when and where you think you lost the card...';
      case 'stolen':
        return 'Describe the circumstances of the theft...';
      case 'damaged':
        return 'Describe how the card was damaged...';
      case 'not_working':
        return 'Describe the issue with the card (not scanning, rejected, etc.)...';
      default:
        return 'Please provide details about the incident...';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const reasonValidation = validateRequired(reason, 'Reason');
    if (!reasonValidation.isValid) {
      newErrors.reason = reasonValidation.message || 'Reason is required';
    } else {
      const lengthValidation = validateTextLength(reason, 20, 1000, 'Reason');
      if (!lengthValidation.isValid) {
        newErrors.reason = lengthValidation.message || 'Reason must be between 20-1000 characters';
      }
    }
    
    if (lastSeenDate && new Date(lastSeenDate) > new Date()) {
      newErrors.lastSeenDate = 'Last seen date cannot be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!card || !validateForm()) return;
    
    try {
      const fullReason = `[${reportType.toUpperCase()}] ${reason}${lastSeenDate ? ` | Last seen: ${lastSeenDate}` : ''}`;
      await reportLostCard.mutateAsync({ 
        cardId: card.id, 
        reason: fullReason 
      });
      
      onSuccess?.();
      onClose();
      
      // Reset form
      setReportType('lost');
      setReason('');
      setLastSeenDate('');
      setErrors({});
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setReportType('lost');
    setReason('');
    setLastSeenDate('');
    setErrors({});
  };

  if (!card) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Report Card Issue"
      size="md"
      closeOnOverlayClick={!reportLostCard.isPending}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Report Card Issue
          </h3>
          <p className="text-gray-600">
            Report an issue with your RFID card to request assistance or replacement.
          </p>
        </div>

        {/* Card Information */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Card Information
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Card ID:</span>
              <p className="font-medium">#{card.id}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium">{card.status}</p>
            </div>
            <div>
              <span className="text-gray-600">UID:</span>
              <p className="font-mono text-xs bg-white px-2 py-1 rounded">
                {card.uid}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Assigned:</span>
              <p className="font-medium">
                {formatDate(card.assigned_at || card.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Report Type */}
        <div>
          <Select
            label="Issue Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            options={reportTypeOptions}
            required
          />
          
          <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              {getReportTypeDescription(reportType)}
            </p>
          </div>
        </div>

        {/* Last Seen Date (for lost/stolen) */}
        {(reportType === 'lost' || reportType === 'stolen') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Seen Date (Optional)
              <Calendar className="w-4 h-4 inline ml-1" />
            </label>
            <input
              type="date"
              value={lastSeenDate}
              onChange={(e) => setLastSeenDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.lastSeenDate && (
              <p className="text-sm text-red-600 mt-1">{errors.lastSeenDate}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              When did you last see or use the card?
            </p>
          </div>
        )}

        {/* Detailed Reason */}
        <div>
          <Textarea
            label="Detailed Description"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={getReasonPlaceholder(reportType)}
            rows={5}
            required
            error={errors.reason}
            maxLength={1000}
            showCharCount
            helperText="Please provide as much detail as possible to help us assist you better (minimum 20 characters)"
          />
        </div>

        {/* Security Notice */}
        <InfoCard
          type="warning"
          title="Security Notice"
          message="Reporting a card as lost or stolen will immediately deactivate it for security purposes. If you find the card later, contact management to reactivate it."
        />

        {/* Important Information */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            What Happens Next
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your card will be deactivated immediately for security</li>
            <li>• Management will review your report within 24 hours</li>
            <li>• You'll receive notification about next steps</li>
            <li>• Replacement cards may incur additional fees</li>
            <li>• Emergency access can be arranged if needed</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={reportLostCard.isPending}
            fullWidth
            className="order-2 sm:order-1"
          >
            Cancel
          </Button>
          
          <Button
            variant="danger"
            onClick={handleSubmit}
            loading={reportLostCard.isPending}
            disabled={!reason.trim()}
            fullWidth
            className="order-1 sm:order-2"
            icon={AlertTriangle}
          >
            Report Issue
          </Button>
        </div>

        {/* Emergency Contact */}
        <div className="text-center text-sm text-gray-500">
          <p>
            For urgent access issues, contact security at{' '}
            <span className="font-medium text-gray-700">+62-XXX-XXXX-XXXX</span>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ReportLostCardModal;