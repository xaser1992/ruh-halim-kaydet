import { gapi } from 'gapi-script';
import { getAllMoodEntries } from '@/utils/moodStorage';

interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  discoveryDoc: string;
  scopes: string;
}

export class GoogleDriveService {
  private isInitialized = false;
  private config: GoogleDriveConfig;

  constructor() {
    // Google Drive API yapılandırması
    this.config = {
      clientId: '889229051425-sasf4jjhntk1mpfis6klblrh5ue8868j.apps.googleusercontent.com',
      apiKey: 'AIzaSyA4g3uJ7tXlVgzp62il-ROv66OIWL99t8c',
      discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
      scopes: 'https://www.googleapis.com/auth/drive.file'
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      return new Promise((resolve, reject) => {
        gapi.load('client:auth2', () => {
          gapi.client.init({
            apiKey: this.config.apiKey,
            clientId: this.config.clientId,
            discoveryDocs: [this.config.discoveryDoc],
            scope: this.config.scopes,
            ux_mode: 'popup'
          }).then(() => {
            this.isInitialized = true;
            console.log('🟢 Google Drive API initialized');
            resolve();
          }).catch((error) => {
            console.error('❌ Google Drive client init failed:', error);
            reject(error);
          });
        });
      });
    } catch (error) {
      console.error('❌ Google Drive initialization failed:', error);
      throw error;
    }
  }

  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const authInstance = gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();
      
      if (!isSignedIn) {
        await authInstance.signIn();
      }
      
      return authInstance.isSignedIn.get();
    } catch (error) {
      console.error('❌ Google Drive sign in failed:', error);
      return false;
    }
  }

  async uploadMoodData(): Promise<{ success: boolean; fileId?: string; error?: string }> {
    try {
      const isSignedIn = await this.signIn();
      if (!isSignedIn) {
        return { success: false, error: 'Google Drive authentication failed' };
      }

      // localStorage'dan tüm mood entries'i al
      const moodEntries = getAllMoodEntries();
      const backupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        appName: 'Ruh Halim',
        data: moodEntries
      };

      const fileName = `mood_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileContent = JSON.stringify(backupData, null, 2);

      // Önce mevcut yedek dosyası var mı kontrol et
      const existingFile = await this.findBackupFile();
      
      let response;
      if (existingFile) {
        // Mevcut dosyayı güncelle
        response = await gapi.client.request({
          path: `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}`,
          method: 'PATCH',
          params: {
            uploadType: 'media'
          },
          body: fileContent
        });
      } else {
        // Yeni dosya oluştur
        const metadata = {
          name: fileName,
          parents: ['appDataFolder'], // Kullanıcı görünümünde gizli kalır
          description: 'Ruh Halim uygulaması günlük yedekleri'
        };

        response = await gapi.client.request({
          path: 'https://www.googleapis.com/upload/drive/v3/files',
          method: 'POST',
          params: {
            uploadType: 'multipart'
          },
          headers: {
            'Content-Type': 'multipart/related; boundary="foo_bar_baz"'
          },
          body: [
            '--foo_bar_baz',
            'Content-Type: application/json; charset=UTF-8',
            '',
            JSON.stringify(metadata),
            '--foo_bar_baz',
            'Content-Type: application/json',
            '',
            fileContent,
            '--foo_bar_baz--'
          ].join('\r\n')
        });
      }

      if (response.status === 200) {
        console.log('🟢 Mood data uploaded to Google Drive');
        return { success: true, fileId: response.result.id };
      } else {
        return { success: false, error: 'Upload failed' };
      }
    } catch (error) {
      console.error('❌ Google Drive upload failed:', error);
      return { success: false, error: error.message };
    }
  }

  async downloadMoodData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const isSignedIn = await this.signIn();
      if (!isSignedIn) {
        return { success: false, error: 'Google Drive authentication failed' };
      }

      const backupFile = await this.findBackupFile();
      if (!backupFile) {
        return { success: false, error: 'No backup file found' };
      }

      const response = await gapi.client.drive.files.get({
        fileId: backupFile.id,
        alt: 'media'
      });

      if (response.status === 200) {
        const backupData = JSON.parse(response.body);
        console.log('🟢 Mood data downloaded from Google Drive');
        return { success: true, data: backupData };
      } else {
        return { success: false, error: 'Download failed' };
      }
    } catch (error) {
      console.error('❌ Google Drive download failed:', error);
      return { success: false, error: error.message };
    }
  }

  private async findBackupFile(): Promise<any> {
    try {
      const response = await gapi.client.drive.files.list({
        q: "name contains 'mood_backup' and parents in 'appDataFolder'",
        spaces: 'appDataFolder'
      });

      return response.result.files && response.result.files.length > 0 
        ? response.result.files[0] 
        : null;
    } catch (error) {
      console.error('❌ Error finding backup file:', error);
      return null;
    }
  }

  async getLastSyncDate(): Promise<Date | null> {
    const backupFile = await this.findBackupFile();
    if (backupFile) {
      return new Date(backupFile.modifiedTime);
    }
    return null;
  }
}

export const googleDriveService = new GoogleDriveService();