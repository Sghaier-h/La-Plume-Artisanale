# 📱 Applications Android - ERP ALL BY FOUTA

## 🏗️ Architecture Mobile

```
mobile/android/
├── app-tisseur/          # Application Tisseur
├── app-coupeur/          # Application Coupeur
├── app-mecanicien/       # Application Mécanicien
├── app-magasinier-mp/    # Application Magasinier MP
├── app-magasinier-pf/    # Application Magasinier PF
├── app-magasinier-st/    # Application Magasinier Sous-Traitant
├── app-controleur/       # Application Contrôleur Qualité
└── shared/               # Code partagé (API, modèles, utils)
```

## 🚀 Technologies

- **Langage** : Kotlin
- **Framework** : Android Native
- **API** : Retrofit 2
- **Socket.IO** : Client Android
- **QR Code** : ZXing
- **Bluetooth** : Impression étiquettes
- **Base de données locale** : Room (pour mode hors ligne)

## 📦 Fonctionnalités par App

### App Tisseur
- ✅ Connexion sécurisée
- ✅ Dashboard personnel
- ✅ Liste OF assignés
- ✅ Scan QR Code OF
- ✅ Déclaration production
- ✅ Impression étiquettes Bluetooth
- ✅ Demandes intervention
- ✅ Notifications push

### App Coupeur
- ✅ Scan étiquettes tisseur
- ✅ Saisie quantités (1er/2ème choix/déchet)
- ✅ Génération étiquettes suivis
- ✅ Photos défauts
- ✅ Demandes achats

### App Mécanicien
- ✅ Alertes machines
- ✅ Interventions
- ✅ Contrôle première pièce
- ✅ Gestion ensouples
- ✅ Historique maintenance

### App Magasinier MP
- ✅ Préparation MP
- ✅ Alimentation machines
- ✅ Transferts entrepôts
- ✅ Scan QR codes
- ✅ Retours MP

### App Magasinier PF
- ✅ Mouvements PF
- ✅ Colisage
- ✅ Palettisation
- ✅ Scan étiquettes

### App Magasinier ST
- ✅ Sorties/Retours lots
- ✅ Suivi sous-traitants
- ✅ Scan QR codes

### App Contrôleur
- ✅ Validation lots
- ✅ Saisie défauts
- ✅ Photos
- ✅ Approbations

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Refresh tokens
- ✅ Chiffrement données locales
- ✅ Certificats SSL pinning
- ✅ Validation signatures APK

## 📡 API Cloud

Toutes les apps se connectent à :
```
https://api.fouta-erp.com/api/v1/mobile/
```

Endpoints :
- `POST /mobile/auth/login` - Connexion
- `POST /mobile/auth/refresh` - Refresh token
- `GET /mobile/dashboard/:role` - Dashboard par rôle
- `POST /mobile/sync` - Synchronisation
- `POST /mobile/upload/photo` - Upload photos
- `POST /mobile/scan/qr` - Traitement QR code

## 🔄 Mode Hors Ligne

- ✅ Stockage local (Room Database)
- ✅ Synchronisation automatique
- ✅ Queue d'actions
- ✅ Détection connexion
- ✅ Sync au retour en ligne

## 📱 Installation

```bash
# Pour chaque app
cd mobile/android/app-tisseur
./gradlew build
./gradlew installDebug
```

## 🎯 Déploiement

- **Play Store** : Applications publiques
- **Distribution interne** : APK signé
- **MDM** : Gestion centralisée

