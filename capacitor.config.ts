
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2db1032edae140e088c824fe4b03a6c9',
  appName: 'ruh-halim-kaydet',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_EXACT_ALARM'
    ]
  },
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    Camera: {
      saveToGallery: false,
      permissions: ['camera', 'photos']
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
    StatusBar: {
      style: 'default'
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999"
    }
  },
};

export default config;
