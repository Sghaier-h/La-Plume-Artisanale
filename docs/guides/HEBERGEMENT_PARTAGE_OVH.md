# 🏠 Déploiement sur Hébergement Partagé OVH

## ⚠️ Limitation : Pas de sudo

Sur un hébergement partagé OVH, vous n'avez **pas accès à sudo**. Certaines installations nécessitent l'accès root.

---

## 🚀 Solution : Script Adapté

J'ai créé un script spécialement pour les hébergements partagés :

```bash
# Télécharger le script adapté
curl -o deploy-ovh.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-ovh-shared.sh

# Exécuter
chmod +x deploy-ovh.sh
bash deploy-ovh.sh
```

---

## 📋 Ce que le Script Fait (Sans sudo)

- ✅ Vérifie Node.js (doit être installé via panneau OVH)
- ✅ Vérifie Git
- ✅ Clone le projet
- ✅ Configure .env
- ✅ Installe les dépendances npm
- ✅ Installe PM2 localement

---

## ⚠️ Ce qui Nécessite l'Accès Root

Ces éléments nécessitent l'accès root (contactez le support OVH) :

1. **PostgreSQL** - Installation et configuration
2. **Redis** - Installation (optionnel)
3. **Nginx** - Configuration (géré par OVH)
4. **SSL** - Géré par OVH
5. **Firewall** - Géré par OVH

---

## 🔧 Solutions Alternatives

### Option 1 : Utiliser une Base de Données Externe

Au lieu de PostgreSQL local, utilisez :
- **OVH Cloud Databases** (PostgreSQL)
- **Clever Cloud** (PostgreSQL)
- **ElephantSQL** (PostgreSQL gratuit)

Puis modifiez le `.env` avec les informations de la base externe.

### Option 2 : Passer à un VPS OVH

Un VPS vous donne l'accès root et permet d'installer tout ce dont vous avez besoin.

### Option 3 : Utiliser les Services OVH

- **Node.js** : Installé via panneau OVH
- **Base de données** : OVH Cloud Databases
- **SSL** : Géré par OVH
- **Domaine** : Configuré dans OVH

---

## 📋 Checklist pour Hébergement Partagé

- [ ] Node.js installé via panneau OVH
- [ ] Git activé dans panneau OVH
- [ ] Base de données PostgreSQL (OVH Cloud Databases ou externe)
- [ ] Script de déploiement exécuté
- [ ] Application démarrée avec PM2

---

## 🚀 Commandes Après Installation

### Démarrer l'application

```bash
cd ~/fouta-erp/backend
pm2 start src/server.js --name fouta-api
pm2 save
```

### Vérifier

```bash
pm2 status
pm2 logs fouta-api
```

---

## 💡 Recommandation

Pour un projet ERP complet, **un VPS OVH est recommandé** car :
- ✅ Accès root complet
- ✅ Installation de tous les services
- ✅ Contrôle total
- ✅ Meilleures performances

L'hébergement partagé est limité pour ce type d'application.

---

## 🆘 Besoin d'Aide ?

Contactez le support OVH pour :
- Installer PostgreSQL
- Passer à un VPS
- Configurer les services nécessaires

