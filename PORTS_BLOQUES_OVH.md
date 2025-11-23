# 🔧 Résoudre les Ports Bloqués sur OVH

## ❌ Problème : Tous les Ports Bloqués (EACCES)

Sur hébergement partagé OVH, de nombreux ports sont bloqués, même sur localhost.

---

## ✅ Solution 1 : Utiliser un Port Très Élevé

Les ports entre **50000 et 65535** sont parfois autorisés :

```bash
cd ~/fouta-erp/backend

# Modifier le port en 50000
grep -v "^PORT=" .env > .env.tmp
echo "PORT=50000" >> .env.tmp
mv .env.tmp .env

# Vérifier
grep PORT .env

# Redémarrer
pm2 restart fouta-api --update-env
pm2 logs fouta-api --lines 20
```

---

## ✅ Solution 2 : Utiliser la Variable d'Environnement OVH

OVH peut fournir un port spécifique via une variable d'environnement. Vérifiez dans le panneau OVH.

---

## ✅ Solution 3 : Utiliser un Socket Unix (Alternative)

Si les ports TCP sont tous bloqués, on peut utiliser un socket Unix (mais nécessite une modification du code).

---

## ✅ Solution 4 : Utiliser le Port Fourni par OVH

Sur certains hébergements OVH, un port spécifique est fourni. Vérifiez dans :
- Panneau OVH → Votre hébergement → Variables d'environnement
- Ou contactez le support OVH

---

## 🔍 Tester Plusieurs Ports

```bash
cd ~/fouta-erp/backend

# Tester différents ports
for port in 50000 51000 60000 65000; do
  echo "Test port $port..."
  grep -v "^PORT=" .env > .env.tmp
  echo "PORT=$port" >> .env.tmp
  mv .env.tmp .env
  pm2 restart fouta-api --update-env
  sleep 2
  pm2 logs fouta-api --lines 5 | grep -q "EACCES" && echo "Port $port bloqué" || echo "Port $port OK!"
done
```

---

## 💡 Solution Recommandée : Contacter OVH

**Contactez le support OVH** pour :
1. Demander quels ports sont autorisés pour Node.js
2. Demander un port spécifique pour votre application
3. Vérifier si un reverse proxy est nécessaire

---

## 🚀 Solution Alternative : Utiliser le Reverse Proxy OVH

Au lieu d'exposer directement le port, configurez :
1. L'application écoute sur un port local (même si bloqué, elle peut démarrer)
2. Configurez le reverse proxy OVH pour pointer vers votre application
3. Utilisez le domaine `fabrication.laplume-artisanale.tn` directement

---

## 📋 Commandes Rapides

```bash
# Essayer le port 50000
cd ~/fouta-erp/backend
grep -v "^PORT=" .env > .env.tmp
echo "PORT=50000" >> .env.tmp
mv .env.tmp .env
pm2 restart fouta-api --update-env
pm2 logs fouta-api --lines 10
```

---

## ⚠️ Note Importante

Sur hébergement partagé OVH, il est possible que **aucun port ne soit accessible directement**. Dans ce cas, il faut :
1. Configurer le reverse proxy via le panneau OVH
2. Ou passer à un VPS OVH (plus de contrôle)

---

## 🎯 Action Immédiate

Essayez le port **50000** d'abord, puis contactez le support OVH si ça ne fonctionne pas.

