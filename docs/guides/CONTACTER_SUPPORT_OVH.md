# 📞 Contacter le Support OVH - Application Ne Démarre Pas

## ❌ Situation

- ✅ Code correct (HOST défini, écoute sur 127.0.0.1)
- ✅ Fichiers essentiels présents (`.ovhconfig`, `index.js`)
- ✅ Configuration Multisite vérifiée
- ❌ Application ne démarre toujours pas automatiquement

**C'est probablement un problème côté OVH.**

---

## 🔍 Dernières Vérifications

### 1. Vérifier que Tout est en Place

```bash
cd ~/fouta-erp/backend

# Vérifier .ovhconfig
cat .ovhconfig

# Vérifier index.js
cat index.js

# Vérifier le code
grep -B 5 "httpServer.listen" src/server.js

# Vérifier que l'application ne tourne pas
ps aux | grep node | grep -v grep
```

### 2. Vérifier le Chemin Absolu

```bash
# Vérifier le chemin absolu
pwd

# Doit être quelque chose comme :
# /home/allbyfb/fouta-erp/backend
# OU
# /homez.1005/allbyfb/fouta-erp/backend
```

Dans OVH Multisite, le dossier racine doit être relatif à `~` (home), donc `fouta-erp/backend`.

---

## 📞 Contacter le Support OVH

### Informations à Fournir

1. **Configuration** :
   - `.ovhconfig` avec Node.js 18
   - `index.js` qui importe `src/server.js`
   - `src/server.js` qui écoute sur `127.0.0.1:PORT`
   - Dossier racine dans Multisite : `fouta-erp/backend`
   - Node.js activé dans Multisite

2. **Problème** :
   - L'application Node.js ne démarre pas automatiquement
   - Aucun processus Node.js ne tourne : `ps aux | grep node` ne retourne rien
   - Connexion refusée : `curl: (7) Failed to connect to fabrication.laplume-artisanale.tn port 80: Connexion refusée`

3. **Ce qui a été fait** :
   - Code vérifié et corrigé
   - Fichiers essentiels créés
   - Configuration Multisite vérifiée
   - Plusieurs tentatives de redémarrage (touch index.js)
   - Attente de 20+ minutes

### Message Type pour le Support

```
Bonjour,

J'ai un problème avec le démarrage automatique d'une application Node.js sur mon hébergement partagé OVH.

Configuration :
- Domaine : fabrication.laplume-artisanale.tn
- Dossier racine (Multisite) : fouta-erp/backend
- Node.js activé dans Multisite
- Fichier .ovhconfig présent avec Node.js 18
- Fichier index.js présent qui importe src/server.js
- Code qui écoute sur 127.0.0.1:PORT

Problème :
- L'application Node.js ne démarre pas automatiquement
- Aucun processus Node.js ne tourne (ps aux | grep node ne retourne rien)
- Connexion refusée lors du test : curl http://fabrication.laplume-artisanale.tn/health

Pouvez-vous vérifier pourquoi l'application ne démarre pas automatiquement ?
Y a-t-il des logs d'erreur côté serveur ?
La configuration est-elle correcte ?

Merci pour votre aide.
```

---

## 🔧 Alternative : Essayer un Démarrage Manuel (Pour Voir les Erreurs)

```bash
cd ~/fouta-erp/backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Charger .env
set -a
source .env
set +a

# Tester le démarrage
node index.js
```

**Note** : Cela peut échouer avec EACCES, mais vous verrez d'autres erreurs éventuelles (connexion DB, modules manquants, etc.).

---

## 📋 Checklist Avant de Contacter le Support

- [x] Code vérifié (HOST défini, écoute sur 127.0.0.1)
- [x] Fichiers essentiels présents
- [x] Configuration Multisite vérifiée (dossier racine, Node.js activé)
- [x] Plusieurs tentatives de redémarrage
- [x] Attente de 20+ minutes
- [ ] Test manuel effectué (pour voir les erreurs)
- [ ] Support OVH contacté

---

## ✅ Résumé

1. **Vérifier une dernière fois** que tout est en place
2. **Tester manuellement** pour voir les erreurs éventuelles
3. **Contacter le support OVH** avec toutes les informations
4. **Attendre leur réponse**

**Le code est correct. C'est un problème côté OVH maintenant. Il faut contacter le support !**
