// File: src/pages/Admin/components/feature/rfid/RfidScanner.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Wifi, WifiOff, CreditCard, CheckCircle, AlertCircle, 
  Loader, Scan, X, Settings, UserPlus, Loader2 
} from 'lucide-react';
import mqtt from 'mqtt';
import { toast } from 'react-hot-toast';
import api from '../../../../../utils/api';

interface RfidCardInfo {
  uid: string;
  user?: { id: number; name: string; email: string };
  room?: { id: number; room_number: string };
  status: 'active' | 'inactive';
}

interface IoTDevice {
  id: number;
  device_id: string;
  device_name: string;
  device_type: 'door_lock' | 'card_scanner';
  room_id?: number;
  status: 'online' | 'offline';
  last_seen?: string;
  room?: { id: number; room_number: string; };
}

// MQTT Configuration
const MQTT_CONFIG = {
  url: 'wss://16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud:8884/mqtt',
  clientId: `react-scanner-client-${Date.now()}`,
  username: 'hivemq.webclient.1745310839638',
  password: 'UXNM#Agehw3B8!4;>6tz',
  topic: 'rfid/tags',
  commandTopic: 'rfid/command',
  statusTopic: 'rfid/scanner/status'
};

const getErrorMessage = (error: unknown, defaultMessage: string = 'An unexpected error occurred.'): string => {
  if (error instanceof Error) {
    if ((error as any).response?.data?.message) return (error as any).response.data.message;
    if ((error as any).response?.data?.error) return (error as any).response.data.error;
    if ((error as any).response?.status) return `Server Error: ${(error as any).response.status} ${(error as any).response.statusText}`;
    return error.message;
  }
  return defaultMessage;
};

interface RfidScannerProps {
  onCardRegistered: () => void;
}

