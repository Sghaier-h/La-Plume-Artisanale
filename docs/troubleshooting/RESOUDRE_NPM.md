# 🔧 Résoudre le Problème npm

## ❌ Erreur : "npm : commande introuvable"

Node.js est installé (v10.24.0) mais npm n'est pas dans le PATH.

---

## 🚀 Solution : Script Amélioré

J'ai créé un script amélioré qui gère ce problème. Exécutez :

```bash
cd ~/la-plume-artisanale
curl -o deploy-ovh.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-ovh-final.sh
chmod +x deploy-ovh.sh
bash deploy-ovh.sh
```

---

## 🔍 Vérifier où se trouve npm

```bash
# Chercher npm
which npm
whereis npm
find /usr -name npm 2>/dev/null
find ~ -name npm 2>/dev/null
```

---

## 🔧 Solution Manuelle

Si le script ne fonctionne toujours pas :

### Option 1 : Installer npm localement

```bash
mkdir -p ~/.local/bin
curl -L https://www.npmjs.com/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
npm --version
```

### Option 2 : Utiliser npx

```bash
# Si npx est disponible
npx npm install --production
```

### Option 3 : Installer via le panneau OVH

1. Allez dans le panneau OVH
2. Activez/installez npm via les options Node.js

---

## 📋 Commandes Alternatives

Si npm n'est toujours pas disponible, vous pouvez :

### Installer les dépendances manuellement

```bash
cd ~/fouta-erp/backend

# Télécharger package.json et installer
# Ou utiliser yarn si disponible
yarn install --production

# Ou utiliser pnpm si disponible
pnpm install --production
```

---

## ✅ Après Résolution

Une fois npm disponible, le script continuera automatiquement.

---

## 🆘 Si Rien Ne Fonctionne

Contactez le support OVH pour :
- Installer npm
- Mettre à jour Node.js (v10.24.0 est très ancien, v18+ est recommandé)
- Configurer le PATH correctement

---

## 🎯 Action Immédiate

**Exécutez le nouveau script** qui gère automatiquement le problème npm :

```bash
bash deploy-ovh.sh
```

Le script va chercher npm à différents endroits et l'installer si nécessaire.

