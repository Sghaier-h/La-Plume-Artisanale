# ❌ Application Node.js Ne Démarre Pas - Diagnostic

## ❌ Problème

Aucun processus Node.js ne tourne malgré :
- ✅ Fichier `.ovhconfig` présent
- ✅ Fichier `index.js` présent
- ✅ Fichier `src/server.js` existe
- ✅ Configuration Multisite (à vérifier)

---

## 🔍 Diagnostic

### 1. Tester si l'Application Peut Démarrer Manuellement

Cela nous permettra de voir les erreurs :

```bash
cd ~/fouta-erp/backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Essayer de démarrer l'application manuellement
node index.js
```

**Observez les erreurs** qui apparaissent. Cela nous dira pourquoi l'application ne démarre pas.

### 2. Vérifier la Syntaxe du Code

```bash
cd ~/fouta-erp/backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Vérifier la syntaxe
node -c src/server.js

# Si erreur, notez-la
```

### 3. Vérifier les Modules Installés

```bash
cd ~/fouta-erp/backend

# Vérifier que node_modules existe
ls -la node_modules/ | head -10

# Vérifier que les modules essentiels sont installés
ls -la node_modules/express node_modules/cors node_modules/dotenv 2>/dev/null
```

### 4. Vérifier la Configuration Multisite

Dans le panneau OVH :
1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. Vérifiez **EXACTEMENT** :
   - **Dossier racine** : `fouta-erp/backend` (sans `/` au début, sans `/` à la fin)
   - **Node.js** : Activé (vert)

---

## 🔧 Solutions

### Solution 1 : Vérifier les Erreurs au Démarrage

Exécutez `node index.js` et notez les erreurs. Les erreurs courantes :

- **Module not found** → `npm install`
- **SyntaxError** → Erreur dans le code
- **EACCES port** → Problème de port (normal sur hébergement partagé)
- **Database connection error** → Problème de connexion DB

### Solution 2 : Réinstaller les Dépendances

```bash
cd ~/fouta-erp/backend

# Réinstaller les dépendances
npm install --production
```

### Solution 3 : Vérifier le Fichier .env

```bash
cd ~/fouta-erp/backend

# Vérifier que .env existe et est correct
cat .env

# Vérifier que les variables essentielles sont présentes
grep -E "DB_HOST|DB_PORT|DB_NAME|DB_USER|DB_PASSWORD" .env
```

### Solution 4 : Vérifier les Logs OVH

Dans le panneau OVH :
1. **Statistiques et logs** → **Logs d'erreur**
2. Cherchez les erreurs pour `fabrication.laplume-artisanale.tn`
3. Vérifiez les erreurs Node.js

---

## 🧪 Test Manuel

### Tester le Démarrage Manuel

```bash
cd ~/fouta-erp/backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Tester le démarrage (peut échouer sur le port, mais on verra les autres erreurs)
node index.js
```

**Observez les erreurs** et notez-les. Cela nous dira exactement ce qui ne va pas.

---

## 📋 Checklist

- [ ] Testé le démarrage manuel (`node index.js`)
- [ ] Noté les erreurs (s'il y en a)
- [ ] Vérifié la syntaxe (`node -c src/server.js`)
- [ ] Vérifié que `node_modules/` existe
- [ ] Vérifié le fichier `.env`
- [ ] Vérifié la configuration Multisite
- [ ] Consulté les logs OVH

---

## 🆘 Si l'Application Ne Peut Pas Démarrer Manuellement

### Erreur : Module Not Found

```bash
# Réinstaller les dépendances
npm install --production
```

### Erreur : SyntaxError

Vérifiez le code dans `src/server.js` et corrigez l'erreur.

### Erreur : Database Connection

Vérifiez les informations dans `.env` et testez la connexion :

```bash
export PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "SELECT 1;"
unset PGPASSWORD
```

### Erreur : EACCES Port

C'est normal sur hébergement partagé. OVH gère le port automatiquement. L'application devrait quand même démarrer.

---

## 🆘 Si Rien Ne Fonctionne

### Contacter le Support OVH

1. Panneau OVH → **Support** → **Créer un ticket**
2. Sélectionnez **Hébergement web**

**Message** :

```
Bonjour,

J'ai une application Node.js qui ne démarre pas automatiquement.

DOMAINE : fabrication.laplume-artisanale.tn
DOSSIER RACINE : fouta-erp/backend

CONFIGURATION :
- Fichier .ovhconfig présent avec Node.js 18 ✅
- Fichier index.js présent ✅
- Fichier src/server.js existe ✅
- Domaine configuré dans Multisite ✅

PROBLÈME :
- L'application Node.js ne démarre pas automatiquement
- Aucun processus Node.js détecté
- [Ajoutez les erreurs trouvées avec "node index.js"]

DEMANDES :
1. Vérifier que Node.js est activé pour ce domaine
2. Vérifier pourquoi l'application ne démarre pas
3. Démarrer manuellement l'application si nécessaire

Merci de votre aide.
```

---

## ✅ Résumé

1. **Tester le démarrage manuel** : `node index.js` (pour voir les erreurs)
2. **Noter les erreurs** trouvées
3. **Corriger les erreurs** selon ce qui apparaît
4. **Attendre 10-15 minutes** après corrections
5. **Vérifier que l'application tourne** : `ps aux | grep node`
6. **Si nécessaire, contacter le support OVH**

**Commencez par tester `node index.js` pour voir les erreurs !**

