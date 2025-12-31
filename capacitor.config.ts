import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abokibdc.app',
  appName: 'Aboki BDC',
  webDir: 'dist',
  server: {
    url: 'https://1403583e-9cf2-4e36-a8ed-6095df29fdca.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
