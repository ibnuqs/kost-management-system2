// File: src/utils/echo.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { env } from '../config/env';

// Define callback type for event handling
type EventCallback = (eventType: string, data: Record<string, unknown>) => void;

// Extend window interface for TypeScript
declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}
window.Pusher = Pusher;

// ==============================
// Echo Manager (singleton)
// ==============================
class EchoManager {
  private echo: Echo<Pusher> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor() {
    // Don't auto-initialize, wait for explicit connect call
  }

  // Connect with specific token (called from AuthContext)
  public async connect(token?: string): Promise<void> {
    if (this.isConnecting) {
      console.log('🔄 Connection already in progress...');
      return;
    }

    if (!env.PUSHER.APP_KEY) {
      console.warn('🟡 Pusher disabled: APP_KEY not configured');
      return;
    }

    // Use provided token or get from localStorage
    const authToken = token || localStorage.getItem('auth_token');
    if (!authToken) {
      console.warn('🟡 No auth token available for Echo connection');
      return;
    }

    // Connecting Echo (token details omitted for security)
    this.isConnecting = true;

    try {
      // Disconnect existing connection
      if (this.echo) {
        this.disconnect();
      }

      this.echo = new Echo({
        broadcaster: 'pusher',
        key: env.PUSHER.APP_KEY,
        cluster: env.PUSHER.CLUSTER,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        auth: {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
        authEndpoint: `${env.API_URL}/broadcasting/auth`,
        pusherOptions: {
          cluster: env.PUSHER.CLUSTER,
          forceTLS: true,
          enableStats: false,
          enableLogging: env.isDevelopment?.() || false,
          activityTimeout: 30000,
          pongTimeout: 10000,
          unavailableTimeout: 10000,
        }
      });

      this.setupEventListeners();
      this.isConnecting = false;
      console.log('✅ Echo initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Echo:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
      throw error;
    }
  }

  private setupEventListeners() {
    if (!this.echo?.connector?.pusher) return;
    
    const pusher = this.echo.connector.pusher;

    // Connection events
    pusher.connection.bind('connected', () => {
      console.log('✅ Pusher connected successfully');
      this.reconnectAttempts = 0;
      this.clearReconnectTimer();
    });

    pusher.connection.bind('connecting', () => {
      console.log('🔄 Pusher connecting...');
    });

    pusher.connection.bind('disconnected', () => {
      console.log('❌ WebSocket disconnected');
      this.handleDisconnection();
    });

    pusher.connection.bind('unavailable', () => {
      console.log('⚠️ Pusher unavailable, will retry...');
      this.handleDisconnection();
    });

    pusher.connection.bind('failed', () => {
      console.error('❌ Pusher connection failed');
      this.handleDisconnection();
    });

    pusher.connection.bind('error', (error: Record<string, unknown>) => {
      console.error('❌ Pusher connection error:', error);
      
      // Handle auth errors specifically
      if (error?.error?.data?.code === 4001) {
        console.error('🚨 Broadcasting authentication failed - invalid token');
      }
      
      this.handleDisconnection();
    });

    pusher.connection.bind('state_change', (states: Record<string, unknown>) => {
      console.log(`🔄 WebSocket state: ${states.previous} → ${states.current}`);
    });

    // Subscription events
    pusher.bind('pusher:subscription_error', (error: Record<string, unknown>) => {
      console.error('❌ Subscription error:', error);
      
      // Handle 401 subscription errors
      if (error?.status === 401) {
        console.error('🚨 Subscription authentication failed');
      }
    });

    pusher.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Subscription succeeded');
    });
  }

  private handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      console.error('❌ Max reconnection attempts reached. Echo disabled.');
    }
  }

  private scheduleReconnect() {
    this.clearReconnectTimer();
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * this.reconnectAttempts;
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.connect(token);
      } else {
        console.warn('🟡 No token available for reconnection');
      }
    }, delay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  public disconnect() {
    console.log('🧹 Disconnecting Echo...');
    
    if (this.echo) {
      try {
        this.echo.disconnect();
      } catch (error) {
        console.warn('⚠️ Warning during disconnect:', error);
      }
      this.echo = null;
    }
    
    this.clearReconnectTimer();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  public getEcho(): Echo<Pusher> | null {
    return this.echo;
  }

  public isConnected(): boolean {
    return this.echo?.connector?.pusher?.connection?.state === 'connected';
  }

  public getConnectionState(): string {
    if (!this.echo?.connector?.pusher) return 'disconnected';
    return this.echo.connector.pusher.connection.state;
  }

  // Reconnect with new token
  public async reconnect(newToken?: string): Promise<void> {
    console.log('🔄 Manual reconnect requested');
    
    // Update token if provided
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
    }
    
    this.disconnect();
    this.reconnectAttempts = 0;
    
    // Connect with new/current token
    const token = newToken || localStorage.getItem('auth_token');
    if (token) {
      await this.connect(token);
    }
  }
}

// Create singleton instance
const echoManager = new EchoManager();

