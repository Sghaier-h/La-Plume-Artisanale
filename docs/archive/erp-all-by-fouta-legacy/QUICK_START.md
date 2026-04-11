# ⚡ Démarrage Rapide - La Plume Artisanale

## 🎯 Votre repository GitHub

**URL** : `https://github.com/Sghaier-h/La-Plume-Artisanle.git`

## 📤 Pousser le code (3 étapes)

### Méthode 1 : GitHub Desktop (Le plus simple)

1. **Installer** : https://desktop.github.com/
2. **Cloner** : File > Clone Repository > URL > `https://github.com/Sghaier-h/La-Plume-Artisanle.git`
3. **Pousser** : Commit + Push

### Méthode 2 : Git en ligne de commande

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Sghaier-h/La-Plume-Artisanle.git
git branch -M main
git push -u origin main
```

## 🚀 Déployer sur OVH

```bash
ssh root@votre-serveur-ovh.com
apt update && apt install -y git
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanle/main/scripts/install-ovh.sh)
```

Quand le script demande l'URL GitHub, entrez :
```
https://github.com/Sghaier-h/La-Plume-Artisanle.git
```

## 📚 Documentation complète

- **`SETUP_GITHUB.md`** - Guide complet GitHub
- **`GUIDE_GITHUB.md`** - Workflow GitHub
- **`DEPLOIEMENT_OVH.md`** - Guide déploiement OVH

