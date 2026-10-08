# Commandes pour résoudre le conflit Git et vérifier les données

## Sur le serveur, exécutez ces commandes :

```bash
cd /opt/fouta-erp

# Forcer la mise à jour depuis GitHub (écrase les modifications locales)
git fetch origin
git reset --hard origin/main

# Maintenant exécuter le script de vérification
bash scripts/verifier-donnees-pointage.sh
```

Si vous voulez sauvegarder les modifications locales avant :

```bash
cd /opt/fouta-erp

# Sauvegarder les modifications locales
cp scripts/verifier-donnees-pointage.sh scripts/verifier-donnees-pointage.sh.local 2>/dev/null || true

# Forcer la mise à jour
git fetch origin
git reset --hard origin/main

# Exécuter le script
bash scripts/verifier-donnees-pointage.sh
```
