# 🔍 Diagnostic Node.js - Vérifier l'Installation

## ❌ Problème Persistant

nvm dit qu'il a installé Node.js 18, mais le binaire n'existe toujours pas. Il faut diagnostiquer le problème.

---

## 🔍 Commandes de Diagnostic

```bash
# 1. Vérifier si le dossier existe
ls -la ~/.nvm/versions/node/

# 2. Vérifier le contenu de v18.20.8
ls -la ~/.nvm/versions/node/v18.20.8/ 2>/dev/null || echo "Le dossier n'existe pas"

# 3. Vérifier le dossier bin
ls -la ~/.nvm/versions/node/v18.20.8/bin/ 2>/dev/null || echo "Le dossier bin n'existe pas"

# 4. Vérifier le cache
ls -la ~/.nvm/.cache/bin/

# 5. Vérifier les permissions
ls -ld ~/.nvm/versions/node/
```

---

## 🔧 Solution : Réinstaller avec Nettoyage Complet

```bash
# 1. Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Désinstaller complètement
nvm uninstall 18
rm -rf ~/.nvm/versions/node/v18.20.8

# 3. Nettoyer le cache
rm -rf ~/.nvm/.cache/bin/node-v18.20.8-linux-x64

# 4. Réinstaller (téléchargement complet)
nvm install 18 --reinstall-packages-from=current

# 5. OU installer une version différente
nvm install 18.19.0

# 6. Utiliser
nvm use 18
node --version
```

---

## 🔄 Alternative : Utiliser Node.js Directement

Si nvm continue à poser problème, on peut utiliser Node.js directement s'il est installé ailleurs :

```bash
# Chercher Node.js dans le système
which node
whereis node
find /usr -name node 2>/dev/null
find ~ -name node 2>/dev/null

# Si trouvé, utiliser directement
/chemin/vers/node --version
```

---

## 📋 Commandes Complètes de Diagnostic

Exécutez ces commandes pour diagnostiquer :

```bash
# Vérifier la structure
echo "=== Structure nvm ==="
ls -la ~/.nvm/versions/node/ 2>/dev/null || echo "Aucun dossier versions/node"

echo "=== Contenu v18.20.8 ==="
ls -la ~/.nvm/versions/node/v18.20.8/ 2>/dev/null || echo "Dossier v18.20.8 n'existe pas"

echo "=== Dossier bin ==="
ls -la ~/.nvm/versions/node/v18.20.8/bin/ 2>/dev/null || echo "Dossier bin n'existe pas"

echo "=== Cache ==="
ls -la ~/.nvm/.cache/bin/ 2>/dev/null || echo "Cache vide"

echo "=== Permissions ==="
ls -ld ~/.nvm/versions/node/ 2>/dev/null
```

---

## 🎯 Action Immédiate

Exécutez d'abord les commandes de diagnostic pour voir ce qui existe réellement :

```bash
ls -la ~/.nvm/versions/node/
ls -la ~/.nvm/versions/node/v18.20.8/ 2>/dev/null || echo "N'existe pas"
ls -la ~/.nvm/versions/node/v18.20.8/bin/ 2>/dev/null || echo "Bin n'existe pas"
```

Ensuite, dites-moi ce que vous voyez.

