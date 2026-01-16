# 🔍 Trouver les Logs OVH

## ❌ Problème

Le fichier `~/logs/error.log` n'existe pas à cet emplacement.

---

## 🔍 Emplacements Possibles des Logs

### Option 1 : Logs dans le Dossier Home

```bash
# Vérifier les logs dans le home
ls -la ~/logs/

# OU
ls -la ~/log/

# OU
ls -la ~/www/logs/
```

### Option 2 : Logs dans le Dossier du Site

```bash
cd ~/fouta-erp/backend

# Chercher les logs dans le dossier du projet
find . -name "*.log" -type f 2>/dev/null

# OU chercher dans le dossier parent
find .. -name "*.log" -type f 2>/dev/null
```

### Option 3 : Logs via le Manager OVH

**Dans le panneau OVH** :
1. **Hébergement** → **Statistiques et logs**
2. **Logs** → **Logs d'erreur**
3. **Télécharger ou consulter** les logs

### Option 4 : Logs Passenger (Node.js)

```bash
# Chercher les logs Passenger
find ~ -name "*passenger*" -type f 2>/dev/null

# OU chercher dans /tmp
ls -la /tmp/passenger* 2>/dev/null
```

### Option 5 : Logs Système

```bash
# Logs système (si accessible)
tail -50 /var/log/apache2/error.log 2>/dev/null
tail -50 /var/log/nginx/error.log 2>/dev/null
```

---

## 🔧 Commandes pour Trouver les Logs

### Chercher Tous les Fichiers de Log

```bash
# Chercher tous les fichiers .log
find ~ -name "*.log" -type f 2>/dev/null | head -20

# Chercher les fichiers contenant "error"
find ~ -name "*error*" -type f 2>/dev/null | head -20

# Chercher les fichiers contenant "node"
find ~ -name "*node*" -type f 2>/dev/null | head -20
```

### Vérifier les Dossiers Communs

```bash
# Vérifier les dossiers communs
ls -la ~/logs/ 2>/dev/null
ls -la ~/log/ 2>/dev/null
ls -la ~/www/logs/ 2>/dev/null
ls -la ~/www/log/ 2>/dev/null
ls -la ~/public_html/logs/ 2>/dev/null
```

---

## 📋 Alternative : Vérifier via le Manager OVH

### Dans le Panneau OVH

1. **Connectez-vous au panneau OVH**
2. **Allez dans** : **Hébergement** → **Statistiques et logs**
3. **Cliquez sur** : **Logs**
4. **Consultez** :
   - **Logs d'erreur**
   - **Logs d'accès**
   - **Logs spécifiques Node.js** (si disponibles)

---

## 🧪 Vérifications Alternatives

### Si Pas de Logs Disponibles

Vérifiez directement l'application :

```bash
# Vérifier que l'application tourne
ps aux | grep node | grep -v grep

# Tester l'application
curl http://fabrication.laplume-artisanale.tn/health

# Vérifier les fichiers essentiels
cd ~/fouta-erp/backend
cat .ovhconfig
cat index.js
grep -A 3 "httpServer.listen" src/server.js
```

---

## 📋 Checklist

- [ ] Logs cherchés dans différents emplacements
- [ ] Logs consultés via le Manager OVH
- [ ] Application vérifiée : `ps aux | grep node`
- [ ] Application testée : `curl http://fabrication.laplume-artisanale.tn/health`
- [ ] Fichiers essentiels vérifiés

---

## ✅ Résumé

1. **Chercher les logs** dans différents emplacements
2. **OU consulter les logs** via le Manager OVH
3. **Vérifier l'application** directement : `ps aux | grep node`
4. **Tester l'application** : `curl http://fabrication.laplume-artisanale.tn/health`

**Si les logs ne sont pas accessibles, vérifiez directement l'application !**

