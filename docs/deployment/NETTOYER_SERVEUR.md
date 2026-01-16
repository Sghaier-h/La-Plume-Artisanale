# 🧹 Nettoyer et Organiser le Serveur

## 🎯 Objectif

Nettoyer et organiser le serveur pour qu'il corresponde à la structure du dépôt Git, supprimer les doublons et fichiers inutiles qui peuvent bloquer.

## 📋 Étapes

### 1. Se connecter au serveur

```bash
ssh ubuntu@137.74.40.191
```

### 2. Mettre à jour depuis GitHub

```bash
cd /opt/fouta-erp
bash scripts/update-server.sh
```

### 3. Exécuter le script de nettoyage

```bash
cd /opt/fouta-erp
chmod +x scripts/nettoyer-serveur.sh
bash scripts/nettoyer-serveur.sh
```

**⚠️ Important** : Le script crée automatiquement une sauvegarde avant de nettoyer.

### 4. Exécuter le script d'organisation

```bash
cd /opt/fouta-erp
chmod +x scripts/organiser-serveur.sh
bash scripts/organiser-serveur.sh
```

## 🔍 Ce que fait le script

### Nettoyage
- ✅ Supprime les fichiers temporaires (.log, .tmp, .bak, .swp)
- ✅ Supprime les node_modules en doublon
- ✅ Supprime les fichiers .md en doublon à la racine
- ✅ Supprime les fichiers de référence (.txt, .docx, .csv, .html) à la racine
- ✅ Supprime les fichiers SQL en doublon
- ✅ Nettoie les fichiers .env en doublon

### Organisation
- ✅ Crée la structure `docs/` complète
- ✅ Déplace les fichiers .md vers `docs/guides/`
- ✅ Déplace les fichiers de référence vers `docs/references/`
- ✅ Déplace les scripts vers `scripts/`
- ✅ Vérifie et corrige les permissions

## 📦 Sauvegarde

Le script crée automatiquement une sauvegarde dans :
```
/opt/fouta-erp-backup-YYYYMMDD-HHMMSS/
```

Pour restaurer si nécessaire :
```bash
cp -r /opt/fouta-erp-backup-*/opt/fouta-erp/* /opt/fouta-erp/
```

## ✅ Vérification

Après le nettoyage, vérifier :

```bash
# Structure
ls -la /opt/fouta-erp/
ls -la /opt/fouta-erp/docs/

# Fichiers à la racine (doit être minimal)
ls -1 /opt/fouta-erp/*.md

# Fichiers SQL (doit être 28 fichiers)
ls -1 /opt/fouta-erp/database/*.sql | wc -l
```

## 🚨 En cas de problème

Si quelque chose ne fonctionne plus après le nettoyage :

```bash
# Restaurer la sauvegarde
cp -r /opt/fouta-erp-backup-*/opt/fouta-erp/* /opt/fouta-erp/

# Ou récupérer depuis GitHub
cd /opt/fouta-erp
git fetch origin
git reset --hard origin/main
bash scripts/update-server.sh
```
