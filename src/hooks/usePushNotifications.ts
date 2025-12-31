import { useState, useEffect, useCallback } from 'react';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  subscriptionId: string | null;
}

const STORAGE_KEY = 'push_subscription_id';

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    subscriptionId: localStorage.getItem(STORAGE_KEY),
  });

  useEffect(() => {
    // Check if running on native platform
    const isNative = Capacitor.isNativePlatform();
    setState(prev => ({ ...prev, isSupported: isNative }));

    if (!isNative) {
      console.log('Push notifications not supported on web');
      return;
    }

    // Check current permission status
    PushNotifications.checkPermissions().then(result => {
      if (result.receive === 'granted') {
        registerPush();
      }
    });

    // Listen for registration success
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success:', token.value);
      await saveSubscription(token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
      toast({
        title: 'Notification Error',
        description: 'Failed to register for push notifications',
        variant: 'destructive',
      });
    });

    // Listen for push notifications received while app is open
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);
      toast({
        title: notification.title || 'Notification',
        description: notification.body || '',
        duration: 10000,
      });
    });

    // Listen for push notification action (when user taps notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push notification action:', action);
      // Handle navigation or other actions based on notification data
    });

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);

  const registerPush = async () => {
    try {
      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      
      if (permResult.receive !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your device settings',
          variant: 'destructive',
        });
        return false;
      }

      // Register with FCM/APNs
      await PushNotifications.register();
      return true;
    } catch (error) {
      console.error('Error registering push:', error);
      return false;
    }
  };

  const saveSubscription = async (token: string) => {
    try {
      // Check if this token already exists
      const { data: existing } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('endpoint', token)
        .single();

      if (existing) {
        setState(prev => ({
          ...prev,
          isRegistered: true,
          token,
          subscriptionId: existing.id,
        }));
        localStorage.setItem(STORAGE_KEY, existing.id);
        return existing.id;
      }

      // Insert new subscription
      const { data, error } = await supabase
        .from('push_subscriptions')
        .insert({
          endpoint: token,
          p256dh: 'capacitor', // Not used for native push
          auth: 'capacitor', // Not used for native push
        })
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        isRegistered: true,
        token,
        subscriptionId: data.id,
      }));
      localStorage.setItem(STORAGE_KEY, data.id);

      toast({
        title: 'Notifications Enabled',
        description: 'You will receive price alerts as push notifications',
      });

      return data.id;
    } catch (error) {
      console.error('Error saving subscription:', error);
      return null;
    }
  };

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications require the native app',
        variant: 'destructive',
      });
      return false;
    }

    return await registerPush();
  }, [state.isSupported]);

  return {
    ...state,
    requestPermission,
  };
};
