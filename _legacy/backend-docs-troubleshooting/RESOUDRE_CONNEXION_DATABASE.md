# 🔧 Résoudre la Connexion à la Base de Données

## ❌ Problème

```
Error: P1001: Can't reach database server at `sh131616-002.eu.clouddb.ovh.net:35392`
```

## 🔍 Diagnostic

### 1. Vérifier que l'IP de votre PC est autorisée

**Dans PostgreSQL OVH, vous devez autoriser l'IP de votre PC.**

1. Connectez-vous à votre espace client OVH
2. Allez dans **Web Cloud Databases** → Votre base PostgreSQL
3. Section **Utilisateurs et autorisations**
4. Vérifiez que l'IP de votre PC est dans la liste des IP autorisées

**Trouver votre IP publique :**
```powershell
# Ouvrir dans le navigateur
# https://www.whatismyip.com/
# Ou utiliser cette commande PowerShell
Invoke-RestMethod -Uri "https://api.ipify.org?format=json"
```

### 2. Tester la connexion avec psql

**Installer PostgreSQL client (si pas déjà installé) :**
- Télécharger : https://www.postgresql.org/download/windows/
- Ou utiliser pgAdmin

**Tester la connexion :**
```powershell
# Remplacer par votre IP publique
$env:PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume
```

Si cela fonctionne avec `psql`, le problème vient de Prisma. Si cela ne fonctionne pas, c'est un problème d'accès réseau.

---

## ✅ Solutions

### Solution 1 : Utiliser la Base de Données Existante (Recommandé pour commencer)

Au lieu de créer de nouvelles tables avec Prisma, utilisons les tables existantes créées par les scripts SQL.

**Modifier le schéma Prisma pour utiliser les tables existantes :**

```prisma
// Dans prisma/schema.prisma
model User {
  id_utilisateur    Int      @id @map("id_utilisateur")
  nom_utilisateur   String   @map("nom_utilisateur")
  email             String   @unique @map("email")
  mot_de_passe_hash String   @map("mot_de_passe_hash")
  salt              String?  @map("salt")
  id_operateur      Int?     @map("id_operateur")
  derniere_connexion DateTime? @map("derniere_connexion")
  actif             Boolean  @default(true) @map("actif")
  createdAt         DateTime @default(now()) @map("date_creation")
  updatedAt         DateTime @updatedAt @map("date_modification")

  @@map("utilisateurs")
}
```

**Mais c'est complexe...** Mieux vaut utiliser l'approche hybride ci-dessous.

### Solution 2 : Approche Hybride (Recommandée)

**Utiliser Prisma pour les nouvelles tables, et pg (pool) pour les tables existantes.**

1. **Garder l'authentification avec les tables existantes** (utilisateurs, roles)
2. **Utiliser Prisma pour les nouvelles fonctionnalités** (quand on les ajoutera)

**Modifier `auth.controller.js` pour utiliser pg au lieu de Prisma :**

```javascript
// Utiliser pool au lieu de prisma pour l'authentification
import { pool } from '../utils/db.js';
```

### Solution 3 : Configurer l'Accès PostgreSQL OVH

**Si vous voulez vraiment utiliser Prisma avec la base distante :**

1. **Autoriser votre IP dans OVH :**
   - Espace client OVH → Web Cloud Databases
   - Votre base PostgreSQL → Utilisateurs et autorisations
   - Ajouter votre IP publique

2. **Vérifier le firewall Windows :**
   ```powershell
   # Vérifier que le port 35392 n'est pas bloqué
   Test-NetConnection -ComputerName sh131616-002.eu.clouddb.ovh.net -Port 35392
   ```

3. **Vérifier le firewall OVH :**
   - Dans l'espace client OVH, vérifier les règles de firewall

---

## 🚀 Solution Immédiate : Utiliser les Tables Existantes

**Pour continuer rapidement, modifions l'authentification pour utiliser les tables existantes :**

### Étape 1 : Vérifier que les tables existent

Connectez-vous à la base de données et vérifiez :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('utilisateurs', 'roles', 'utilisateurs_roles');
```

### Étape 2 : Modifier auth.controller.js

Utiliser `pool` au lieu de `prisma` pour l'authentification.

---

## 📝 Recommandation

**Pour le développement local, je recommande :**

1. **Option A :** Installer PostgreSQL localement
   - Plus rapide pour le développement
   - Pas de problème de connexion réseau
   - Données isolées

2. **Option B :** Utiliser les tables existantes avec pg
   - Pas besoin de Prisma pour l'authentification
   - Utiliser Prisma seulement pour les nouveaux modules

Quelle option préférez-vous ?
