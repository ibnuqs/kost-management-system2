// File: src/components/Notifications/NotificationListener.tsx
import { useEffect } from 'react';
import { useAuth } from '../../pages/Auth/contexts/AuthContext';
import { echoHelpers } from '../../utils/echo';
import { toast } from 'react-hot-toast';

export default function NotificationListener() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Use the auth helper to get token consistently
    const getToken = async () => {
      const { getAuthToken } = await import('../../pages/Auth/utils/helpers');
      return getAuthToken();
    };

    getToken().then(token => {
      if (!token) return;

      // Connect Echo
      const timer = setTimeout(() => {
        echoHelpers.connect(token).then(() => {
          setupNotifications();
        }).catch(() => {
          // Silent fail
        });
      }, 3000);

      return () => {
        clearTimeout(timer);
        echoHelpers.disconnect();
      };
    });
  }, [user?.id, isAuthenticated]);

  const setupNotifications = () => {
    if (!user) return;

    // Admin notifications
    if (user.role === 'admin') {
      try {
        echoHelpers.listenToAdminNotifications((eventType, data) => {
          if (eventType === 'rfid-access' && data.access_granted) {
            toast.success(`${data.user_name} entered ${data.room_number}`);
          }
        });
      } catch (e) {
        // Silent fail
      }
    }

    // User notifications
    try {
      echoHelpers.listenToUserNotifications(user.id, (eventType, data) => {
        if (eventType === 'payment-success') {
          toast.success('Payment successful!');
        }
      });
    } catch (e) {
      // Silent fail
    }
  };

  return null;
}