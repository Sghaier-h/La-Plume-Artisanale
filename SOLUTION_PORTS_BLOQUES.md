# 🔧 Solution Définitive : Ports Bloqués sur Hébergement Partagé OVH

## ❌ Problème Confirmé

Tous les ports sont bloqués (5000, 30000, 50000) même sur localhost. C'est une limitation stricte de l'hébergement partagé OVH.

---

## ✅ Solution 1 : Utiliser le Reverse Proxy OVH (Recommandé)

Sur hébergement partagé OVH, l'application doit être accessible via le domaine, pas directement par port.

### Configuration dans le Panneau OVH

1. **Allez dans le panneau OVH** → Votre hébergement → `fabrication.laplume-artisanale.tn`
2. **Cherchez "Configuration" ou "Multisite"**
3. **Configurez le domaine** pour pointer vers votre application Node.js
4. **Activez Node.js** pour ce domaine si disponible

### Modifier l'Application pour Écouter sur le Domaine

L'application peut démarrer même si le port est "bloqué" - elle sera accessible via le reverse proxy OVH.

---

## ✅ Solution 2 : Utiliser un Socket Unix (Alternative)

Modifier le serveur pour utiliser un socket Unix au lieu d'un port TCP.

### Modification du Code

```javascript
// Dans server.js, au lieu de :
httpServer.listen(PORT, HOST, ...)

// Utiliser :
import { createServer } from 'http';
import { unlink } from 'fs/promises';

const SOCKET_PATH = '/tmp/fouta-erp.sock';

// Nettoyer le socket s'il existe
try {
  await unlink(SOCKET_PATH);
} catch (e) {}

httpServer.listen(SOCKET_PATH, () => {
  console.log(`🚀 Serveur démarré sur socket ${SOCKET_PATH}`);
});
```

Puis configurer Nginx/Reverse Proxy pour pointer vers le socket.

---

## ✅ Solution 3 : Contacter le Support OVH

**Contactez le support OVH** et demandez :

1. **Quels ports sont autorisés** pour Node.js sur hébergement partagé ?
2. **Comment configurer le reverse proxy** pour votre application Node.js ?
3. **Y a-t-il une variable d'environnement** pour le port (comme `PORT` ou `NODE_PORT`) ?

---

## ✅ Solution 4 : Passer à un VPS OVH (Définitif)

Si vous avez besoin de contrôle complet :

1. **Commander un VPS OVH** (à partir de ~3€/mois)
2. **Installer Node.js, PM2, Nginx** librement
3. **Avoir accès root** et contrôler tous les ports

---

## 🚀 Solution Immédiate : Essayer avec le Port par Défaut d'OVH

Certains hébergements OVH utilisent une variable d'environnement spécifique :

```bash
cd ~/fouta-erp/backend

# Vérifier les variables d'environnement disponibles
env | grep -i port
env | grep -i node

# Essayer avec PORT=8080 (parfois autorisé)
grep -v "^PORT=" .env > .env.tmp
echo "PORT=8080" >> .env.tmp
mv .env.tmp .env
pm2 restart fouta-api --update-env
pm2 logs fouta-api --lines 10
```

---

## 💡 Solution Recommandée : Configurer le Reverse Proxy

**La meilleure solution** est de configurer le reverse proxy dans le panneau OVH :

1. L'application démarre (même si le port semble "bloqué")
2. Le reverse proxy OVH route les requêtes vers votre application
3. L'application est accessible via `https://fabrication.laplume-artisanale.tn`

---

## 📋 Action Immédiate

1. **Contactez le support OVH** pour savoir comment configurer Node.js avec le reverse proxy
2. **Ou passez à un VPS OVH** pour avoir le contrôle complet

---

## ⚠️ Note Importante

Sur hébergement partagé OVH, il est **normal** que les ports soient bloqués. L'application doit être accessible via le **reverse proxy OVH** configuré dans le panneau, pas directement par port.

---

## 🎯 Prochaines Étapes

1. Vérifier dans le panneau OVH si Node.js peut être activé pour votre domaine
2. Configurer le reverse proxy pour pointer vers votre application
3. Ou contacter le support OVH pour obtenir de l'aide

