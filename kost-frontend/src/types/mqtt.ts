// MQTT Types for ESP32 Integration
export interface MqttConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export interface RfidScanEvent {
  uid: string;
  device_id: string;
  signal_strength?: number;
  timestamp: number;
  response?: {
    status: string;
    user: string;
    message: string;
    access_granted: boolean;
  };
}

export interface DeviceStatus {
  device_id: string;
  wifi_connected: boolean;
  mqtt_connected: boolean;
  rfid_ready: boolean;
  device_ip?: string;
  uptime?: number;
  firmware_version?: string;
  free_heap?: number;
  last_seen: Date;
}

export interface MqttMessage {
  topic: string;
  message: string;
  timestamp: number;
}

export type MqttMessageHandler = (topic: string, message: string) => void;