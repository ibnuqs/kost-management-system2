// ========================================
// AUTO ENVIRONMENT DETECTION SYSTEM
// ========================================
// File ini secara otomatis mendeteksi environment (dev/production)
// tanpa perlu ganti kode manual saat deploy

interface EnvironmentConfig {
  // API Configuration
  API_URL: string;
  APP_URL: string;
  WS_URL: string;
  
  // MQTT Configuration  
  MQTT_HOST: string;
  MQTT_PORT: string;
  MQTT_USERNAME: string;
  MQTT_PASSWORD: string;
  MQTT_ENABLED: boolean;
  
  // Feature Flags
  DEBUG: boolean;
  MOCK_DATA: boolean;
  
  // Environment Info
  ENV_NAME: string;
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
}

/**
 * Deteksi environment berdasarkan berbagai kondisi
 */
function detectEnvironment(): 'development' | 'production' {
  // 1. Cek Vite mode (paling akurat)
  if (import.meta.env.MODE) {
    return import.meta.env.MODE === 'development' ? 'development' : 'production';
  }
  
  // 2. Cek hostname
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Development indicators
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.includes('dev') ||
      hostname.includes('staging') ||
      import.meta.env.DEV) {
    return 'development';
  }
  
  // Production indicators  
  if (hostname.includes('potunakos.my.id') ||
      hostname === '148.230.96.228' ||
      import.meta.env.PROD) {
    return 'production';
  }
  
  // Default fallback berdasarkan NODE_ENV
  return import.meta.env.NODE_ENV === 'development' ? 'development' : 'production';
}

/**
 * Get configuration berdasarkan environment
 */
function getEnvironmentConfig(): EnvironmentConfig {
  const env = detectEnvironment();
  const isDev = env === 'development';
  
  console.log(`🔧 Environment detected: ${env.toUpperCase()}`);
  
  // Base configuration
  const baseConfig = {
    ENV_NAME: env,
    IS_DEVELOPMENT: isDev,
    IS_PRODUCTION: !isDev,
    DEBUG: isDev || import.meta.env.VITE_DEBUG === 'true',
    MOCK_DATA: isDev && import.meta.env.VITE_MOCK_DATA === 'true',
  };
  
  if (isDev) {
    // DEVELOPMENT CONFIGURATION
    return {
      ...baseConfig,
      
      // Local development URLs
      API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
      WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
      
      // Development MQTT (HiveMQ Cloud - same as production)
      MQTT_HOST: import.meta.env.VITE_HIVEMQ_HOST || '16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud',
      MQTT_PORT: import.meta.env.VITE_HIVEMQ_PORT || '8884',
      MQTT_USERNAME: import.meta.env.VITE_HIVEMQ_USERNAME || 'hivemq.webclient.1745310839638',
      MQTT_PASSWORD: import.meta.env.VITE_HIVEMQ_PASSWORD || 'UXNM#Agehw3B8!4;>6tz',
      MQTT_ENABLED: import.meta.env.VITE_MQTT_ENABLED !== 'false',
    };
  } else {
    // PRODUCTION CONFIGURATION
    return {
      ...baseConfig,
      
      // Production URLs (otomatis gunakan domain production)
      API_URL: import.meta.env.VITE_API_URL || 'https://potunakos.my.id/api',
      APP_URL: import.meta.env.VITE_APP_URL || 'https://potunakos.my.id',
      WS_URL: import.meta.env.VITE_WS_URL || 'wss://potunakos.my.id/ws',
      
      // Production MQTT (HiveMQ Cloud)
      MQTT_HOST: import.meta.env.VITE_HIVEMQ_HOST || '16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud',
      MQTT_PORT: import.meta.env.VITE_HIVEMQ_PORT || '8884',
      MQTT_USERNAME: import.meta.env.VITE_HIVEMQ_USERNAME || 'hivemq.webclient.1745310839638',
      MQTT_PASSWORD: import.meta.env.VITE_HIVEMQ_PASSWORD || 'UXNM#Agehw3B8!4;>6tz',
      MQTT_ENABLED: import.meta.env.VITE_MQTT_ENABLED !== 'false',
    };
  }
}

// Export environment configuration
export const ENV = getEnvironmentConfig();

// Helper functions untuk komponen
export const isDevelopment = () => ENV.IS_DEVELOPMENT;
export const isProduction = () => ENV.IS_PRODUCTION;
export const getApiUrl = () => ENV.API_URL;
export const getAppUrl = () => ENV.APP_URL;
export const getMqttConfig = () => ({
  host: ENV.MQTT_HOST,
  port: ENV.MQTT_PORT,
  username: ENV.MQTT_USERNAME,
  password: ENV.MQTT_PASSWORD,
  enabled: ENV.MQTT_ENABLED
});

// Debug log untuk development
if (ENV.DEBUG) {
  console.group('🔧 Environment Configuration');
  console.log('Environment:', ENV.ENV_NAME);
  console.log('API URL:', ENV.API_URL);
  console.log('App URL:', ENV.APP_URL);
  console.log('MQTT Host:', ENV.MQTT_HOST);
  console.log('MQTT Enabled:', ENV.MQTT_ENABLED);
  console.log('Debug Mode:', ENV.DEBUG);
  console.groupEnd();
}

export default ENV;