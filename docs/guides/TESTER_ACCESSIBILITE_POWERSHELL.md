# 🧪 Tester l'Accessibilité depuis PowerShell

## ⚠️ Problème avec curl dans PowerShell

Dans PowerShell, `curl` est un alias pour `Invoke-WebRequest`, ce qui cause des erreurs.

---

## ✅ Solutions pour Tester

### Option 1 : Utiliser curl.exe (Recommandé)

```powershell
# Utiliser curl.exe au lieu de curl
curl.exe -I http://137.74.40.191

# Tester avec le domaine (si DNS configuré)
curl.exe -I http://fabrication.laplume-artisanale.tn

# Tester le endpoint health
curl.exe http://137.74.40.191/health
```

### Option 2 : Utiliser Invoke-WebRequest

```powershell
# Tester avec Invoke-WebRequest
Invoke-WebRequest -Uri http://137.74.40.191 -Method Head

# Tester le endpoint health
Invoke-WebRequest -Uri http://137.74.40.191/health

# Voir seulement le contenu
(Invoke-WebRequest -Uri http://137.74.40.191/health).Content
```

### Option 3 : Utiliser wget (si disponible)

```powershell
# Tester avec wget
wget -Method Head http://137.74.40.191

# Tester le endpoint health
wget http://137.74.40.191/health
```

---

## 🔍 Vérifier le DNS

### Depuis PowerShell

```powershell
# Vérifier le DNS avec nslookup
nslookup fabrication.laplume-artisanale.tn

# Doit retourner : 137.74.40.191
```

### Si le DNS n'est pas Configuré

**Dans le Panneau OVH** :

1. **Se connecter** à https://www.ovh.com/manager/
2. **Domaines** → `laplume-artisanale.tn` → **Zone DNS**
3. **Ajouter une entrée** :
   - **Type** : A
   - **Sous-domaine** : `fabrication`
   - **Cible** : `137.74.40.191`
   - **TTL** : 3600
4. **Sauvegarder**

**Attendre 15-30 minutes** pour la propagation DNS.

---

## 🧪 Tests à Effectuer

### 1. Tester l'IP Directement

```powershell
# Tester HTTP
curl.exe -I http://137.74.40.191

# Doit retourner : HTTP/1.1 200 OK ou 502 Bad Gateway

# Tester le endpoint health
curl.exe http://137.74.40.191/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

### 2. Tester avec le Domaine (si DNS configuré)

```powershell
# Vérifier d'abord le DNS
nslookup fabrication.laplume-artisanale.tn

# Si le DNS est configuré, tester
curl.exe -I http://fabrication.laplume-artisanale.tn

# Tester le endpoint health
curl.exe http://fabrication.laplume-artisanale.tn/health
```

### 3. Tester HTTPS (après SSL)

```powershell
# Tester HTTPS
curl.exe -I https://fabrication.laplume-artisanale.tn/health

# Doit retourner : HTTP/2 200
```

---

## 📋 Interprétation des Résultats

### HTTP/1.1 200 OK
✅ **Nginx fonctionne** et répond correctement.

### HTTP/1.1 502 Bad Gateway
⚠️ **Nginx fonctionne** mais ne peut pas joindre l'application Node.js.
- Vérifier que PM2 est actif : `pm2 status`
- Vérifier que l'application écoute sur le port 5000

### Connection refused
❌ **Le serveur ne répond pas** sur le port 80.
- Vérifier le firewall OVH dans le panneau
- Vérifier que Nginx est actif : `sudo systemctl status nginx`

### DNS resolution failed
❌ **Le DNS n'est pas configuré** ou pas encore propagé.
- Configurer le DNS dans le panneau OVH
- Attendre 15-30 minutes

---

## ✅ Checklist

- [ ] DNS configuré : `nslookup fabrication.laplume-artisanale.tn` → `137.74.40.191`
- [ ] Serveur accessible : `curl.exe -I http://137.74.40.191` → `HTTP/1.1 200 OK`
- [ ] Application répond : `curl.exe http://137.74.40.191/health` → `{"status":"OK"}`
- [ ] Domaine accessible : `curl.exe -I http://fabrication.laplume-artisanale.tn` → `HTTP/1.1 200 OK`

---

## 🚀 Après Vérification

Une fois que tout fonctionne :

1. **Réessayer Certbot** :
   ```bash
   sudo certbot --nginx -d fabrication.laplume-artisanale.tn
   ```

2. **Tester HTTPS** :
   ```powershell
   curl.exe https://fabrication.laplume-artisanale.tn/health
   ```

---

## ✅ Résumé

**Dans PowerShell, utilisez `curl.exe` au lieu de `curl` !**

```powershell
# Tester l'IP
curl.exe -I http://137.74.40.191

# Tester le health endpoint
curl.exe http://137.74.40.191/health

# Vérifier le DNS
nslookup fabrication.laplume-artisanale.tn
```

