-- ============================================================================
-- FICHIER 1/3 : BASE ET SÉCURITÉ
-- ============================================================================
-- Tables de base, utilisateurs, matières premières, clients, commandes, OF
-- Temps d'exécution: ~1 minute
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🚀 FICHIER 1/3 : TABLES DE BASE ET SÉCURITÉ
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ✅ Extensions activées'

-- ============================================================================
-- SUPPRESSION TABLES EXISTANTES
-- ============================================================================

DROP TABLE IF EXISTS logs_systeme CASCADE;
DROP TABLE IF EXISTS utilisateurs_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS utilisateurs CASCADE;
DROP TABLE IF EXISTS preparation_mp CASCADE;
DROP TABLE IF EXISTS demandes_ourdissage CASCADE;
DROP TABLE IF EXISTS mouvements_mp CASCADE;
DROP TABLE IF EXISTS inventaires_mp_detail CASCADE;
DROP TABLE IF EXISTS inventaires_mp CASCADE;
DROP TABLE IF EXISTS stock_mp CASCADE;
DROP TABLE IF EXISTS matieres_premieres CASCADE;
DROP TABLE IF EXISTS types_mp CASCADE;
DROP TABLE IF EXISTS fournisseurs CASCADE;
DROP TABLE IF EXISTS planning_machines CASCADE;
DROP TABLE IF EXISTS sous_of CASCADE;
DROP TABLE IF EXISTS ordres_fabrication CASCADE;
DROP TABLE IF EXISTS articles_commande CASCADE;
DROP TABLE IF EXISTS commandes CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS equipe_fabrication CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS types_machines CASCADE;
DROP TABLE IF EXISTS selecteurs CASCADE;
DROP TABLE IF EXISTS articles_catalogue CASCADE;
DROP TABLE IF EXISTS types_articles CASCADE;
DROP TABLE IF EXISTS parametres_systeme CASCADE;

-- ✅ Nettoyage terminé

-- ============================================================================
-- TABLES DE BASE
-- ============================================================================

