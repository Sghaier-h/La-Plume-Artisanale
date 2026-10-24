# 🔧 Corriger parametrage.controller.js sur le Serveur

## Correction Rapide avec sed

```bash
cd /opt/fouta-erp/backend/src/controllers

# Créer une sauvegarde
cp parametrage.controller.js parametrage.controller.js.backup

# Corriger la ligne 222
sed -i 's/const defaults: { \[key: string\]: any } = {/const defaults = {/' parametrage.controller.js

# Vérifier que c'est corrigé
sed -n '220,225p' parametrage.controller.js
```

Vous devriez maintenant voir :
```javascript
const defaults = {
```

Au lieu de :
```javascript
const defaults: { [key: string]: any } = {
```

---

## Alternative : Correction Manuelle avec nano

```bash
cd /opt/fouta-erp/backend/src/controllers
nano parametrage.controller.js
```

1. Aller à la ligne 222 : `Ctrl+_`, taper `222`, `Enter`
2. Remplacer `const defaults: { [key: string]: any } = {` par `const defaults = {`
3. Sauvegarder : `Ctrl+O`, `Enter`, `Ctrl+X`
