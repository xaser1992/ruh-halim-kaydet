
import { Camera } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';

export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    const permissions = await Camera.requestPermissions();
    return permissions.camera === 'granted' && permissions.photos === 'granted';
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const permissions = await LocalNotifications.requestPermissions();
    return permissions.display === 'granted';
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

export const checkAndRequestAllPermissions = async (): Promise<{
  camera: boolean;
  notifications: boolean;
}> => {
  const cameraGranted = await requestCameraPermissions();
  const notificationsGranted = await requestNotificationPermissions();
  
  return {
    camera: cameraGranted,
    notifications: notificationsGranted
  };
};