CREATE TABLE parametres_systeme (
    id_parametre SERIAL PRIMARY KEY,
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT,
    description TEXT,
    type_donnee VARCHAR(50) DEFAULT 'string',
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE types_articles (
    id_type_article SERIAL PRIMARY KEY,
    code_type VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true
);

CREATE TABLE articles_catalogue (
    id_article SERIAL PRIMARY KEY,
    code_article VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(200) NOT NULL,
    id_type_article INTEGER REFERENCES types_articles(id_type_article),
    specification TEXT,
    unite_vente VARCHAR(20) DEFAULT 'mètre',
    prix_unitaire_base DECIMAL(10,2),
    temps_production_standard DECIMAL(10,2),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE selecteurs (
    id_selecteur SERIAL PRIMARY KEY,
    code_selecteur VARCHAR(10) UNIQUE NOT NULL,
    description VARCHAR(200),
    actif BOOLEAN DEFAULT true
);

CREATE TABLE types_machines (
    id_type_machine SERIAL PRIMARY KEY,
    code_type VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true
);

CREATE TABLE machines (
    id_machine SERIAL PRIMARY KEY,
    numero_machine VARCHAR(20) UNIQUE NOT NULL,
    id_type_machine INTEGER REFERENCES types_machines(id_type_machine),
    marque VARCHAR(100),
    modele VARCHAR(100),
    numero_serie VARCHAR(100),
    annee_fabrication INTEGER,
    date_mise_service DATE,
    statut VARCHAR(50) DEFAULT 'operationnel',
    vitesse_nominale DECIMAL(10,2),
    largeur_utile DECIMAL(10,2),
    capacite_production DECIMAL(10,2),
    id_selecteur_actuel INTEGER REFERENCES selecteurs(id_selecteur),
    emplacement VARCHAR(100),
    observations TEXT,
    date_derniere_maintenance DATE,
    date_prochaine_maintenance DATE,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipe_fabrication (
    id_operateur SERIAL PRIMARY KEY,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    fonction VARCHAR(100) NOT NULL,
    departement VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(150),
    date_embauche DATE,
    niveau_qualification VARCHAR(50),
    habilitations TEXT,
    taux_horaire DECIMAL(10,2),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Tables de base créées

-- ============================================================================
-- SÉCURITÉ ET UTILISATEURS
-- ============================================================================

CREATE TABLE roles (
    id_role SERIAL PRIMARY KEY,
    code_role VARCHAR(50) UNIQUE NOT NULL,
    nom_role VARCHAR(100) NOT NULL,
    description TEXT,
    niveau_acces INTEGER DEFAULT 1,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE utilisateurs (
    id_utilisateur SERIAL PRIMARY KEY,
    nom_utilisateur VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100),
    id_operateur INTEGER REFERENCES equipe_fabrication(id_operateur),
    derniere_connexion TIMESTAMP,
    tentatives_connexion INTEGER DEFAULT 0,
    compte_verrouille BOOLEAN DEFAULT false,
    date_verrouillage TIMESTAMP,
    date_expiration_mdp DATE,
    force_changement_mdp BOOLEAN DEFAULT false,
    token_reinitialisation VARCHAR(255),
    date_token_reinitialisation TIMESTAMP,
    preferences_json TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE utilisateurs_roles (
    id_utilisateur_role SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    id_role INTEGER NOT NULL REFERENCES roles(id_role) ON DELETE CASCADE,
    date_attribution TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attribue_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    UNIQUE(id_utilisateur, id_role)
);

CREATE TABLE logs_systeme (
    id_log SERIAL PRIMARY KEY,
    id_utilisateur INTEGER REFERENCES utilisateurs(id_utilisateur),
    type_action VARCHAR(100) NOT NULL,
    module VARCHAR(100),
    description TEXT,
    details_json TEXT,
    adresse_ip VARCHAR(50),
    user_agent TEXT,
    niveau_severite VARCHAR(20) DEFAULT 'INFO',
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Tables sécurité créées

-- ============================================================================
-- FOURNISSEURS ET MATIÈRES PREMIÈRES
-- ============================================================================

CREATE TABLE fournisseurs (
    id_fournisseur SERIAL PRIMARY KEY,
    code_fournisseur VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(200) NOT NULL,
    adresse TEXT,
    code_postal VARCHAR(20),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Tunisie',
    telephone VARCHAR(20),
    email VARCHAR(150),
    contact_principal VARCHAR(200),
    delai_livraison_moyen INTEGER,
    conditions_paiement VARCHAR(100),
    devise VARCHAR(10) DEFAULT 'TND',
    taux_conformite DECIMAL(5,2),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE types_mp (
    id_type_mp SERIAL PRIMARY KEY,
    code_type VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true
);

CREATE TABLE matieres_premieres (
    id_mp SERIAL PRIMARY KEY,
    code_mp VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(200) NOT NULL,
    id_type_mp INTEGER REFERENCES types_mp(id_type_mp),
    id_fournisseur INTEGER REFERENCES fournisseurs(id_fournisseur),
    composition TEXT,
    titre_numerateur DECIMAL(10,2),
    titre_denominateur DECIMAL(10,2),
    unite_titre VARCHAR(20),
    couleur VARCHAR(100),
    reference_fournisseur VARCHAR(100),
    poids_cone_standard DECIMAL(10,3),
    prix_unitaire DECIMAL(10,2),
    unite_achat VARCHAR(20) DEFAULT 'kg',
    stock_minimum DECIMAL(10,2),
    stock_alerte DECIMAL(10,2),
    delai_approvisionnement INTEGER,
    qr_code_mp VARCHAR(255),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_mp (
    id_stock_mp SERIAL PRIMARY KEY,
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    numero_lot VARCHAR(50) NOT NULL,
    quantite_disponible DECIMAL(10,3) DEFAULT 0,
    quantite_reservee DECIMAL(10,3) DEFAULT 0,
    quantite_initiale DECIMAL(10,3),
    emplacement VARCHAR(100),
    date_reception DATE,
    date_peremption DATE,
    numero_bon_livraison VARCHAR(50),
    numero_facture VARCHAR(50),
    prix_achat_unitaire DECIMAL(10,2),
    qr_code_stock VARCHAR(255),
    statut VARCHAR(50) DEFAULT 'disponible',
    observations TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_mp, numero_lot)
);

CREATE TABLE inventaires_mp (
    id_inventaire SERIAL PRIMARY KEY,
    numero_inventaire VARCHAR(50) UNIQUE NOT NULL,
    date_inventaire DATE NOT NULL,
    type_inventaire VARCHAR(50) DEFAULT 'complet',
    statut VARCHAR(50) DEFAULT 'en_cours',
    id_operateur_responsable INTEGER REFERENCES equipe_fabrication(id_operateur),
    observations TEXT,
    date_validation TIMESTAMP,
    valide_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventaires_mp_detail (
    id_detail SERIAL PRIMARY KEY,
    id_inventaire INTEGER NOT NULL REFERENCES inventaires_mp(id_inventaire) ON DELETE CASCADE,
    id_stock_mp INTEGER NOT NULL REFERENCES stock_mp(id_stock_mp),
    quantite_theorique DECIMAL(10,3),
    quantite_physique DECIMAL(10,3),
    ecart DECIMAL(10,3),
    valeur_ecart DECIMAL(10,2),
    observations TEXT,
    date_comptage TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mouvements_mp (
    id_mouvement SERIAL PRIMARY KEY,
    id_stock_mp INTEGER NOT NULL REFERENCES stock_mp(id_stock_mp),
    type_mouvement VARCHAR(50) NOT NULL,
    quantite DECIMAL(10,3) NOT NULL,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_operateur INTEGER REFERENCES equipe_fabrication(id_operateur),
    reference_document VARCHAR(100),
    cout_unitaire DECIMAL(10,2),
    observations TEXT
);

CREATE TABLE demandes_ourdissage (
    id_demande_ourdissage SERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    quantite_demandee DECIMAL(10,3) NOT NULL,
    priorite VARCHAR(20) DEFAULT 'normale',
    id_demandeur INTEGER REFERENCES equipe_fabrication(id_operateur),
    statut VARCHAR(50) DEFAULT 'en_attente',
    date_traitement TIMESTAMP,
    traite_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    observations TEXT
);

-- ✅ Tables matières premières créées

-- ============================================================================
-- CLIENTS ET COMMANDES
-- ============================================================================

CREATE TABLE clients (
    id_client SERIAL PRIMARY KEY,
    code_client VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(200) NOT NULL,
    adresse TEXT,
    code_postal VARCHAR(20),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Tunisie',
    telephone VARCHAR(20),
    email VARCHAR(150),
    contact_principal VARCHAR(200),
    conditions_paiement VARCHAR(100),
    plafond_credit DECIMAL(12,2),
    devise VARCHAR(10) DEFAULT 'TND',
    taux_remise DECIMAL(5,2) DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commandes (
    id_commande SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    date_commande DATE NOT NULL,
    date_livraison_prevue DATE,
    statut VARCHAR(50) DEFAULT 'en_attente',
    priorite VARCHAR(20) DEFAULT 'normale',
    montant_total DECIMAL(12,2),
    devise VARCHAR(10) DEFAULT 'TND',
    conditions_paiement VARCHAR(100),
    adresse_livraison TEXT,
    observations TEXT,
    date_validation TIMESTAMP,
    validee_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE articles_commande (
    id_article_commande SERIAL PRIMARY KEY,
    id_commande INTEGER NOT NULL REFERENCES commandes(id_commande) ON DELETE CASCADE,
    numero_ligne INTEGER NOT NULL,
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article),
    quantite_commandee DECIMAL(10,2) NOT NULL,
    quantite_produite DECIMAL(10,2) DEFAULT 0,
    quantite_livree DECIMAL(10,2) DEFAULT 0,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    remise DECIMAL(5,2) DEFAULT 0,
    montant_ligne DECIMAL(12,2),
    date_livraison_prevue DATE,
    statut VARCHAR(50) DEFAULT 'en_attente',
    observations TEXT,
    UNIQUE(id_commande, numero_ligne)
);

-- ✅ Tables commandes créées 

-- ============================================================================
-- ORDRES DE FABRICATION
-- ============================================================================

CREATE TABLE ordres_fabrication (
    id_of SERIAL PRIMARY KEY,
    numero_of VARCHAR(50) UNIQUE NOT NULL,
    id_article_commande INTEGER REFERENCES articles_commande(id_article_commande),
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article),
    quantite_a_produire DECIMAL(10,2) NOT NULL,
    quantite_produite DECIMAL(10,2) DEFAULT 0,
    unite VARCHAR(20) DEFAULT 'mètre',
    date_creation_of DATE NOT NULL DEFAULT CURRENT_DATE,
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    date_debut_reelle TIMESTAMP,
    date_fin_reelle TIMESTAMP,
    priorite VARCHAR(20) DEFAULT 'normale',
    statut VARCHAR(50) DEFAULT 'planifie',
    temps_production_estime DECIMAL(10,2),
    temps_production_reel DECIMAL(10,2),
    cout_estime DECIMAL(12,2),
    cout_reel DECIMAL(12,2),
    qr_code_of VARCHAR(255),
    observations TEXT,
    cree_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sous_of (
    id_sous_of SERIAL PRIMARY KEY,
    id_of_parent INTEGER NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    id_of_enfant INTEGER NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    ordre_execution INTEGER,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_of_parent, id_of_enfant)
);

CREATE TABLE planning_machines (
    id_planning SERIAL PRIMARY KEY,
    id_machine INTEGER NOT NULL REFERENCES machines(id_machine),
    id_of INTEGER NOT NULL REFERENCES ordres_fabrication(id_of),
    date_debut_prevue TIMESTAMP NOT NULL,
    date_fin_prevue TIMESTAMP NOT NULL,
    date_debut_reelle TIMESTAMP,
    date_fin_reelle TIMESTAMP,
    id_operateur INTEGER REFERENCES equipe_fabrication(id_operateur),
    statut VARCHAR(50) DEFAULT 'planifie',
    observations TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE preparation_mp (
    id_preparation SERIAL PRIMARY KEY,
    numero_preparation VARCHAR(50) UNIQUE NOT NULL,
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    id_stock_mp INTEGER REFERENCES stock_mp(id_stock_mp),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    quantite_preparee DECIMAL(10,3) NOT NULL,
    nombre_cones INTEGER,
    poids_total DECIMAL(10,3),
    date_preparation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prepare_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    emplacement_preparation VARCHAR(100),
    qr_code_preparation VARCHAR(255),
    statut VARCHAR(50) DEFAULT 'prepare',
    observations TEXT
);

-- ✅ Tables ordres de fabrication créées

-- ============================================================================
-- INDEX PERFORMANCE
-- ============================================================================

CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX idx_utilisateurs_operateur ON utilisateurs(id_operateur);
CREATE INDEX idx_commandes_client ON commandes(id_client);
CREATE INDEX idx_commandes_statut ON commandes(statut);
CREATE INDEX idx_of_article ON ordres_fabrication(id_article);
CREATE INDEX idx_of_statut ON ordres_fabrication(statut);
CREATE INDEX idx_stock_mp_mp ON stock_mp(id_mp);
CREATE INDEX idx_stock_mp_statut ON stock_mp(statut);
CREATE INDEX idx_planning_machine ON planning_machines(id_machine);
CREATE INDEX idx_planning_of ON planning_machines(id_of);

-- ✅ Index créés

-- ============================================================================
-- DONNÉES INITIALES
-- ============================================================================

-- Paramètres système
INSERT INTO parametres_systeme (cle, valeur, description, type_donnee) VALUES
('version_systeme', '3.0', 'Version du système', 'string'),
('alerte_metrage_ensouple', '500', 'Seuil d''alerte métrage ensouple (mètres)', 'integer'),
('pieces_par_lot_coupe', '5', 'Nombre de pièces par lot de coupe', 'integer'),
('delai_validation_controle', '24', 'Délai de validation contrôle qualité (heures)', 'integer'),
('taux_change_euro_tnd', '3.25', 'Taux de change EUR/TND', 'decimal');

-- Types d'articles
INSERT INTO types_articles (code_type, libelle, description) VALUES
('SIMPLE', 'Article Simple', 'Article produit en une seule opération'),
('COMPOSE', 'Article Composé', 'Article nécessitant plusieurs sous-OF');

-- Sélecteurs
INSERT INTO selecteurs (code_selecteur, description) VALUES
('S01', 'Sélecteur 01'), ('S02', 'Sélecteur 02'), ('S03', 'Sélecteur 03'), 
('S04', 'Sélecteur 04'), ('S05', 'Sélecteur 05'), ('S06', 'Sélecteur 06'), 
('S07', 'Sélecteur 07'), ('S08', 'Sélecteur 08');

-- Types de machines
INSERT INTO types_machines (code_type, libelle, description) VALUES
('METIER', 'Métier à tisser', 'Métier à tisser traditionnel'),
('JET_EAU', 'Jet d''eau', 'Métier à jet d''eau'),
('JET_AIR', 'Jet d''air', 'Métier à jet d''air'),
('RAPIER', 'Rapier', 'Métier rapier');

-- Types de MP
INSERT INTO types_mp (code_type, libelle, description) VALUES
('FIL_COTON', 'Fil Coton', 'Fil 100% coton'),
('FIL_POLY', 'Fil Polyester', 'Fil polyester'),
('FIL_MIXTE', 'Fil Mixte', 'Fil mélangé (coton/polyester)'),
('FIL_ELASTHANNE', 'Fil Élasthanne', 'Fil avec élasthanne');

-- Équipe de fabrication
INSERT INTO equipe_fabrication (matricule, nom, prenom, fonction, departement, actif) VALUES
('ADM001', 'Admin', 'Système', 'Admin', 'Administration', true),
('CPR001', 'Dupont', 'Jean', 'Chef de Production', 'Production', true),
('MEC001', 'Martin', 'Pierre', 'Mécanicien', 'Maintenance', true),
('TIS001', 'Bernard', 'Marie', 'Tisseur', 'Tissage', true),
('MAG001', 'Dubois', 'Paul', 'Magasinier MP', 'Magasin', true),
('COU001', 'Lambert', 'Sophie', 'Coupeur', 'Coupe', true),
('CAF001', 'Rousseau', 'Luc', 'Chef Atelier Finition', 'Finition', true),
('MAG002', 'Moreau', 'Julie', 'Magasinier PF', 'Magasin', true),
('CTL001', 'Petit', 'Marc', 'Contrôleur Qualité', 'Qualité', true);

-- Rôles
INSERT INTO roles (code_role, nom_role, description, niveau_acces) VALUES
('ADMIN', 'Administrateur', 'Accès complet à tous les modules', 100),
('CHEF_PROD', 'Chef de Production', 'Gestion complète production et planification', 90),
('MECANICIEN', 'Mécanicien', 'Maintenance machines, contrôle première pièce, ensouples', 70),
('TISSEUR', 'Tisseur', 'Suivi fabrication, déclaration production', 60),
('MAG_MP', 'Magasinier MP', 'Gestion stock matières premières', 60),
('COUPEUR', 'Coupeur', 'Gestion coupe et lots', 60),
('CHEF_ATELIER', 'Chef d''Atelier Finition', 'Gestion atelier finition', 70),
('MAG_PF', 'Magasinier PF', 'Gestion stock produits finis, expéditions', 60),
('CONTROLEUR', 'Contrôleur Qualité', 'Contrôle qualité tous départements', 70),
('MAG_ST', 'Magasinier Sous-Traitance', 'Gestion flux sous-traitance', 60),
('OPERATEUR', 'Opérateur', 'Accès basique production', 50),
('VISITEUR', 'Visiteur', 'Consultation seule', 10);

-- Utilisateurs
INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe_hash, salt, id_operateur, actif, force_changement_mdp)
VALUES 
('admin', 'admin@system.local', crypt('Admin123!', gen_salt('bf', 10)), gen_salt('bf', 10),
 (SELECT id_operateur FROM equipe_fabrication WHERE matricule = 'ADM001'), true, true),
('chef.prod', 'chef.production@entreprise.local', crypt('User123!', gen_salt('bf', 10)), gen_salt('bf', 10),
 (SELECT id_operateur FROM equipe_fabrication WHERE matricule = 'CPR001'), true, true),
('mecanicien', 'mecanicien@entreprise.local', crypt('User123!', gen_salt('bf', 10)), gen_salt('bf', 10),
 (SELECT id_operateur FROM equipe_fabrication WHERE matricule = 'MEC001'), true, true),
('tisseur', 'tisseur@entreprise.local', crypt('User123!', gen_salt('bf', 10)), gen_salt('bf', 10),
 (SELECT id_operateur FROM equipe_fabrication WHERE matricule = 'TIS001'), true, true),
('mag.mp', 'magasinier.mp@entreprise.local', crypt('User123!', gen_salt('bf', 10)), gen_salt('bf', 10),
 (SELECT id_operateur FROM equipe_fabrication WHERE matricule = 'MAG001'), true, true),
('coupeur', 'coupeur@entreprise.local', crypt('User123!', gen_salt('bf', 10)), gen_salt('bf', 10),
 (SELECT id_operateur FROM equipe_fabrication WHERE matricule = 'COU001'), true, true),
('chef.finition', 'chef.finition@entreprise.local', crypt('User123!', gen_salt('bf', 10)), gen_salt('bf', 10),
 (SELECT id_operateur FROM equipe_fabrication WHERE matricule = 'CAF001'), true, true),
('mag.pf', 'magasinier.pf@entreprise.local', crypt('User123!', gen_salt('bf', 10)), gen_salt('bf', 10),
 (SELECT id_operateur FROM equipe_fabrication WHERE matricule = 'MAG002'), true, true),
('controleur', 'controleur@entreprise.local', crypt('User123!', gen_salt('bf', 10)), gen_salt('bf', 10),
 (SELECT id_operateur FROM equipe_fabrication WHERE matricule = 'CTL001'), true, true);

-- Attribution rôles
INSERT INTO utilisateurs_roles (id_utilisateur, id_role) VALUES
((SELECT id_utilisateur FROM utilisateurs WHERE nom_utilisateur = 'admin'), (SELECT id_role FROM roles WHERE code_role = 'ADMIN')),
((SELECT id_utilisateur FROM utilisateurs WHERE nom_utilisateur = 'chef.prod'), (SELECT id_role FROM roles WHERE code_role = 'CHEF_PROD')),
((SELECT id_utilisateur FROM utilisateurs WHERE nom_utilisateur = 'mecanicien'), (SELECT id_role FROM roles WHERE code_role = 'MECANICIEN')),
((SELECT id_utilisateur FROM utilisateurs WHERE nom_utilisateur = 'tisseur'), (SELECT id_role FROM roles WHERE code_role = 'TISSEUR')),
((SELECT id_utilisateur FROM utilisateurs WHERE nom_utilisateur = 'mag.mp'), (SELECT id_role FROM roles WHERE code_role = 'MAG_MP')),
((SELECT id_utilisateur FROM utilisateurs WHERE nom_utilisateur = 'coupeur'), (SELECT id_role FROM roles WHERE code_role = 'COUPEUR')),
((SELECT id_utilisateur FROM utilisateurs WHERE nom_utilisateur = 'chef.finition'), (SELECT id_role FROM roles WHERE code_role = 'CHEF_ATELIER')),
((SELECT id_utilisateur FROM utilisateurs WHERE nom_utilisateur = 'mag.pf'), (SELECT id_role FROM roles WHERE code_role = 'MAG_PF')),
((SELECT id_utilisateur FROM utilisateurs WHERE nom_utilisateur = 'controleur'), (SELECT id_role FROM roles WHERE code_role = 'CONTROLEUR'));

-- ✅ Données initiales insérées

-- Log
INSERT INTO logs_systeme (type_action, module, description, niveau_severite)
VALUES ('INIT', 'BASE_SECURITE', 'Tables de base et sécurité créées', 'INFO');

--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ✅ FICHIER 1/3 TERMINÉ
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Exécutez maintenant : 02_production_et_qualite.sql
--