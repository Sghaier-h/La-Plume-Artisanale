# Guide : Nettoyer et organiser le serveur

## Méthode rapide

```bash
# Se connecter au serveur
ssh ubuntu@137.74.40.191

# Mettre à jour depuis GitHub
cd /opt/fouta-erp
git pull origin main

# Exécuter le script de nettoyage et organisation
bash scripts/nettoyer-et-organiser-serveur.sh
```

## Méthode manuelle (étape par étape)

### 1. Mettre à jour depuis GitHub
```bash
cd /opt/fouta-erp
git pull origin main
```

### 2. Rendre les scripts exécutables
```bash
chmod +x scripts/nettoyer-serveur.sh
chmod +x scripts/organiser-serveur.sh
chmod +x scripts/nettoyer-et-organiser-serveur.sh
```

### 3. Exécuter le nettoyage
```bash
bash scripts/nettoyer-serveur.sh
```

### 4. Exécuter l'organisation
```bash
bash scripts/organiser-serveur.sh
```

### 5. Redémarrer l'application
```bash
cd backend
pm2 restart fouta-api
```

## Vérification

```bash
# Vérifier la structure
ls -la docs/
ls -1 database/*.sql | wc -l
ls -1 scripts/*.sh | wc -l

# Vérifier que l'application fonctionne
pm2 status
pm2 logs fouta-api --lines 20
```
