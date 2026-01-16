# 🧪 Tester l'Application

## 🧪 Test de l'Application

### Depuis le Serveur

```bash
# Se connecter au serveur
ssh allbyfb@ssh.cluster130.hosting.ovh.net

# Tester l'application
curl http://fabrication.laplume-artisanale.tn/health
```

### Résultats Possibles

#### ✅ Succès

```json
{"status":"OK","timestamp":"2025-01-06T..."}
```

**L'application fonctionne !**

#### ❌ Connexion Refusée

```
curl: (7) Failed to connect to fabrication.laplume-artisanale.tn port 80: Connexion refusée
```

**L'application ne démarre pas automatiquement.**

**Actions** :
1. Vérifier que l'application tourne : `ps aux | grep node | grep -v grep`
2. Vérifier la configuration Multisite OVH
3. Vérifier que le code est correct

#### ❌ Erreur 501 Not Implemented

```
curl: Not Implemented GET not supported for current URL
```

**Le reverse proxy ne route pas correctement vers Node.js.**

**Actions** :
1. Vérifier la configuration Multisite (dossier racine, Node.js activé)
2. Vérifier qu'il n'y a pas de `.htaccess` qui interfère

---

## 🔍 Vérifications Si Ça Ne Fonctionne Pas

### 1. Vérifier que l'Application Tourne

```bash
ps aux | grep node | grep -v grep

# Doit afficher un processus node
# Exemple :
# allbyfb 12345 0.0 0.2 ... node /home/allbyfb/fouta-erp/backend/index.js
```

### 2. Vérifier les Fichiers Essentiels

```bash
cd ~/fouta-erp/backend

# Vérifier .ovhconfig
cat .ovhconfig

# Vérifier index.js
cat index.js

# Vérifier le code
grep -A 3 "httpServer.listen" src/server.js
```

### 3. Vérifier la Configuration Multisite OVH

Dans le panneau OVH :
1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. **Dossier racine** : `fouta-erp/backend` (exactement, sans `/` au début)
3. **Node.js** : Activé (vert)
4. **PHP** : Désactivé (si possible)

### 4. Forcer un Redémarrage

```bash
cd ~/fouta-erp/backend

# Toucher les fichiers
touch index.js
touch .ovhconfig
touch src/server.js

# Attendre 10-15 minutes
```

---

## 📋 Checklist

- [ ] Test exécuté : `curl http://fabrication.laplume-artisanale.tn/health`
- [ ] Résultat vérifié
- [ ] Si erreur, vérifications effectuées
- [ ] Configuration Multisite vérifiée

---

## ✅ Résumé

1. **Tester** : `curl http://fabrication.laplume-artisanale.tn/health`
2. **Vérifier le résultat**
3. **Si erreur, faire les vérifications**

**Testez et dites-moi le résultat !**

