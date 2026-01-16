# 🔄 Redémarrer l'Application Après Correction

## ✅ Correction Appliquée

Le serveur a été modifié pour écouter sur `localhost` (127.0.0.1) au lieu de `0.0.0.0`, ce qui résout le problème de permissions.

---

## 🚀 Commandes à Exécuter

Sur le serveur SSH :

```bash
# 1. Mettre à jour le code
cd ~/fouta-erp
git pull

# 2. Redémarrer l'application
cd backend
pm2 restart fouta-api

# 3. Vérifier le statut
pm2 status
pm2 logs fouta-api --lines 20

# 4. Tester l'API
curl http://localhost:5000/health
```

---

## ✅ Résultat Attendu

Vous devriez voir :
- `status: online` dans `pm2 status`
- `🚀 Serveur démarré sur 127.0.0.1:5000` dans les logs
- `{"status":"OK","timestamp":"..."}` lors du test curl

---

## 🔧 Si le Problème Persiste

### Option 1 : Utiliser un Port Différent

Modifiez le fichier `.env` :

```bash
cd ~/fouta-erp/backend
nano .env
```

Changez :
```
PORT=30000
```

Puis redémarrez :
```bash
pm2 restart fouta-api
```

### Option 2 : Vérifier les Ports Disponibles

```bash
# Voir les ports utilisés
netstat -tuln | grep LISTEN

# Utiliser un port libre (30000-65535)
```

---

## 📋 Checklist

- [ ] Code mis à jour (`git pull`)
- [ ] Application redémarrée (`pm2 restart`)
- [ ] Statut `online` dans PM2
- [ ] Logs sans erreur
- [ ] API répond (`curl http://localhost:5000/health`)

---

## 🎉 Après Succès

L'application sera accessible via :
- **Local** : `http://localhost:5000`
- **Domaine** : Nécessite configuration Nginx/proxy OVH pour `https://fabrication.laplume-artisanale.tn`

---

## 💡 Note

Sur hébergement partagé OVH, l'application écoute sur `localhost` uniquement. Pour l'exposer publiquement, configurez un reverse proxy via le panneau OVH.

