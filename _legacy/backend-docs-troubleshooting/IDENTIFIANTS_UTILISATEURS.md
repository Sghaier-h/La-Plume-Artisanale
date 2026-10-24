# 🔐 Identifiants Utilisateurs - Guide d'Authentification

**Date :** 20 janvier 2026  
**Version :** 1.0

---

## 📋 Identifiants Mock (Mode Développement)

Le système dispose d'utilisateurs **mock** pour les tests en mode développement. Ces identifiants fonctionnent **sans base de données**.

### 👤 Administrateur (Recommandé pour les tests)

**Email :** `admin@system.local`  
**Mot de passe :** `Admin123!`  
**Rôle :** ADMIN  
**Accès :** Tous les modules Odoo

---

### 👥 Autres Utilisateurs Mock

#### 1. Chef de Production
- **Email :** `chef.production@entreprise.local`
- **Mot de passe :** `User123!`
- **Rôle :** CHEF_PRODUCTION

#### 2. Tisseur
- **Email :** `tisseur@entreprise.local`
- **Mot de passe :** `User123!`
- **Rôle :** TISSEUR

#### 3. Magasinier MP
- **Email :** `magasinier.mp@entreprise.local`
- **Mot de passe :** `User123!`
- **Rôle :** MAGASINIER

#### 4. Coupeur
- **Email :** `coupeur@entreprise.local`
- **Mot de passe :** `User123!`
- **Rôle :** COUPEUR

#### 5. Contrôleur Qualité
- **Email :** `controleur.qualite@entreprise.local`
- **Mot de passe :** `User123!`
- **Rôle :** CONTROLEUR_QUALITE

#### 6. Commercial
- **Email :** `commercial@entreprise.local`
- **Mot de passe :** `User123!`
- **Rôle :** COMMERCIAL

---

## 🗄️ Identifiants Base de Données (Mode Production)

Si vous êtes en mode **production** ou que la base de données est configurée, vous devez utiliser les identifiants de la table `utilisateurs`.

### Comment Trouver vos Identifiants dans la Base de Données

#### Via pgAdmin :

```sql
-- Lister tous les utilisateurs actifs
SELECT 
    id_utilisateur,
    email,
    nom_utilisateur,
    actif,
    date_creation
FROM utilisateurs
WHERE actif = true
ORDER BY date_creation DESC;
```

#### Via psql :

```bash
psql -h localhost -p 5433 -U Aviateur -d ERP_La_Plume

# Puis dans psql :
SELECT email, nom_utilisateur, actif FROM utilisateurs WHERE actif = true;
```

---

## 🧪 Utilisation avec le Script Automatique

### Option 1 : Utiliser les Identifiants Mock (Recommandé)

Quand le script vous demande vos identifiants :

```powershell
Email: admin@system.local
Mot de passe: Admin123!
```

### Option 2 : Utiliser vos Identifiants Base de Données

Si vous avez créé un utilisateur dans la base de données :

```powershell
Email: votre_email@example.com
Mot de passe: votre_mot_de_passe
```

---

## 🔧 Créer un Utilisateur dans la Base de Données

Si vous n'avez pas d'utilisateur dans la base de données, vous pouvez en créer un :

### Via SQL Directement

```sql
-- Hasher le mot de passe avec bcrypt (utiliser un outil en ligne ou Node.js)
-- Exemple : mot de passe "Admin123!" hashé en bcrypt

INSERT INTO utilisateurs (
    email,
    mot_de_passe_hash,
    nom_utilisateur,
    actif,
    date_creation
) VALUES (
    'admin@example.com',
    '$2b$10$votre_hash_bcrypt_ici',  -- Remplacer par le hash réel
    'Admin',
    true,
    CURRENT_TIMESTAMP
);

-- Attribuer le rôle ADMIN
INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
SELECT u.id_utilisateur, r.id_role
FROM utilisateurs u, roles r
WHERE u.email = 'admin@example.com'
  AND r.code_role = 'ADMIN';
```

### Via l'API (si disponible)

```bash
curl -X POST http://localhost:5000/api/utilisateurs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN" \
  -d '{
    "email": "nouveau@example.com",
    "password": "MotDePasse123!",
    "nom_utilisateur": "Nouveau",
    "role": "ADMIN"
  }'
```

---

## ✅ Mode Développement vs Production

### Mode Développement (USE_MOCK_AUTH=true ou NODE_ENV=development)

- ✅ Utilise les utilisateurs mock
- ✅ Pas besoin de base de données
- ✅ Fonctionne immédiatement
- ✅ Utilise : `admin@system.local` / `Admin123!`

### Mode Production (Base de Données)

- ✅ Utilise les utilisateurs de la base de données
- ✅ Nécessite une connexion PostgreSQL
- ✅ Mots de passe hashés avec bcrypt ou crypt()
- ✅ Utilise les emails de votre table `utilisateurs`

---

## 🎯 Recommandation pour les Tests

**Pour tester rapidement les API Odoo, utilisez :**

```
Email: admin@system.local
Mot de passe: Admin123!
```

Ces identifiants fonctionnent en mode développement **même sans base de données**.

---

## 🔍 Vérifier le Mode Actuel

Le serveur affiche dans les logs au démarrage :

```
📊 Configuration base de données:
   Host: localhost
   Port: 5433
   ...
```

Si `USE_MOCK_AUTH=true` est défini ou si `NODE_ENV=development`, le mode mock est actif.

---

## 📝 Notes Importantes

1. **Sécurité :** Les utilisateurs mock ne doivent **jamais** être utilisés en production
2. **Mots de passe :** En production, les mots de passe sont hashés (bcrypt ou crypt())
3. **Rôles :** Chaque utilisateur a des permissions selon son rôle
4. **Token :** Les tokens sont valides pendant 24h par défaut

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0
