// File: src/services/mqttService.ts
import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { ENV, getMqttConfig } from '../config/environment';

export interface MqttMessage {
  topic: string;
  message: string;
  timestamp: number;
}

export interface MqttConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export type MqttMessageHandler = (topic: string, message: string) => void;

class MqttService {
  private client: MqttClient | null = null;
  private messageHandlers: Map<string, MqttMessageHandler[]> = new Map();
  private connectionStatus: MqttConnectionStatus = {
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0
  };
  private statusCallbacks: ((status: MqttConnectionStatus) => void)[] = [];
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Check if MQTT is explicitly disabled
    const mqttConfig = getMqttConfig();
    if (!mqttConfig.enabled) {
      console.log('🔧 MQTT service explicitly disabled in environment');
      this.updateConnectionStatus({
        connected: false,
        connecting: false,
        error: 'MQTT disabled in configuration',
        reconnectAttempts: this.maxReconnectAttempts // Prevent reconnection attempts
      });
      return;
    }

    // Only auto-connect if MQTT credentials are properly configured
    if (this.hasValidCredentials()) {
      this.connect();
    } else {
      console.warn('🔧 MQTT service disabled - configure MQTT credentials in .env file');
      this.updateConnectionStatus({
        connected: false,
        connecting: false,
        error: 'MQTT credentials not configured',
        reconnectAttempts: 0
      });
    }
  }

  /**
   * Connect to MQTT broker
   */
  public async connect(): Promise<boolean> {
    if (this.connectionStatus.connecting || this.connectionStatus.connected) {
      return this.connectionStatus.connected;
    }

    // Check if MQTT should be disabled due to previous failures
    if (this.connectionStatus.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🔧 MQTT disabled - max reconnection attempts reached');
      return false;
    }

    // Check if credentials are configured
    if (!this.hasValidCredentials()) {
      console.warn('❌ Cannot connect: MQTT credentials not configured');
      this.updateConnectionStatus({
        connected: false,
        connecting: false,
        error: 'MQTT credentials not configured - update .env file',
        reconnectAttempts: 0
      });
      return false;
    }

    this.updateConnectionStatus({
      ...this.connectionStatus,
      connecting: true,
      error: null
    });

    try {
      // Get MQTT configuration from environment
      const mqttConfig = getMqttConfig();
      const host = mqttConfig.host;
      const port = mqttConfig.port;
      let username = mqttConfig.username;
      let password = mqttConfig.password;
      
      // Handle different MQTT brokers
      if (host.includes('broker.emqx.io')) {
        console.log('🔧 Using public EMQX broker (no auth)');
        username = undefined;
        password = undefined;
      } else {
        // Ensure we have the complete password for HiveMQ
        if (username === 'hivemq.webclient.1745310839638') {
          password = 'UXNM#Agehw3B8!4;>6tz';
          console.log('🔧 Using complete HiveMQ password');
        }
        
        // Remove quotes if they exist (Vite might include them)
        if (password && password.startsWith('"') && password.endsWith('"')) {
          password = password.slice(1, -1);
        }
        
        // Also handle single quotes
        if (password && password.startsWith("'") && password.endsWith("'")) {
          password = password.slice(1, -1);
        }
      }

      console.log('🔗 Connecting to MQTT broker:', host);
      if (ENV.DEBUG) {
        console.log('🔧 MQTT Debug - Processed Username:', username);
        console.log('🔧 MQTT Debug - Password length:', password?.length);
        console.log('🔧 MQTT Debug - Host:', host);
        console.log('🔧 MQTT Debug - Port:', port);
        console.log('🔧 MQTT Config:', mqttConfig);
      }

      // HiveMQ Cloud WebSocket endpoint (official format from console)
      const brokerUrl = `wss://${host}:${port}/mqtt`;
      
      const clientId = `kost_frontend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔧 MQTT Debug - Client ID:', clientId);
      
      const options: IClientOptions = {
        clientId,
        username,
        password,
        keepalive: 30,
        connectTimeout: 10000,
        clean: true,
        protocol: 'wss',
        protocolVersion: 4,
      };

      console.log('🔧 MQTT Debug - Full connection URL:', brokerUrl);
      console.log('🔧 MQTT Debug - Connection options:', JSON.stringify(options, null, 2));

      console.log('🔗 Connecting to MQTT broker:', brokerUrl);
      
      this.client = mqtt.connect(brokerUrl, options);

      return new Promise((resolve) => {
        if (!this.client) {
          resolve(false);
          return;
        }

        this.client.on('connect', (connack) => {
          console.log('✅ Connected to MQTT broker');
          console.log('🔧 Connection acknowledgment:', connack);
          console.log('🔧 Connected with credentials:', { username, clientId });
          this.updateConnectionStatus({
            connected: true,
            connecting: false,
            error: null,
            reconnectAttempts: 0
          });

          // Frontend status publishing disabled to reduce console spam
          // Only publish if debugging is enabled
          if (ENV.DEBUG) {
            this.publish('rfid/status', JSON.stringify({
              device_id: 'frontend-client',
              wifi_connected: true,
              mqtt_connected: true,
              rfid_ready: false,
              device_ip: 'frontend',
              uptime: '0h 0m',
              firmware_version: 'frontend-v1.0.0',
              free_heap: 0,
              timestamp: Date.now()
            }), 1, true);
          }

          resolve(true);
        });

        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message.toString());
        });

        this.client.on('error', (error) => {
          console.error('❌ MQTT connection error:', error);
          console.error('🔧 Error details:', {
            message: error.message,
            code: (error as any).code,
            errno: (error as any).errno,
            type: typeof error,
            stack: error.stack
          });
          
          // Check if this is an authorization error
          if (error.message.includes('Not authorized') || error.message.includes('Connection refused')) {
            console.error('🔒 MQTT Authorization failed - credentials may be invalid or expired');
            console.error('🔧 Auth failure details:', {
              username_length: username?.length,
              password_length: password?.length,
              host,
              port,
              brokerUrl,
              clientId
            });
            this.updateConnectionStatus({
              ...this.connectionStatus,
              connected: false,
              connecting: false,
              error: 'Authorization failed - check MQTT credentials',
              reconnectAttempts: this.maxReconnectAttempts // Stop further attempts
            });
            resolve(false);
            return; // Don't schedule reconnect for auth failures
          }
          
          this.updateConnectionStatus({
            ...this.connectionStatus,
            connected: false,
            connecting: false,
            error: error.message
          });
          this.scheduleReconnect();
          resolve(false);
        });

        this.client.on('close', () => {
          console.log('🔌 MQTT connection closed');
          
          // Don't reconnect if we've reached max attempts (likely auth failure)
          if (this.connectionStatus.reconnectAttempts >= this.maxReconnectAttempts) {
            this.updateConnectionStatus({
              ...this.connectionStatus,
              connected: false,
              connecting: false
            });
            return;
          }
          
          this.updateConnectionStatus({
            ...this.connectionStatus,
            connected: false,
            connecting: false
          });
          this.scheduleReconnect();
        });

        this.client.on('offline', () => {
          console.log('📵 MQTT client offline');
          this.updateConnectionStatus({
            ...this.connectionStatus,
            connected: false
          });
        });

        this.client.on('reconnect', () => {
          console.log('🔄 MQTT reconnecting...');
          this.updateConnectionStatus({
            ...this.connectionStatus,
            connecting: true
          });
        });
      });

    } catch (error) {
      console.error('❌ Failed to create MQTT client:', error);
      this.updateConnectionStatus({
        ...this.connectionStatus,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      });
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Disconnect from MQTT broker
   */
  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.client) {
      // Offline status publishing disabled to reduce console spam
      if (ENV.DEBUG) {
        this.publish('rfid/status', JSON.stringify({
          device_id: 'frontend-client',
          wifi_connected: false,
          mqtt_connected: false,
          rfid_ready: false,
          timestamp: Date.now()
        }), 1, true);
      }

      this.client.end();
      this.client = null;
    }

    this.updateConnectionStatus({
      connected: false,
      connecting: false,
      error: null,
      reconnectAttempts: 0
    });
  }

  /**
   * Subscribe to MQTT topic
   */
  public subscribe(topic: string, handler: MqttMessageHandler): void {
    if (!this.messageHandlers.has(topic)) {
      this.messageHandlers.set(topic, []);
    }
    this.messageHandlers.get(topic)!.push(handler);

    if (this.client && this.connectionStatus.connected) {
      this.client.subscribe(topic, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to ${topic}:`, err);
        }
        // Removed success log to reduce console spam
      });
    }
  }

  /**
   * Unsubscribe from MQTT topic
   */
  public unsubscribe(topic: string, handler?: MqttMessageHandler): void {
    if (handler) {
      const handlers = this.messageHandlers.get(topic);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
          this.messageHandlers.delete(topic);
        }
      }
    } else {
      this.messageHandlers.delete(topic);
    }

    if (this.client && this.connectionStatus.connected && !this.messageHandlers.has(topic)) {
      this.client.unsubscribe(topic, (err) => {
        if (err) {
          console.error(`❌ Failed to unsubscribe from ${topic}:`, err);
        } else {
          console.log(`🚫 Unsubscribed from ${topic}`);
        }
      });
    }
  }

  /**
   * Publish message to MQTT topic
   */
  public publish(topic: string, message: string, qos: 0 | 1 | 2 = 0, retain: boolean = false): boolean {
    if (!this.client || !this.connectionStatus.connected) {
      console.warn('⚠️ Cannot publish: MQTT client not connected');
      return false;
    }

    try {
      this.client.publish(topic, message, { qos, retain }, (err) => {
        if (err) {
          console.error(`❌ Failed to publish to ${topic}:`, err);
        } else {
          console.log(`📤 Published to ${topic}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
        }
      });
      return true;
    } catch (error) {
      console.error('❌ Publish error:', error);
      return false;
    }
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): MqttConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Add callback for connection status changes
   */
  public onConnectionStatusChange(callback: (status: MqttConnectionStatus) => void): void {
    this.statusCallbacks.push(callback);
  }

  /**
   * Remove connection status callback
   */
  public removeConnectionStatusCallback(callback: (status: MqttConnectionStatus) => void): void {
    const index = this.statusCallbacks.indexOf(callback);
    if (index > -1) {
      this.statusCallbacks.splice(index, 1);
    }
  }

  /**
   * Send command to ESP32 device
   */
  public sendDeviceCommand(deviceId: string, command: string, payload?: Record<string, unknown>): boolean {
    const commandMessage = {
      command,
      device_id: deviceId,
      timestamp: Date.now(),
      payload: payload || {},
      from: 'frontend'
    };

    return this.publish(`kost_system/device/${deviceId}/command`, JSON.stringify(commandMessage));
  }

  /**
   * Send RFID command response
   */
  public sendRfidResponse(uid: string, response: Record<string, unknown>): boolean {
    const responseMessage = {
      uid,
      ...response,
      timestamp: Date.now(),
      from: 'frontend'
    };

    return this.publish('rfid/command', JSON.stringify(responseMessage));
  }

  // Private methods

  /**
   * Check if MQTT credentials are properly configured
   */
  private hasValidCredentials(): boolean {
    const mqttConfig = getMqttConfig();
    const { host, username, password } = mqttConfig;

    return !!(
      host && 
      username && 
      password && 
      host !== 'your_hivemq_host_here' &&
      username !== 'your_mqtt_username_here' &&
      password !== 'your_mqtt_password_here'
    );
  }

  private handleMessage(topic: string, message: string): void {
    // Only log non-routine messages to reduce console spam
    if (topic !== 'rfid/status' || !message.includes('frontend-client')) {
      console.log(`📨 MQTT message received on ${topic}:`, message);
    }

    const handlers = this.messageHandlers.get(topic);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(topic, message);
        } catch (error) {
          console.error(`❌ Error in message handler for ${topic}:`, error);
        }
      });
    }

    // Also check for wildcard handlers
    this.messageHandlers.forEach((handlers, pattern) => {
      if (this.matchTopic(pattern, topic)) {
        handlers.forEach(handler => {
          try {
            handler(topic, message);
          } catch (error) {
            console.error(`❌ Error in wildcard message handler for ${pattern}:`, error);
          }
        });
      }
    });
  }

  private matchTopic(pattern: string, topic: string): boolean {
    // Simple wildcard matching for MQTT topics
    // Supports + (single level) and # (multi level) wildcards
    if (pattern === topic) return true;
    
    const patternParts = pattern.split('/');
    const topicParts = topic.split('/');
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      
      if (patternPart === '#') {
        return true; // # matches everything remaining
      }
      
      if (patternPart === '+') {
        continue; // + matches any single level
      }
      
      if (patternPart !== topicParts[i]) {
        return false;
      }
    }
    
    return patternParts.length === topicParts.length;
  }

  private updateConnectionStatus(status: MqttConnectionStatus): void {
    this.connectionStatus = status;
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('❌ Error in status callback:', error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.connectionStatus.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🛑 Max reconnection attempts reached - MQTT service disabled');
      this.updateConnectionStatus({
        ...this.connectionStatus,
        error: 'MQTT disabled - restart application to retry'
      });
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = this.reconnectDelay * Math.pow(2, this.connectionStatus.reconnectAttempts); // Exponential backoff
    
    console.log(`🔄 Scheduling reconnect in ${delay}ms (attempt ${this.connectionStatus.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.updateConnectionStatus({
      ...this.connectionStatus,
      reconnectAttempts: this.connectionStatus.reconnectAttempts + 1
    });

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

// Export singleton instance
export const mqttService = new MqttService();

// Make MQTT service globally available for ESP32 commands
if (typeof window !== 'undefined') {
  (window as any).mqttService = mqttService;
}

export default mqttService;