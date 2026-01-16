# 🔧 Résoudre : "destination directory is not empty"

## ❌ Erreur

```
destination directory fabrication is not empty and not a git repository
The folder /homez.1005/allbyfb/fabrication does not contain exactly one file.
```

## ✅ Solution : Vider le répertoire

### Étape 1 : Se connecter en SSH

```bash
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

### Étape 2 : Vider le répertoire fabrication

```bash
# Aller dans le répertoire
cd ~/fabrication

# Voir ce qu'il contient
ls -la

# Vider TOUT le contenu
rm -rf *

# Vérifier que c'est vide
ls -la
```

**OU** si vous voulez être sûr :

```bash
# Supprimer tout le répertoire
rm -rf ~/fabrication

# Le recréer vide
mkdir ~/fabrication
```

### Étape 3 : Réessayer dans OVH

1. Retournez dans le panneau OVH
2. Réessayez de configurer Git
3. Cette fois, ça devrait fonctionner !

---

## 🔄 Alternative : Utiliser un autre répertoire

Si vous ne voulez pas vider `fabrication`, créez un nouveau répertoire :

### Dans OVH

Au lieu de `fabrication`, utilisez un nouveau nom comme :
- `fouta-erp`
- `la-plume-artisanale`
- `deploy`

Puis configurez Git avec ce nouveau répertoire.

---

## 🚀 Solution Rapide : Ignorer Git OVH

Si Git OVH continue de poser problème, **ignorez-le** et utilisez directement SSH :

```bash
# Se connecter
ssh allbyfb@ssh.cluster130.hosting.ovh.net

# Créer un dossier
mkdir -p ~/fouta-erp
cd ~/fouta-erp

# Télécharger le script directement
curl -o deploy.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-simple.sh

# Rendre exécutable
chmod +x deploy.sh

# Exécuter
bash deploy.sh
```

Cette méthode fonctionne **sans** Git OVH et est plus simple !

---

## 📋 Checklist

- [ ] Se connecter en SSH
- [ ] Vider le répertoire `fabrication` : `rm -rf ~/fabrication/*`
- [ ] Vérifier qu'il est vide : `ls -la ~/fabrication`
- [ ] Réessayer la configuration Git dans OVH
- [ ] OU utiliser la méthode SSH directe (plus simple)

---

## 💡 Recommandation

**Je recommande d'utiliser la méthode SSH directe** - c'est plus simple, plus rapide, et vous n'avez pas besoin de configurer Git OVH.

Une fois le script exécuté, votre application sera déployée !

