# 🔧 Guide de Paramétrage Initial - ERP La Plume Artisanale

## 📋 Vue d'ensemble

Ce guide vous accompagne dans le paramétrage complet de votre application ERP. Suivez les étapes dans l'ordre pour configurer tous les éléments nécessaires au fonctionnement de l'application.

---

## ✅ Prérequis

Avant de commencer, assurez-vous que :

- ✅ Le backend est déployé et fonctionnel sur le VPS
- ✅ La base de données PostgreSQL est accessible
- ✅ Les scripts SQL d'initialisation ont été exécutés
- ✅ Vous avez accès à l'interface d'administration (ou à l'API)

---

## 📊 Étape 1 : Vérifier l'initialisation de la base de données

### 1.1 Vérifier la connexion à la base de données

**Sur le VPS :**

```bash
# Se connecter au VPS
ssh ubuntu@137.74.40.191

# Vérifier la connexion à PostgreSQL
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume
```

**Si la connexion fonctionne, vous verrez :**
```
ERP_La_Plume=>
```

### 1.2 Vérifier que les tables existent

```sql
-- Vérifier les tables principales
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Vérifier les paramètres système
SELECT COUNT(*) FROM parametres_systeme;

-- Vérifier les utilisateurs
SELECT COUNT(*) FROM utilisateurs;

-- Vérifier les machines
SELECT COUNT(*) FROM machines;

-- Vérifier les matières premières
SELECT COUNT(*) FROM matieres_premieres;
```

**Si les tables sont vides ou n'existent pas :**

Exécutez les scripts SQL d'initialisation dans l'ordre :

```bash
cd /opt/fouta-erp/database

# Exporter le mot de passe (remplacez par votre mot de passe)
export PGPASSWORD=Allbyfouta007

# Exécuter les scripts SQL
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 01_base_et_securite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 02_production_et_qualite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 03_flux_et_tracabilite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 04_mobile_devices.sql

# Nettoyer
unset PGPASSWORD
```

---

## ⚙️ Étape 2 : Configurer les paramètres système

### 2.1 Vérifier les paramètres existants

```sql
SELECT cle, valeur, description 
FROM parametres_systeme 
ORDER BY cle;
```

### 2.2 Modifier les paramètres système

**Paramètres essentiels à configurer :**

```sql
-- Version du système
UPDATE parametres_systeme 
SET valeur = '1.0.0', date_modification = CURRENT_TIMESTAMP 
WHERE cle = 'version_systeme';

-- Seuil d'alerte métrage ensouple (en mètres)
UPDATE parametres_systeme 
SET valeur = '500', date_modification = CURRENT_TIMESTAMP 
WHERE cle = 'alerte_metrage_ensouple';

-- Délai de livraison standard (en jours)
UPDATE parametres_systeme 
SET valeur = '7', date_modification = CURRENT_TIMESTAMP 
WHERE cle = 'delai_livraison_standard';

-- Taux de rendement cible (en pourcentage)
UPDATE parametres_systeme 
SET valeur = '90', date_modification = CURRENT_TIMESTAMP 
WHERE cle = 'taux_rendement_cible';

-- Ajouter un nouveau paramètre si nécessaire
INSERT INTO parametres_systeme (cle, valeur, description, type_donnee)
VALUES ('nom_entreprise', 'La Plume Artisanale', 'Nom de l''entreprise', 'string')
ON CONFLICT (cle) DO UPDATE 
SET valeur = EXCLUDED.valeur, date_modification = CURRENT_TIMESTAMP;
```

---

## 🏭 Étape 3 : Configurer les machines

### 3.1 Vérifier les machines existantes

```sql
SELECT 
    m.id_machine,
    m.code_machine,
    m.designation,
    m.id_type_machine,
    tm.libelle as type_machine,
    m.statut,
    m.actif
FROM machines m
LEFT JOIN types_machines tm ON m.id_type_machine = tm.id_type_machine
ORDER BY m.code_machine;
```

### 3.2 Ajouter des machines

```sql
-- Exemple : Ajouter un métier à tisser
INSERT INTO machines (
    code_machine,
    designation,
    id_type_machine,
    largeur_utile,
    vitesse_nominale,
    statut,
    actif
)
VALUES (
    'MET001',
    'Métier à tisser 1',
    (SELECT id_type_machine FROM types_machines WHERE code_type = 'METIER'),
    150,  -- largeur en cm
    500,  -- vitesse en coups/min
    'disponible',
    true
);

-- Exemple : Ajouter un métier jet d'eau
INSERT INTO machines (
    code_machine,
    designation,
    id_type_machine,
    largeur_utile,
    vitesse_nominale,
    statut,
    actif
)
VALUES (
    'JET001',
    'Métier Jet d''eau 1',
    (SELECT id_type_machine FROM types_machines WHERE code_type = 'JET_EAU'),
    180,
    600,
    'disponible',
    true
);
```

### 3.3 Modifier une machine existante

```sql
UPDATE machines 
SET 
    designation = 'Nouveau nom',
    largeur_utile = 160,
    vitesse_nominale = 550,
    date_modification = CURRENT_TIMESTAMP
WHERE code_machine = 'MET001';
```

---

## 🧵 Étape 4 : Configurer les matières premières

### 4.1 Vérifier les matières premières existantes

```sql
SELECT 
    mp.id_mp,
    mp.code_mp,
    mp.designation,
    tmp.libelle as type_mp,
    f.raison_sociale as fournisseur,
    mp.stock_minimum,
    mp.stock_alerte,
    mp.actif
FROM matieres_premieres mp
LEFT JOIN types_mp tmp ON mp.id_type_mp = tmp.id_type_mp
LEFT JOIN fournisseurs f ON mp.id_fournisseur = f.id_fournisseur
ORDER BY mp.code_mp;
```

### 4.2 Ajouter des matières premières

**D'abord, vérifier les types de MP disponibles :**

```sql
SELECT * FROM types_mp;
```

**Ensuite, ajouter une matière première :**

```sql
-- Exemple : Ajouter un fil coton
INSERT INTO matieres_premieres (
    code_mp,
    designation,
    id_type_mp,
    id_fournisseur,
    titre_numerateur,
    titre_denominateur,
    unite_titre,
    couleur,
    prix_unitaire,
    unite_achat,
    stock_minimum,
    stock_alerte,
    delai_approvisionnement,
    actif
)
VALUES (
    'FIL-COT-001',
    'Fil Coton 100% - Ne 30/1',
    (SELECT id_type_mp FROM types_mp WHERE code_type = 'FIL_COTON'),
    (SELECT id_fournisseur FROM fournisseurs WHERE code_fournisseur = 'FOUR001' LIMIT 1),
    30,  -- titre numérateur
    1,   -- titre dénominateur
    'Ne', -- unité titre
    'Blanc',
    15.50, -- prix unitaire en TND
    'kg',
    100,   -- stock minimum en kg
    150,   -- stock alerte en kg
    7,     -- délai approvisionnement en jours
    true
);
```

### 4.3 Configurer les stocks initiaux

```sql
-- Ajouter un stock initial pour une matière première
INSERT INTO stock_mp (
    id_mp,
    quantite_disponible,
    quantite_reservee,
    quantite_en_transit,
    emplacement,
    statut,
    date_entree
)
VALUES (
    (SELECT id_mp FROM matieres_premieres WHERE code_mp = 'FIL-COT-001'),
    500,  -- quantité disponible en kg
    0,    -- quantité réservée
    0,    -- quantité en transit
    'Zone A - Rack 1',
    'disponible',
    CURRENT_TIMESTAMP
);
```

---

## 🏢 Étape 5 : Configurer les clients et fournisseurs

### 5.1 Vérifier les clients existants

```sql
SELECT 
    id_client,
    code_client,
    raison_sociale,
    email,
    telephone,
    actif
FROM clients
ORDER BY code_client;
```

### 5.2 Ajouter un client

```sql
INSERT INTO clients (
    code_client,
    raison_sociale,
    adresse,
    code_postal,
    ville,
    pays,
    telephone,
    email,
    contact_principal,
    conditions_paiement,
    devise,
    actif
)
VALUES (
    'CLI001',
    'Client Exemple SARL',
    '123 Rue Exemple',
    '1000',
    'Tunis',
    'Tunisie',
    '+216 71 123 456',
    'contact@client-exemple.tn',
    'M. Exemple',
    '30 jours',
    'TND',
    true
);
```

### 5.3 Vérifier les fournisseurs existants

```sql
SELECT 
    id_fournisseur,
    code_fournisseur,
    raison_sociale,
    email,
    telephone,
    actif
FROM fournisseurs
ORDER BY code_fournisseur;
```

### 5.4 Ajouter un fournisseur

```sql
INSERT INTO fournisseurs (
    code_fournisseur,
    raison_sociale,
    adresse,
    code_postal,
    ville,
    pays,
    telephone,
    email,
    contact_principal,
    delai_livraison_moyen,
    conditions_paiement,
    devise,
    actif
)
VALUES (
    'FOUR001',
    'Fournisseur Textile SARL',
    '456 Avenue Fournisseur',
    '2000',
    'Sfax',
    'Tunisie',
    '+216 74 987 654',
    'contact@fournisseur-textile.tn',
    'M. Fournisseur',
    7,  -- délai livraison moyen en jours
    '30 jours',
    'TND',
    true
);
```

---

## 📦 Étape 6 : Configurer les articles du catalogue

### 6.1 Vérifier les types d'articles

```sql
SELECT * FROM types_articles;
```

### 6.2 Ajouter un type d'article

```sql
INSERT INTO types_articles (code_type, libelle, description, actif)
VALUES ('FOUTA', 'Fouta', 'Fouta traditionnelle', true);
```

### 6.3 Vérifier les articles existants

```sql
SELECT 
    a.id_article,
    a.code_article,
    a.designation,
    ta.libelle as type_article,
    a.unite_vente,
    a.prix_unitaire_base,
    a.actif
FROM articles_catalogue a
LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article
ORDER BY a.code_article;
```

### 6.4 Ajouter un article au catalogue

```sql
INSERT INTO articles_catalogue (
    code_article,
    designation,
    id_type_article,
    specification,
    unite_vente,
    prix_unitaire_base,
    temps_production_standard,
    actif
)
VALUES (
    'FOUTA-001',
    'Fouta Traditionnelle 120x180',
    (SELECT id_type_article FROM types_articles WHERE code_type = 'FOUTA'),
    'Fouta en coton 100%, dimensions 120x180 cm',
    'mètre',
    25.00,  -- prix unitaire en TND
    2.5,    -- temps production standard en heures
    true
);
```

---

## 👥 Étape 7 : Configurer les utilisateurs et rôles

### 7.1 Vérifier les utilisateurs existants

```sql
SELECT 
    u.id_utilisateur,
    u.nom_utilisateur,
    u.email,
    e.matricule,
    e.nom,
    e.prenom,
    e.fonction,
    u.actif
FROM utilisateurs u
LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur
ORDER BY u.nom_utilisateur;
```

### 7.2 Vérifier les rôles d'un utilisateur

```sql
SELECT 
    u.nom_utilisateur,
    r.code_role,
    r.nom_role,
    r.niveau_acces
FROM utilisateurs u
JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur
JOIN roles r ON ur.id_role = r.id_role
WHERE u.nom_utilisateur = 'admin';
```

### 7.3 Créer un nouvel utilisateur

**D'abord, créer un opérateur dans l'équipe de fabrication :**

```sql
INSERT INTO equipe_fabrication (matricule, nom, prenom, fonction, departement, actif)
VALUES ('TIS002', 'Nouveau', 'Tisseur', 'Tisseur', 'Tissage', true);
```

**Ensuite, créer l'utilisateur :**

```sql
-- Note : Le mot de passe doit être hashé avec bcrypt
-- Pour l'instant, utilisez l'API pour créer des utilisateurs
-- ou utilisez cette commande (remplacez 'MotDePasse123!' par le mot de passe souhaité)
INSERT INTO utilisateurs (
    nom_utilisateur,
    email,
    mot_de_passe_hash,
    salt,
    id_operateur,
    actif,
    force_changement_mdp
)
VALUES (
    'nouveau.tisseur',
    'nouveau.tisseur@entreprise.local',
    crypt('MotDePasse123!', gen_salt('bf', 10)),
    gen_salt('bf', 10),
    (SELECT id_operateur FROM equipe_fabrication WHERE matricule = 'TIS002'),
    true,
    true
);
```

**Attribuer un rôle :**

```sql
INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
VALUES (
    (SELECT id_utilisateur FROM utilisateurs WHERE nom_utilisateur = 'nouveau.tisseur'),
    (SELECT id_role FROM roles WHERE code_role = 'TISSEUR')
);
```

---

## 🎯 Étape 8 : Configurer les selecteurs

### 8.1 Vérifier les selecteurs existants

```sql
SELECT * FROM selecteurs ORDER BY code_selecteur;
```

### 8.2 Ajouter des selecteurs

```sql
-- Exemple : Ajouter des selecteurs standards
INSERT INTO selecteurs (code_selecteur, description, actif)
VALUES 
    ('SEL1', 'Selecteur 1', true),
    ('SEL2', 'Selecteur 2', true),
    ('SEL3', 'Selecteur 3', true),
    ('SEL4', 'Selecteur 4', true)
ON CONFLICT (code_selecteur) DO NOTHING;
```

---

## ✅ Étape 9 : Vérification complète de la configuration

### 9.1 Script de vérification SQL

Exécutez ce script pour vérifier que tout est configuré :

```sql
-- Vérification complète
SELECT 
    'Paramètres système' as categorie,
    COUNT(*) as nombre
FROM parametres_systeme
UNION ALL
SELECT 
    'Machines',
    COUNT(*)
FROM machines
WHERE actif = true
UNION ALL
SELECT 
    'Matières premières',
    COUNT(*)
FROM matieres_premieres
WHERE actif = true
UNION ALL
SELECT 
    'Clients',
    COUNT(*)
FROM clients
WHERE actif = true
UNION ALL
SELECT 
    'Fournisseurs',
    COUNT(*)
FROM fournisseurs
WHERE actif = true
UNION ALL
SELECT 
    'Articles catalogue',
    COUNT(*)
FROM articles_catalogue
WHERE actif = true
UNION ALL
SELECT 
    'Utilisateurs',
    COUNT(*)
FROM utilisateurs
WHERE actif = true
UNION ALL
SELECT 
    'Selecteurs',
    COUNT(*)
FROM selecteurs
WHERE actif = true;
```

### 9.2 Vérification via l'API

**Tester l'endpoint de santé :**

```bash
curl https://fabrication.laplume-artisanale.tn/health
```

**Tester l'authentification :**

```bash
curl -X POST https://fabrication.laplume-artisanale.tn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nom_utilisateur": "admin",
    "mot_de_passe": "Admin123!"
  }'
```

---

## 📝 Étape 10 : Configuration via l'interface (recommandé)

Une fois que l'application frontend est déployée, vous pouvez configurer tous ces éléments via l'interface web :

1. **Se connecter** avec le compte admin :
   - Nom d'utilisateur : `admin`
   - Mot de passe : `Admin123!`

2. **Accéder aux modules de configuration** :
   - Paramètres système
   - Gestion des machines
   - Gestion des matières premières
   - Gestion des clients/fournisseurs
   - Gestion des articles
   - Gestion des utilisateurs

---

## 🔄 Prochaines étapes

Après le paramétrage initial :

1. ✅ **Créer des commandes clients** pour tester le flux complet
2. ✅ **Créer des ordres de fabrication** à partir des commandes
3. ✅ **Planifier la production** sur les machines
4. ✅ **Tester le suivi de production** en temps réel
5. ✅ **Configurer les alertes** et notifications

---

## 🆘 En cas de problème

### Problème : Les tables n'existent pas

**Solution :** Exécutez les scripts SQL d'initialisation (voir Étape 1.2)

### Problème : Erreur de connexion à la base de données

**Vérifier :**
- Les informations dans le fichier `.env` du backend
- Que l'IP du VPS est autorisée dans PostgreSQL OVH
- Que le firewall n'bloque pas le port 35392

### Problème : Les utilisateurs ne peuvent pas se connecter

**Vérifier :**
- Que les mots de passe sont correctement hashés
- Que les rôles sont attribués aux utilisateurs
- Que les utilisateurs sont actifs (`actif = true`)

---

## 📚 Ressources supplémentaires

- **Documentation API** : `https://fabrication.laplume-artisanale.tn/`
- **Logs système** : Vérifier la table `logs_systeme` dans PostgreSQL
- **Logs application** : `pm2 logs fouta-api` sur le VPS

---

**✅ Paramétrage terminé !** Votre application ERP est maintenant configurée et prête à être utilisée.

