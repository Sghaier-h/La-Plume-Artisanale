# 🔧 Résoudre les Problèmes de Permissions

## ❌ Erreur : "Panne d'accès au fichier"

Vous n'avez pas les permissions pour supprimer le fichier. Voici les solutions :

---

## 🚀 Solution 1 : Utiliser un Autre Répertoire (Recommandé)

Au lieu de vider `fabrication`, créez un nouveau répertoire :

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

**Dans OVH**, configurez Git avec le répertoire `fouta-erp` au lieu de `fabrication`.

---

## 🚀 Solution 2 : Ignorer Git OVH Complètement

Utilisez directement SSH pour tout faire :

```bash
# Sortir de fabrication
cd ~

# Créer un dossier pour le projet
mkdir -p fouta-erp
cd fouta-erp

# Télécharger le script de déploiement
curl -o deploy.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-simple.sh

# Rendre exécutable
chmod +x deploy.sh

# Exécuter le script
bash deploy.sh
```

Cette méthode fonctionne **sans** Git OVH et évite tous les problèmes de permissions !

---

## 🚀 Solution 3 : Contacter le Support OVH

Si vous devez absolument utiliser le répertoire `fabrication`, contactez le support OVH pour :
- Vider le répertoire
- Donner les permissions nécessaires

---

## ✅ Recommandation

**Utilisez la Solution 2** - c'est la plus simple et la plus rapide. Vous n'avez pas besoin de Git OVH pour déployer votre application.

Le script téléchargé fera tout automatiquement :
- Installera toutes les dépendances
- Configurera tout
- Déploiera l'application

---

## 📋 Commandes Complètes (Copier-Coller)

```bash
cd ~
mkdir -p fouta-erp
cd fouta-erp
curl -o deploy.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-simple.sh
chmod +x deploy.sh
bash deploy.sh
```

C'est tout ! Le script fait le reste automatiquement.

