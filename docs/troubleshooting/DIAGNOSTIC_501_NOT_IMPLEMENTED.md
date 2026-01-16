# 🔍 Diagnostic : Erreur 501 Not Implemented

## ❌ Erreur Détectée

```
curl https://fabrication.laplume-artisanale.tn/health
501 Not Implemented
GET not supported for current URL.
```

**Problème** : Le domaine pointe peut-être encore vers l'ancien serveur OVH shared hosting.

---

## ✅ Solution : Utiliser curl.exe dans PowerShell

### Dans PowerShell, Utiliser curl.exe

```powershell
# Utiliser curl.exe au lieu de curl
curl.exe https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

---

## 🔍 Vérifier le DNS

### Depuis PowerShell

```powershell
# Vérifier le DNS
nslookup fabrication.laplume-artisanale.tn

# Doit retourner : 137.74.40.191 (IP du VPS)
# Si retourne : 145.239.37.162 → DNS pointe vers l'ancien serveur
```

### Si le DNS Pointe Vers l'Ancien Serveur

**Dans le Panneau OVH** :

1. **Se connecter** à https://www.ovh.com/manager/
2. **Domaines** → `laplume-artisanale.tn` → **Zone DNS**
3. **Modifier l'entrée A** pour `fabrication` :
   - **Cible** : `137.74.40.191` (au lieu de `145.239.37.162`)
4. **Sauvegarder**

**Attendre 15-30 minutes** pour la propagation DNS.

---

## 🧪 Tester Depuis le VPS

### Sur le VPS

```bash
# Tester localement
curl http://localhost:5000/health

# Doit retourner : {"status":"OK","timestamp":"..."}

# Tester via Nginx (HTTP)
curl http://localhost/health

# Doit retourner : {"status":"OK","timestamp":"..."} ou 404 (normal si configuré pour le domaine)

# Tester via HTTPS avec le domaine
curl https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

---

## 🔍 Vérifier Nginx

### Sur le VPS

```bash
# Vérifier que Nginx est actif
sudo systemctl status nginx

# Doit afficher : active (running)

# Voir la configuration
cat /etc/nginx/sites-available/fabrication

# Tester la configuration
sudo nginx -t

# Doit afficher : syntax is ok
```

---

## 🔍 Vérifier l'Application

### Sur le VPS

```bash
# Vérifier que PM2 est actif
pm2 status

# Doit afficher : fouta-api (online)

# Voir les logs
pm2 logs fouta-api --lines 10

# Doit afficher : 🚀 Serveur démarré sur le port 5000
```

---

## 📋 Tests à Effectuer

### Depuis PowerShell (Utiliser curl.exe)

```powershell
# 1. Vérifier le DNS
nslookup fabrication.laplume-artisanale.tn

# 2. Tester l'IP directement
curl.exe http://137.74.40.191/health

# Doit retourner : {"status":"OK","timestamp":"..."}

# 3. Tester HTTPS avec le domaine
curl.exe https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

### Depuis le VPS

```bash
# 1. Tester l'application directement
curl http://localhost:5000/health

# 2. Tester via Nginx
curl http://localhost/health

# 3. Tester HTTPS
curl https://fabrication.laplume-artisanale.tn/health
```

---

## 📋 Checklist

- [ ] DNS vérifié : `nslookup fabrication.laplume-artisanale.tn` → `137.74.40.191`
- [ ] Application fonctionne : `curl http://localhost:5000/health` (sur le VPS)
- [ ] Nginx actif : `sudo systemctl status nginx`
- [ ] PM2 actif : `pm2 status`
- [ ] Testé avec curl.exe : `curl.exe https://fabrication.laplume-artisanale.tn/health`

---

## ✅ Résumé

1. **Utiliser curl.exe** : `curl.exe` au lieu de `curl` dans PowerShell
2. **Vérifier le DNS** : `nslookup fabrication.laplume-artisanale.tn` → `137.74.40.191`
3. **Tester l'IP directement** : `curl.exe http://137.74.40.191/health`
4. **Tester le domaine** : `curl.exe https://fabrication.laplume-artisanale.tn/health`

**Si le DNS pointe vers l'ancien serveur, corrigez-le dans le panneau OVH !**

