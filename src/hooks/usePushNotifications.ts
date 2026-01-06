import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  subscriptionId: string | null;
}

const STORAGE_KEY = 'push_subscription_id';
const AUTO_PROMPT_KEY = 'push_auto_prompted';

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    subscriptionId: localStorage.getItem(STORAGE_KEY),
  });

  const listenersAttached = useRef(false);

  // Check if already registered
  const checkExistingSubscription = useCallback(async () => {
    const existingId = localStorage.getItem(STORAGE_KEY);
    if (existingId) {
      // Verify it still exists in database
      const { data } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('id', existingId)
        .single();

      if (data) {
        setState(prev => ({
          ...prev,
          isRegistered: true,
          subscriptionId: existingId,
        }));
        return true;
      } else {
        // Subscription was deleted, clear local storage
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return false;
  }, []);

  // Web Push registration
  const registerWebPush = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Web notifications not supported');
      return false;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      // Generate a unique token for web (using a combination of user agent and timestamp)
      const webToken = `web_${btoa(navigator.userAgent).slice(0, 20)}_${Date.now()}`;
      
      // Check if this device already has a subscription
      const existingToken = localStorage.getItem('web_push_token');
      if (existingToken) {
        const { data: existing } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('endpoint', existingToken)
          .single();

        if (existing) {
          setState(prev => ({
            ...prev,
            isSupported: true,
            isRegistered: true,
            token: existingToken,
            subscriptionId: existing.id,
          }));
          localStorage.setItem(STORAGE_KEY, existing.id);
          return true;
        }
      }

      // Create new subscription
      const { data, error } = await supabase
        .from('push_subscriptions')
        .insert({
          endpoint: webToken,
          p256dh: 'web_push',
          auth: 'web_push',
        })
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem('web_push_token', webToken);
      localStorage.setItem(STORAGE_KEY, data.id);
      
      setState(prev => ({
        ...prev,
        isSupported: true,
        isRegistered: true,
        token: webToken,
        subscriptionId: data.id,
      }));

      console.log('Web push subscription created:', data.id);
      return true;
    } catch (error) {
      console.error('Error registering web push:', error);
      return false;
    }
  }, []);

  // Native Push registration (Capacitor)
  const registerNativePush = useCallback(async () => {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // Request permission first
      let permResult;
      try {
        permResult = await PushNotifications.requestPermissions();
      } catch (permError) {
        console.warn('Push permission request failed (FCM not configured):', permError);
        toast({
          title: 'Notifications unavailable',
          description: 'Push notifications require Firebase setup. Using local notifications instead.',
          duration: 5000,
        });
        return false;
      }

      if (permResult.receive !== 'granted') {
        console.log('Native push permission denied');
        return false;
      }

      // Attach listeners BEFORE registering so we don't miss fast "registration" events
      if (!listenersAttached.current) {
        listenersAttached.current = true;

        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success:', token.value);
          await saveNativeSubscription(token.value);
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('Push registration error:', err);
          // Don't show error toast for FCM config issues - already handled
          if (!String(err).includes('Firebase') && !String(err).includes('google-services')) {
            toast({
              title: 'Push registration failed',
              description: 'Please try enabling notifications again.',
              variant: 'destructive',
            });
          }
        });

        // Listen for push notifications
        PushNotifications.addListener('pushNotificationReceived', async (notification) => {
          console.log('Push notification received:', notification);

          // Show local notification when app is in foreground
          await LocalNotifications.schedule({
            notifications: [
              {
                id: Date.now(),
                title: notification.title || 'Notification',
                body: notification.body || '',
                schedule: { at: new Date(Date.now() + 100) },
                sound: 'default',
                smallIcon: 'ic_stat_icon_config_sample',
                largeIcon: 'ic_launcher',
              },
            ],
          });

          toast({
            title: notification.title || 'Notification',
            description: notification.body || '',
            duration: 10000,
          });
        });
      }

      // Register with FCM/APNs - wrapped in try/catch for missing config
      try {
        await PushNotifications.register();
      } catch (regError) {
        console.warn('FCM registration failed (google-services.json missing):', regError);
        toast({
          title: 'Push notifications unavailable',
          description: 'Firebase configuration is required for push notifications.',
          duration: 5000,
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error registering native push:', error);
      // Show user-friendly message instead of crashing
      toast({
        title: 'Notifications setup incomplete',
        description: 'Push notifications will be available after Firebase is configured.',
        duration: 5000,
      });
      return false;
    }
  }, []);

  const saveNativeSubscription = async (token: string) => {
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
          p256dh: 'capacitor',
          auth: 'capacitor',
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

      return data.id;
    } catch (error) {
      console.error('Error saving subscription:', error);
      return null;
    }
  };

  // Auto-register on mount
  useEffect(() => {
    const autoRegister = async () => {
      // Check if already registered
      const alreadyRegistered = await checkExistingSubscription();
      if (alreadyRegistered) {
        console.log('Already registered for push notifications');
        setState(prev => ({ ...prev, isSupported: true }));
        return;
      }

      // Check if already prompted (don't spam the user)
      const alreadyPrompted = localStorage.getItem(AUTO_PROMPT_KEY);
      
      const isNative = Capacitor.isNativePlatform();
      setState(prev => ({ ...prev, isSupported: true }));

      if (isNative) {
        // Native: always try to register
        await registerNativePush();
      } else {
        // Web: auto-prompt once, then respect user's choice
        if (!alreadyPrompted) {
          // Small delay to let app load first
          setTimeout(async () => {
            const registered = await registerWebPush();
            localStorage.setItem(AUTO_PROMPT_KEY, 'true');
            
            if (registered) {
              toast({
                title: '🔔 Notifications Enabled',
                description: 'You will receive forex news and rate alerts',
                duration: 5000,
              });
            }
          }, 2000);
        }
      }
    };

    autoRegister();
  }, [checkExistingSubscription, registerNativePush, registerWebPush]);

  const requestPermission = useCallback(async () => {
    const isNative = Capacitor.isNativePlatform();
    
    if (isNative) {
      return await registerNativePush();
    } else {
      const registered = await registerWebPush();
      if (registered) {
        toast({
          title: '🔔 Notifications Enabled',
          description: 'You will receive forex news and rate alerts',
          duration: 5000,
        });
      }
      return registered;
    }
  }, [registerNativePush, registerWebPush]);

  return {
    ...state,
    requestPermission,
  };
};
