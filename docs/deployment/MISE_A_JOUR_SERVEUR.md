# 🔄 Mise à Jour du Serveur après Git Push

## ⚠️ Important

**Le serveur ne se met PAS à jour automatiquement.** Après un `git push`, vous devez mettre à jour le serveur manuellement ou configurer un déploiement automatique.

---

## 🚀 Option 1 : Mise à Jour Manuelle (Rapide)

### Se connecter au serveur

```bash
ssh ubuntu@137.74.40.191
# ou
ssh allbyfb@145.239.37.162
```

### Exécuter le script de déploiement

```bash
# Si le projet est dans /opt/fouta-erp
cd /opt/fouta-erp
bash scripts/deploy.sh

# OU si le projet est dans /var/www/fouta-erp
cd /var/www/fouta-erp
bash scripts/deploy.sh
```

**Ce que fait le script :**
1. ✅ `git pull` (récupère les dernières modifications)
2. ✅ `npm install --production` (installe les nouvelles dépendances)
3. ✅ `pm2 restart fouta-api` (redémarre l'application)

---

## 🤖 Option 2 : Déploiement Automatique avec Webhook GitHub

### Configuration du Webhook GitHub

1. **Aller sur GitHub** : `https://github.com/Sghaier-h/La-Plume-Artisanale/settings/hooks`
2. **Ajouter un webhook** :
   - **Payload URL** : `https://fabrication.laplume-artisanale.tn/api/webhooks/github/deploy`
   - **Content type** : `application/json`
   - **Events** : Sélectionner "Just the push event"
   - **Active** : ✅ Cocher

### Créer l'endpoint webhook sur le serveur

Créer un endpoint qui reçoit les webhooks GitHub et exécute le script de déploiement.

**⚠️ Sécurité** : Ajouter une vérification de signature GitHub pour sécuriser l'endpoint.

---

## 🔄 Option 3 : GitHub Actions avec SSH (Recommandé)

Activer le déploiement automatique via GitHub Actions en configurant les secrets SSH.

### Configuration des Secrets GitHub

1. **Aller sur GitHub** : `https://github.com/Sghaier-h/La-Plume-Artisanale/settings/secrets/actions`
2. **Ajouter les secrets** :
   - `SSH_HOST` : `137.74.40.191` (ou l'IP du serveur)
   - `SSH_USER` : `ubuntu` (ou `allbyfb`)
   - `SSH_KEY` : Votre clé SSH privée

### Activer le déploiement dans `.github/workflows/deploy.yml`

Décommenter la section SSH dans le workflow GitHub Actions.

---

## 📋 Script de Déploiement Rapide

Si vous préférez une commande simple, créez un alias :

```bash
# Sur le serveur
echo 'alias deploy="cd /opt/fouta-erp && git pull && cd backend && npm install --production && pm2 restart fouta-api"' >> ~/.bashrc
source ~/.bashrc

# Puis utilisez simplement :
deploy
```

---

## ✅ Vérification après Mise à Jour

```bash
# Vérifier que l'application fonctionne
pm2 status
pm2 logs fouta-api --lines 50

# Tester l'API
curl https://fabrication.laplume-artisanale.tn/health
```

---

## 🎯 Recommandation

Pour l'instant, utilisez **l'Option 1** (mise à jour manuelle) car c'est la plus simple et la plus sûre.

Pour l'automatisation future, configurez **l'Option 3** (GitHub Actions avec SSH) une fois que vous avez configuré les secrets GitHub.
