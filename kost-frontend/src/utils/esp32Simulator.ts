// ESP32 Device Simulator for Testing Dashboard
import mqtt from 'mqtt';

interface SimulatorConfig {
  deviceId: string;
  deviceName: string;
  firmwareVersion: string;
  statusInterval: number;
}

class ESP32Simulator {
  private client: mqtt.MqttClient | null = null;
  private config: SimulatorConfig;
  private statusTimer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(config: SimulatorConfig) {
    this.config = config;
  }

  async start(): Promise<boolean> {
    if (this.isRunning) {
      console.log('🟡 ESP32 Simulator already running');
      return true;
    }

    try {
      // Use same MQTT credentials as frontend
      const host = import.meta.env.VITE_HIVEMQ_HOST;
      const port = import.meta.env.VITE_HIVEMQ_PORT || '8884';
      const username = import.meta.env.VITE_HIVEMQ_USERNAME;
      const password = import.meta.env.VITE_HIVEMQ_PASSWORD;

      if (!host || !username || !password) {
        console.error('❌ MQTT credentials not configured');
        return false;
      }

      const brokerUrl = `wss://${host}:${port}/mqtt`;
      
      this.client = mqtt.connect(brokerUrl, {
        clientId: `${this.config.deviceId}_simulator_${Math.random().toString(16).substr(2, 8)}`,
        username,
        password,
        keepalive: 60,
        clean: true,
      });

      return new Promise((resolve) => {
        if (!this.client) {
          resolve(false);
          return;
        }

        this.client.on('connect', () => {
          console.log(`🟢 ESP32 Simulator [${this.config.deviceId}] connected to MQTT`);
          this.isRunning = true;
          
          // Subscribe to command topic
          this.client?.subscribe('rfid/command', (err) => {
            if (!err) {
              console.log(`📡 Simulator subscribed to commands`);
            }
          });

          // Start sending status updates
          this.startStatusUpdates();
          
          // Send initial status
          this.sendDeviceStatus();
          
          resolve(true);
        });

        this.client.on('error', (error) => {
          console.error(`❌ ESP32 Simulator connection error:`, error);
          resolve(false);
        });

        this.client.on('message', (topic, message) => {
          this.handleCommand(topic, message.toString());
        });
      });

    } catch {
      console.error(`❌ Failed to start ESP32 simulator`);
      return false;
    }
  }

  stop(): void {
    if (this.statusTimer) {
      clearInterval(this.statusTimer);
      this.statusTimer = null;
    }

    if (this.client) {
      // Send offline status before disconnecting
      this.sendDeviceStatus(false);
      this.client.end();
      this.client = null;
    }

    this.isRunning = false;
    console.log(`🔴 ESP32 Simulator [${this.config.deviceId}] stopped`);
  }

  private startStatusUpdates(): void {
    this.statusTimer = setInterval(() => {
      this.sendDeviceStatus();
    }, this.config.statusInterval);
  }

  private sendDeviceStatus(online: boolean = true): void {
    if (!this.client || !this.isRunning) return;

    const status = {
      device_id: this.config.deviceId,
      device_name: this.config.deviceName,
      wifi_connected: online,
      mqtt_connected: online,
      rfid_ready: online,
      device_ip: online ? '192.168.1.100' : null,
      uptime: online ? this.getUptime() : '0h 0m',
      firmware_version: this.config.firmwareVersion,
      free_heap: online ? Math.floor(Math.random() * 50000) + 200000 : 0,
      timestamp: Date.now(),
      door_status: 'closed',
      last_rfid_scan: null
    };

    this.client.publish('rfid/status', JSON.stringify(status), { qos: 1, retain: true });
    console.log(`📊 ESP32 Status sent: ${online ? 'ONLINE' : 'OFFLINE'}`);
  }

  private handleCommand(topic: string, message: string): void {
    if (topic !== 'rfid/command') return;

    try {
      const command = JSON.parse(message);
      
      if (command.device_id && command.device_id !== this.config.deviceId) {
        return; // Command not for this device
      }

      console.log(`⚡ ESP32 Simulator received command:`, command.command);

      switch (command.command) {
        case 'ping':
          this.sendDeviceStatus();
          break;
          
        case 'restart':
          console.log(`🔄 ESP32 Simulator restarting...`);
          this.sendDeviceStatus(false);
          setTimeout(() => {
            this.sendDeviceStatus(true);
          }, 3000);
          break;
          
        case 'open_door':
          this.simulateDoorAction('open');
          break;
          
        case 'close_door':
          this.simulateDoorAction('close');
          break;
      }
    } catch {
      console.error('❌ Error parsing command');
    }
  }

  private simulateDoorAction(action: 'open' | 'close'): void {
    console.log(`🚪 ESP32 Simulator: Door ${action}`);
    
    // Send door status update
    const status = {
      device_id: this.config.deviceId,
      door_status: action === 'open' ? 'open' : 'closed',
      timestamp: Date.now(),
      action_type: 'manual_override',
      triggered_by: 'admin_dashboard'
    };

    this.client?.publish('rfid/status', JSON.stringify(status));

    // Auto-close door after 5 seconds if opened
    if (action === 'open') {
      setTimeout(() => {
        const closeStatus = {
          device_id: this.config.deviceId,
          door_status: 'closed',
          timestamp: Date.now(),
          action_type: 'auto_close'
        };
        this.client?.publish('rfid/status', JSON.stringify(closeStatus));
        console.log(`🚪 ESP32 Simulator: Door auto-closed`);
      }, 5000);
    }
  }

  // Simulate RFID card scan
  simulateRfidScan(cardUid?: string): void {
    if (!this.client || !this.isRunning) {
      console.warn('⚠️ Cannot simulate RFID scan - simulator not running');
      return;
    }

    const uid = cardUid || this.generateRandomUID();
    
    const scanData = {
      uid,
      device_id: this.config.deviceId,
      timestamp: Date.now(),
      signal_strength: -45 + Math.floor(Math.random() * 20), // -45 to -65 dBm
    };

    this.client.publish('rfid/tags', JSON.stringify(scanData));
    console.log(`💳 ESP32 Simulator: RFID scan simulated - UID: ${uid}`);

    // Simulate server response after 1-2 seconds
    setTimeout(() => {
      const response = {
        uid,
        device_id: this.config.deviceId,
        status: Math.random() > 0.3 ? 'granted' : 'denied',
        user: Math.random() > 0.3 ? `Test User ${uid.slice(-4)}` : 'Unknown',
        message: Math.random() > 0.3 ? 'Access granted' : 'Card not registered',
        access_granted: Math.random() > 0.3,
        timestamp: Date.now()
      };

      this.client?.publish('rfid/command', JSON.stringify(response));
    }, 1000 + Math.random() * 1000);
  }

  private generateRandomUID(): string {
    const chars = '0123456789ABCDEF';
    let uid = '';
    for (let i = 0; i < 8; i++) {
      uid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return uid;
  }

  private getUptime(): string {
    const uptimeMs = Date.now() - (this.startTime || Date.now());
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  private startTime: number = Date.now();

  getStatus(): { running: boolean; deviceId: string } {
    return {
      running: this.isRunning,
      deviceId: this.config.deviceId
    };
  }
}

// Export simulator instance
export const esp32Simulator = new ESP32Simulator({
  deviceId: 'ESP32-RFID-01',
  deviceName: 'Main Door RFID Scanner',
  firmwareVersion: 'v2.1.0-sim',
  statusInterval: 30000 // Send status every 30 seconds
});

// Make globally available for testing
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).esp32Simulator = esp32Simulator;
}

export default esp32Simulator;