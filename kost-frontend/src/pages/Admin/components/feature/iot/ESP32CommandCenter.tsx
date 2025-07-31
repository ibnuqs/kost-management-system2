// File: src/pages/Admin/components/feature/iot/ESP32CommandCenter.tsx
interface CommandHistory {
  id: string;
  command: string;
  device_id: string;
  payload?: Record<string, unknown>;
  status: 'sent' | 'delivered' | 'acknowledged' | 'failed' | 'timeout';
  sent_at: string;
  response_at?: string;
  response?: Record<string, unknown>;
  error?: string;
}

interface CommandTemplate {
  name: string;
  command: string;
  description: string;
  requiresPayload: boolean;
  payloadSchema?: Record<string, string>;
  category: 'system' | 'config' | 'rfid' | 'network' | 'debug';
}

const COMMAND_TEMPLATES: CommandTemplate[] = [
  {
    name: 'Restart Device',
    command: 'restart',
    description: 'Reboot the ESP32 device',
    requiresPayload: false,
    category: 'system'
  },
  {
    name: 'Ping Device',
    command: 'ping',
    description: 'Test device connectivity',
    requiresPayload: false,
    category: 'system'
  },
  {
    name: 'Get Status',
    command: 'get_status',
    description: 'Request full device status',
    requiresPayload: false,
    category: 'system'
  },
  {
    name: 'Update WiFi Config',
    command: 'update_wifi',
    description: 'Update WiFi credentials',
    requiresPayload: true,
    payloadSchema: {
      ssid: 'string',
      password: 'string'
    },
    category: 'network'
  },
  {
    name: 'Update MQTT Config',
    command: 'update_mqtt',
    description: 'Update MQTT broker settings',
    requiresPayload: true,
    payloadSchema: {
      broker: 'string',
      port: 'number',
      username: 'string',
      password: 'string'
    },
    category: 'network'
  },
  {
    name: 'Set RFID Read Interval',
    command: 'set_rfid_interval',
    description: 'Change RFID scanning frequency',
    requiresPayload: true,
    payloadSchema: {
      interval_ms: 'number'
    },
    category: 'rfid'
  },
  {
    name: 'Enable Debug Mode',
    command: 'set_debug',
    description: 'Enable/disable debug logging',
    requiresPayload: true,
    payloadSchema: {
      enabled: 'boolean',
      level: 'string'
    },
    category: 'debug'
  },
  {
    name: 'Factory Reset',
    command: 'factory_reset',
    description: 'Reset device to factory defaults',
    requiresPayload: false,
    category: 'system'
  },
  {
    name: 'Get Device Info',
    command: 'get_info',
    description: 'Get hardware and firmware information',
    requiresPayload: false,
    category: 'debug'
  },
  {
    name: 'Test Door Lock',
    command: 'test_door',
    description: 'Test door lock mechanism',
    requiresPayload: true,
    payloadSchema: {
      action: 'string', // 'lock' | 'unlock' | 'toggle'
      duration_ms: 'number'
    },
    category: 'rfid'
  }
];

