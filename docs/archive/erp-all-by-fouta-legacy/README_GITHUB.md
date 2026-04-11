# 🚀 Déploiement OVH avec GitHub

## ⚡ Installation en 3 commandes

```bash
# 1. Se connecter au serveur
ssh root@votre-serveur-ovh.com

# 2. Installer Git
apt update && apt install -y git

# 3. Exécuter l'installation
bash <(curl -s https://raw.githubusercontent.com/votre-username/fouta-erp/main/scripts/install-ovh.sh)
```

Le script va vous demander :
- 📦 URL du repository GitHub
- 🔐 Mot de passe PostgreSQL
- 🔑 JWT Secret
- 🌐 Domaines (API et Frontend)

## 📚 Documentation complète

- **`GUIDE_GITHUB.md`** - Guide complet GitHub (création repo, push, workflow)
- **`DEPLOIEMENT_OVH.md`** - Guide déploiement détaillé
- **`GUIDE_DEPLOIEMENT_OVH.md`** - Guide rapide

## 🔄 Mise à jour

```bash
cd /var/www/fouta-erp
bash scripts/deploy.sh
```

## ✅ Avantages GitHub

- ✅ Pas besoin de transférer les fichiers manuellement
- ✅ Versioning automatique
- ✅ Historique complet
- ✅ Déploiement automatique possible (GitHub Actions)
- ✅ Collaboration facilitée

