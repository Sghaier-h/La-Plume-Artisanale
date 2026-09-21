# Guide de Configuration des Utilisateurs et Groupes

Ce guide explique comment configurer les utilisateurs avec leurs groupes et photos/emojis.

## 📋 Vue d'ensemble

Les modifications apportées incluent :
1. ✅ Suppression de l'affichage des comptes de test sur la page de connexion
2. ✅ Création de la table `groupes` (Fabrication, Atelier, Commercial)
3. ✅ Ajout de colonnes dans `utilisateurs` (photo_emoji, photo_url, id_groupe, prenom, nom, numero_employe)
4. ✅ Configuration de Hamdi Sghaier en tant qu'Admin
5. ✅ Attribution des utilisateurs aux groupes

## 🗂️ Structure des Groupes

Les groupes créés sont :
- **FAB** : Fabrication
- **ATL** : Atelier
- **COM** : Commercial
- **SOU** : Soustraitant

## 👥 Utilisateurs

19 utilisateurs ont été configurés avec :
- Prénom et nom
- Numéro d'employé (si disponible)
- Groupe d'appartenance
- Photo/emoji

### Utilisateur Admin

- **Nom** : Hamdi Sghaier
- **Email** : responsable@laplume-artisanale.tn
- **Mot de passe** : Allbyfouta#007
- **Rôle** : ADMIN
- **Groupe** : Commercial
- **Emoji** : 👨‍💼

## 📝 Fichiers à exécuter

### 1. Structure de la base de données

Exécutez le script SQL pour créer les groupes et ajouter les colonnes nécessaires :

```sql
-- Fichier: database/imports/05_structure_utilisateurs_groupes.sql
```

**Note :** Ce script crée maintenant 4 groupes : Fabrication, Atelier, Commercial, et **Soustraitant**.

### 1bis. Ajouter le groupe Soustraitant (si déjà exécuté)

Si vous avez déjà exécuté `05_structure_utilisateurs_groupes.sql` avant cette mise à jour, vous pouvez exécuter ce script séparé pour ajouter uniquement le groupe Soustraitant :

```sql
-- Fichier: database/imports/06_ajouter_groupe_soustraitant.sql
```

**Via pgAdmin :**
1. Ouvrez pgAdmin
2. Connectez-vous à votre base de données
3. Ouvrez l'éditeur de requête SQL
4. Ouvrez le fichier `05_structure_utilisateurs_groupes.sql`
5. Exécutez le script (F5)

**Via psql :**
```bash
psql -U votre_utilisateur -d votre_base_de_donnees -f database/imports/05_structure_utilisateurs_groupes.sql
```

### 2. Données des utilisateurs

Exécutez le script SQL pour créer/mettre à jour les utilisateurs :

```sql
-- Fichier: database/imports/05_utilisateurs_data.sql
```

**Via pgAdmin :**
1. Ouvrez le fichier `05_utilisateurs_data.sql`
2. Exécutez le script (F5)

**Via psql :**
```bash
psql -U votre_utilisateur -d votre_base_de_donnees -f database/imports/05_utilisateurs_data.sql
```

### 3. Mise à jour du mot de passe admin

Le mot de passe doit être hashé avec bcrypt. Exécutez le script Node.js :

```bash
cd backend
node src/utils/update-admin-password.js
```

**Note :** Assurez-vous que :
- PostgreSQL est démarré
- Les variables d'environnement dans `.env` sont correctement configurées
- Le package `bcrypt` est installé (`npm install`)

## ✅ Vérification

### Vérifier les groupes

```sql
SELECT * FROM groupes;
```

Vous devriez voir 4 groupes : FAB, ATL, COM, SOU.

### Vérifier les utilisateurs

```sql
SELECT 
    u.id_utilisateur,
    u.prenom,
    u.nom,
    u.email,
    u.numero_employe,
    u.photo_emoji,
    g.libelle as groupe,
    u.actif
FROM utilisateurs u
LEFT JOIN groupes g ON u.id_groupe = g.id_groupe
ORDER BY u.prenom, u.nom;
```

### Vérifier l'utilisateur admin

```sql
SELECT 
    u.id_utilisateur,
    u.prenom,
    u.nom,
    u.email,
    u.photo_emoji,
    g.libelle as groupe,
    r.code_role,
    r.nom_role
FROM utilisateurs u
LEFT JOIN groupes g ON u.id_groupe = g.id_groupe
LEFT JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur
LEFT JOIN roles r ON ur.id_role = r.id_role
WHERE u.email = 'responsable@laplume-artisanale.tn';
```

## 🔐 Connexion

Après avoir exécuté tous les scripts :

1. Accédez à la page de connexion
2. Les comptes de test ne sont plus affichés
3. Utilisez les identifiants :
   - **Email** : responsable@laplume-artisanale.tn
   - **Mot de passe** : Allbyfouta#007

## 📸 Photos/Emojis

Chaque utilisateur a un emoji attribué. Pour ajouter une photo réelle :

1. Téléchargez la photo sur le serveur
2. Mettez à jour le champ `photo_url` dans la table `utilisateurs` :

```sql
UPDATE utilisateurs 
SET photo_url = '/uploads/photos/nom_photo.jpg'
WHERE email = 'email@example.com';
```

## 🔄 Modifier un utilisateur

Pour modifier un utilisateur (changer de groupe, ajouter une photo, etc.) :

```sql
UPDATE utilisateurs 
SET 
    id_groupe = (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB'),
    photo_emoji = '👨',
    photo_url = '/uploads/photos/nom_photo.jpg'
WHERE email = 'email@example.com';
```

## 🆕 Ajouter un nouvel utilisateur

```sql
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, 
    photo_emoji, id_groupe, actif, mot_de_passe_hash
)
VALUES (
    'Prénom Nom',
    'email@laplume-artisanale.tn',
    'Prénom',
    'Nom',
    '001',
    '👤',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB'), -- ou 'ATL', 'COM', 'SOU'
    true,
    -- Le mot de passe doit être hashé avec bcrypt via le backend
    '$2b$10$placeholder'
);
```

**Groupes disponibles :**
- `FAB` : Fabrication
- `ATL` : Atelier
- `COM` : Commercial
- `SOU` : Soustraitant

## ⚠️ Notes importantes

1. **Mot de passe** : Les mots de passe doivent être hashés avec bcrypt (10 rounds). Utilisez le script `update-admin-password.js` comme référence.

2. **Rôles** : Les rôles sont gérés via la table `utilisateurs_roles`. Pour attribuer un rôle :

```sql
INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
VALUES (
    (SELECT id_utilisateur FROM utilisateurs WHERE email = 'email@example.com'),
    (SELECT id_role FROM roles WHERE code_role = 'ADMIN')
)
ON CONFLICT DO NOTHING;
```

3. **Sécurité** : Ne stockez jamais les mots de passe en clair. Utilisez toujours bcrypt pour le hachage.

## 🐛 Dépannage

### Erreur : "relation groupes does not exist"
→ Exécutez d'abord `05_structure_utilisateurs_groupes.sql`

### Erreur : "column photo_emoji does not exist"
→ Exécutez d'abord `05_structure_utilisateurs_groupes.sql`

### Erreur : "ECONNREFUSED" lors de l'exécution du script Node.js
→ Vérifiez que PostgreSQL est démarré et que les variables d'environnement sont correctes

### Le mot de passe ne fonctionne pas
→ Assurez-vous d'avoir exécuté `update-admin-password.js` pour hasher le mot de passe
