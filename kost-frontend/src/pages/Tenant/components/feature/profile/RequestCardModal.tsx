// ===== FIXED: src/pages/Tenant/components/feature/profile/RequestCardModal.tsx =====
import React, { useState } from 'react';
import { CreditCard, AlertCircle, Info } from 'lucide-react';
import { useRequestNewCard } from '../../../hooks/useRfidCards';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Buttons';
import { Textarea, Select } from '../../ui/Forms';
import { validateRequired, validateTextLength } from '../../../utils/validators';

interface RequestCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RequestCardModal: React.FC<RequestCardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [requestType, setRequestType] = useState<'new' | 'replacement' | 'additional'>('new');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const requestNewCard = useRequestNewCard();

  const requestTypeOptions = [
    { value: 'new', label: 'First RFID Card' },
    { value: 'replacement', label: 'Replace Lost/Damaged Card' },
    { value: 'additional', label: 'Additional Card' },
  ];

  const getRequestTypeDescription = (type: string) => {
    switch (type) {
      case 'new':
        return 'Request your first RFID card for room access.';
      case 'replacement':
        return 'Replace a lost, stolen, or damaged RFID card.';
      case 'additional':
        return 'Request an additional RFID card (additional fees may apply).';
      default:
        return '';
    }
  };

  const getReasonPlaceholder = (type: string) => {
    switch (type) {
      case 'new':
        return 'Please explain why you need an RFID card...';
      case 'replacement':
        return 'Please describe what happened to your previous card...';
      case 'additional':
        return 'Please explain why you need an additional card...';
      default:
        return 'Please provide a reason for your request...';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const reasonValidation = validateRequired(reason, 'Reason');
    if (!reasonValidation.isValid) {
      newErrors.reason = reasonValidation.message || 'Reason is required';
    } else {
      const lengthValidation = validateTextLength(reason, 10, 500, 'Reason');
      if (!lengthValidation.isValid) {
        newErrors.reason = lengthValidation.message || 'Reason must be between 10-500 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const fullReason = `[${requestType.toUpperCase()}] ${reason}`;
      await requestNewCard.mutateAsync(fullReason);
      
      onSuccess?.();
      onClose();
      
      // Reset form
      setRequestType('new');
      setReason('');
      setErrors({});
    } catch {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setRequestType('new');
    setReason('');
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request RFID Card"
      size="md"
      closeOnOverlayClick={!requestNewCard.isPending}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            RFID Card Request
          </h3>
          <p className="text-gray-600">
            Fill out the form below to request an RFID card for room access.
          </p>
        </div>

        {/* Request Type */}
        <div>
          <Select
            label="Request Type"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as 'new' | 'replacement')}
            options={requestTypeOptions}
            required
          />
          
          {requestType && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  {getRequestTypeDescription(requestType)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reason */}
        <div>
          <Textarea
            label="Reason for Request"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={getReasonPlaceholder(requestType)}
            rows={4}
            required
            error={errors.reason}
            maxLength={500}
            showCharCount
          />
        </div>

        {/* Important Notice */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-800">Important Notice</h4>
              <ul className="text-sm text-orange-700 mt-1 space-y-1">
                <li>• Card requests are reviewed within 24-48 hours</li>
                <li>• Additional fees may apply for replacement/additional cards</li>
                <li>• You will be notified via email once approved</li>
                <li>• Report lost cards immediately for security</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={requestNewCard.isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={requestNewCard.isPending}
            disabled={!reason.trim()}
            className="flex-1"
          >
            Submit Request
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RequestCardModal;