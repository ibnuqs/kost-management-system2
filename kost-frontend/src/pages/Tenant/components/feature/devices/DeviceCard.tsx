// ===== NEW: src/pages/Tenant/components/feature/devices/DeviceCard.tsx =====
import React from 'react';
import { 
  Wifi, WifiOff, Battery, Signal, Settings, AlertTriangle, 
  Lock, Camera, Thermometer, Lightbulb, Volume2, Activity, Cpu 
} from 'lucide-react';
import { Device, getDeviceStatusLabel, getBatteryLevelColor, getSignalStrengthColor } from '../../../types/device';
import { Card } from '../../ui/Card';
import { StatusBadge } from '../../ui/Status';
import { Button } from '../../ui/Buttons';
import { formatRelativeTime } from '../../../utils/dateUtils';
import { mergeClasses } from '../../../utils/helpers';

interface DeviceCardProps {
  device: Device;
  onControl?: (device: Device) => void;
  onSettings?: (device: Device) => void;
  className?: string;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onControl,
  onSettings,
  className = '',
}) => {
  const getDeviceIcon = () => {
    const iconClass = "w-6 h-6";
    switch (device.device_type) {
      case 'door_lock':
        return <Lock className={iconClass} />;
      case 'camera':
        return <Camera className={iconClass} />;
      case 'thermostat':
        return <Thermometer className={iconClass} />;
      case 'light':
        return <Lightbulb className={iconClass} />;
      case 'speaker':
        return <Volume2 className={iconClass} />;
      case 'sensor':
        return <Activity className={iconClass} />;
      default:
        return <Cpu className={iconClass} />;
    }
  };

  const getStatusIcon = () => {
    switch (device.status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-600" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-600" />;
      case 'maintenance':
        return <Settings className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const isOnline = device.status === 'online';
  const hasError = device.status === 'error';

  return (
    <Card className={mergeClasses(
      'transition-all duration-200',
      hasError ? 'border-red-200 bg-red-50' : '',
      className
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={mergeClasses(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            )}>
              {getDeviceIcon()}
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {device.device_name}
              </h3>
              <p className="text-sm text-gray-600">
                {device.room_number ? `Room ${device.room_number}` : 'Unknown Room'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <StatusBadge
              status={device.status === 'online' ? 'success' : 
                     device.status === 'error' ? 'error' : 
                     device.status === 'maintenance' ? 'warning' : 'neutral'}
              label={getDeviceStatusLabel(device.status)}
              size="sm"
            />
          </div>
        </div>

        {/* Device Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Battery Level */}
          {device.battery_level !== undefined && (
            <div className="flex items-center gap-2">
              <Battery className={mergeClasses('w-4 h-4', getBatteryLevelColor(device.battery_level))} />
              <span className="text-gray-600">
                Battery: <span className={getBatteryLevelColor(device.battery_level)}>
                  {device.battery_level}%
                </span>
              </span>
            </div>
          )}

          {/* Signal Strength */}
          {device.signal_strength !== undefined && (
            <div className="flex items-center gap-2">
              <Signal className={mergeClasses('w-4 h-4', getSignalStrengthColor(device.signal_strength))} />
              <span className="text-gray-600">
                Signal: <span className={getSignalStrengthColor(device.signal_strength)}>
                  {device.signal_strength}%
                </span>
              </span>
            </div>
          )}

          {/* Last Seen */}
          {device.last_seen && (
            <div className="col-span-2">
              <span className="text-gray-600">
                Last seen: {formatRelativeTime(device.last_seen)}
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {device.error_message && (
          <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Device Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{device.error_message}</p>
          </div>
        )}

        {/* Maintenance Notes */}
        {device.maintenance_notes && device.status === 'maintenance' && (
          <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Maintenance</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">{device.maintenance_notes}</p>
          </div>
        )}

        {/* Device Details */}
        <div className="pt-2 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-500">
            {device.model && (
              <div>Model: {device.model}</div>
            )}
            {device.firmware_version && (
              <div>Firmware: {device.firmware_version}</div>
            )}
            {device.ip_address && (
              <div>IP: {device.ip_address}</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {onControl && isOnline && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onControl(device)}
              className="flex-1"
            >
              Control
            </Button>
          )}
          
          {onSettings && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSettings(device)}
              icon={Settings}
              className={onControl && isOnline ? '' : 'flex-1'}
            >
              Settings
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DeviceCard;