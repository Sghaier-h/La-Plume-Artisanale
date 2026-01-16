# 🔧 Changer le Port - Résoudre EACCES

## ❌ Problème : Port 5000 Bloqué

Même sur localhost, le port 5000 est bloqué sur l'hébergement partagé OVH.

---

## ✅ Solution : Utiliser un Port Élevé

Sur hébergement partagé, utilisez un port entre **30000 et 65535**.

---

## 🚀 Commandes à Exécuter

```bash
# 1. Aller dans le dossier backend
cd ~/fouta-erp/backend

# 2. Modifier le fichier .env
nano .env
# OU utiliser echo pour modifier directement
```

**Dans le fichier .env, changez :**
```
PORT=5000
```

**En :**
```
PORT=30000
```

**Puis sauvegarder** (Ctrl+X, puis Y, puis Enter si nano)

---

## 🔄 Redémarrer l'Application

```bash
# Redémarrer avec la nouvelle configuration
pm2 restart fouta-api --update-env

# Vérifier le statut
pm2 status

# Voir les logs
pm2 logs fouta-api --lines 20

# Tester avec le nouveau port
curl http://localhost:30000/health
```

---

## 📝 Modification Rapide (Sans Éditeur)

```bash
cd ~/fouta-erp/backend

# Sauvegarder l'ancien .env
cp .env .env.backup

# Modifier PORT dans .env
sed -i 's/^PORT=5000$/PORT=30000/' .env

# Vérifier la modification
grep PORT .env

# Redémarrer
pm2 restart fouta-api --update-env

# Tester
curl http://localhost:30000/health
```

---

## ✅ Résultat Attendu

- `pm2 status` : `status: online`
- Logs : `🚀 Serveur démarré sur 127.0.0.1:30000`
- `curl` : `{"status":"OK","timestamp":"..."}`

---

## 🔍 Autres Ports à Essayer

Si 30000 ne fonctionne pas, essayez :
- 30001
- 31000
- 40000
- 50000

---

## 💡 Note

Une fois le port configuré, vous devrez :
1. Configurer le reverse proxy OVH pour pointer vers `http://localhost:30000`
2. Mettre à jour les variables d'environnement du frontend si nécessaire

