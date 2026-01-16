# 🔐 UTILISATEURS POUR LA CONNEXION

## 🚀 Mode Staging (Développement)

En mode staging, l'authentification fonctionne en mode **MOCK** (simulé). Vous pouvez vous connecter avec les identifiants suivants :

### 👤 Compte Administrateur (Recommandé)

**Email :** `admin@system.local`  
**Mot de passe :** `Admin123!`  
**Rôle :** ADMIN

**Accès :** Tous les modules et fonctionnalités

---

## 📋 Autres Comptes de Test (Si Base de Données Configurée)

Si vous avez configuré PostgreSQL et appliqué les scripts SQL, vous pouvez utiliser ces comptes :

### 👥 Comptes Disponibles

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| **Administrateur** | `admin@system.local` | `Admin123!` | Tous les modules |
| **Chef de Production** | `chef.production@entreprise.local` | `User123!` | Production, Planning, Maintenance |
| **Tisseur** | `tisseur@entreprise.local` | `User123!` | Interface Tisseur, Tâches |
| **Magasinier MP** | `magasinier.mp@entreprise.local` | `User123!` | Stock, Préparations |
| **Coupeur** | `coupeur@entreprise.local` | `User123!` | Interface Coupeur, Tâches |
| **Contrôleur Qualité** | `controleur.qualite@entreprise.local` | `User123!` | Contrôle Qualité, Non-conformités |
| **Commercial** | `commercial@entreprise.local` | `User123!` | Ventes, Clients, Devis |

---

## 🔑 Connexion Rapide

### Étape 1 : Accéder à l'application

Ouvrez votre navigateur et allez à :
**http://localhost:3000**

### Étape 2 : Se connecter

Sur la page de connexion, entrez :

```
Email : admin@system.local
Mot de passe : Admin123!
```

### Étape 3 : Cliquer sur "Se connecter"

Vous serez automatiquement redirigé vers le Dashboard.

---

## ⚙️ Mode Mock vs Production

### Mode Mock (Staging - Actuel)

- ✅ **Pas besoin de base de données**
- ✅ **Authentification simulée**
- ✅ **Données mockées pour tests**
- ✅ **Parfait pour développement**

**Identifiants :**
- Email : `admin@system.local`
- Mot de passe : `Admin123!`

### Mode Production (Avec Base de Données)

- ✅ **Vraie authentification**
- ✅ **Vraies données**
- ✅ **Utilisateurs depuis la base**

**Pour activer :**
1. Configurer PostgreSQL
2. Appliquer les scripts SQL
3. Créer les utilisateurs dans la base
4. Désactiver `USE_MOCK_AUTH=false` dans `.env`

---

## 🛠️ Créer des Utilisateurs (Si Base Configurée)

### Via Script SQL

```sql
-- Exemple : Créer un utilisateur admin
INSERT INTO utilisateurs (
    email, 
    nom_utilisateur, 
    mot_de_passe_hash, 
    actif
) VALUES (
    'admin@system.local',
    'Administrateur',
    crypt('Admin123!', gen_salt('bf')),
    TRUE
);

-- Assigner le rôle ADMIN
INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
SELECT u.id_utilisateur, r.id_role
FROM utilisateurs u, roles r
WHERE u.email = 'admin@system.local'
AND r.code_role = 'ADMIN';
```

### Via Interface (Si Disponible)

1. Se connecter en tant qu'admin
2. Aller dans "Paramètres" > "Utilisateurs"
3. Cliquer sur "Nouvel utilisateur"
4. Remplir le formulaire
5. Assigner un rôle

---

## 🔒 Sécurité

### ⚠️ Important en Staging

- Les mots de passe sont en clair dans ce document
- **Ne jamais utiliser ces identifiants en production**
- Changer tous les mots de passe en production
- Utiliser des mots de passe forts

### 🔐 Mots de Passe Recommandés (Production)

- Minimum 12 caractères
- Majuscules, minuscules, chiffres, symboles
- Unique par compte
- Changé régulièrement

---

## 🆘 Problèmes de Connexion

### Erreur : "Identifiants invalides"

1. Vérifier que vous utilisez les bons identifiants
2. Vérifier que le backend est démarré (port 5000)
3. Vérifier les logs backend pour les erreurs

### Erreur : "Token invalide"

1. Vider le cache du navigateur
2. Supprimer `localStorage` dans la console :
   ```javascript
   localStorage.clear()
   ```
3. Recharger la page et se reconnecter

### Erreur : "Erreur de connexion"

1. Vérifier que le backend répond :
   ```powershell
   curl http://localhost:5000/api/auth/login
   ```
2. Vérifier les fichiers `.env`
3. Vérifier les logs backend

---

## 📝 Résumé

**Pour se connecter en staging :**

```
URL : http://localhost:3000
Email : admin@system.local
Mot de passe : Admin123!
```

**C'est tout ! 🎉**

---

**Date de mise à jour** : 2026-01-09  
**Environnement** : Staging (Mode Mock)
