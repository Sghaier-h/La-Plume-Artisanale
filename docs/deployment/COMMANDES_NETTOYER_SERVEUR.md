# 🧹 Commandes pour Nettoyer et Organiser le Serveur

## 📋 Commandes à Exécuter sur le Serveur

### 1. Se connecter au serveur

```bash
ssh ubuntu@137.74.40.191
```

### 2. Mettre à jour depuis GitHub

```bash
cd /opt/fouta-erp
bash scripts/update-server.sh
```

### 3. Nettoyer et organiser

```bash
cd /opt/fouta-erp

# Rendre les scripts exécutables
chmod +x scripts/nettoyer-serveur.sh
chmod +x scripts/organiser-serveur.sh

# Exécuter le nettoyage (crée une sauvegarde automatique)
bash scripts/nettoyer-serveur.sh

# Exécuter l'organisation
bash scripts/organiser-serveur.sh
```

## ✅ Vérification

```bash
# Vérifier la structure
ls -la /opt/fouta-erp/
ls -la /opt/fouta-erp/docs/

# Compter les fichiers SQL (doit être 28)
ls -1 /opt/fouta-erp/database/*.sql | wc -l

# Vérifier les fichiers à la racine (doit être minimal)
ls -1 /opt/fouta-erp/*.md
```

## 🔄 Redémarrer l'application

```bash
cd /opt/fouta-erp/backend
pm2 restart fouta-api
```

## 📦 Sauvegarde

La sauvegarde est créée automatiquement dans :
```
/opt/fouta-erp-backup-YYYYMMDD-HHMMSS/
```

Pour restaurer si nécessaire :
```bash
cp -r /opt/fouta-erp-backup-*/opt/fouta-erp/* /opt/fouta-erp/
```
