# ✅ Solution : Tunnel SSH sur Port 5433

## 🎯 Solution Rapide

Le port 5432 nécessite des privilèges administrateur. Utilisons le port 5433.

---

## 🚀 Étapes

### 1. Créer le Tunnel SSH

**Dans un terminal PowerShell (laisser ouvert) :**

```powershell
ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Entrer votre mot de passe SSH pour le VPS.**

**⚠️ Important :** Laissez ce terminal ouvert pendant que vous développez.

---

### 2. Modifier le fichier `.env`

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
notepad .env
```

**Modifier ces deux lignes :**

```env
# AVANT
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392

# APRÈS (via tunnel SSH)
DB_HOST=localhost
DB_PORT=5433
```

**Sauvegarder le fichier.**

---

### 3. Tester la Connexion

```powershell
npm run test:db
```

**Résultat attendu :**
```
✅ Connexion réussie !
✅ Requête réussie !
✅ Tables trouvées
✅ Utilisateurs trouvés
```

---

### 4. Démarrer le Backend

**Dans un nouveau terminal :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm run dev
```

**Vous devriez voir :**
```
✅ Connecté à PostgreSQL
🚀 Serveur démarré sur le port 5000
```

---

## ✅ Checklist

- [ ] Tunnel SSH créé sur port 5433 et actif
- [ ] Fichier `.env` modifié (DB_HOST=localhost, DB_PORT=5433)
- [ ] Test de connexion réussi (`npm run test:db`)
- [ ] Backend démarre sans erreur

---

## 🆘 Si le Port 5433 est aussi Bloqué

**Utiliser un autre port (5434, 5435, etc.) :**

```powershell
# Tunnel SSH sur port 5434
ssh -L 5434:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
```

**Puis modifier `.env` :**

```env
DB_PORT=5434
```

---

**🎯 Utilisez le port 5433 pour éviter les problèmes de permissions !**
