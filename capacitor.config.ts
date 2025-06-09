
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2db1032edae140e088c824fe4b03a6c9',
  appName: 'ruh-halim-kaydet',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  },
  plugins: {
    Camera: {
      saveToGallery: false
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
