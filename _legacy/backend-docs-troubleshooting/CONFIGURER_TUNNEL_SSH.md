# 🔗 Configurer un Tunnel SSH pour PostgreSQL

## 🎯 Pourquoi un Tunnel SSH ?

Si votre PC ne peut pas se connecter directement à PostgreSQL OVH (timeout), utilisez un tunnel SSH via votre VPS pour contourner le problème.

---

## 🚀 Solution Rapide

### Étape 1 : Créer le Tunnel SSH

**⚠️ Important : Utiliser le port 5433 au lieu de 5432 pour éviter les problèmes de permissions.**

**Option A : Script automatique**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
.\tunnel-ssh.ps1
```

**Option B : Commande manuelle (Recommandé)**

```powershell
# Dans un terminal séparé (laisser ouvert)
# Utiliser le port 5433 au lieu de 5432
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**💡 Pourquoi 5433 ?**
- Le port 5432 nécessite souvent des privilèges administrateur
- Le port 5433 est libre et n'a pas besoin de permissions spéciales

**⚠️ Important :** Laissez ce terminal ouvert pendant que vous développez. Le tunnel restera actif tant que ce terminal est ouvert.

### Étape 2 : Modifier le fichier `.env`

**Modifier le fichier `.env` pour utiliser localhost :**

```powershell
notepad .env
```

**Changer :**

```env
# AVANT (ne fonctionne pas)
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392

# APRÈS (via tunnel SSH sur port 5433)
DB_HOST=localhost
DB_PORT=5433
```

**Garder le reste identique :**

```env
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
```

### Étape 3 : Tester la Connexion

```powershell
npm run test:db
```

**Résultat attendu :**
```
✅ Connexion réussie !
✅ Requête réussie !
✅ Tables trouvées
```

### Étape 4 : Démarrer le Backend

**Dans un nouveau terminal :**

```powershell
npm run dev
```

---

## 📋 Workflow Complet

**Terminal 1 : Tunnel SSH (laisser ouvert)**

```powershell
ssh -L 5432:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Terminal 2 : Backend**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm run dev
```

**Terminal 3 : Frontend (optionnel)**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
```

---

## ✅ Vérifications

### Vérifier que le tunnel fonctionne

```powershell
# Dans un nouveau terminal
Test-NetConnection -ComputerName localhost -Port 5432
```

**Résultat attendu :** `TcpTestSucceeded: True`

### Tester la connexion PostgreSQL via le tunnel

```powershell
$env:PGPASSWORD="Allbyfouta007"
psql -h localhost -p 5432 -U Aviateur -d ERP_La_Plume -c "SELECT NOW();"
```

---

## 🆘 Problèmes Courants

### Erreur : "Permission denied (publickey)"

**Solution :** Configurer la clé SSH

```powershell
# Générer une clé SSH si nécessaire
ssh-keygen -t rsa -b 4096

# Copier la clé publique au VPS
ssh-copy-id ubuntu@137.74.40.191
```

### Erreur : "Port 5432 already in use"

**Solution :** Utiliser un autre port local

```powershell
# Utiliser le port 5433 au lieu de 5432
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Puis modifier `.env` :**

```env
DB_PORT=5433
```

### Le tunnel se ferme tout seul

**Solution :** Utiliser l'option `-o ServerAliveInterval=60`

```powershell
ssh -L 5432:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N -o ServerAliveInterval=60
```

---

## 🔄 Alternative : Utiliser putty (Windows)

**Si vous préférez utiliser PuTTY :**

1. **Télécharger PuTTY :** https://www.putty.org/
2. **Configuration :**
   - Host: `137.74.40.191`
   - Port: `22`
   - Connection type: `SSH`
3. **Tunnel :**
   - Connection → SSH → Tunnels
   - Source port: `5432`
   - Destination: `sh131616-002.eu.clouddb.ovh.net:35392`
   - Type: `Local`
   - Cliquer sur "Add"
4. **Se connecter**

---

## ✅ Checklist

- [ ] Tunnel SSH créé et actif
- [ ] Fichier `.env` modifié (DB_HOST=localhost, DB_PORT=5432)
- [ ] Test de connexion réussi (`npm run test:db`)
- [ ] Backend démarre sans erreur (`npm run dev`)

---

## 📚 Prochaines Étapes

Une fois le tunnel SSH configuré et testé :

1. ✅ Tester l'authentification
2. ✅ Continuer avec le développement
3. ✅ Démarrer le frontend

---

**🎯 Commencez par créer le tunnel SSH, puis testez la connexion !**
