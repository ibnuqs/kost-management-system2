// File: src/types/global.d.ts
import { mqttService } from '../services/mqttService';

declare global {
  interface Window {
    mqttService: typeof mqttService;
  }
}

export {};