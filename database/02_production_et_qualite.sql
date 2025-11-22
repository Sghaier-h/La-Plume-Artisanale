-- ============================================================================
-- FICHIER 2/3 : PRODUCTION ET QUALITÉ
-- ============================================================================
-- Ensouples, suivi fabrication, qualité, alertes, sous-traitance, stock PF
-- Temps d'exécution: ~1 minute
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🏭 FICHIER 2/3 : PRODUCTION ET QUALITÉ'
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--

-- ============================================================================
-- SUPPRESSION TABLES FICHIER 2
-- ============================================================================

DROP TABLE IF EXISTS demandes_achat_pieces CASCADE;
DROP TABLE IF EXISTS demandes_intervention CASCADE;
DROP TABLE IF EXISTS arrets_production CASCADE;
DROP TABLE IF EXISTS incidents_production CASCADE;
DROP TABLE IF EXISTS operations_finition CASCADE;
DROP TABLE IF EXISTS suivi_finition CASCADE;
DROP TABLE IF EXISTS inventaires_pf_detail CASCADE;
DROP TABLE IF EXISTS inventaires_pf CASCADE;
DROP TABLE IF EXISTS expedition_colis_detail CASCADE;
DROP TABLE IF EXISTS expedition_colis CASCADE;
DROP TABLE IF EXISTS expedition_palettes CASCADE;
DROP TABLE IF EXISTS expeditions CASCADE;
DROP TABLE IF EXISTS stock_produits_finis CASCADE;
DROP TABLE IF EXISTS mouvements_st_detail CASCADE;
DROP TABLE IF EXISTS mouvements_sous_traitance CASCADE;
DROP TABLE IF EXISTS sous_traitants CASCADE;
DROP TABLE IF EXISTS lots_coupe CASCADE;
DROP TABLE IF EXISTS suivi_fabrication CASCADE;
DROP TABLE IF EXISTS controle_premiere_piece CASCADE;
DROP TABLE IF EXISTS ensouples_attributions CASCADE;
DROP TABLE IF EXISTS ensouples CASCADE;
DROP TABLE IF EXISTS procedures_nc CASCADE;
DROP TABLE IF EXISTS non_conformites CASCADE;
DROP TABLE IF EXISTS types_non_conformites CASCADE;
DROP TABLE IF EXISTS sla_interventions CASCADE;
DROP TABLE IF EXISTS historique_alertes CASCADE;
DROP TABLE IF EXISTS alertes_actives CASCADE;
DROP TABLE IF EXISTS types_alertes CASCADE;

--✅ Nettoyage fichier 2 terminé

-- ============================================================================
-- GESTION ENSOUPLES
-- ============================================================================

