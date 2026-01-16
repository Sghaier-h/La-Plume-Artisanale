# 🔍 Vérification du Trust Proxy

## 🎯 Objectif

Vérifier que le `trust proxy` fonctionne correctement et que le rate limiting utilise la **vraie IP du client** (et pas l'IP de Nginx).

---

## 📤 Étape 1 : Transférer le fichier avec l'endpoint debug

### Via FileZilla

1. **Ouvrir FileZilla**
2. **Se connecter au VPS** :
   - Hôte : `137.74.40.191`
   - Utilisateur : `ubuntu`
   - Port : `22`
   - Protocole : `SFTP`
3. **Naviguer vers** : `/opt/fouta-erp/backend/src/`
4. **Transférer** : `server.js` (remplacer l'ancien fichier)

### Via SCP (PowerShell)

```powershell
scp "D:\OneDrive - FLYING TEX\PROJET\backend\src\server.js" ubuntu@137.74.40.191:/opt/fouta-erp/backend/src/server.js
```

---

## 🔄 Étape 2 : Redémarrer l'application

### Se connecter au VPS

```bash
ssh ubuntu@137.74.40.191
```

### Redémarrer PM2

```bash
cd /opt/fouta-erp/backend
pm2 restart fouta-api
```

### Vérifier le statut

```bash
pm2 status
```

**Doit afficher** : `fouta-api (online)`

---

## ✅ Étape 3 : Tester l'endpoint debug

### Depuis le VPS

```bash
curl https://fabrication.laplume-artisanale.tn/debug/ip
```

### Depuis PowerShell (depuis votre machine)

```powershell
curl.exe https://fabrication.laplume-artisanale.tn/debug/ip
```

---

## 🔍 Étape 4 : Analyser les résultats

### ✅ Résultat attendu (CORRECT)

```json
{
  "ip": "VOTRE_IP_PUBLIQUE",
  "ips": ["VOTRE_IP_PUBLIQUE"],
  "xff": "VOTRE_IP_PUBLIQUE"
}
```

**Exemple** :
```json
{
  "ip": "41.xxx.xxx.xxx",
  "ips": ["41.xxx.xxx.xxx"],
  "xff": "41.xxx.xxx.xxx"
}
```

👉 **Si vous voyez votre IP publique** → ✅ **Parfait !** Le trust proxy fonctionne correctement.

---

### ❌ Résultat incorrect (À CORRIGER)

```json
{
  "ip": "127.0.0.1",
  "ips": [],
  "xff": "VOTRE_IP_PUBLIQUE"
}
```

**OU**

```json
{
  "ip": "10.0.0.xxx",
  "ips": ["10.0.0.xxx"],
  "xff": "VOTRE_IP_PUBLIQUE"
}
```

👉 **Si vous voyez `127.0.0.1` ou une IP privée** → ❌ **Problème !** Il faut ajuster Nginx.

---

## 🔧 Correction si problème détecté

### Vérifier la configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/fabrication
```

### Vérifier que ces lignes sont présentes

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

### Recharger Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Retester

```bash
curl https://fabrication.laplume-artisanale.tn/debug/ip
```

---

## 🗑️ Étape 5 : Supprimer l'endpoint debug (après vérification)

### Modifier server.js

Supprimer ces lignes dans `backend/src/server.js` :

```javascript
// Debug IP (TEMPORAIRE - à supprimer après vérification)
app.get('/debug/ip', (req, res) => {
  res.json({
    ip: req.ip,
    ips: req.ips,
    xff: req.headers['x-forwarded-for'] || null
  });
});
```

### Retransférer et redémarrer

```bash
# Sur le VPS
cd /opt/fouta-erp/backend
pm2 restart fouta-api
```

---

## 🔄 Gestion du Reboot Ubuntu

### Avant le reboot (si message Ubuntu)

```bash
# Vérifier que PM2 est configuré pour démarrer au boot
pm2 startup

# Sauvegarder la liste des processus
pm2 save
```

### Effectuer le reboot

```bash
sudo reboot
```

### Après reconnexion

```bash
# Se reconnecter au VPS
ssh ubuntu@137.74.40.191

# Vérifier que PM2 a redémarré les processus
pm2 status

# Doit afficher : fouta-api (online)
```

### Si PM2 n'a pas redémarré

```bash
# Redémarrer manuellement
cd /opt/fouta-erp/backend
pm2 start index.js --name fouta-api
pm2 save
```

---

## 📋 Checklist de vérification

- [ ] Fichier `server.js` transféré avec l'endpoint `/debug/ip`
- [ ] PM2 redémarré : `pm2 restart fouta-api`
- [ ] Test effectué : `curl https://fabrication.laplume-artisanale.tn/debug/ip`
- [ ] IP publique visible dans la réponse (pas `127.0.0.1`)
- [ ] Endpoint debug supprimé après vérification
- [ ] PM2 configuré pour le boot : `pm2 startup` et `pm2 save`

---

## ✅ Résultat Final

Après ces vérifications, vous êtes sûr que :
- ✅ Le `trust proxy` fonctionne correctement
- ✅ Le rate limiting utilise la vraie IP du client
- ✅ Nginx transmet correctement les headers
- ✅ PM2 redémarrera automatiquement après un reboot

---

## 🎯 Commandes Rapides

```bash
# Test debug
curl https://fabrication.laplume-artisanale.tn/debug/ip

# Vérifier PM2
pm2 status
pm2 logs fouta-api --lines 5

# Configurer PM2 pour le boot
pm2 startup
pm2 save
```

