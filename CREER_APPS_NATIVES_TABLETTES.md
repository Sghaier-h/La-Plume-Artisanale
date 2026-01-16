# 📱 CRÉATION APPLICATIONS NATIVES TABLETTES

## 🎯 Objectif

Créer des applications natives Android et iOS pour chaque poste de travail à partir des pages React existantes.

## ✅ Pages React Existant

Nous avons déjà créé :
- ✅ `TabletteTisseur.tsx` - Vue Tisseur
- ✅ `TabletteMagasinier.tsx` - Vue Magasinier MP
- ✅ `TabletteCoupeur.tsx` - Vue Coupeur
- ✅ `TabletteQualite.tsx` - Vue Contrôle Qualité

## 🔧 Solution : Capacitor

**Capacitor** permet de convertir les pages React en applications natives Android/iOS.

### Avantages :
- ✅ Réutilise le code React existant
- ✅ Support Android ET iOS
- ✅ Accès natif : caméra, notifications push, Bluetooth
- ✅ Facile à déployer

## 📋 ÉTAPES DE CRÉATION

### 1. Installer Capacitor

```bash
cd La-Plume-Artisanale/frontend
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npm install @capacitor/camera @capacitor/push-notifications @capacitor/bluetooth-le
```

### 2. Initialiser Capacitor

```bash
npx cap init
# Nom: ERP La Plume Artisanale
# ID: com.laplumeartisanale.erp
# Web dir: build
```

### 3. Configurer pour chaque poste

Créer 4 applications séparées :
- `app-tisseur` - Application Tisseur
- `app-magasinier` - Application Magasinier
- `app-coupeur` - Application Coupeur
- `app-qualite` - Application Qualité

### 4. Configuration Capacitor

Fichier `capacitor.config.ts` :

```typescript
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
    BluetoothLe: {
      permissions: {
        scan: 'Pour imprimer les étiquettes Bluetooth'
      }
    }
  }
};

export default config;
```

### 5. Créer routes pour tablettes

Modifier `App.tsx` pour détecter le poste :

```typescript
// Détection automatique du poste via paramètre URL ou storage
const getPosteFromStorage = () => {
  return localStorage.getItem('poste_travail') || 'tisseur';
};

// Routes tablettes
<Route path="/tablette/:poste" element={<TabletteView />} />
```

### 6. Permissions Android

Fichier `android/app/src/main/AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### 7. Build Applications

#### Build Android

```bash
npm run build
npx cap sync android
npx cap open android
# Dans Android Studio: Build > Generate Signed Bundle / APK
```

#### Build iOS

```bash
npm run build
npx cap sync ios
npx cap open ios
# Dans Xcode: Product > Archive
```

## 📱 APPLICATIONS PAR POSTE

### App Tisseur
- URL: `/tablette/tisseur`
- Permissions: Camera, Bluetooth, Notifications
- Fonctionnalités:
  - Vue tâches en cours
  - Saisie production
  - Scan QR codes
  - Notifications temps réel

### App Magasinier MP
- URL: `/tablette/magasinier`
- Permissions: Camera, Notifications
- Fonctionnalités:
  - Liste préparations
  - Scan QR matières premières
  - Validation préparation
  - Notifications nouvelles tâches

### App Coupeur
- URL: `/tablette/coupeur`
- Permissions: Camera, Notifications
- Fonctionnalités:
  - OF prêts à couper
  - Scan QR OF
  - Saisie quantités
  - Statistiques

### App Qualité
- URL: `/tablette/qualite`
- Permissions: Camera, Notifications
- Fonctionnalités:
  - Liste contrôles
  - Formulaire contrôle
  - Photos non-conformités
  - Validation

## 🔧 FONCTIONNALITÉS NATIVES

### 1. Scan QR Code

```typescript
import { Camera } from '@capacitor/camera';

const scanQRCode = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: 'base64',
    source: 'camera'
  });
  
  // Décoder QR code
  // ...
};
```

### 2. Notifications Push

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

PushNotifications.register();
PushNotifications.addListener('registration', (token) => {
  // Envoyer token au backend
});

PushNotifications.addListener('pushNotificationReceived', (notification) => {
  // Afficher notification
});
```

### 3. Bluetooth Impression

```typescript
import { BluetoothLe } from '@capacitor/bluetooth-le';

const imprimerEtiquette = async (data: string) => {
  await BluetoothLe.connect({ address: 'printer-address' });
  await BluetoothLe.write({ service: '...', characteristic: '...', value: data });
};
```

### 4. Vibration

```typescript
import { Haptics } from '@capacitor/haptics';

const vibrate = async () => {
  await Haptics.vibrate({ duration: 200 });
};
```

## 📦 DÉPLOIEMENT

### Android (APK)

1. Générer APK signé
2. Distribuer via :
   - Google Play Store
   - MDM (Mobile Device Management)
   - OTA (Over-The-Air)
   - Installation directe (APK)

### iOS (IPA)

1. Générer IPA via Xcode
2. Distribuer via :
   - App Store
   - TestFlight
   - Enterprise Distribution

## 🎯 PROCHAINES ÉTAPES

1. ✅ Installer Capacitor
2. ✅ Configurer Capacitor
3. ✅ Ajouter plugins (Camera, Push, Bluetooth)
4. ✅ Configurer permissions
5. ✅ Créer builds Android/iOS
6. ✅ Tester sur tablettes réelles
7. ✅ Déployer

## 📝 NOTES

- Les pages React existantes sont prêtes
- Capacitor convertit automatiquement en apps natives
- Support Android et iOS simultanément
- Accès complet aux fonctionnalités natives
