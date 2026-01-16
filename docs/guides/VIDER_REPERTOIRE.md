# 🗑️ Vider le Répertoire Fabrication

## ✅ Commandes à Exécuter

Vous êtes dans le répertoire `~/fabrication`. Exécutez :

```bash
# Supprimer le fichier .htaccess
rm -f .htaccess

# OU supprimer tous les fichiers (y compris les fichiers cachés)
rm -rf *

# Vérifier que c'est vide
ls -la
```

Vous devriez voir seulement :
```
.
..
```

---

## 🔄 Alternative : Sortir puis Supprimer

Si vous voulez supprimer tout le répertoire :

```bash
# Sortir du répertoire
cd ~

# Supprimer le répertoire
rm -rf fabrication

# Le recréer vide
mkdir fabrication

# Vérifier
ls -la fabrication
```

---

## ✅ Après avoir vidé

Une fois le répertoire vide :

1. Retournez dans le panneau OVH
2. Réessayez de configurer Git
3. Ça devrait fonctionner maintenant !

---

## 🚀 OU Utilisez la Méthode Directe

Si Git OVH continue de poser problème, utilisez directement :

```bash
# Sortir de fabrication
cd ~

# Créer un nouveau dossier
mkdir -p fouta-erp
cd fouta-erp

# Télécharger le script
curl -o deploy.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-simple.sh

# Exécuter
chmod +x deploy.sh
bash deploy.sh
```

Cette méthode est plus simple et fonctionne sans Git OVH !

