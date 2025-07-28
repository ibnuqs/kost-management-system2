// File: src/config/env.ts
interface Environment {
  API_URL: string;
  APP_URL: string;
  PUSHER: {
    APP_KEY: string;
    CLUSTER: string;
    HOST?: string;
    PORT: number;
    SCHEME: string;
  };
  MIDTRANS: {
    CLIENT_KEY: string;
    IS_PRODUCTION: boolean;
  };
  APP: {
    NAME: string;
    VERSION: string;
    DEBUG: boolean;
  };
  isDevelopment: () => boolean;
  isProduction: () => boolean;
  validate: () => boolean;
}

export const env: Environment = {
  // API Configuration - Production fallback
  API_URL: import.meta.env.VITE_API_URL || 'https://148.230.96.228/api',
  APP_URL: import.meta.env.VITE_APP_URL || 'https://148.230.96.228',
  
  // Pusher Configuration
  PUSHER: {
    APP_KEY: import.meta.env.VITE_PUSHER_APP_KEY || '',
    CLUSTER: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
    HOST: import.meta.env.VITE_PUSHER_HOST,
    PORT: parseInt(import.meta.env.VITE_PUSHER_PORT || '443'),
    SCHEME: import.meta.env.VITE_PUSHER_SCHEME || 'https',
  },
  
  // Midtrans Configuration
  MIDTRANS: {
    CLIENT_KEY: import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '',
    IS_PRODUCTION: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true',
  },
  
  // App Configuration
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || 'Kost Management System',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    DEBUG: import.meta.env.VITE_DEBUG === 'true',
  },
  
  // Helper methods
  isDevelopment: () => import.meta.env.DEV,
  isProduction: () => import.meta.env.PROD,
  
  // Validation
  validate() {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Check required variables
    if (!this.API_URL) {
      errors.push('VITE_API_URL is required');
    }
    
    // Pusher is optional for development
    if (!this.PUSHER.APP_KEY) {
      warnings.push('VITE_PUSHER_APP_KEY not set - real-time features disabled');
    }
    
    // Midtrans is optional for development
    if (!this.MIDTRANS.CLIENT_KEY) {
      warnings.push('VITE_MIDTRANS_CLIENT_KEY not set - payment features disabled');
    }
    
    // Log warnings in development
    if (this.isDevelopment() && warnings.length > 0) {
      console.warn('⚠️ Environment warnings:', warnings);
    }
    
    // Log errors
    if (errors.length > 0) {
      console.error('❌ Environment errors:', errors);
      return false;
    }
    
    return true;
  }
};

// Validate on import
env.validate();