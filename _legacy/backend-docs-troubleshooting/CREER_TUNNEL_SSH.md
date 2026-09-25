# 🔗 Créer un Tunnel SSH - Solution Rapide

## ❌ Problème

```
bind [127.0.0.1]:5432: Permission denied
```

**Le port 5432 nécessite des privilèges administrateur ou est déjà utilisé.**

---

## ✅ Solution : Utiliser un Autre Port

**Utiliser le port 5433 au lieu de 5432 :**

### Étape 1 : Créer le Tunnel SSH

```powershell
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**⚠️ Important :** Laissez ce terminal ouvert pendant que vous développez.

### Étape 2 : Modifier le fichier `.env`

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
notepad .env
```

**Changer ces lignes :**

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
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
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
Test-NetConnection -ComputerName localhost -Port 5433
```

**Résultat attendu :** `TcpTestSucceeded: True`

### Tester la connexion PostgreSQL via le tunnel

```powershell
$env:PGPASSWORD="Allbyfouta007"
psql -h localhost -p 5433 -U Aviateur -d ERP_La_Plume -c "SELECT NOW();"
```

---

## 🔄 Alternative : Script Automatique

**J'ai mis à jour le script `tunnel-ssh.ps1` pour utiliser le port 5433.**

**Exécuter :**

```powershell
.\tunnel-ssh.ps1
```

**Puis modifier le `.env` pour utiliser le port 5433.**

---

## ✅ Checklist

- [ ] Tunnel SSH créé sur le port 5433
- [ ] Fichier `.env` modifié (DB_HOST=localhost, DB_PORT=5433)
- [ ] Test de connexion réussi (`npm run test:db`)
- [ ] Backend démarre sans erreur (`npm run dev`)

---

**🎯 Utilisez le port 5433 au lieu de 5432 pour éviter les problèmes de permissions !**
