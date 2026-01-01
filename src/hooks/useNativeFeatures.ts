import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { toast } from '@/hooks/use-toast';

export function useNativeFeatures() {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  useEffect(() => {
    if (!isNative) return;

    const initializeNativeFeatures = async () => {
      try {
        // Hide splash screen after app loads
        await SplashScreen.hide();

        // Configure status bar
        if (platform === 'ios' || platform === 'android') {
          await StatusBar.setStyle({ style: Style.Light });
          if (platform === 'android') {
            await StatusBar.setBackgroundColor({ color: '#16a34a' });
          }
        }

        // Log device info for debugging
        const deviceInfo = await Device.getInfo();
        console.log('Device Info:', deviceInfo);

        // Monitor network status
        Network.addListener('networkStatusChange', (status) => {
          console.log('Network status changed:', status);
          if (!status.connected) {
            toast({
              title: 'No Internet Connection',
              description: 'Please check your network settings',
              variant: 'destructive',
            });
          }
        });

        // Handle keyboard events on iOS
        if (platform === 'ios') {
          Keyboard.addListener('keyboardWillShow', () => {
            console.log('Keyboard will show');
          });
          Keyboard.addListener('keyboardWillHide', () => {
            console.log('Keyboard will hide');
          });
        }

      } catch (error) {
        console.error('Error initializing native features:', error);
      }
    };

    initializeNativeFeatures();

    // Handle app state changes
    const appStateListener = App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
    });

    // Handle back button on Android
    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    // Handle deep links
    const appUrlOpenListener = App.addListener('appUrlOpen', (event) => {
      console.log('App opened with URL:', event.url);
      // Handle deep link navigation here
    });

    return () => {
      appStateListener.then(listener => listener.remove());
      backButtonListener.then(listener => listener.remove());
      appUrlOpenListener.then(listener => listener.remove());
      Network.removeAllListeners();
      if (platform === 'ios') {
        Keyboard.removeAllListeners();
      }
    };
  }, [isNative, platform]);

  // Haptic feedback
  const triggerHaptic = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!isNative) return;
    
    const impactStyles: Record<string, ImpactStyle> = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };

    await Haptics.impact({ style: impactStyles[style] });
  }, [isNative]);

  // Native share
  const shareContent = useCallback(async (title: string, text: string, url?: string) => {
    if (!isNative) {
      // Fallback to web share API
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url || text);
        toast({ title: 'Link copied to clipboard' });
      }
      return;
    }

    await Share.share({
      title,
      text,
      url,
      dialogTitle: 'Share via',
    });
  }, [isNative]);

  // Open external URL in browser
  const openExternalUrl = useCallback(async (url: string) => {
    if (!isNative) {
      window.open(url, '_blank');
      return;
    }

    await Browser.open({ url });
  }, [isNative]);

  // Get network status
  const getNetworkStatus = useCallback(async () => {
    const status = await Network.getStatus();
    return status;
  }, []);

  // Get device info
  const getDeviceInfo = useCallback(async () => {
    const info = await Device.getInfo();
    const id = await Device.getId();
    return { ...info, deviceId: id.identifier };
  }, []);

  return {
    isNative,
    platform,
    triggerHaptic,
    shareContent,
    openExternalUrl,
    getNetworkStatus,
    getDeviceInfo,
  };
}
