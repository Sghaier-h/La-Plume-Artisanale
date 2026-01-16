# 🔧 Corriger les Permissions sur le VPS

## ⚠️ Erreur Rencontrée

```
Erreur: mkdir /opt/fouta-erp/backend/src/models: received failure with description 'Failure'
Erreur: mkdir /opt/fouta-erp/backend/src/services: received failure with description 'Failure'
```

**Problème** : Permissions insuffisantes pour créer certains dossiers.

---

## ✅ Solution : Corriger les Permissions

### Sur le VPS (dans votre connexion SSH)

```bash
# Donner les permissions complètes à l'utilisateur ubuntu
sudo chown -R ubuntu:ubuntu /opt/fouta-erp

# Donner les permissions d'écriture
sudo chmod -R 755 /opt/fouta-erp

# Créer les dossiers manquants
sudo mkdir -p /opt/fouta-erp/backend/src/models
sudo mkdir -p /opt/fouta-erp/backend/src/services

# Donner les permissions aux nouveaux dossiers
sudo chown -R ubuntu:ubuntu /opt/fouta-erp
```

---

## 📋 Vérifier les Fichiers Transférés

### Vérifier la Structure

```bash
# Voir la structure complète
ls -la /opt/fouta-erp/backend/
ls -la /opt/fouta-erp/backend/src/
```

### Vérifier les Dossiers Manquants

```bash
# Vérifier si les dossiers models et services existent
ls -la /opt/fouta-erp/backend/src/models 2>/dev/null || echo "Dossier models manquant"
ls -la /opt/fouta-erp/backend/src/services 2>/dev/null || echo "Dossier services manquant"
```

---

## 🔄 Continuer le Transfert avec FileZilla

### Après Avoir Corrigé les Permissions

1. **Dans FileZilla**, vérifiez quels fichiers n'ont pas été transférés
2. **Recopiez** les fichiers manquants (notamment ceux dans `models` et `services`)
3. **Vérifiez** que tous les fichiers sont bien présents

### Ou Créer les Dossiers Manquants via FileZilla

1. **Clic droit** dans `/opt/fouta-erp/backend/src/`
2. **Créer un répertoire** : `models`
3. **Créer un répertoire** : `services`
4. **Recopier** les fichiers manquants

---

## 📁 Structure Attendue

```
/opt/fouta-erp/backend/
├── .gitignore
├── package.json
├── src/
│   ├── server.js
│   ├── config/
│   │   └── cloud.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── mobile.controller.js
│   │   ├── planning.controller.js
│   │   ├── production.controller.js
│   │   └── stock.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── mobile.middleware.js
│   ├── models/          ← À créer
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── mobile.routes.js
│   │   ├── planning.routes.js
│   │   ├── production.routes.js
│   │   ├── quality.routes.js
│   │   └── stock.routes.js
│   ├── services/        ← À créer
│   └── utils/
│       ├── db.js
│       └── device.js
```

---

## ✅ Checklist

- [ ] Permissions corrigées : `sudo chown -R ubuntu:ubuntu /opt/fouta-erp`
- [ ] Dossiers `models` et `services` créés
- [ ] Tous les fichiers transférés
- [ ] Structure vérifiée : `ls -la /opt/fouta-erp/backend/src/`

---

## 🚀 Prochaines Étapes

Une fois tous les fichiers transférés :

1. **Créer le fichier `.env`** sur le VPS
2. **Installer les dépendances** : `npm install`
3. **Configurer PM2** pour démarrer l'application
4. **Configurer Nginx** comme reverse proxy
5. **Configurer SSL** avec Certbot

**Corrigez d'abord les permissions, puis continuez le transfert !**

