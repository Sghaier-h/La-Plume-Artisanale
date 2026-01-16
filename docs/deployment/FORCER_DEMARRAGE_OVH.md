# 🔧 Forcer le Démarrage de l'Application sur OVH

## ❌ Problème

Malgré :
- ✅ Fichier `.ovhconfig` présent
- ✅ Fichier `index.js` présent
- ✅ Fichier `src/server.js` existe
- ✅ `.env` correct (pas de HOST=127.0.0.1)

L'application Node.js ne démarre pas automatiquement.

---

## 🔧 Solutions

### Solution 1 : Forcer un Redémarrage en Touchant les Fichiers

```bash
cd ~/fouta-erp/backend

# Toucher les fichiers pour forcer OVH à redémarrer
touch .ovhconfig
touch index.js

# Attendre 5-10 minutes
```

### Solution 2 : Vérifier la Configuration Multisite (CRITIQUE)

Dans le panneau OVH :

1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. **Vérifiez EXACTEMENT** :
   - **Dossier racine** : `fouta-erp/backend` (exactement, sans `/` au début, sans `/` à la fin)
   - **Node.js** : Activé (vert)
3. **Si le dossier racine n'est pas exact**, modifiez-le et sauvegardez
4. **Attendez 10-15 minutes** après modification

### Solution 3 : Vérifier les Permissions des Fichiers

```bash
cd ~/fouta-erp/backend

# Vérifier les permissions
ls -la .ovhconfig index.js src/server.js

# Les fichiers doivent être lisibles (r-- ou rw-)
# Si nécessaire, ajuster les permissions
chmod 644 .ovhconfig index.js
```

### Solution 4 : Vérifier la Structure Complète

```bash
cd ~/fouta-erp/backend

# Vérifier que tous les fichiers sont présents
ls -la

# Doit contenir :
# - .ovhconfig ✅
# - index.js ✅
# - package.json ✅
# - src/server.js ✅
# - node_modules/ ✅
# - .env ✅
```

---

## ⏰ Timeline

OVH peut prendre du temps pour démarrer l'application :

1. **Détection des fichiers** : 5-10 minutes
2. **Démarrage de l'application** : 5-10 minutes
3. **Total** : 10-20 minutes (parfois plus)

**Attendez au moins 15-20 minutes** après avoir vérifié la configuration Multisite.

---

## 🧪 Vérifications

### Vérifier que l'Application Tourne

```bash
# Vérifier les processus Node.js
ps aux | grep node | grep -v grep

# Si vous voyez un processus, c'est bon
# Si vous ne voyez rien, attendez encore ou contactez le support
```

### Tester l'Application

```bash
# Tester HTTP
curl http://fabrication.laplume-artisanale.tn/health

# Tester HTTPS
curl https://fabrication.laplume-artisanale.tn/health
```

---

## 📋 Checklist Complète

- [ ] Fichier `.ovhconfig` présent et correct
- [ ] Fichier `index.js` présent et correct
- [ ] Fichier `src/server.js` existe
- [ ] Fichier `.env` correct (pas de HOST=127.0.0.1)
- [ ] `node_modules/` existe
- [ ] Configuration Multisite vérifiée (dossier racine EXACT)
- [ ] Node.js activé dans Multisite
- [ ] `touch .ovhconfig index.js` exécuté
- [ ] Attendu 15-20 minutes
- [ ] Vérifié que l'application tourne
- [ ] Testé l'application

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas Après 20 Minutes

### Contacter le Support OVH

C'est probablement un problème de configuration OVH qui nécessite une intervention manuelle.

1. Panneau OVH → **Support** → **Créer un ticket**
2. Sélectionnez **Hébergement web**

**Message** :

```
Bonjour,

J'ai une application Node.js qui ne démarre pas automatiquement malgré une configuration correcte.

DOMAINE : fabrication.laplume-artisanale.tn
DOSSIER RACINE : fouta-erp/backend
SERVEUR : cluster130.hosting.ovh.net

CONFIGURATION EFFECTUÉE :
- Fichier .ovhconfig présent avec Node.js 18 ✅
- Fichier index.js présent ✅
- Fichier src/server.js existe ✅
- Fichier .env configuré ✅
- Domaine configuré dans Multisite ✅
- Dossier racine : fouta-erp/backend ✅
- Node.js activé dans Multisite ✅

PROBLÈME :
- L'application Node.js ne démarre pas automatiquement
- Aucun processus Node.js détecté après 20 minutes d'attente
- Connexion refusée sur le domaine
- Test manuel : Erreur EACCES sur port 5000 (normal sur hébergement partagé)

DEMANDES :
1. Vérifier que Node.js est correctement activé pour ce domaine
2. Vérifier pourquoi l'application ne démarre pas automatiquement
3. Démarrer manuellement l'application si nécessaire
4. Vérifier les logs système pour identifier le problème

Merci de votre aide.
```

---

## 💡 Notes Importantes

1. **L'erreur EACCES lors d'un test manuel est normale** sur hébergement partagé OVH
2. **OVH doit démarrer l'application automatiquement** via `.ovhconfig` et `index.js`
3. **Le dossier racine dans Multisite doit être EXACT** : `fouta-erp/backend` (sans `/` au début)
4. **La propagation peut prendre 15-20 minutes**

---

## ✅ Résumé

1. **Vérifiez la configuration Multisite** (dossier racine exact)
2. **Forcez un redémarrage** : `touch .ovhconfig index.js`
3. **Attendez 15-20 minutes**
4. **Vérifiez** : `ps aux | grep node`
5. **Si toujours rien, contactez le support OVH**

**Le support OVH peut démarrer l'application manuellement et vérifier la configuration !**

