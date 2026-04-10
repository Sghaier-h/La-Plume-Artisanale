# La Plume Artisanale - Application Mobile

Application mobile et tablette pour Android et iOS permettant aux opérateurs de se connecter et travailler.

## Fonctionnalités

- ✅ Authentification sécurisée
- ✅ Dashboard opérateur avec statistiques
- ✅ Gestion des tâches
- ✅ Suivi des Ordres de Fabrication (OF)
- ✅ Scanner QR Code
- ✅ Notifications push
- ✅ Mode hors ligne (à venir)
- ✅ Interface adaptée mobile/tablette

## Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI
- Expo Go app (pour tester)
- Compte EAS (pour build)

## Installation

```bash
cd mobile
npm install
```

## Configuration

1. Mettre à jour `src/services/api.ts` avec l'URL de votre API backend
2. Configurer les identifiants dans `app.json` pour iOS et Android
3. Configurer EAS Build (optionnel) : `eas build:configure`

## Développement

```bash
# Démarrer le serveur de développement
npm start

# Démarrer sur Android
npm run android

# Démarrer sur iOS
npm run ios
```

## Build de production

### Android

```bash
# Build APK/AAB
eas build --platform android

# Soumettre sur Google Play
eas submit --platform android
```

### iOS

```bash
# Build IPA
eas build --platform ios

# Soumettre sur App Store
eas submit --platform ios
```

## Structure du projet

```
mobile/
├── src/
│   ├── screens/          # Écrans de l'app
│   ├── components/       # Composants réutilisables
│   ├── services/         # Services API
│   ├── store/           # State management
│   └── theme.ts         # Thème de l'app
├── assets/              # Images, icônes
├── App.tsx              # Point d'entrée
└── app.json             # Configuration Expo
```

## Sécurité

- Tokens stockés dans SecureStore (iOS Keychain / Android Keystore)
- HTTPS obligatoire en production
- Authentification JWT
- Gestion de session sécurisée

## Support

Pour toute question ou problème, contactez l'équipe de développement.
