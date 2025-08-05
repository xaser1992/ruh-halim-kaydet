import { getAllMoodEntries } from '@/utils/moodStorage';

// Google Identity Services type declarations
declare global {
  interface Window {
    gapi: any;
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  discoveryDoc: string;
  scopes: string;
}

export class GoogleDriveService {
  private isInitialized = false;
  private config: GoogleDriveConfig;
  private tokenClient: any = null;
  private accessToken: string | null = null;

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

    // Google APIs'nin yüklendiğini bekle
    const waitForGoogle = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window.gapi !== 'undefined' && typeof window.google !== 'undefined') {
          resolve();
          return;
        }
        
        let attempts = 0;
        const checkGoogle = () => {
          attempts++;
          if (typeof window.gapi !== 'undefined' && typeof window.google !== 'undefined') {
            resolve();
          } else if (attempts > 50) { // 5 saniye bekle
            reject(new Error('Google APIs could not be loaded'));
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
      });
    };

    try {
      // Google APIs'nin yüklenmesini bekle
      await waitForGoogle();
      
      return new Promise((resolve, reject) => {
        window.gapi.load('client', {
          callback: async () => {
            try {
              console.log('🔄 Initializing Google Drive API with GIS...');
              
              // gapi.client'ı initialize et
              await window.gapi.client.init({
                apiKey: this.config.apiKey,
                discoveryDocs: [this.config.discoveryDoc]
              });

              // Google Identity Services token client'ı oluştur
              this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: this.config.clientId,
                scope: this.config.scopes,
                callback: (response: any) => {
                  if (response.error) {
                    console.error('❌ Token client error:', response.error);
                    return;
                  }
                  this.accessToken = response.access_token;
                  console.log('🟢 Access token received');
                },
              });
              
              this.isInitialized = true;
              console.log('🟢 Google Drive API initialized successfully with GIS');
              resolve();
            } catch (error) {
              console.error('❌ Google Drive initialization failed:', error);
              reject(error);
            }
          },
          onerror: (error) => {
            console.error('❌ Failed to load gapi client:', error);
            reject(new Error('Failed to load gapi client'));
          }
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
      console.log('🔄 Starting Google sign in...');
      
      if (!this.tokenClient) {
        console.error('❌ Token client not initialized');
        return false;
      }

      // Access token varsa ve geçerliyse direkt true döndür
      if (this.accessToken) {
        window.gapi.client.setToken({ access_token: this.accessToken });
        console.log('✅ Using existing access token');
        return true;
      }

      // Yeni token al
      return new Promise((resolve) => {
        const originalCallback = this.tokenClient.callback;
        this.tokenClient.callback = (response: any) => {
          if (response.error) {
            console.error('❌ Sign in failed:', response.error);
            resolve(false);
          } else {
            this.accessToken = response.access_token;
            window.gapi.client.setToken({ access_token: this.accessToken });
            console.log('🟢 Google Drive sign in successful');
            resolve(true);
          }
          // Restore original callback
          this.tokenClient.callback = originalCallback;
        };
        
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (error) {
      console.error('❌ Google Drive sign in failed:', error);
      return false;
    }
  }

  async uploadMoodData(): Promise<{ success: boolean; fileId?: string; error?: string }> {
    try {
      console.log('🔄 Starting Google Drive upload process...');
      
      const isSignedIn = await this.signIn();
      if (!isSignedIn) {
        return { success: false, error: 'Google Drive authentication failed' };
      }

      console.log('✅ Google Drive authentication successful');

      // localStorage'dan tüm mood entries'i al
      const moodEntries = getAllMoodEntries();
      console.log('📊 Mood entries to upload:', moodEntries.length, 'entries');
      
      const backupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        appName: 'Ruh Halim',
        data: moodEntries
      };

      const fileName = `mood_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileContent = JSON.stringify(backupData, null, 2);
      console.log('📄 Backup file prepared:', fileName, 'size:', fileContent.length, 'bytes');

      // Önce mevcut yedek dosyası var mı kontrol et
      const existingFile = await this.findBackupFile();
      console.log('🔍 Existing backup file:', existingFile ? 'Found' : 'Not found');
      
      let response;
      if (existingFile) {
        console.log('🔄 Updating existing file...');
        // Mevcut dosyayı güncelle
        response = await window.gapi.client.request({
          path: `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}`,
          method: 'PATCH',
          params: {
            uploadType: 'media'
          },
          body: fileContent
        });
      } else {
        console.log('📁 Creating new file...');
        // Yeni dosya oluştur - FormData kullan
        const metadata = {
          name: fileName,
          parents: ['appDataFolder'],
          description: 'Ruh Halim uygulaması günlük yedekleri'
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        formData.append('file', new Blob([fileContent], {type: 'application/json'}));

        response = await window.gapi.client.request({
          path: 'https://www.googleapis.com/upload/drive/v3/files',
          method: 'POST',
          params: {
            uploadType: 'multipart'
          },
          body: formData
        });
      }

      console.log('📤 Upload response status:', response.status);
      console.log('📤 Upload response:', response);

      if (response.status === 200) {
        console.log('🟢 Mood data uploaded to Google Drive successfully');
        return { success: true, fileId: response.result.id };
      } else {
        console.error('❌ Upload failed with status:', response.status);
        return { success: false, error: `Upload failed with status: ${response.status}` };
      }
    } catch (error) {
      console.error('❌ Google Drive upload failed:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return { success: false, error: error.message || 'Unknown error occurred' };
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

      const response = await window.gapi.client.drive.files.get({
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
      const response = await window.gapi.client.drive.files.list({
        q: "name contains 'mood_backup' and 'appDataFolder' in parents",
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