export const ESP32CommandCenter: React.FC = () => {
  const [devices, setDevices] = useState<ESP32Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<CommandTemplate | null>(null);
  const [customCommand, setCustomCommand] = useState('');
  const [payload, setPayload] = useState<string>('{}');
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([]);
  const [showPayloadModal, setShowPayloadModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // MQTT connection for sending commands and receiving responses
  const { isConnected, publish, subscribe, unsubscribe } = useMqtt();

  const fetchDevices = useCallback(async () => {
    try {
      const deviceList = await esp32Service.getDevices();
      setDevices(deviceList);
      if (deviceList.length > 0 && !selectedDevice) {
        setSelectedDevice(deviceList[0].device_id);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  }, [selectedDevice]);

  const setupCommandResponseHandler = useCallback(() => {
    // Subscribe to command responses from ESP32
    subscribe('rfid/command/response', (topic, message) => {
      try {
        const response = JSON.parse(message);
        console.log('📨 Command response received:', response);
        
        // Update command history with response
        setCommandHistory(prev => prev.map(cmd => {
          if (cmd.device_id === response.device_id && 
              cmd.command === response.command &&
              cmd.status === 'sent') {
            return {
              ...cmd,
              status: response.success ? 'acknowledged' : 'failed',
              response_at: new Date().toISOString(),
              response: response,
              error: response.error
            };
          }
          return cmd;
        }));
      } catch (error) {
        console.error('Error parsing command response:', error);
      }
    });
  }, [subscribe]);

  useEffect(() => {
    fetchDevices();
    setupCommandResponseHandler();
    
    return () => {
      // Cleanup subscriptions
      unsubscribe('rfid/command/response');
    };
  }, [fetchDevices, setupCommandResponseHandler, unsubscribe]);

  

  const sendCommand = async (template: CommandTemplate, customPayload?: Record<string, unknown>) => {
    if (!selectedDevice) {
      alert('Please select a device first');
      return;
    }

    setLoading(true);

    try {
      let commandPayload: Record<string, unknown> = {};
      
      if (template.requiresPayload) {
        if (customPayload) {
          commandPayload = customPayload;
        } else {
          // Parse payload from form input
          try {
            commandPayload = JSON.parse(payload);
          } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
            alert('Invalid JSON payload');
            setLoading(false);
            return;
          }
        }
      }

      const commandData = {
        command: template.command,
        device_id: selectedDevice,
        timestamp: Date.now(),
        payload: commandPayload,
        from: 'admin_dashboard',
        request_id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };


      // Send via MQTT
      const success = publish('rfid/command', JSON.stringify(commandData));

      if (success) {
        // Add to command history
        const historyEntry: CommandHistory = {
          id: commandData.request_id,
          command: template.command,
          device_id: selectedDevice,
          payload: commandPayload,
          status: 'sent',
          sent_at: new Date().toISOString()
        };

        setCommandHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 commands

        // Set timeout for command response
        setTimeout(() => {
          setCommandHistory(prev => prev.map(cmd => 
            cmd.id === commandData.request_id && cmd.status === 'sent' 
              ? { ...cmd, status: 'timeout' }
              : cmd
          ));
        }, 30000); // 30 second timeout

        alert(`Command "${template.name}" sent successfully!`);
      } else {
        alert('Failed to send command - MQTT not connected');
      }

    } catch (error) {
      console.error('Error sending command:', error);
      alert('Error sending command');
    } finally {
      setLoading(false);
      setShowPayloadModal(false);
      setPayload('{}');
    }
  };

  const sendCustomCommand = async () => {
    if (!customCommand.trim()) {
      alert('Please enter a custom command');
      return;
    }

    const customTemplate: CommandTemplate = {
      name: 'Custom Command',
      command: customCommand,
      description: 'Custom command entered by user',
      requiresPayload: payload !== '{}',
      category: 'debug'
    };

    await sendCommand(customTemplate);
    setCustomCommand('');
  };

  const handleTemplateCommand = (template: CommandTemplate) => {
    setSelectedTemplate(template);
    
    if (template.requiresPayload) {
      // Set default payload based on schema
      if (template.payloadSchema) {
        const defaultPayload: Record<string, unknown> = {};
        Object.entries(template.payloadSchema).forEach(([key, type]) => {
          switch (type) {
            case 'string':
              defaultPayload[key] = '';
              break;
            case 'number':
              defaultPayload[key] = 0;
              break;
            case 'boolean':
              defaultPayload[key] = false;
              break;
            default:
              defaultPayload[key] = null;
          }
        });
        setPayload(JSON.stringify(defaultPayload, null, 2));
      }
      setShowPayloadModal(true);
    } else {
      sendCommand(template);
    }
  };

  const getStatusColor = (status: CommandHistory['status']): string => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-yellow-100 text-yellow-800';
      case 'acknowledged': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'timeout': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const groupedTemplates = COMMAND_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, CommandTemplate[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ESP32 Command Center</h2>
          <p className="text-gray-600">Send commands and manage ESP32 devices remotely</p>
        </div>
        <div className="flex gap-2 items-center">
          <StatusBadge 
            status={isConnected ? 'online' : 'offline'}
          >
            MQTT {isConnected ? 'Connected' : 'Disconnected'}
          </StatusBadge>
          <Button onClick={fetchDevices} variant="outline">
Refresh
          </Button>
        </div>
      </div>

      {/* Device Selection */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Select Target Device</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">ESP32 Device</label>
              <Select
                value={selectedDevice}
                onChange={(value) => setSelectedDevice(value)}
                options={[
                  { value: "", label: "Select Device" },
                  ...devices.map(device => ({
                    value: device.device_id,
                    label: `${device.device_name} (${device.device_id}) - ${device.status}`
                  }))
                ]}
              />
            </div>
            <div className="flex items-end">
              {selectedDevice && (
                <div className="text-sm text-gray-600">
                  {devices.find(d => d.device_id === selectedDevice)?.status === 'online' ? (
                    <span className="text-green-600">Device Online</span>
                  ) : (
                    <span className="text-red-600">Device Offline</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Command Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Quick Commands</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedTemplates).map(([category, templates]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-2">
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {templates.map(template => (
                      <Button
                        key={template.command}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTemplateCommand(template)}
                        disabled={!selectedDevice || !isConnected || loading}
                        className="text-left justify-start"
                      >
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Custom Command</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Command</label>
                <Input
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value)}
                  placeholder="enter_custom_command"
                  className="font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payload (JSON)</label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder="{}"
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                />
              </div>
              <Button
                onClick={sendCustomCommand}
                disabled={!selectedDevice || !isConnected || loading}
                className="w-full"
              >
{loading ? 'Sending...' : 'Send Custom Command'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Command History */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Command History</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {commandHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📜</div>
                <div>No commands sent yet</div>
              </div>
            ) : (
              commandHistory.map(cmd => (
                <div key={cmd.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium">{cmd.command}</span>
                      <span className="text-xs text-gray-500">{cmd.device_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(cmd.status)}`}>
                        {cmd.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(cmd.sent_at)}
                      </span>
                    </div>
                  </div>
                  
                  {cmd.payload && Object.keys(cmd.payload).length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">Payload:</div>
                      <pre className="text-xs bg-gray-50 p-2 rounded font-mono overflow-x-auto">
                        {JSON.stringify(cmd.payload, null, 2)}
                      </pre>
                    </div>
                  )}

                  {cmd.response && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">Response:</div>
                      <pre className="text-xs bg-green-50 p-2 rounded font-mono overflow-x-auto">
                        {JSON.stringify(cmd.response, null, 2)}
                      </pre>
                    </div>
                  )}

                  {cmd.error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      Error: {cmd.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payload Modal */}
      {showPayloadModal && selectedTemplate && (
        <Modal
          isOpen={true}
          onClose={() => setShowPayloadModal(false)}
          title={`Configure: ${selectedTemplate.name}`}
        >
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600">
              {selectedTemplate.description}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              />
              {selectedTemplate.payloadSchema && (
                <div className="mt-2 text-xs text-gray-500">
                  Expected fields: {Object.keys(selectedTemplate.payloadSchema).join(', ')}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowPayloadModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => sendCommand(selectedTemplate)}
                disabled={loading}
              >
{loading ? 'Sending...' : 'Send Command'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};