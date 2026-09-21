# 🔐 Instructions : Mot de Passe PostgreSQL

## 🎯 Problème

PostgreSQL nécessite un mot de passe pour créer la base de données locale.

---

## ✅ Solutions

### Solution 1 : Trouver votre mot de passe

Si vous avez déjà configuré PostgreSQL, le mot de passe peut être :
- Dans un fichier de configuration
- Dans votre mémoire 😊
- Dans un gestionnaire de mots de passe

**Tester avec le script :**

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File trouver-mot-de-passe-postgres.ps1
```

---

### Solution 2 : Réinitialiser le mot de passe

#### Avec pgAdmin (Interface graphique)

1. Ouvrez **pgAdmin**
2. Connectez-vous au serveur PostgreSQL
3. Clic droit sur **Login/Group Roles** → **postgres** → **Properties**
4. Onglet **Definition** → Entrez un nouveau mot de passe
5. Cliquez **Save**

#### Avec psql (Ligne de commande)

```bash
# Se connecter (si vous avez encore accès)
psql -U postgres

# Ou si vous êtes administrateur Windows
psql -U votre_utilisateur_windows

# Dans psql, exécutez :
ALTER USER postgres PASSWORD 'nouveau_mot_de_passe';
\q
```

#### Avec Windows (si vous êtes admin)

```powershell
# Trouver le service PostgreSQL
Get-Service | Where-Object { $_.Name -like "*postgres*" }

# Arrêter le service
Stop-Service -Name "postgresql-x64-XX"  # Remplacez XX par votre version

# Modifier pg_hba.conf temporairement
# Trouvez le fichier (généralement dans C:\Program Files\PostgreSQL\XX\data\)
# Changez 'md5' en 'trust' pour localhost
# Redémarrez le service
Start-Service -Name "postgresql-x64-XX"

# Connectez-vous sans mot de passe et changez-le
psql -U postgres
ALTER USER postgres PASSWORD 'nouveau_mot_de_passe';
\q

# Remettez 'trust' en 'md5' dans pg_hba.conf
# Redémarrez le service
```

---

### Solution 3 : Utiliser un autre utilisateur

Si vous avez créé un autre utilisateur PostgreSQL :

```powershell
# Modifier le script pour utiliser cet utilisateur
$env:DB_USER = "votre_utilisateur"
$env:DB_PASSWORD = "votre_mot_de_passe"
node creer-base-locale-node.js
```

---

### Solution 4 : Configuration trust (Développement uniquement)

⚠️ **ATTENTION :** Cette méthode désactive l'authentification par mot de passe pour localhost. **À utiliser uniquement en développement local !**

1. **Trouver pg_hba.conf :**
   ```powershell
   # Généralement dans :
   # C:\Program Files\PostgreSQL\XX\data\pg_hba.conf
   ```

2. **Ouvrir le fichier** (en tant qu'administrateur)

3. **Trouver la ligne :**
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            md5
   ```

4. **Changer `md5` en `trust` :**
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            trust
   ```

5. **Redémarrer PostgreSQL :**
   ```powershell
   Restart-Service -Name "postgresql-x64-XX"
   ```

6. **Créer la base :**
   ```powershell
   $env:DB_PASSWORD = ""
   node creer-base-locale-node.js
   ```

---

## 🚀 Après avoir configuré le mot de passe

### Option A : Avec variable d'environnement

```powershell
cd backend
$env:DB_PASSWORD = "votre_mot_de_passe"
node creer-base-locale-node.js
```

### Option B : Avec fichier .env.local

Modifiez `.env.local` :

```env
DB_PASSWORD=votre_mot_de_passe
```

Puis :

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1
node creer-base-locale-node.js
```

---

## 📝 Vérification

Après avoir créé la base, testez :

```bash
node test-connexion-simple.js
```

**Résultat attendu :** `✅ Port 5432: CONNEXION RÉUSSIE`

---

## 💡 Astuce

Pour éviter de retaper le mot de passe à chaque fois, créez un fichier `.env.local` avec :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ERP_La_Plume_Local
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
```

Puis utilisez toujours :

```powershell
powershell -ExecutionPolicy Bypass -File basculer-env-local.ps1
```

---

**Document créé le :** 20 janvier 2026