export const RfidScanner: React.FC<RfidScannerProps> = ({ onCardRegistered }) => {
  const [state, setState] = useState({
    rfidUid: '',
    cardInfo: null as RfidCardInfo | null,
    isConnectedToMqtt: false,
    isScanningModeActive: false,
    isProcessingCommand: false,
    devices: [] as IoTDevice[],
    selectedDeviceId: '',
    isLoadingDevices: true,
    loadError: null as string | null,
    manualUid: '',
  });

  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const toastIdRef = useRef<string | null>(null);

  // Load scanner devices
  const loadScannerDevices = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingDevices: true, loadError: null }));
    
    try {
      const endpoints = ['/admin/iot-devices', '/admin/iot/devices', '/iot/devices'];
      let devicesData: IoTDevice[] = [];
      let lastError: any = null;

      for (const endpoint of endpoints) {
        try {
          const { data } = await api.get(endpoint);
          if (data.success && data.data) {
            devicesData = Array.isArray(data.data.data) ? data.data.data : 
                          Array.isArray(data.data) ? data.data : [];
          } else if (Array.isArray(data)) {
            devicesData = data;
          }
          if (devicesData.length > 0) break;
        } catch (error) {
          lastError = error;
        }
      }

      const scannerDevices = devicesData.filter((d: IoTDevice) =>
        d.device_type === 'card_scanner' ||
        d.device_type === 'door_lock' ||
        d.device_id?.toLowerCase().includes('scanner') ||
        d.device_id?.toLowerCase().includes('esp32') ||
        d.device_id?.toLowerCase().includes('rfid') ||
        d.device_name?.toLowerCase().includes('scanner') ||
        d.device_name?.toLowerCase().includes('esp32') ||
        d.device_name?.toLowerCase().includes('rfid')
      );

      setState(prev => ({
        ...prev,
        devices: scannerDevices,
        isLoadingDevices: false,
        loadError: scannerDevices.length === 0 ? 'No scanner devices found.' : null,
        selectedDeviceId: scannerDevices.length > 0 ? 
          (scannerDevices.find(d => d.status === 'online') || scannerDevices[0]).device_id : ''
      }));

      if (scannerDevices.length === 0 && lastError) {
        toast.error(getErrorMessage(lastError, 'Failed to load any IoT devices.'));
      }

    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load scanner devices.');
      setState(prev => ({ ...prev, loadError: errorMessage, isLoadingDevices: false }));
      toast.error(errorMessage);
    }
  }, []);

  // MQTT Connection
  useEffect(() => {
    const { selectedDeviceId } = state;

    if (!selectedDeviceId) {
      if (mqttClientRef.current) {
        mqttClientRef.current.end(true);
        mqttClientRef.current = null;
      }
      setState(prev => ({ 
        ...prev, 
        isConnectedToMqtt: false, 
        isScanningModeActive: false, 
        rfidUid: '', 
        cardInfo: null 
      }));
      return;
    }

    if (mqttClientRef.current?.connected && 
        mqttClientRef.current.options.clientId?.includes(selectedDeviceId)) {
      return;
    }

    if (mqttClientRef.current) {
      mqttClientRef.current.end(true);
      mqttClientRef.current = null;
    }

    const client = mqtt.connect(MQTT_CONFIG.url, {
      clientId: `${MQTT_CONFIG.clientId}-${selectedDeviceId}`,
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      reconnectPeriod: 5000,
      protocol: 'wss',
    });

    mqttClientRef.current = client;

    client.on('connect', () => {
      setState(prev => ({ ...prev, isConnectedToMqtt: true }));
      client.subscribe([MQTT_CONFIG.topic, MQTT_CONFIG.statusTopic, `kost_system/door/response/${selectedDeviceId}`]);
      
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.success(`Connected to scanner: ${selectedDeviceId}`);
    });

    client.on('message', (topic: string, message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        if (topic === MQTT_CONFIG.topic && (!data.device_id || data.device_id === selectedDeviceId)) {
          setState(prev => ({ ...prev, rfidUid: data.uid, cardInfo: null }));
          toast.success(`Card Scanned: ${data.uid}`);
          checkCard(data.uid);
        } else if (topic === MQTT_CONFIG.statusTopic && (!data.device_id || data.device_id === selectedDeviceId)) {
          setState(prev => ({
            ...prev,
            isScanningModeActive: data.scanner_status === 'activated',
            ...(data.scanner_status !== 'activated' && { rfidUid: '', cardInfo: null })
          }));
        } else if (topic === `kost_system/door/response/${selectedDeviceId}`) {
          const message = data.access_granted ? 
            `Access granted for ${data.card_uid}` : 
            `Access denied for ${data.card_uid}: ${data.message}`;
          toast[data.access_granted ? 'success' : 'error'](message);
        }
      } catch (e) {
        toast.error("Error processing scanner message.");
      }
    });

    client.on('error', (err: Error) => {
      setState(prev => ({ ...prev, isConnectedToMqtt: false }));
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.error(`Scanner connection error: ${err.message}`);
    });

    client.on('close', () => {
      setState(prev => ({ 
        ...prev, 
        isConnectedToMqtt: false, 
        isScanningModeActive: false, 
        rfidUid: '', 
        cardInfo: null 
      }));
    });

    return () => {
      client.removeAllListeners();
      if (mqttClientRef.current) {
        mqttClientRef.current.end(true);
        mqttClientRef.current = null;
      }
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    };
  }, [state.selectedDeviceId]);

  useEffect(() => {
    loadScannerDevices();
  }, [loadScannerDevices]);

  // Check card in backend
  const checkCard = useCallback(async (uid: string): Promise<void> => {
    try {
      const response = await api.get(`/rfid/check-card/${uid}`);
      if (response.data.success) {
        setState(prev => ({
          ...prev,
          cardInfo: response.data.exists ? response.data.card : null,
        }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, cardInfo: null }));
      toast.error(getErrorMessage(error, 'Failed to check card existence.'));
    }
  }, []);

  // Send command to backend
  const sendCommandToBackend = async (command: 'start' | 'stop') => {
    if (!state.selectedDeviceId) {
      toast.error("No scanner device selected.");
      return;
    }

    setState(prev => ({ ...prev, isProcessingCommand: true }));
    
    try {
      await api.post(`/admin/rfid/scanner/${command}`, { device_id: state.selectedDeviceId });
      toast.success(`Scanner ${command} command sent.`);
      setState(prev => ({ ...prev, isScanningModeActive: command === 'start' }));
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to send ${command} command.`));
    } finally {
      setState(prev => ({ ...prev, isProcessingCommand: false }));
    }
  };

  // Register scanned card
  const registerScannedCard = async () => {
    if (!state.rfidUid) return;

    setState(prev => ({ ...prev, isProcessingCommand: true }));
    
    try {
      await api.post('/rfid/register-scan', { rfid_uid: state.rfidUid });
      toast.success('Card registered successfully!');
      onCardRegistered();
      setState(prev => ({ ...prev, rfidUid: '', cardInfo: null }));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Registration failed.'));
    } finally {
      setState(prev => ({ ...prev, isProcessingCommand: false }));
    }
  };

  // Manual register
  const handleManualRegister = async () => {
    if (!state.manualUid.trim()) return;

    setState(prev => ({ ...prev, isProcessingCommand: true }));
    
    try {
      await api.post('/rfid/register-card', { uid: state.manualUid.trim() });
      toast.success('Card manually registered successfully!');
      onCardRegistered();
      setState(prev => ({ ...prev, manualUid: '', rfidUid: '', cardInfo: null }));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Manual registration failed.'));
    } finally {
      setState(prev => ({ ...prev, isProcessingCommand: false }));
    }
  };

  // Visual status content
  const getVisualStatusContent = () => {
    if (state.isLoadingDevices) {
      return (
        <div className="bg-slate-100 rounded-lg p-4 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
          <p className="font-medium text-slate-600">Loading scanner devices...</p>
        </div>
      );
    }

    if (state.loadError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="font-semibold text-red-800">Loading Error</p>
          <p className="text-sm text-red-700 mt-1">{state.loadError}</p>
        </div>
      );
    }

    if (!state.isConnectedToMqtt) {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <WifiOff className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="font-medium text-orange-600">Scanner Offline</p>
          <p className="text-sm text-orange-500">Device: {state.selectedDeviceId || 'N/A'}</p>
        </div>
      );
    }

    if (state.rfidUid) {
      if (state.cardInfo) {
        return (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-emerald-800">Card Already Registered</p>
            <p className="font-mono text-sm text-emerald-700 mt-1">{state.cardInfo.uid}</p>
            {state.cardInfo.user && (
              <p className="text-xs text-emerald-600 mt-1">
                Assigned to: {state.cardInfo.user.name}
              </p>
            )}
          </div>
        );
      } else {
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <AlertCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="font-semibold text-blue-800">New Card Detected!</p>
            <p className="font-mono text-sm text-blue-700 mt-1">{state.rfidUid}</p>
            <p className="text-xs text-blue-600 mt-1">Ready for registration.</p>
          </div>
        );
      }
    }

    return (
      <div className="bg-slate-100 rounded-lg p-4 text-center">
        <Scan className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="font-medium text-slate-600">
          {state.isScanningModeActive ? "Ready to Scan..." : "Scanner Inactive"}
        </p>
        <p className="text-sm text-slate-500">
          {state.isScanningModeActive ? "Tap a card on the reader." : "Click 'Start Scan Mode' to activate."}
        </p>
      </div>
    );
  };

  const boxClassName = `relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
    !state.isConnectedToMqtt ? 'border-orange-400 bg-orange-50' :
    state.rfidUid && !state.cardInfo ? 'border-blue-400 bg-blue-50' :
    state.rfidUid && state.cardInfo ? 'border-green-400 bg-green-50' :
    state.isScanningModeActive ? 'border-sky-400 bg-sky-50' :
    'border-gray-300 bg-gray-50'
  }`;

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            state.isConnectedToMqtt ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {state.isConnectedToMqtt ? <Wifi size={20} /> : <WifiOff size={20} />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Live RFID Scanner</h3>
            <p className="text-sm text-gray-500">
              {state.isConnectedToMqtt ? 'Connected to MQTT broker' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          state.isConnectedToMqtt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {state.isConnectedToMqtt ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        {/* Device Selection */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">Select Scanner Device</label>
            <button
              onClick={loadScannerDevices}
              disabled={state.isLoadingDevices}
              className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
              title="Refresh devices"
            >
              <Settings size={16} className={state.isLoadingDevices ? 'animate-spin' : ''} />
            </button>
          </div>
          <select
            value={state.selectedDeviceId}
            onChange={e => setState(prev => ({
              ...prev,
              selectedDeviceId: e.target.value,
              rfidUid: '',
              cardInfo: null,
              isScanningModeActive: false
            }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            disabled={state.isLoadingDevices || state.devices.length === 0 || state.isProcessingCommand}
          >
            {state.isLoadingDevices && <option>Loading devices...</option>}
            {state.devices.length === 0 && !state.isLoadingDevices && (
              <option value="">No scanner devices found</option>
            )}
            {state.devices.map(d => (
              <option key={d.id} value={d.device_id}>
                {d.device_name} {d.room ? `(${d.room.room_number})` : ''}
                {d.status === 'offline' ? ' (Offline)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Visual Scanner Status */}
        <div className={boxClassName}>
          {getVisualStatusContent()}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-auto">
          {state.rfidUid && !state.cardInfo && (
            <button
              onClick={registerScannedCard}
              disabled={state.isProcessingCommand || !state.isConnectedToMqtt}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {state.isProcessingCommand ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Register Scanned Card
                </>
              )}
            </button>
          )}

          {state.selectedDeviceId && !state.loadError && (
            <button
              onClick={() => sendCommandToBackend(state.isScanningModeActive ? 'stop' : 'start')}
              disabled={state.isProcessingCommand || !state.isConnectedToMqtt}
              className={`w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg border transition-colors disabled:opacity-50 ${
                state.isScanningModeActive
                  ? 'bg-red-500 text-white hover:bg-red-600 border-transparent'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {state.isProcessingCommand ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {state.isScanningModeActive ? <X size={16} /> : <Scan size={16} />}
                  {state.isScanningModeActive ? 'Stop Scan Mode' : 'Start Scan Mode'}
                </>
              )}
            </button>
          )}
        </div>

        {/* Manual Entry */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manual Card Registration
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={state.manualUid}
              onChange={(e) => setState(prev => ({ ...prev, manualUid: e.target.value }))}
              placeholder="Enter card UID manually"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={state.isProcessingCommand}
            />
            <button
              onClick={handleManualRegister}
              disabled={!state.manualUid.trim() || state.isProcessingCommand}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {state.isProcessingCommand ? <Loader2 size={16} className="animate-spin" /> : 'Register'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use this for testing or if the scanner is not working.
          </p>
        </div>
      </div>
    </div>
  );
};