CREATE TABLE ensouples (
    id_ensouple SERIAL PRIMARY KEY,
    numero_ensouple VARCHAR(50) UNIQUE NOT NULL,
    id_mp INTEGER REFERENCES matieres_premieres(id_mp),
    metrage_initial DECIMAL(10,2) NOT NULL,
    metrage_restant DECIMAL(10,2),
    poids_initial DECIMAL(10,3),
    poids_restant DECIMAL(10,3),
    date_reception DATE,
    date_nouage DATE,
    statut VARCHAR(50) DEFAULT 'disponible',
    emplacement VARCHAR(100),
    qr_code_ensouple VARCHAR(255),
    observations TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ensouples_attributions (
    id_attribution SERIAL PRIMARY KEY,
    id_ensouple INTEGER NOT NULL REFERENCES ensouples(id_ensouple),
    id_machine INTEGER NOT NULL REFERENCES machines(id_machine),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    date_attribution TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_retrait TIMESTAMP,
    metrage_consomme DECIMAL(10,2),
    attribue_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    statut VARCHAR(50) DEFAULT 'en_cours',
    observations TEXT
);

CREATE TABLE controle_premiere_piece (
    id_controle SERIAL PRIMARY KEY,
    id_machine INTEGER NOT NULL REFERENCES machines(id_machine),
    id_of INTEGER NOT NULL REFERENCES ordres_fabrication(id_of),
    date_controle TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_operateur INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    poids_mesure DECIMAL(10,3),
    poids_attendu DECIMAL(10,3),
    ecart_poids DECIMAL(10,3),
    largeur_mesure DECIMAL(10,2),
    largeur_attendue DECIMAL(10,2),
    ecart_largeur DECIMAL(10,2),
    densite_trame DECIMAL(10,2),
    densite_chaine DECIMAL(10,2),
    aspect_visuel VARCHAR(50),
    conformite BOOLEAN DEFAULT false,
    observations TEXT,
    actions_correctives TEXT
);

-- ✅ Tables ensouples créées

-- ============================================================================
-- SUIVI FABRICATION
-- ============================================================================

CREATE TABLE suivi_fabrication (
    id_suivi SERIAL PRIMARY KEY,
    numero_suivi VARCHAR(50) UNIQUE NOT NULL,
    id_of INTEGER NOT NULL REFERENCES ordres_fabrication(id_of),
    id_machine INTEGER REFERENCES machines(id_machine),
    id_operateur INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP,
    quantite_produite DECIMAL(10,2),
    quantite_bonne DECIMAL(10,2),
    quantite_rebut DECIMAL(10,2),
    quantite_2eme_choix DECIMAL(10,2),
    temps_production DECIMAL(10,2),
    temps_arret DECIMAL(10,2),
    vitesse_moyenne DECIMAL(10,2),
    rendement DECIMAL(5,2),
    trs DECIMAL(5,2),
    qr_code_suivi VARCHAR(255),
    statut VARCHAR(50) DEFAULT 'en_cours',
    observations TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lots_coupe (
    id_lot_coupe SERIAL PRIMARY KEY,
    numero_lot VARCHAR(50) UNIQUE NOT NULL,
    id_suivi INTEGER NOT NULL REFERENCES suivi_fabrication(id_suivi),
    date_coupe TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nombre_pieces INTEGER DEFAULT 5,
    metrage_total DECIMAL(10,2),
    qualite VARCHAR(50) DEFAULT '1er_choix',
    coupe_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    qr_code_lot VARCHAR(255),
    emplacement VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'en_attente_finition',
    observations TEXT
);

CREATE TABLE incidents_production (
    id_incident SERIAL PRIMARY KEY,
    id_suivi INTEGER NOT NULL REFERENCES suivi_fabrication(id_suivi),
    date_incident TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type_incident VARCHAR(100) NOT NULL,
    gravite VARCHAR(20) DEFAULT 'moyenne',
    description TEXT NOT NULL,
    quantite_affectee DECIMAL(10,2),
    declare_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    statut VARCHAR(50) DEFAULT 'ouvert',
    date_resolution TIMESTAMP,
    actions_correctives TEXT,
    cout_estime DECIMAL(10,2)
);

CREATE TABLE arrets_production (
    id_arret SERIAL PRIMARY KEY,
    id_suivi INTEGER NOT NULL REFERENCES suivi_fabrication(id_suivi),
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP,
    duree_minutes INTEGER,
    type_arret VARCHAR(100) NOT NULL,
    raison TEXT,
    declare_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    impact_production DECIMAL(10,2),
    observations TEXT
);

-- ✅ Tables suivi fabrication créées

-- ============================================================================
-- DEMANDES INTERVENTION
-- ============================================================================

CREATE TABLE demandes_intervention (
    id_demande SERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_machine INTEGER REFERENCES machines(id_machine),
    type_intervention VARCHAR(100) NOT NULL,
    priorite VARCHAR(20) DEFAULT 'normale',
    description TEXT NOT NULL,
    demande_par INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    assigne_a INTEGER REFERENCES equipe_fabrication(id_operateur),
    statut VARCHAR(50) DEFAULT 'en_attente',
    date_debut_intervention TIMESTAMP,
    date_fin_intervention TIMESTAMP,
    duree_intervention INTEGER,
    diagnostic TEXT,
    actions_effectuees TEXT,
    pieces_changees TEXT,
    cout_intervention DECIMAL(10,2),
    date_cloture TIMESTAMP,
    temps_reponse INTEGER,
    temps_resolution INTEGER,
    cout_perte_production DECIMAL(10,2),
    efficacite_intervention VARCHAR(20)
);

CREATE TABLE demandes_achat_pieces (
    id_demande_achat SERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    designation_piece VARCHAR(200) NOT NULL,
    reference_piece VARCHAR(100),
    quantite INTEGER NOT NULL,
    unite VARCHAR(20) DEFAULT 'pièce',
    urgence VARCHAR(20) DEFAULT 'normale',
    justification TEXT,
    demande_par INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    statut VARCHAR(50) DEFAULT 'en_attente',
    prix_estime DECIMAL(10,2),
    date_validation TIMESTAMP,
    valide_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    date_commande DATE,
    date_reception_prevue DATE,
    observations TEXT
);

CREATE TABLE sla_interventions (
    id_sla SERIAL PRIMARY KEY,
    type_intervention VARCHAR(100) NOT NULL,
    priorite VARCHAR(20) NOT NULL,
    temps_reponse_max INTEGER NOT NULL,
    temps_resolution_max INTEGER NOT NULL,
    alerte_depassement BOOLEAN DEFAULT true,
    UNIQUE(type_intervention, priorite)
);

INSERT INTO sla_interventions (type_intervention, priorite, temps_reponse_max, temps_resolution_max) VALUES
('Machine arrêtée', 'critique', 15, 60),
('Machine arrêtée', 'urgente', 30, 120),
('Réparation équipement', 'critique', 30, 120),
('Réparation équipement', 'urgente', 60, 240),
('Réparation équipement', 'normale', 240, 1440),
('Électricité', 'critique', 15, 60),
('Électricité', 'urgente', 30, 120),
('Entretien', 'normale', 480, 2880),
('Changement pièce', 'urgente', 60, 180),
('Changement pièce', 'normale', 240, 1440);

-- ✅ Tables demandes intervention créées

-- ============================================================================
-- GESTION QUALITÉ ET NON-CONFORMITÉS
-- ============================================================================

CREATE TABLE types_non_conformites (
    id_type_nc SERIAL PRIMARY KEY,
    code_type VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    categorie VARCHAR(50) NOT NULL,
    gravite VARCHAR(20) DEFAULT 'moyenne',
    action_automatique VARCHAR(100),
    description TEXT,
    actif BOOLEAN DEFAULT true
);

INSERT INTO types_non_conformites (code_type, libelle, categorie, gravite, action_automatique) VALUES
('ERR_COULEUR', 'Erreur de couleur', 'couleur', 'critique', 'arret_production'),
('ERR_MODELE', 'Erreur de modèle/dessin', 'defaut', 'critique', 'arret_production'),
('DEFAUT_TISSAGE', 'Défaut de tissage', 'defaut', 'majeure', 'declasser_2eme_choix'),
('MESURE_HORS_TOL', 'Mesure hors tolérance', 'mesure', 'majeure', 'controle_renforce'),
('CASSE_FIL', 'Casse de fil excessive', 'defaut', 'majeure', 'intervention_mecanicien'),
('TENSION_INCORRECTE', 'Tension fil incorrecte', 'defaut', 'mineure', 'ajustement'),
('REBUT', 'Pièce à mettre au rebut', 'rebut', 'critique', 'mise_rebut');

CREATE TABLE non_conformites (
    id_non_conformite SERIAL PRIMARY KEY,
    numero_nc VARCHAR(50) UNIQUE NOT NULL,
    date_detection TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_suivi INTEGER REFERENCES suivi_fabrication(id_suivi),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_machine INTEGER REFERENCES machines(id_machine),
    id_type_nc INTEGER NOT NULL REFERENCES types_non_conformites(id_type_nc),
    description_probleme TEXT NOT NULL,
    quantite_affectee DECIMAL(10,2),
    valeur_perte DECIMAL(10,2),
    declare_par INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    priorite VARCHAR(20) DEFAULT 'haute',
    statut VARCHAR(50) DEFAULT 'ouverte',
    action_immediate TEXT,
    cause_racine TEXT,
    action_corrective TEXT,
    action_preventive TEXT,
    decision_qualite VARCHAR(50),
    quantite_acceptee DECIMAL(10,2),
    quantite_2eme_choix DECIMAL(10,2),
    quantite_rebut DECIMAL(10,2),
    date_debut_traitement TIMESTAMP,
    traite_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_resolution TIMESTAMP,
    duree_resolution INTEGER,
    cout_resolution DECIMAL(10,2),
    valide_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    date_validation TIMESTAMP,
    observations TEXT
);

CREATE TABLE procedures_nc (
    id_procedure SERIAL PRIMARY KEY,
    id_type_nc INTEGER REFERENCES types_non_conformites(id_type_nc),
    ordre_etape INTEGER,
    titre_etape VARCHAR(200) NOT NULL,
    description_etape TEXT,
    responsable_fonction VARCHAR(100),
    delai_max INTEGER,
    document_requis VARCHAR(200),
    validation_requise BOOLEAN DEFAULT false,
    actif BOOLEAN DEFAULT true
);

-- ✅ Tables qualité créées'

-- ============================================================================
-- SYSTÈME D'ALERTES COMPLET
-- ============================================================================

CREATE TABLE types_alertes (
    id_type_alerte SERIAL PRIMARY KEY,
    code_alerte VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    categorie VARCHAR(50),
    niveau_urgence VARCHAR(20) DEFAULT 'moyenne',
    destinataires_fonction TEXT,
    canal_notification VARCHAR(50) DEFAULT 'systeme',
    couleur_badge VARCHAR(20) DEFAULT 'orange',
    son_alerte BOOLEAN DEFAULT false,
    actif BOOLEAN DEFAULT true
);

-- Insérer TOUS les types d'alertes
INSERT INTO types_alertes (code_alerte, libelle, description, categorie, niveau_urgence, destinataires_fonction, couleur_badge, son_alerte) VALUES
-- Production
('ERREUR_COULEUR', '🚨 Erreur de couleur détectée', 'Production avec mauvaise couleur - Arrêt immédiat requis', 'production', 'critique', 'Chef Production, Contrôleur Qualité, Mécanicien', 'red', true),
('ERREUR_MODELE', '⚠️ Erreur de modèle/dessin', 'Mauvais dessin sur machine - Changement requis', 'production', 'critique', 'Mécanicien, Chef Production', 'red', true),
('ARRET_MACHINE', '🔴 Arrêt machine', 'Machine arrêtée - Intervention requise', 'production', 'haute', 'Mécanicien, Tisseur', 'red', true),
('CHANGEMENT_MODELE', '🔄 Changement de modèle requis', 'OF suivant nécessite changement de configuration', 'production', 'haute', 'Mécanicien', 'orange', false),
-- Ensouples
('ENSOUPLE_500M', '📏 Ensouple < 500m', 'Métrage ensouple inférieur à 500 mètres', 'production', 'haute', 'Mécanicien, Magasinier MP', 'orange', false),
('ENSOUPLE_EPUISE', '❌ Ensouple épuisée', 'Ensouple terminée - Changement immédiat', 'production', 'critique', 'Mécanicien', 'red', true),
('ENSOUPLE_RESERVE', 'ℹ️ Ensouple de réserve disponible', 'Ensouple de réserve prête pour attribution', 'production', 'info', 'Mécanicien', 'blue', false),
-- Stock MP
('STOCK_MP_CRITIQUE', '🚨 Stock MP critique', 'Stock en dessous du minimum critique', 'stock', 'critique', 'Magasinier MP, Chef Production', 'red', true),
('STOCK_MP_ALERTE', '⚠️ Stock MP bas', 'Stock en dessous du seuil d''alerte', 'stock', 'haute', 'Magasinier MP', 'orange', false),
('RUPTURE_MP', '❌ Rupture de stock MP', 'Matière première en rupture totale', 'stock', 'critique', 'Magasinier MP, Chef Production', 'red', true),
('OURDISSAGE_URGENT', '⏰ Ourdissage urgent requis', 'Demande d''ourdissage prioritaire', 'stock', 'haute', 'Magasinier MP, Sous-traitant Ourdissage', 'orange', false),
-- Maintenance
('DEMANDE_CRITIQUE', '🆘 Demande intervention CRITIQUE', 'Intervention urgente requise', 'maintenance', 'critique', 'Mécanicien, Chef Production', 'red', true),
('DEMANDE_URGENTE', '⚡ Demande intervention URGENTE', 'Intervention à traiter en priorité', 'maintenance', 'haute', 'Mécanicien', 'orange', true),
('MAINTENANCE_PREVENTIVE', '🔧 Maintenance préventive due', 'Date de maintenance préventive dépassée', 'maintenance', 'moyenne', 'Mécanicien, Chef Production', 'yellow', false),
('PANNE_MACHINE', '🔴 Machine en panne', 'Machine hors service', 'maintenance', 'haute', 'Mécanicien, Chef Production', 'red', true),
-- Qualité
('NC_CRITIQUE', '🚨 Non-conformité critique', 'Problème qualité critique détecté', 'qualite', 'critique', 'Contrôleur Qualité, Chef Production', 'red', true),
('REBUT_ELEVE', '⚠️ Taux de rebut élevé', 'Taux de rebut anormal sur production', 'qualite', 'haute', 'Contrôleur Qualité, Chef Production, Mécanicien', 'orange', false),
('CONTROLE_REQUIS', '✓ Contrôle qualité requis', 'Contrôle première pièce nécessaire', 'qualite', 'moyenne', 'Mécanicien, Contrôleur Qualité', 'blue', false),
('2EME_CHOIX', 'ℹ️ Production classée 2ème choix', 'Pièces déclassées en 2ème choix', 'qualite', 'info', 'Contrôleur Qualité', 'yellow', false),
-- Planning
('RETARD_COMMANDE', '⏰ Commande en retard', 'Date de livraison dépassée', 'planning', 'haute', 'Chef Production', 'red', false),
('COMMANDE_URGENTE', '⚡ Commande urgente', 'Livraison prévue aujourd''hui', 'planning', 'haute', 'Chef Production, Magasinier PF', 'orange', false),
('OF_EN_RETARD', '⏰ OF en retard', 'OF non terminé à la date prévue', 'planning', 'moyenne', 'Chef Production', 'orange', false),
('CONFLIT_PLANNING', '⚠️ Conflit planning', 'Chevauchement dans le planning machines', 'planning', 'moyenne', 'Chef Production', 'yellow', false),
-- Stock PF
('STOCK_PF_BLOQUE', '⚠️ Stock PF bloqué', 'Produits finis en attente depuis plus de 7 jours', 'stock', 'moyenne', 'Magasinier PF, Chef Production', 'yellow', false),
('EXPEDITION_URGENTE', '⚡ Expédition urgente', 'Expédition à préparer aujourd''hui', 'stock', 'haute', 'Magasinier PF', 'orange', false),
-- Sous-traitance
('RETOUR_ST_RETARD', '⏰ Retour sous-traitant en retard', 'Date de retour prévue dépassée', 'production', 'haute', 'Magasinier Sous-Traitant, Chef Production', 'orange', false),
('ST_CONFORME', '✓ Retour sous-traitant conforme', 'Marchandise reçue et conforme', 'production', 'info', 'Magasinier Sous-Traitant', 'green', false),
('ST_NON_CONFORME', '❌ Retour sous-traitant non conforme', 'Problème qualité sur retour', 'qualite', 'haute', 'Magasinier Sous-Traitant, Contrôleur Qualité', 'red', false);

CREATE TABLE alertes_actives (
    id_alerte SERIAL PRIMARY KEY,
    id_type_alerte INTEGER NOT NULL REFERENCES types_alertes(id_type_alerte),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_machine INTEGER REFERENCES machines(id_machine),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_suivi INTEGER REFERENCES suivi_fabrication(id_suivi),
    id_ensouple INTEGER REFERENCES ensouples(id_ensouple),
    id_mp INTEGER REFERENCES matieres_premieres(id_mp),
    id_stock_mp INTEGER REFERENCES stock_mp(id_stock_mp),
    id_commande INTEGER REFERENCES commandes(id_commande),
    id_demande_intervention INTEGER REFERENCES demandes_intervention(id_demande),
    id_non_conformite INTEGER REFERENCES non_conformites(id_non_conformite),
    message TEXT,
    valeur_critique VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'active',
    priorite_actuelle VARCHAR(20),
    acquittee_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    date_acquittement TIMESTAMP,
    traitee_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    date_traitement TIMESTAMP,
    action_prise TEXT,
    date_expiration TIMESTAMP,
    notifications_envoyees TEXT,
    observations TEXT
);

CREATE TABLE historique_alertes (
    id_historique SERIAL PRIMARY KEY,
    id_alerte INTEGER,
    id_type_alerte INTEGER,
    date_creation TIMESTAMP,
    date_resolution TIMESTAMP,
    duree_resolution INTEGER,
    priorite VARCHAR(20),
    traite_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    action_prise TEXT,
    efficacite_resolution VARCHAR(20),
    date_archivage TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Système d''alertes créé (25 types)

-- ============================================================================
-- FINITION
-- ============================================================================

CREATE TABLE suivi_finition (
    id_suivi_finition SERIAL PRIMARY KEY,
    id_commande INTEGER NOT NULL REFERENCES commandes(id_commande),
    date_entree TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_sortie_prevue DATE,
    date_sortie_reelle TIMESTAMP,
    responsable INTEGER REFERENCES equipe_fabrication(id_operateur),
    statut VARCHAR(50) DEFAULT 'en_attente',
    observations TEXT
);

CREATE TABLE operations_finition (
    id_operation_finition SERIAL PRIMARY KEY,
    id_suivi_finition INTEGER NOT NULL REFERENCES suivi_finition(id_suivi_finition),
    id_lot_coupe INTEGER REFERENCES lots_coupe(id_lot_coupe),
    type_operation VARCHAR(100) NOT NULL,
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    quantite_traitee DECIMAL(10,2),
    execute_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    statut VARCHAR(50) DEFAULT 'en_attente',
    observations TEXT
);

-- ✅ Tables finition créées

-- ============================================================================
-- SOUS-TRAITANCE
-- ============================================================================

CREATE TABLE sous_traitants (
    id_sous_traitant SERIAL PRIMARY KEY,
    code_sous_traitant VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(200) NOT NULL,
    specialite VARCHAR(100),
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(150),
    contact_principal VARCHAR(200),
    delai_traitement_moyen INTEGER,
    taux_conformite DECIMAL(5,2),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mouvements_sous_traitance (
    id_mouvement_st SERIAL PRIMARY KEY,
    numero_mouvement VARCHAR(50) UNIQUE NOT NULL,
    id_sous_traitant INTEGER NOT NULL REFERENCES sous_traitants(id_sous_traitant),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    type_mouvement VARCHAR(20) NOT NULL,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_retour_prevue DATE,
    date_retour_reelle TIMESTAMP,
    qr_code_sortie VARCHAR(255),
    qr_code_retour VARCHAR(255),
    statut VARCHAR(50) DEFAULT 'en_cours',
    observations TEXT,
    execute_par INTEGER REFERENCES equipe_fabrication(id_operateur)
);

CREATE TABLE mouvements_st_detail (
    id_detail_st SERIAL PRIMARY KEY,
    id_mouvement_st INTEGER NOT NULL REFERENCES mouvements_sous_traitance(id_mouvement_st) ON DELETE CASCADE,
    id_lot_coupe INTEGER REFERENCES lots_coupe(id_lot_coupe),
    quantite_envoyee DECIMAL(10,2),
    quantite_retournee DECIMAL(10,2),
    quantite_conforme DECIMAL(10,2),
    quantite_non_conforme DECIMAL(10,2),
    observations TEXT
);

-- ✅ Tables sous-traitance créées

-- ============================================================================
-- STOCK PRODUITS FINIS
-- ============================================================================

CREATE TABLE stock_produits_finis (
    id_stock_pf SERIAL PRIMARY KEY,
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article),
    id_lot_coupe INTEGER REFERENCES lots_coupe(id_lot_coupe),
    numero_lot_pf VARCHAR(50) NOT NULL,
    quantite_disponible DECIMAL(10,2) DEFAULT 0,
    quantite_reservee DECIMAL(10,2) DEFAULT 0,
    qualite VARCHAR(50) DEFAULT '1er_choix',
    emplacement VARCHAR(100),
    date_entree TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'en_attente_expedition',
    qr_code_pf VARCHAR(255),
    observations TEXT,
    UNIQUE(id_article, numero_lot_pf)
);

CREATE TABLE inventaires_pf (
    id_inventaire_pf SERIAL PRIMARY KEY,
    numero_inventaire VARCHAR(50) UNIQUE NOT NULL,
    date_inventaire DATE NOT NULL,
    type_inventaire VARCHAR(50) DEFAULT 'complet',
    statut VARCHAR(50) DEFAULT 'en_cours',
    responsable INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_validation TIMESTAMP,
    valide_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    observations TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventaires_pf_detail (
    id_detail_pf SERIAL PRIMARY KEY,
    id_inventaire_pf INTEGER NOT NULL REFERENCES inventaires_pf(id_inventaire_pf) ON DELETE CASCADE,
    id_stock_pf INTEGER NOT NULL REFERENCES stock_produits_finis(id_stock_pf),
    quantite_theorique DECIMAL(10,2),
    quantite_physique DECIMAL(10,2),
    ecart DECIMAL(10,2),
    observations TEXT,
    date_comptage TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Tables stock PF créées

-- ============================================================================
-- EXPÉDITIONS
-- ============================================================================

CREATE TABLE expeditions (
    id_expedition SERIAL PRIMARY KEY,
    numero_expedition VARCHAR(50) UNIQUE NOT NULL,
    id_commande INTEGER NOT NULL REFERENCES commandes(id_commande),
    date_expedition DATE NOT NULL,
    date_livraison_prevue DATE,
    transporteur VARCHAR(200),
    numero_bl VARCHAR(50),
    adresse_livraison TEXT,
    statut VARCHAR(50) DEFAULT 'en_preparation',
    prepare_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_chargement TIMESTAMP,
    observations TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expedition_palettes (
    id_palette SERIAL PRIMARY KEY,
    numero_palette VARCHAR(50) UNIQUE NOT NULL,
    id_expedition INTEGER NOT NULL REFERENCES expeditions(id_expedition),
    poids_total DECIMAL(10,2),
    dimensions VARCHAR(100),
    nombre_colis INTEGER DEFAULT 0,
    qr_code_palette VARCHAR(255),
    observations TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expedition_colis (
    id_colis SERIAL PRIMARY KEY,
    numero_colis VARCHAR(50) UNIQUE NOT NULL,
    id_palette INTEGER REFERENCES expedition_palettes(id_palette),
    poids_net DECIMAL(10,2),
    poids_brut DECIMAL(10,2),
    dimensions VARCHAR(100),
    qr_code_colis VARCHAR(255),
    observations TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expedition_colis_detail (
    id_detail_colis SERIAL PRIMARY KEY,
    id_colis INTEGER NOT NULL REFERENCES expedition_colis(id_colis) ON DELETE CASCADE,
    id_stock_pf INTEGER NOT NULL REFERENCES stock_produits_finis(id_stock_pf),
    quantite DECIMAL(10,2) NOT NULL,
    observations TEXT
);

-- ✅ Tables expéditions créées

-- ============================================================================
-- INDEX PERFORMANCE FICHIER 2
-- ============================================================================

CREATE INDEX idx_suivi_of ON suivi_fabrication(id_of);
CREATE INDEX idx_suivi_machine ON suivi_fabrication(id_machine);
CREATE INDEX idx_suivi_dates ON suivi_fabrication(date_debut, date_fin);
CREATE INDEX idx_ensouples_statut ON ensouples(statut);
CREATE INDEX idx_stock_pf_article ON stock_produits_finis(id_article);
CREATE INDEX idx_stock_pf_statut ON stock_produits_finis(statut);
CREATE INDEX idx_expeditions_commande ON expeditions(id_commande);
CREATE INDEX idx_logs_utilisateur ON logs_systeme(id_utilisateur);
CREATE INDEX idx_logs_date ON logs_systeme(date_action);

--✅ Index créés

-- Log
INSERT INTO logs_systeme (type_action, module, description, niveau_severite)
VALUES ('INIT', 'PRODUCTION_QUALITE', 'Tables production et qualité créées', 'INFO');

--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ✅ FICHIER 2/3 TERMINÉ
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Exécutez maintenant : 03_flux_et_tracabilite.sql'
--