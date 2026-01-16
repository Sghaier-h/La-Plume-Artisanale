# 🚀 Démarrer l'Application Node.js sur OVH

## ❌ Problème

Aucun processus Node.js ne tourne. L'application n'est pas démarrée.

---

## 🔧 Solutions

### Solution 1 : Forcer un Redémarrage en Touchant index.js

```bash
cd ~/fouta-erp/backend

# Toucher index.js pour forcer OVH à redémarrer
touch index.js

# Attendre 2-3 minutes
# Vérifier que l'application tourne
ps aux | grep node
```

### Solution 2 : Vérifier que les Fichiers Sont Corrects

```bash
cd ~/fouta-erp/backend

# Vérifier .ovhconfig
cat .ovhconfig

# Vérifier index.js
cat index.js

# Vérifier que src/server.js existe
ls -la src/server.js
```

### Solution 3 : Vérifier la Configuration Multisite

Dans le panneau OVH :
1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. Vérifiez que :
   - **Dossier racine** : `fouta-erp/backend` (exactement)
   - **Node.js** : Activé (vert)

### Solution 4 : Vérifier les Permissions

```bash
cd ~/fouta-erp/backend

# Vérifier les permissions des fichiers
ls -la .ovhconfig index.js src/server.js

# Les fichiers doivent être lisibles
```

---

## ⏰ Timeline

OVH peut prendre du temps pour démarrer l'application :

1. **Détection des fichiers** : 2-5 minutes
2. **Démarrage de l'application** : 2-5 minutes
3. **Total** : 5-10 minutes (parfois jusqu'à 15 minutes)

---

## 🧪 Tests

### Test 1 : Vérifier que l'Application Tourne

```bash
# Vérifier les processus Node.js
ps aux | grep node | grep -v grep

# Si vous voyez un processus, c'est bon
# Si vous ne voyez que "grep node", l'application ne tourne pas
```

### Test 2 : Tester l'Application

```bash
# Tester HTTP
curl http://fabrication.laplume-artisanale.tn/health

# Tester HTTPS
curl https://fabrication.laplume-artisanale.tn/health
```

---

## 🔍 Vérifications Complémentaires

### Vérifier les Logs OVH

Dans le panneau OVH :
1. **Statistiques et logs** → **Logs d'erreur**
2. Cherchez les erreurs pour `fabrication.laplume-artisanale.tn`
3. Vérifiez s'il y a des erreurs Node.js

### Vérifier la Syntaxe du Code

```bash
cd ~/fouta-erp/backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Vérifier la syntaxe (sans l'exécuter)
node -c src/server.js

# Si erreur de syntaxe, corrigez-la
```

---

## 📋 Checklist

- [ ] Fichiers `.ovhconfig` et `index.js` présents et corrects
- [ ] Configuration Multisite vérifiée (dossier racine exact)
- [ ] `touch index.js` exécuté pour forcer un redémarrage
- [ ] Attendu 10-15 minutes
- [ ] Vérifié que l'application tourne (`ps aux | grep node`)
- [ ] Testé l'application
- [ ] Consulté les logs OVH si nécessaire

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

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
- Aucun processus Node.js détecté (ps aux | grep node)
- Connexion refusée sur le domaine

DEMANDES :
1. Vérifier que Node.js est activé pour ce domaine
2. Vérifier pourquoi l'application ne démarre pas automatiquement
3. Démarrer manuellement l'application si nécessaire

Merci de votre aide.
```

---

## ✅ Résumé

1. **Forcer un redémarrage** : `touch index.js`
2. **Attendre 10-15 minutes**
3. **Vérifier que l'application tourne** : `ps aux | grep node`
4. **Tester l'application** : `curl http://fabrication.laplume-artisanale.tn/health`

**Si après 15 minutes l'application ne tourne toujours pas, contactez le support OVH.**

