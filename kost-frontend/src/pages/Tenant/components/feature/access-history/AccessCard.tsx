// File: src/pages/Tenant/components/feature/access-history/AccessCard.tsx
import React from 'react';
import { Key, MapPin, Clock, AlertCircle, CheckCircle, Smartphone, CreditCard } from 'lucide-react';
import { AccessLog, getAccessStatusColor, getAccessMethodLabel } from '../../../types/access';
import { Card } from '../../ui/Card';
import { StatusBadge } from '../../ui/Status';
import { formatDateTime, formatTime } from '../../../utils/formatters';
import { mergeClasses } from '../../../utils/helpers';

interface AccessCardProps {
  accessLog: AccessLog;
  compact?: boolean;
  showDevice?: boolean;
  className?: string;
}

const AccessCard: React.FC<AccessCardProps> = ({
  accessLog,
  compact = false,
  showDevice = true,
  className = '',
}) => {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'rfid':
        return <CreditCard className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'manual':
        return <Key className="w-4 h-4" />;
      case 'emergency':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Key className="w-4 h-4" />;
    }
  };

  const getStatusIcon = () => {
    return accessLog.access_granted 
      ? <CheckCircle className="w-5 h-5 text-green-600" />
      : <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const cardBgColor = accessLog.access_granted ? 'bg-green-50' : 'bg-red-50';
  const borderColor = accessLog.access_granted ? 'border-green-200' : 'border-red-200';

  return (
    <Card 
      className={mergeClasses(
        cardBgColor,
        borderColor,
        'transition-all duration-200 hover:shadow-md',
        className
      )}
      padding={compact ? 'sm' : 'md'}
    >
      <div className="flex items-start gap-4">
        {/* Status & Method Icon */}
        <div className={mergeClasses(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          accessLog.access_granted ? 'bg-green-100' : 'bg-red-100'
        )}>
          <div className="relative">
            {getStatusIcon()}
            <div className={mergeClasses(
              'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
              accessLog.access_granted ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            )}>
              {getMethodIcon(accessLog.entry_method)}
            </div>
          </div>
        </div>

        {/* Access Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Room {accessLog.room_number}
              </h4>
              <p className="text-sm text-gray-600">
                {getAccessMethodLabel(accessLog.entry_method)} Access
              </p>
            </div>
            
            <StatusBadge
              status={accessLog.access_granted ? 'success' : 'error'}
              label={accessLog.access_granted ? 'Granted' : 'Denied'}
              size="sm"
            />
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{compact ? formatTime(accessLog.accessed_at) : formatDateTime(accessLog.accessed_at)}</span>
            </div>
          </div>

          {/* Denial Reason */}
          {!accessLog.access_granted && accessLog.denial_reason && (
            <div className="p-3 bg-red-100 border border-red-200 rounded-lg mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Access Denied</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{accessLog.denial_reason}</p>
            </div>
          )}

          {/* Device Info */}
          {showDevice && accessLog.device_id && (
            <div className="text-xs text-gray-500">
              Device: {accessLog.device_id}
              {accessLog.location && ` • ${accessLog.location}`}
            </div>
          )}

          {/* RFID Card Info */}
          {accessLog.rfid_card_id && (
            <div className="text-xs text-gray-500 mt-1">
              RFID Card ID: {accessLog.rfid_card_id}
            </div>
          )}
        </div>

        {/* Time Badge */}
        <div className="flex-shrink-0 text-right">
          <div className={mergeClasses(
            'px-2 py-1 rounded-full text-xs font-medium',
            accessLog.access_granted 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}>
            {formatTime(accessLog.accessed_at)}
          </div>
          
          {!compact && (
            <div className="text-xs text-gray-500 mt-1">
              #{accessLog.id}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AccessCard;