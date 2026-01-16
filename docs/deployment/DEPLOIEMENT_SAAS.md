# ☁️ Guide de Déploiement SaaS

## 🏗️ Architecture Cloud

### Serveur OVH (VPS)

```
┌─────────────────────────────────────────────────────────┐
│              SERVEUR OVH (VPS)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Node.js API │  │  PostgreSQL  │  │    Redis     │ │
│  │  Express     │  │  Database    │  │    Cache     │ │
│  │  Port 443    │  │  Port 5432    │  │  Port 6379   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  • Nginx (Reverse Proxy)                                │
│  • SSL/TLS (Let's Encrypt)                              │
│  • PM2 (Process Manager)                                │
│  • Backup automatique                                   │
└─────────────────────────────────────────────────────────┘
```

## 📦 Déploiement Backend

### 1. Configuration Serveur

```bash
# Sur le serveur OVH
sudo apt update
sudo apt install nodejs npm postgresql nginx certbot
```

### 2. Configuration Nginx

```nginx
server {
    listen 80;
    server_name api.fouta-erp.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. SSL avec Let's Encrypt

```bash
sudo certbot --nginx -d api.fouta-erp.com
```

### 4. PM2 pour gestion processus

```bash
npm install -g pm2
pm2 start backend/src/server.js --name fouta-api
pm2 save
pm2 startup
```

## 📱 Déploiement Applications Android

### Structure

```
mobile/android/
├── app-tisseur/
│   ├── build.gradle
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/foutaerp/tisseur/
│   │   └── res/
│   └── README.md
├── app-coupeur/
├── app-mecanicien/
├── app-magasinier-mp/
├── app-magasinier-pf/
├── app-magasinier-st/
└── app-controleur/
```

### Configuration API

Dans chaque app Android, configurer l'URL de l'API :

```kotlin
// ApiConfig.kt
const val BASE_URL = "https://api.fouta-erp.com/api/v1/"
```

### Build APK

```bash
cd mobile/android/app-tisseur
./gradlew assembleRelease
```

### Distribution

1. **Play Store** : Publier sur Google Play
2. **Distribution interne** : APK signé via MDM
3. **OTA** : Mise à jour over-the-air

## 🔐 Sécurité SaaS

### Backend
- ✅ HTTPS obligatoire
- ✅ Rate limiting
- ✅ CORS configuré
- ✅ Helmet.js (headers sécurité)
- ✅ Validation des données
- ✅ Logs et monitoring

### Mobile
- ✅ Certificats SSL pinning
- ✅ Chiffrement données locales
- ✅ Authentification JWT
- ✅ Refresh tokens
- ✅ Validation signatures APK

## 📊 Monitoring

- **Uptime** : Monitoring serveur
- **Logs** : Winston + rotation
- **Métriques** : PM2 monitoring
- **Alertes** : Email/SMS en cas de problème

## 🔄 Mise à jour

### Backend
```bash
git pull
npm install
pm2 restart fouta-api
```

### Mobile
- Versioning dans `build.gradle`
- Mise à jour via Play Store
- Ou distribution OTA

## 💰 Coûts estimés

- **Serveur OVH** : ~20-50€/mois
- **Domaine** : ~10€/an
- **SSL** : Gratuit (Let's Encrypt)
- **Play Store** : 25€ (une fois)

## 📝 Checklist déploiement

- [ ] Serveur OVH configuré
- [ ] PostgreSQL installé
- [ ] Nginx configuré
- [ ] SSL activé
- [ ] PM2 configuré
- [ ] Backup automatique
- [ ] Monitoring activé
- [ ] Applications Android compilées
- [ ] Distribution configurée

