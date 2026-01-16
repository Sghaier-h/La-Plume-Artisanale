// Utilitaires Capacitor pour applications natives
// Ces imports sont optionnels et ne fonctionnent que si Capacitor est installé

let Capacitor: any;
let Camera: any;
let PushNotifications: any;
let Haptics: any;

try {
  Capacitor = require('@capacitor/core').Capacitor;
  Camera = require('@capacitor/camera');
  PushNotifications = require('@capacitor/push-notifications');
  Haptics = require('@capacitor/haptics');
} catch (e) {
  // Capacitor non installé, utiliser fallbacks
  console.log('Capacitor non disponible, utilisation du mode web');
}

// Vérifier si on est sur une plateforme native
export const isNative = (): boolean => {
  if (!Capacitor) return false;
  return Capacitor.isNativePlatform();
};

// Vérifier si on est sur Android
export const isAndroid = (): boolean => {
  if (!Capacitor) return false;
  return Capacitor.getPlatform() === 'android';
};

// Vérifier si on est sur iOS
export const isIOS = (): boolean => {
  if (!Capacitor) return false;
  return Capacitor.getPlatform() === 'ios';
};

// Scanner QR Code avec caméra native
export const scanQRCode = async (): Promise<string> => {
  if (!Camera) {
    // Mode web, utiliser HTML5 QR code
    throw new Error('Utiliser html5-qrcode en mode web');
  }
  
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: Camera.CameraResultType.Base64,
      source: Camera.CameraSource.Camera
    });
    
    // TODO: Décoder QR code avec bibliothèque appropriée
    // Pour l'instant, retourner l'image base64
    return image.base64String || '';
  } catch (error) {
    console.error('Erreur scan QR:', error);
    throw error;
  }
};

// Vibration
export const vibrate = async (style: any = 'Medium'): Promise<void> => {
  if (!Haptics || !isNative()) {
    // Mode web, utiliser navigator.vibrate si disponible
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    return;
  }
  
  try {
    await Haptics.impact({ style });
  } catch (error) {
    console.error('Erreur vibration:', error);
  }
};

// Vibration légère (feedback)
export const vibrateLight = async (): Promise<void> => {
  await vibrate('Light');
};

// Vibration moyenne (notification)
export const vibrateMedium = async (): Promise<void> => {
  await vibrate('Medium');
};

// Vibration forte (alerte)
export const vibrateHeavy = async (): Promise<void> => {
  await vibrate('Heavy');
};

// Vibration séquence (alerte urgente)
export const vibrateAlert = async (): Promise<void> => {
  if (!isNative()) {
    // Mode web
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    return;
  }
  
  if (!Haptics) return;
  
  try {
    await Haptics.vibrate({ duration: 200 });
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.vibrate({ duration: 200 });
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.vibrate({ duration: 200 });
  } catch (error) {
    console.error('Erreur vibration:', error);
  }
};

// Initialiser notifications push
export const initPushNotifications = async (): Promise<string | null> => {
  if (!isNative() || !PushNotifications) {
    // Mode web, utiliser Notification API du navigateur
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    return null;
  }

  try {
    // Demander permission
    await PushNotifications.requestPermissions();
    
    // Enregistrer
    await PushNotifications.register();
    
    // Écouter enregistrement
    PushNotifications.addListener('registration', (token: any) => {
      console.log('Push registration success, token: ' + token.value);
      return token.value;
    });
    
    // Écouter erreurs
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });
    
    // Écouter notifications reçues
    PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
      console.log('Push received: ' + JSON.stringify(notification));
      
      // Vibration
      vibrateMedium();
    });
    
    // Écouter notifications ouvertes
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
    });
    
    return null;
  } catch (error) {
    console.error('Erreur init push:', error);
    return null;
  }
};
