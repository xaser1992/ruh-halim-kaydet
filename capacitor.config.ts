
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2db1032edae140e088c824fe4b03a6c9',
  appName: 'ruh-halim-kaydet',
  webDir: 'dist',
  server: {
    url: "https://2db1032e-dae1-40e0-88c8-24fe4b03a6c9.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
