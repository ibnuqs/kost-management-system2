// File: src/pages/Admin/components/feature/rfid/DoorControlOnly.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import { 
  DoorOpen, 
  DoorClosed, 
  Shield, 
  AlertTriangle, 
  Clock, 
  User,
  Home,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { Room } from '../../../types/room';
import type { IoTDevice } from '../../../types/iot';
import type { AdminDoorControlRequest } from '../../../types/rfid';

interface DoorControlOnlyProps {
  rooms: Room[];
  devices: IoTDevice[];
  onDoorControl: (request: AdminDoorControlRequest) => Promise<boolean>;
}

interface ControlHistory {
  id: string;
  room_id: number;
  room_number: string;
  action: string;
  reason: string;
  timestamp: Date;
  success: boolean;
  admin_name: string;
}

export const DoorControlOnly: React.FC<DoorControlOnlyProps> = ({
  rooms,
  devices,
  onDoorControl
}) => {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [controlMode, setControlMode] = useState<'manual' | 'emergency'>('manual');
  const [controlHistory, setControlHistory] = useState<ControlHistory[]>([]);
  const [emergencyAccess, setEmergencyAccess] = useState(false);

  // Quick reasons for different modes
  const manualReasons = [
    'Admin manual control',
    'Maintenance access',
    'Inspection purposes',
    'Guest access',
    'Custom reason...'
  ];

  const emergencyReasons = [
    'Emergency evacuation',
    'Fire emergency',
    'Medical emergency',
    'Security breach',
    'Power outage',
    'System failure',
    'Custom emergency...'
  ];

  const getDeviceForRoom = (roomId: number) => {
    return devices.find(device => 
      device.room?.id?.toString() === roomId?.toString() || device.room?.id === roomId
    );
  };

  const addToHistory = (roomId: number, action: string, reason: string, success: boolean) => {
    const room = rooms.find(r => r.id === roomId);
    const newEntry: ControlHistory = {
      id: Date.now().toString(),
      room_id: roomId,
      room_number: room?.room_number || `Room ${roomId}`,
      action,
      reason,
      timestamp: new Date(),
      success,
      admin_name: 'Current Admin' // This would come from auth context
    };
    
    setControlHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10
  };

  const handleDoorAction = async (roomId: number, action: 'open_door' | 'close_door') => {
    if (!reason.trim()) {
      alert('Please provide a reason for this action');
      return;
    }

    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    setLoading(roomId);
    try {
      const request: AdminDoorControlRequest = {
        room_id: roomId,
        action,
        reason: reason.trim()
      };

      const success = await onDoorControl(request);
      
      addToHistory(roomId, action, reason, success);
      
      if (success) {
        setReason(''); // Clear reason after successful action
      }
    } catch (error) {
      console.error('Door control failed:', error);
      addToHistory(roomId, action, reason, false);
    } finally {
      setLoading(null);
    }
  };

  const handleEmergencyMasterControl = async (action: 'open_all' | 'close_all') => {
    if (!emergencyAccess) {
      setEmergencyAccess(true);
      return;
    }

    const emergencyReason = `Emergency ${action.replace('_', ' ')} - Admin override`;
    setLoading(-1); // Special loading state for emergency

    try {
      const promises = rooms.map(room => 
        onDoorControl({
          room_id: room.id,
          action: action === 'open_all' ? 'open_door' : 'close_door',
          reason: emergencyReason
        })
      );

      await Promise.all(promises);
      
      // Add to history
      addToHistory(-1, action, emergencyReason, true);
      
    } catch (error) {
      console.error('Emergency control failed:', error);
      addToHistory(-1, action, emergencyReason, false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Mode Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-orange-600" />
            🚪 Door Control Center
          </h2>
          <p className="text-sm text-gray-600">Manual door control dan emergency access management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={controlMode === 'manual' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setControlMode('manual')}
            className="text-xs"
          >
            🔧 Manual
          </Button>
          <Button
            variant={controlMode === 'emergency' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setControlMode('emergency')}
            className={`text-xs ${controlMode === 'emergency' ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            🚨 Emergency
          </Button>
        </div>
      </div>

      {/* Emergency Master Controls */}
      {controlMode === 'emergency' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">🚨 Emergency Master Control</h3>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {!emergencyAccess ? (
              <div className="text-center py-6">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-red-900 mb-2">Emergency Access Required</h4>
                <p className="text-red-700 mb-4">This will control ALL doors simultaneously</p>
                <Button
                  onClick={() => setEmergencyAccess(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  🔓 Enable Emergency Access
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleEmergencyMasterControl('open_all')}
                  disabled={loading === -1}
                  className="h-16 bg-green-600 hover:bg-green-700 text-white flex-col"
                >
                  {loading === -1 ? '⏳' : '🔓'}
                  <span className="text-sm">OPEN ALL DOORS</span>
                  <span className="text-xs opacity-80">Emergency Evacuation</span>
                </Button>
                <Button
                  onClick={() => handleEmergencyMasterControl('close_all')}
                  disabled={loading === -1}
                  className="h-16 bg-red-600 hover:bg-red-700 text-white flex-col"
                >
                  {loading === -1 ? '⏳' : '🔒'}
                  <span className="text-sm">CLOSE ALL DOORS</span>
                  <span className="text-xs opacity-80">Security Lockdown</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Control Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                🏠 Individual Room Control
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Access Control
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(controlMode === 'emergency' ? emergencyReasons : manualReasons).map((quickReason) => (
                      <Button
                        key={quickReason}
                        variant="outline"
                        size="sm"
                        onClick={() => setReason(quickReason === 'Custom reason...' || quickReason === 'Custom emergency...' ? '' : quickReason)}
                        className="text-xs"
                      >
                        {quickReason}
                      </Button>
                    ))}
                  </div>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={`Enter ${controlMode} access reason...`}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
              </div>

              {/* Room List */}
              <div className="space-y-3">
                {rooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <div>No rooms available for control</div>
                  </div>
                ) : (
                  rooms.map(room => {
                    const device = getDeviceForRoom(room.id);
                    const isLoading = loading === room.id;
                    
                    return (
                      <div key={room.id} 
                           className={`p-4 border rounded-lg transition-all ${
                             selectedRoom === room.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                           }`}>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${device ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <Home className={`w-5 h-5 ${device ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <div className="font-medium">{room.room_number}</div>
                              <div className="text-sm text-gray-500">
                                {room.tenant?.user?.name || 'Tidak ada penyewa'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {device && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                {device.device_id}
                              </span>
                            )}
                            <div className={`w-3 h-3 rounded-full ${device ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleDoorAction(room.id, 'open_door')}
                            disabled={isLoading || !device || !reason.trim()}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isLoading ? '⏳' : '🔓'} Open Door
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDoorAction(room.id, 'close_door')}
                            disabled={isLoading || !device || !reason.trim()}
                            className="flex-1"
                          >
                            {isLoading ? '⏳' : '🔒'} Close Door
                          </Button>
                        </div>

                        {!device && (
                          <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            No device assigned to this room
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control History & Status */}
        <div className="space-y-4">
          {/* Control History */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                📝 Control History
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              {controlHistory.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <div className="text-sm">No control actions yet</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {controlHistory.map(entry => (
                    <div key={entry.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{entry.room_number}</span>
                        <div className="flex items-center gap-1">
                          {entry.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs ${entry.success ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div>{entry.action.replace('_', ' ').toUpperCase()}</div>
                        <div>Reason: {entry.reason}</div>
                        <div>{entry.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold">📊 Control Stats</h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available Rooms</span>
                  <span className="font-medium">{rooms.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Connected Devices</span>
                  <span className="font-medium">{devices.filter(d => d.status === 'online').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Control Actions</span>
                  <span className="font-medium">{controlHistory.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className={`font-medium ${
                    controlHistory.length > 0 
                      ? (controlHistory.filter(h => h.success).length / controlHistory.length) > 0.8 
                        ? 'text-green-600' : 'text-orange-600'
                      : 'text-gray-600'
                  }`}>
                    {controlHistory.length > 0 
                      ? Math.round((controlHistory.filter(h => h.success).length / controlHistory.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Notice */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-orange-900 mb-1">Safety Notice</div>
                  <div className="text-orange-700">
                    Manual door control should only be used when necessary. 
                    Always provide a clear reason for tracking and security purposes.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};