# 🔧 Résoudre l'Erreur 501 Not Implemented

## ❌ Problème

```
501 Not Implemented
GET not supported for current URL.
```

**Bonne nouvelle** : Le domaine répond maintenant ! Le reverse proxy fonctionne.

**Problème** : La requête n'atteint pas correctement l'application Node.js.

---

## 🔍 Causes Possibles

### 1. Fichier .htaccess qui Intercepte les Requêtes

Sur hébergement partagé OVH, un fichier `.htaccess` peut intercepter les requêtes avant qu'elles n'atteignent Node.js.

### 2. Configuration Apache/PHP qui Bloque Node.js

Si PHP est activé pour le domaine, il peut intercepter les requêtes.

### 3. Application Node.js Non Démarrée Correctement

L'application peut ne pas écouter correctement.

---

## 🔧 Solutions

### Solution 1 : Vérifier et Supprimer .htaccess

```bash
# Vérifier si .htaccess existe
cd ~/fouta-erp/backend
ls -la .htaccess

# Si le fichier existe, le renommer (backup)
mv .htaccess .htaccess.backup

# OU le supprimer si vous êtes sûr
rm .htaccess
```

### Solution 2 : Vérifier que l'Application Tourne

```bash
# Vérifier les processus Node.js
ps aux | grep node

# Vous devriez voir :
# node /home/allbyfb/fouta-erp/backend/index.js
```

### Solution 3 : Redémarrer l'Application

```bash
# Toucher index.js pour forcer un rechargement
cd ~/fouta-erp/backend
touch index.js

# Attendre 2-3 minutes
# Vérifier que le processus tourne toujours
ps aux | grep node
```

### Solution 4 : Vérifier la Configuration Multisite

Dans le panneau OVH :

1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. Vérifiez que :
   - **Dossier racine** : `fouta-erp/backend` (exactement)
   - **Node.js** : Activé (vert)
   - **PHP** : Désactivé (si possible) ou ne doit pas intercepter

### Solution 5 : Vérifier les Logs Node.js

```bash
# Vérifier les logs système (si accessibles)
tail -f ~/logs/nodejs.log 2>/dev/null

# OU vérifier les logs OVH dans le panneau
```

---

## 🧪 Tests

### Test 1 : Vérifier que l'Application Écoute

```bash
# Vérifier les processus
ps aux | grep node

# Vérifier les ports (si accessible)
netstat -tuln 2>/dev/null | grep node
```

### Test 2 : Tester Différentes Routes

```bash
# Tester la route racine
curl http://fabrication.laplume-artisanale.tn/

# Tester /health
curl http://fabrication.laplume-artisanale.tn/health

# Tester une route API
curl http://fabrication.laplume-artisanale.tn/api/auth/login
```

### Test 3 : Tester avec Verbose

```bash
# Voir les détails de la requête
curl -v http://fabrication.laplume-artisanale.tn/health
```

---

## 📋 Checklist

- [ ] Vérifié si `.htaccess` existe et l'a supprimé/renommé
- [ ] Vérifié que l'application Node.js tourne
- [ ] Vérifié la configuration Multisite (PHP désactivé si possible)
- [ ] Redémarré l'application (touch index.js)
- [ ] Attendu 5-10 minutes
- [ ] Testé à nouveau

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

### Contacter le Support OVH

1. Panneau OVH → **Support** → **Créer un ticket**
2. Sélectionnez **Hébergement web**

**Message** :

```
Bonjour,

J'ai une erreur 501 Not Implemented pour mon application Node.js.

DOMAINE : fabrication.laplume-artisanale.tn
DOSSIER RACINE : fouta-erp/backend

CONFIGURATION :
- Fichier .ovhconfig présent avec Node.js 18 ✅
- Fichier index.js présent ✅
- Application Node.js tourne ✅
- Domaine configuré dans Multisite ✅

PROBLÈME :
- Erreur 501 Not Implemented
- GET not supported for current URL
- Les requêtes n'atteignent pas l'application Node.js

DEMANDES :
1. Vérifier que les requêtes sont bien routées vers Node.js
2. Vérifier s'il y a un conflit avec PHP ou Apache
3. Vérifier les logs du reverse proxy

Merci de votre aide.
```

---

## 💡 Note sur les Logs PostgreSQL

Les erreurs dans les logs PostgreSQL (`column "checkpoints_timed" does not exist`) sont des **erreurs de monitoring OVH**, pas critiques. Elles n'affectent pas votre application.

**Concentrez-vous sur l'erreur 501** qui est le vrai problème.

---

## ✅ Résumé

1. **Vérifiez et supprimez `.htaccess`** si présent
2. **Vérifiez que l'application tourne**
3. **Redémarrez l'application** (touch index.js)
4. **Attendez 5-10 minutes**
5. **Testez à nouveau**

**L'erreur 501 indique que le reverse proxy fonctionne mais que les requêtes n'atteignent pas Node.js correctement.**
