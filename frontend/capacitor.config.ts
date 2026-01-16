import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.laplumeartisanale.erp',
  appName: 'ERP La Plume Artisanale',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    url: process.env.REACT_APP_API_URL || 'https://fabrication.laplume-artisanale.tn',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'Pour scanner les QR codes',
        photos: 'Pour prendre des photos'
      }
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Haptics: {},
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#3b82f6',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
