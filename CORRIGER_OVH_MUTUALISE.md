# 🔧 Corriger Node.js sur OVH Mutualisé - Guide Complet

## ⚠️ Contraintes OVH Mutualisé

OVH mutualisé n'est **pas conçu** pour faire tourner plusieurs apps Node.js persistantes comme sur un VPS.

**Node.js y est lancé via Passenger**, pas comme un serveur classique.

---

## 🔍 Diagnostic et Corrections

### 1️⃣ Méthode de Démarrage (CRITIQUE)

#### ❌ Interdit sur OVH Mutualisé

```javascript
app.listen(3000)  // Port fixe
app.listen(3000, '127.0.0.1')  // Avec adresse IP
```

#### ✅ Obligatoire sur OVH Mutualisé

```javascript
const PORT = process.env.PORT || 8080;
app.listen(PORT);  // SANS adresse IP, SANS port fixe
```

**Passenger injecte le port automatiquement.**

#### 🔧 Vérifier et Corriger

```bash
cd ~/fouta-erp/backend

# Vérifier le code actuel
grep -A 3 "httpServer.listen" src/server.js
```

**Doit être** :
```javascript
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
```

**PAS** :
```javascript
httpServer.listen(PORT, HOST, () => {  // ❌ Pas de HOST
httpServer.listen(5000, () => {  // ❌ Pas de port fixe
```

---

### 2️⃣ Fichier de Démarrage

#### Fichiers Acceptés par OVH

- `app.js` (priorité)
- `index.js` (si app.js n'existe pas)

#### 🔧 Vérifier

```bash
cd ~/fouta-erp/backend

# Vérifier que index.js existe
ls -la index.js

# Vérifier le contenu
cat index.js

# Doit être :
# // Point d'entrée pour OVH
# import './src/server.js';
```

#### 📌 Configuration .ovhconfig

```bash
cat .ovhconfig
```

**Doit contenir** :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
```

**OU** (format alternatif) :
```
environment=production
app.engine=nodejs
app.documentRoot=public
```

---

### 3️⃣ Problème de Multisite

#### ✅ Configuration Correcte

Chaque site doit avoir son **propre dossier** et sa **propre app Node.js**.

**Exemple correct** :
```
/fouta-erp/backend/app.js  ← pour fabrication.laplume-artisanale.tn
```

#### ❌ Mauvaise Pratique

```
/node/app.js  ← utilisé par 2 multisites (ne fonctionne pas)
```

#### 🔧 Vérifier dans OVH Manager

1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. **Dossier racine** : `fouta-erp/backend` (exactement, sans `/` au début)
3. **Node.js** : Activé
4. **Fichier de démarrage** : `index.js` (ou `app.js`)

---

### 4️⃣ Dépendances Non Installées

#### 🔧 Installer les Dépendances

```bash
cd ~/fouta-erp/backend

# Installer les dépendances
npm install --production

# Vérifier
node -v
npm -v
```

---

### 5️⃣ Version Node.js

#### 🔧 Vérifier la Version

```bash
# Vérifier la version Node.js
node -v

# Doit être une version LTS supportée par OVH
# Généralement : 16.x, 18.x, 20.x (si supporté)
```

#### 📌 Dans le Manager OVH

1. **Applications** → **Node.js**
2. **Choisir une version supportée** (LTS)
3. **Éviter Node 20** si non listé

#### 🔧 Modifier .ovhconfig

```bash
cd ~/fouta-erp/backend

# Éditer .ovhconfig
nano .ovhconfig
```

**Utiliser une version LTS** :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>  <!-- Version LTS -->
</engine>
```

---

### 6️⃣ Logs OVH (CRITIQUE)

#### 📍 Emplacement des Logs

```bash
# Logs OVH
ls -la ~/logs/

# OU
cat ~/logs/error.log
cat ~/logs/access.log
```

#### 📌 Dans le Manager OVH

1. **Hébergement** → **Logs**
2. **Chercher** :
   - `Passenger`
   - `App failed to start`
   - `Cannot find module`
   - `Error: listen EACCES`

#### 🔧 Consulter les Logs

```bash
# Logs d'erreur
tail -f ~/logs/error.log

# Logs d'accès
tail -f ~/logs/access.log

# Logs spécifiques Node.js
grep -i "node\|passenger\|error" ~/logs/error.log
```

---

## 🔧 Corrections à Appliquer

### Étape 1 : Corriger server.js

```bash
cd ~/fouta-erp/backend

# Éditer server.js
nano src/server.js
```

**Vérifier que c'est** :
```javascript
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

**SANS** `HOST` et **SANS** port fixe.

### Étape 2 : Vérifier index.js

```bash
# Vérifier que index.js existe
cat index.js

# Doit être :
# // Point d'entrée pour OVH
# import './src/server.js';
```

### Étape 3 : Vérifier .ovhconfig

```bash
cat .ovhconfig

# Doit être :
# <?xml version="1.0" encoding="UTF-8"?>
# <engine>
#     <name>nodejs</name>
#     <version>18</version>
# </engine>
```

### Étape 4 : Installer les Dépendances

```bash
npm install --production
```

### Étape 5 : Vérifier la Configuration Multisite

Dans le Manager OVH :
- Dossier racine : `fouta-erp/backend`
- Node.js : Activé
- Fichier de démarrage : `index.js`

### Étape 6 : Consulter les Logs

```bash
# Voir les erreurs récentes
tail -50 ~/logs/error.log | grep -i "node\|passenger\|error"
```

---

## 📋 Checklist Complète

- [ ] Code corrigé : `httpServer.listen(PORT, () => {` (sans HOST, sans port fixe)
- [ ] `index.js` présent et correct
- [ ] `.ovhconfig` présent avec version Node.js LTS
- [ ] Dépendances installées : `npm install --production`
- [ ] Configuration Multisite vérifiée (dossier racine, Node.js activé)
- [ ] Logs consultés : `tail -50 ~/logs/error.log`
- [ ] Fichiers touchés : `touch index.js`
- [ ] Attendu 15-20 minutes

---

## ⚠️ Limitations Structurelles OVH Mutualisé

Si rien ne fonctionne après toutes ces corrections :

**OVH mutualisé a des limitations** :
- ❌ Pas de WebSocket fiable
- ❌ Pas de process long
- ❌ Pas de cron Node.js
- ❌ Pas de workers

### Solutions Recommandées

1. **VPS OVH** (recommandé pour projet sérieux)
2. **Render / Railway / Fly.io** (alternatives cloud)
3. **Docker + VPS** (pour plus de contrôle)

---

## ✅ Résumé

1. **Corriger server.js** : `httpServer.listen(PORT, () => {` (sans HOST, sans port fixe)
2. **Vérifier index.js** : Présent et correct
3. **Vérifier .ovhconfig** : Version Node.js LTS
4. **Installer dépendances** : `npm install --production`
5. **Vérifier Multisite** : Dossier racine, Node.js activé
6. **Consulter logs** : `tail -50 ~/logs/error.log`
7. **Forcer redémarrage** : `touch index.js`
8. **Attendre 15-20 minutes**

**Ces corrections devraient résoudre le problème sur OVH mutualisé !**