// Enhanced helper functions
export const echoHelpers = {
  // Connect Echo (should be called after authentication)
  async connect(token?: string): Promise<void> {
    return echoManager.connect(token);
  },

  // Disconnect Echo
  disconnect(): void {
    echoManager.disconnect();
  },

  // Reconnect with new token
  async reconnect(newToken?: string): Promise<void> {
    return echoManager.reconnect(newToken);
  },

  // Get connection status
  getConnectionState(): string {
    return echoManager.getConnectionState();
  },

  // Check if connected
  isConnected(): boolean {
    return echoManager.isConnected();
  },

  // Join public channel
  joinChannel(channelName: string) {
    const echo = echoManager.getEcho();
    if (!echo) {
      console.warn(`🟡 Cannot join channel '${channelName}' - Echo not connected`);
      return null;
    }
    
    console.log(`📡 Joining public channel: ${channelName}`);
    return echo.channel(channelName);
  },
  
  // Join private channel (requires authentication)
  joinPrivateChannel(channelName: string) {
    const echo = echoManager.getEcho();
    if (!echo) {
      console.warn(`🟡 Cannot join private channel '${channelName}' - Echo not connected`);
      return null;
    }
    
    console.log(`🔐 Joining private channel: ${channelName}`);
    return echo.private(channelName);
  },
  
  // Join presence channel (shows who's online)
  joinPresenceChannel(channelName: string) {
    const echo = echoManager.getEcho();
    if (!echo) {
      console.warn(`🟡 Cannot join presence channel '${channelName}' - Echo not connected`);
      return null;
    }
    
    console.log(`👥 Joining presence channel: ${channelName}`);
    return echo.join(channelName);
  },
  
  // Leave channel
  leaveChannel(channelName: string) {
    const echo = echoManager.getEcho();
    if (!echo) return;
    
    console.log(`👋 Leaving channel: ${channelName}`);
    echo.leaveChannel(channelName);
  },
  
  // Leave all channels
  leaveAllChannels() {
    console.log('👋 Leaving all channels...');
    echoManager.disconnect();
  },
  
  // Listen to admin notifications (public channel)
  listenToAdminNotifications(callback: EventCallback) {
    const channel = this.joinChannel('admin-notifications');
    if (!channel) return null;
    
    return channel
      .listen('.RfidAccessEvent', (e: Record<string, unknown>) => {
        console.log('🔑 Admin RFID event:', e);
        callback('rfid-access', e);
      })
      .listen('.PaymentSuccessEvent', (e: Record<string, unknown>) => {
        console.log('💰 Admin payment event:', e);
        callback('payment-success', e);
      })
      .listen('.DeviceStatusEvent', (e: Record<string, unknown>) => {
        console.log('🔌 Admin device event:', e);
        callback('device-status', e);
      })
      .listen('.SystemAlertEvent', (e: Record<string, unknown>) => {
        console.log('🚨 Admin system alert:', e);
        callback('system-alert', e);
      });
  },
  
  // Listen to user-specific notifications (private channel)
  listenToUserNotifications(userId: string | number, callback: EventCallback) {
    if (!userId) {
      console.warn('🟡 Cannot listen to user notifications - no userId provided');
      return null;
    }
    
    const channel = this.joinPrivateChannel(`user.${userId}`);
    if (!channel) return null;
    
    return channel
      .listen('.RfidAccessEvent', (e: Record<string, unknown>) => {
        console.log('🔑 User RFID event:', e);
        callback('rfid-access', e);
      })
      .listen('.PaymentSuccessEvent', (e: Record<string, unknown>) => {
        console.log('💰 User payment event:', e);
        callback('payment-success', e);
      })
      .listen('.PaymentReminderEvent', (e: Record<string, unknown>) => {
        console.log('⏰ User payment reminder:', e);
        callback('payment-reminder', e);
      })
      .listen('.NotificationEvent', (e: Record<string, unknown>) => {
        console.log('📢 User notification:', e);
        callback('notification', e);
      });
  },
  
  // Listen to room-specific notifications
  listenToRoomNotifications(roomId: string | number, callback: EventCallback) {
    if (!roomId) return null;
    
    const channel = this.joinChannel(`room.${roomId}`);
    if (!channel) return null;
    
    return channel
      .listen('.RoomAccessEvent', (e: Record<string, unknown>) => {
        callback('room-access', e);
      })
      .listen('.RoomMaintenanceEvent', (e: Record<string, unknown>) => {
        callback('room-maintenance', e);
      });
  },
  
  // Listen to system announcements (public channel)
  listenToSystemAnnouncements(callback: EventCallback) {
    const channel = this.joinChannel('system-announcements');
    if (!channel) return null;
    
    return channel
      .listen('.SystemAnnouncementEvent', (e: Record<string, unknown>) => {
        console.log('📢 System announcement:', e);
        callback('system-announcement', e);
      });
  },
};

// ==============================
// Export Echo Manager
// ==============================
export { echoManager };
export default echoManager;