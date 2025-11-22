-- ============================================================================
-- FICHIER 3/3 : FLUX, TRAÇABILITÉ ET AUTOMATISATIONS (CORRIGÉ)
-- ============================================================================
-- Flux demandes, traçabilité 2ème choix, triggers, vues, fonctions
-- Temps d'exécution: ~1-2 minutes
-- ============================================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔄 FICHIER 3/3 : FLUX ET TRAÇABILITÉ
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- SUPPRESSION TABLES FICHIER 3
-- ============================================================================

DROP TABLE IF EXISTS historique_mouvements_2eme_choix CASCADE;
DROP TABLE IF EXISTS declarations_2eme_choix CASCADE;
DROP TABLE IF EXISTS conditions_acceptation_2eme_choix CASCADE;
DROP TABLE IF EXISTS grille_prix_2eme_choix CASCADE;
DROP TABLE IF EXISTS motifs_2eme_choix CASCADE;
DROP TABLE IF EXISTS notifications_demandes CASCADE;
DROP TABLE IF EXISTS demandes_expedition CASCADE;
DROP TABLE IF EXISTS demandes_controle_qualite CASCADE;
DROP TABLE IF EXISTS demandes_finition CASCADE;
DROP TABLE IF EXISTS demandes_completion_commande CASCADE;
DROP TABLE IF EXISTS demandes_retour_mp CASCADE;
DROP TABLE IF EXISTS historique_livraisons_mp CASCADE;
DROP TABLE IF EXISTS demandes_mp_tisseur CASCADE;

-- ✅ Nettoyage fichier 3 terminé

-- ============================================================================
-- FLUX DEMANDES INTER-POSTES
-- ============================================================================

CREATE TABLE demandes_mp_tisseur (
    id_demande_mp_tisseur SERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    demande_par INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    id_machine INTEGER REFERENCES machines(id_machine),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    quantite_demandee DECIMAL(10,3) NOT NULL,
    type_demande VARCHAR(50) DEFAULT 'normale',
    raison TEXT NOT NULL,
    priorite VARCHAR(20) DEFAULT 'normale',
    statut VARCHAR(50) DEFAULT 'en_attente',
    traitee_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_debut_traitement TIMESTAMP,
    date_preparation TIMESTAMP,
    quantite_preparee DECIMAL(10,3),
    id_preparation INTEGER REFERENCES preparation_mp(id_preparation),
    date_livraison TIMESTAMP,
    livre_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    recu_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    emplacement_livraison VARCHAR(100),
    temps_reponse INTEGER,
    temps_preparation INTEGER,
    temps_livraison INTEGER,
    temps_total INTEGER,
    observations TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historique_livraisons_mp (
    id_historique SERIAL PRIMARY KEY,
    id_demande_mp_tisseur INTEGER REFERENCES demandes_mp_tisseur(id_demande_mp_tisseur),
    date_livraison TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    quantite_livree DECIMAL(10,3) NOT NULL,
    id_machine INTEGER REFERENCES machines(id_machine),
    livre_par INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    recu_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    numero_lot VARCHAR(50),
    observations TEXT
);

CREATE TABLE demandes_retour_mp (
    id_demande_retour SERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    demande_par INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    fonction_demandeur VARCHAR(100),
    id_machine INTEGER REFERENCES machines(id_machine),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    quantite_retour DECIMAL(10,3) NOT NULL,
    numero_lot_origine VARCHAR(50),
    etat_mp VARCHAR(50) DEFAULT 'bonne',
    motif_retour VARCHAR(100) NOT NULL,
    statut VARCHAR(50) DEFAULT 'en_attente',
    traitee_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_reception TIMESTAMP,
    quantite_receptionnee DECIMAL(10,3),
    quantite_acceptee DECIMAL(10,3),
    quantite_refusee DECIMAL(10,3),
    decision VARCHAR(50),
    id_stock_mp_destination INTEGER REFERENCES stock_mp(id_stock_mp),
    observations TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE demandes_completion_commande (
    id_demande_completion SERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    demande_par INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    fonction_demandeur VARCHAR(100),
    id_commande INTEGER NOT NULL REFERENCES commandes(id_commande),
    id_article_commande INTEGER REFERENCES articles_commande(id_article_commande),
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article),
    quantite_commandee DECIMAL(10,2) NOT NULL,
    quantite_produite DECIMAL(10,2) NOT NULL,
    quantite_manquante DECIMAL(10,2) NOT NULL,
    quantite_demandee_supplement DECIMAL(10,2) NOT NULL,
    motif VARCHAR(100) NOT NULL,
    description_probleme TEXT NOT NULL,
    quantite_rebut DECIMAL(10,2) DEFAULT 0,
    quantite_2eme_choix DECIMAL(10,2) DEFAULT 0,
    valeur_perte DECIMAL(10,2),
    priorite VARCHAR(20) DEFAULT 'haute',
    date_livraison_client DATE,
    jours_restants INTEGER,
    impact_client VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'en_attente',
    validee_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    date_validation TIMESTAMP,
    decision TEXT,
    id_of_supplement INTEGER REFERENCES ordres_fabrication(id_of),
    date_debut_production TIMESTAMP,
    date_fin_production TIMESTAMP,
    quantite_produite_supplement DECIMAL(10,2),
    cause_racine TEXT,
    action_preventive TEXT,
    responsable_analyse INTEGER REFERENCES equipe_fabrication(id_operateur),
    observations TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE demandes_finition (
    id_demande_finition SERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    demande_par INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    id_lot_coupe INTEGER NOT NULL REFERENCES lots_coupe(id_lot_coupe),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_commande INTEGER REFERENCES commandes(id_commande),
    quantite DECIMAL(10,2) NOT NULL,
    qualite VARCHAR(50) DEFAULT '1er_choix',
    operations_requises TEXT NOT NULL,
    instructions_speciales TEXT,
    priorite VARCHAR(20) DEFAULT 'normale',
    date_besoin DATE,
    statut VARCHAR(50) DEFAULT 'en_attente',
    affectee_a INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_debut_finition TIMESTAMP,
    date_fin_finition TIMESTAMP,
    quantite_traitee DECIMAL(10,2),
    quantite_conforme DECIMAL(10,2),
    quantite_rebut DECIMAL(10,2),
    id_suivi_finition INTEGER REFERENCES suivi_finition(id_suivi_finition),
    observations TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE demandes_controle_qualite (
    id_demande_controle SERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    demande_par INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    fonction_demandeur VARCHAR(100),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_machine INTEGER REFERENCES machines(id_machine),
    id_lot_coupe INTEGER REFERENCES lots_coupe(id_lot_coupe),
    id_stock_pf INTEGER REFERENCES stock_produits_finis(id_stock_pf),
    type_controle VARCHAR(100) NOT NULL,
    raison_demande TEXT NOT NULL,
    quantite_a_controler DECIMAL(10,2),
    points_controle TEXT,
    priorite VARCHAR(20) DEFAULT 'normale',
    statut VARCHAR(50) DEFAULT 'en_attente',
    affectee_a INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_debut_controle TIMESTAMP,
    date_fin_controle TIMESTAMP,
    conformite BOOLEAN,
    quantite_controlee DECIMAL(10,2),
    quantite_conforme DECIMAL(10,2),
    quantite_non_conforme DECIMAL(10,2),
    defauts_constates TEXT,
    decision VARCHAR(50),
    actions_correctives TEXT,
    id_non_conformite INTEGER REFERENCES non_conformites(id_non_conformite),
    observations TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE demandes_expedition (
    id_demande_expedition SERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    demande_par INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
    fonction_demandeur VARCHAR(100),
    id_commande INTEGER NOT NULL REFERENCES commandes(id_commande),
    date_expedition_souhaitee DATE NOT NULL,
    date_livraison_client DATE NOT NULL,
    adresse_livraison TEXT NOT NULL,
    transporteur VARCHAR(200),
    instructions_expedition TEXT,
    priorite VARCHAR(20) DEFAULT 'normale',
    type_expedition VARCHAR(50) DEFAULT 'standard',
    statut VARCHAR(50) DEFAULT 'en_attente',
    affectee_a INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_debut_preparation TIMESTAMP,
    date_prete TIMESTAMP,
    id_expedition INTEGER REFERENCES expeditions(id_expedition),
    date_expedition_reelle TIMESTAMP,
    numero_bl VARCHAR(50),
    stock_insuffisant BOOLEAN DEFAULT false,
    articles_manquants TEXT,
    delai_respecte BOOLEAN,
    observations TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications_demandes (
    id_notification SERIAL PRIMARY KEY,
    date_notification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type_demande VARCHAR(50) NOT NULL,
    id_demande INTEGER NOT NULL,
    numero_demande VARCHAR(50),
    id_utilisateur_destinataire INTEGER REFERENCES utilisateurs(id_utilisateur),
    fonction_destinataire VARCHAR(100),
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priorite VARCHAR(20) DEFAULT 'normale',
    lue BOOLEAN DEFAULT false,
    date_lecture TIMESTAMP,
    acquittee BOOLEAN DEFAULT false,
    date_acquittement TIMESTAMP,
    date_expiration TIMESTAMP
);

-- ✅ Tables flux demandes créées

-- ============================================================================
-- TRAÇABILITÉ 2ÈME CHOIX
-- ============================================================================

CREATE TABLE motifs_2eme_choix (
    id_motif SERIAL PRIMARY KEY,
    code_motif VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    categorie VARCHAR(50),
    description TEXT,
    gravite VARCHAR(20) DEFAULT 'moyenne',
    impact_prix DECIMAL(5,2) DEFAULT 0,
    peut_etre_vendu BOOLEAN DEFAULT true,
    validation_obligatoire BOOLEAN DEFAULT false,
    actif BOOLEAN DEFAULT true
);

INSERT INTO motifs_2eme_choix (code_motif, libelle, categorie, gravite, impact_prix, validation_obligatoire) VALUES
('DEFAUT_TISSAGE', 'Défaut de tissage visible', 'tissage', 'moyenne', 30, true),
('RAYURE', 'Rayure ou marque visible', 'aspect', 'moyenne', 25, false),
('TACHE', 'Tache légère', 'aspect', 'mineure', 20, false),
('IRREGULARITE', 'Irrégularité texture', 'aspect', 'mineure', 15, false),
('LUSTRE', 'Lustre ou brillance irrégulière', 'aspect', 'mineure', 15, false),
('LARGEUR_HT', 'Largeur hors tolérance', 'mesure', 'moyenne', 25, true),
('POIDS_HT', 'Poids au mètre hors tolérance', 'mesure', 'moyenne', 20, true),
('LONGUEUR_COURTE', 'Longueur insuffisante', 'mesure', 'mineure', 10, false),
('NUANCE_COULEUR', 'Légère différence de nuance', 'couleur', 'moyenne', 30, true),
('DECOLORATION', 'Décoloration partielle', 'couleur', 'majeure', 40, true),
('CASSE_FIL', 'Casse de fil réparée', 'tissage', 'mineure', 15, false),
('DENSITE_IRREGULIERE', 'Densité irrégulière', 'tissage', 'moyenne', 25, false),
('DEFAUT_LISIERE', 'Défaut lisière', 'tissage', 'mineure', 10, false),
('COUPE_IRREGULIERE', 'Coupe irrégulière', 'finition', 'mineure', 15, false),
('FRANGE_DEFECTUEUSE', 'Frange défectueuse', 'finition', 'mineure', 10, false),
('PLIAGE_MARQUE', 'Marque de pliage', 'finition', 'mineure', 5, false);

CREATE TABLE declarations_2eme_choix (
    id_declaration SERIAL PRIMARY KEY,
    numero_declaration VARCHAR(50) UNIQUE NOT NULL,
    date_declaration TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    origine VARCHAR(50) NOT NULL,
    id_suivi INTEGER REFERENCES suivi_fabrication(id_suivi),
    id_lot_coupe INTEGER REFERENCES lots_coupe(id_lot_coupe),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_machine INTEGER REFERENCES machines(id_machine),
    id_non_conformite INTEGER REFERENCES non_conformites(id_non_conformite),
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article),
    code_article VARCHAR(50),
    designation VARCHAR(200),
    quantite_declaree DECIMAL(10,2) NOT NULL,
    unite VARCHAR(20) DEFAULT 'mètre',
    nombre_pieces INTEGER,
    id_motif_principal INTEGER NOT NULL REFERENCES motifs_2eme_choix(id_motif),
    motifs_secondaires INTEGER[],
    description_defauts TEXT NOT NULL,
    photos_defauts TEXT,
    declare_par INTEGER NOT NULL REFERENCES equipe_fabrication(id_operateur),
    fonction_declarant VARCHAR(100),
    validation_requise BOOLEAN DEFAULT true,
    statut_validation VARCHAR(50) DEFAULT 'en_attente',
    validee_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_validation TIMESTAMP,
    commentaire_validation TEXT,
    decision_finale VARCHAR(50),
    peut_etre_vendu BOOLEAN DEFAULT true,
    prix_1er_choix DECIMAL(10,2),
    pourcentage_reduction DECIMAL(5,2),
    prix_2eme_choix DECIMAL(10,2),
    valeur_perte DECIMAL(10,2),
    statut_stock VARCHAR(50) DEFAULT 'en_attente_stockage',
    id_stock_pf INTEGER REFERENCES stock_produits_finis(id_stock_pf),
    emplacement_stock VARCHAR(100),
    vendu BOOLEAN DEFAULT false,
    id_commande_vente INTEGER REFERENCES commandes(id_commande),
    date_vente TIMESTAMP,
    prix_vente_reel DECIMAL(10,2),
    id_client_vente INTEGER REFERENCES clients(id_client),
    qr_code_2eme_choix VARCHAR(255),
    cause_racine TEXT,
    action_preventive TEXT,
    responsable_cause VARCHAR(100),
    observations TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historique_mouvements_2eme_choix (
    id_mouvement SERIAL PRIMARY KEY,
    id_declaration INTEGER NOT NULL REFERENCES declarations_2eme_choix(id_declaration),
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type_mouvement VARCHAR(50) NOT NULL,
    de_statut VARCHAR(50),
    vers_statut VARCHAR(50),
    quantite DECIMAL(10,2),
    effectue_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    emplacement_origine VARCHAR(100),
    emplacement_destination VARCHAR(100),
    observations TEXT
);

CREATE TABLE grille_prix_2eme_choix (
    id_grille_prix SERIAL PRIMARY KEY,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    id_motif INTEGER REFERENCES motifs_2eme_choix(id_motif),
    pourcentage_reduction DECIMAL(5,2) NOT NULL,
    prix_minimum DECIMAL(10,2),
    date_debut_validite DATE DEFAULT CURRENT_DATE,
    date_fin_validite DATE,
    actif BOOLEAN DEFAULT true
);

CREATE TABLE conditions_acceptation_2eme_choix (
    id_condition SERIAL PRIMARY KEY,
    id_client INTEGER REFERENCES clients(id_client),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    motifs_acceptes INTEGER[],
    motifs_refuses INTEGER[],
    reduction_max_acceptee DECIMAL(5,2),
    quantite_max_2eme_choix DECIMAL(10,2),
    validation_commerciale_requise BOOLEAN DEFAULT true,
    observations TEXT,
    actif BOOLEAN DEFAULT true
);

-- ✅ Tables traçabilité 2ème choix créées (16 motifs)

-- ============================================================================
-- TRIGGERS AUTOMATIQUES
-- ============================================================================

-- 🔧 SUPPRESSION DES TRIGGERS EXISTANTS (CORRECTION)
DROP TRIGGER IF EXISTS trg_utilisateurs_modification ON utilisateurs;
DROP TRIGGER IF EXISTS trg_commandes_modification ON commandes;
DROP TRIGGER IF EXISTS trg_of_modification ON ordres_fabrication;
DROP TRIGGER IF EXISTS trg_flux_alerte_ensouple ON ensouples;
DROP TRIGGER IF EXISTS trg_calcul_prix_2eme_choix ON declarations_2eme_choix;
DROP TRIGGER IF EXISTS trg_mouvement_2eme_choix ON declarations_2eme_choix;

-- Trigger: Mise à jour date_modification
CREATE OR REPLACE FUNCTION update_date_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_utilisateurs_modification BEFORE UPDATE ON utilisateurs FOR EACH ROW EXECUTE FUNCTION update_date_modification();
CREATE TRIGGER trg_commandes_modification BEFORE UPDATE ON commandes FOR EACH ROW EXECUTE FUNCTION update_date_modification();
CREATE TRIGGER trg_of_modification BEFORE UPDATE ON ordres_fabrication FOR EACH ROW EXECUTE FUNCTION update_date_modification();

-- Trigger: Alerte ensouple < 500m
CREATE OR REPLACE FUNCTION flux_alerte_ensouple() RETURNS TRIGGER AS $$
DECLARE v_metrage_restant DECIMAL(10,2); v_id_machine INTEGER;
BEGIN
    SELECT metrage_restant INTO v_metrage_restant FROM ensouples WHERE id_ensouple = NEW.id_ensouple;
    IF v_metrage_restant < 500 AND v_metrage_restant > 0 THEN
        SELECT id_machine INTO v_id_machine FROM ensouples_attributions WHERE id_ensouple = NEW.id_ensouple AND statut = 'en_cours' LIMIT 1;
        IF NOT EXISTS (SELECT 1 FROM alertes_actives WHERE id_ensouple = NEW.id_ensouple AND id_type_alerte = (SELECT id_type_alerte FROM types_alertes WHERE code_alerte = 'ENSOUPLE_500M') AND statut = 'active') THEN
            INSERT INTO alertes_actives (id_type_alerte, id_ensouple, id_machine, message, valeur_critique, priorite_actuelle)
            SELECT ta.id_type_alerte, NEW.id_ensouple, v_id_machine, 'Ensouple ' || e.numero_ensouple || ' - Métrage restant: ' || v_metrage_restant || 'm', v_metrage_restant || 'm', ta.niveau_urgence
            FROM types_alertes ta LEFT JOIN ensouples e ON e.id_ensouple = NEW.id_ensouple WHERE ta.code_alerte = 'ENSOUPLE_500M';
        END IF;
    END IF;
    IF v_metrage_restant <= 0 THEN
        INSERT INTO alertes_actives (id_type_alerte, id_ensouple, id_machine, message, valeur_critique, priorite_actuelle)
        SELECT ta.id_type_alerte, NEW.id_ensouple, v_id_machine, 'Ensouple ' || e.numero_ensouple || ' ÉPUISÉE', '0m', ta.niveau_urgence
        FROM types_alertes ta LEFT JOIN ensouples e ON e.id_ensouple = NEW.id_ensouple WHERE ta.code_alerte = 'ENSOUPLE_EPUISE'
        AND NOT EXISTS (SELECT 1 FROM alertes_actives WHERE id_ensouple = NEW.id_ensouple AND id_type_alerte = ta.id_type_alerte AND statut = 'active');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_flux_alerte_ensouple AFTER UPDATE ON ensouples FOR EACH ROW WHEN (OLD.metrage_restant IS DISTINCT FROM NEW.metrage_restant) EXECUTE FUNCTION flux_alerte_ensouple();

-- Trigger: Calcul prix 2ème choix
CREATE OR REPLACE FUNCTION calcul_prix_2eme_choix() RETURNS TRIGGER AS $$
DECLARE v_prix_1er DECIMAL(10,2); v_reduction DECIMAL(5,2);
BEGIN
    SELECT prix_unitaire_base INTO v_prix_1er FROM articles_catalogue WHERE id_article = NEW.id_article;
    NEW.prix_1er_choix = v_prix_1er;
    SELECT impact_prix INTO v_reduction FROM motifs_2eme_choix WHERE id_motif = NEW.id_motif_principal;
    NEW.pourcentage_reduction = COALESCE(v_reduction, 0);
    NEW.prix_2eme_choix = v_prix_1er * (1 - NEW.pourcentage_reduction / 100);
    NEW.valeur_perte = (v_prix_1er - NEW.prix_2eme_choix) * NEW.quantite_declaree;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcul_prix_2eme_choix BEFORE INSERT OR UPDATE ON declarations_2eme_choix FOR EACH ROW EXECUTE FUNCTION calcul_prix_2eme_choix();

-- Trigger: Historique 2ème choix
CREATE OR REPLACE FUNCTION mouvement_2eme_choix() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO historique_mouvements_2eme_choix (id_declaration, type_mouvement, vers_statut, quantite, effectue_par, observations)
        VALUES (NEW.id_declaration, 'declaration', NEW.statut_validation, NEW.quantite_declaree, NEW.declare_par, 'Déclaration initiale');
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.statut_validation != NEW.statut_validation THEN
            INSERT INTO historique_mouvements_2eme_choix (id_declaration, type_mouvement, de_statut, vers_statut, quantite, effectue_par, observations)
            VALUES (NEW.id_declaration, 'validation', OLD.statut_validation, NEW.statut_validation, NEW.quantite_declaree, NEW.validee_par, NEW.commentaire_validation);
        END IF;
        IF OLD.statut_stock != NEW.statut_stock AND NEW.statut_stock = 'stocke' THEN
            INSERT INTO historique_mouvements_2eme_choix (id_declaration, type_mouvement, vers_statut, quantite, emplacement_destination, observations)
            VALUES (NEW.id_declaration, 'stockage', 'stocke', NEW.quantite_declaree, NEW.emplacement_stock, 'Mise en stock 2ème choix');
        END IF;
        IF OLD.vendu = false AND NEW.vendu = true THEN
            INSERT INTO historique_mouvements_2eme_choix (id_declaration, type_mouvement, vers_statut, quantite, emplacement_origine, observations)
            VALUES (NEW.id_declaration, 'vente', 'vendu', NEW.quantite_declaree, NEW.emplacement_stock, 'Vendu');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mouvement_2eme_choix AFTER INSERT OR UPDATE ON declarations_2eme_choix FOR EACH ROW EXECUTE FUNCTION mouvement_2eme_choix();

-- ✅ Triggers créés (6 triggers)

-- ============================================================================
-- VUES DASHBOARD
-- ============================================================================

CREATE OR REPLACE VIEW v_utilisateurs_personnel AS
SELECT u.id_utilisateur, u.nom_utilisateur, u.email, u.actif AS compte_actif, e.matricule, e.nom || ' ' || e.prenom AS nom_complet, e.fonction, e.departement, e.telephone,
       STRING_AGG(r.nom_role, ', ') AS roles, u.derniere_connexion,
       CASE WHEN u.compte_verrouille THEN '🔒 VERROUILLÉ' WHEN NOT u.actif THEN '❌ INACTIF' ELSE '✅ ACTIF' END AS statut_compte
FROM utilisateurs u LEFT JOIN equipe_fabrication e ON u.id_operateur = e.id_operateur
LEFT JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur LEFT JOIN roles r ON ur.id_role = r.id_role
GROUP BY u.id_utilisateur, e.matricule, e.nom, e.prenom, e.fonction, e.departement, e.telephone, u.compte_verrouille, u.actif, u.derniere_connexion;

CREATE OR REPLACE VIEW v_dashboard_production AS
SELECT m.numero_machine, m.statut AS statut_machine, o.numero_of, o.statut AS statut_of, a.code_article, a.designation,
       s.date_debut, s.quantite_produite, s.quantite_bonne, s.trs, s.rendement, e.nom || ' ' || e.prenom AS operateur,
       CASE WHEN s.date_fin IS NULL THEN 'EN COURS' ELSE 'TERMINE' END AS etat_production
FROM suivi_fabrication s JOIN ordres_fabrication o ON s.id_of = o.id_of JOIN articles_catalogue a ON o.id_article = a.id_article
LEFT JOIN machines m ON s.id_machine = m.id_machine LEFT JOIN equipe_fabrication e ON s.id_operateur = e.id_operateur
WHERE s.date_debut >= CURRENT_DATE - INTERVAL '7 days' ORDER BY s.date_debut DESC;

CREATE OR REPLACE VIEW v_stock_mp_alertes AS
SELECT mp.code_mp, mp.designation, f.raison_sociale AS fournisseur, SUM(s.quantite_disponible) AS stock_total, mp.stock_minimum, mp.stock_alerte,
       CASE WHEN SUM(s.quantite_disponible) <= mp.stock_minimum THEN 'CRITIQUE' WHEN SUM(s.quantite_disponible) <= mp.stock_alerte THEN 'ALERTE' ELSE 'OK' END AS niveau_alerte
FROM matieres_premieres mp LEFT JOIN stock_mp s ON mp.id_mp = s.id_mp AND s.statut = 'disponible' LEFT JOIN fournisseurs f ON mp.id_fournisseur = f.id_fournisseur
WHERE mp.actif = true GROUP BY mp.id_mp, mp.code_mp, mp.designation, mp.stock_minimum, mp.stock_alerte, f.raison_sociale
HAVING SUM(s.quantite_disponible) <= mp.stock_alerte OR SUM(s.quantite_disponible) IS NULL ORDER BY niveau_alerte DESC, stock_total ASC;

CREATE OR REPLACE VIEW v_commandes_en_cours AS
SELECT c.numero_commande, cl.raison_sociale AS client, c.date_commande, c.date_livraison_prevue, c.statut, c.priorite,
       COUNT(DISTINCT ac.id_article_commande) AS nb_articles, SUM(ac.quantite_commandee) AS quantite_totale, SUM(ac.quantite_produite) AS quantite_produite,
       ROUND(SUM(ac.quantite_produite) / NULLIF(SUM(ac.quantite_commandee), 0) * 100, 2) AS taux_avancement, c.montant_total,
       CASE WHEN c.date_livraison_prevue < CURRENT_DATE AND c.statut != 'livree' THEN 'RETARD' WHEN c.date_livraison_prevue = CURRENT_DATE THEN 'URGENT' ELSE 'NORMAL' END AS urgence
FROM commandes c JOIN clients cl ON c.id_client = cl.id_client LEFT JOIN articles_commande ac ON c.id_commande = ac.id_commande
WHERE c.statut NOT IN ('annulee', 'livree') GROUP BY c.id_commande, cl.raison_sociale ORDER BY urgence DESC, c.date_livraison_prevue ASC;

-- 🔧 VUE CORRIGÉE : v_stock_2eme_choix (suppression du doublon date_declaration)
CREATE OR REPLACE VIEW v_stock_2eme_choix AS
SELECT d.id_declaration, d.numero_declaration, d.date_declaration, a.code_article, a.designation, 
       d.quantite_declaree, d.nombre_pieces, d.unite,
       m.libelle AS motif_principal, m.categorie, d.description_defauts, 
       d.statut_validation, e_valid.nom || ' ' || e_valid.prenom AS valideur, d.date_validation, d.decision_finale,
       d.prix_1er_choix, d.pourcentage_reduction, d.prix_2eme_choix, d.valeur_perte, 
       d.statut_stock, d.emplacement_stock, spf.numero_lot_pf, d.vendu,
       CASE WHEN d.vendu THEN 'VENDU' ELSE 'DISPONIBLE' END AS disponibilite, 
       d.prix_vente_reel, cl.raison_sociale AS client_vendu, c.numero_commande AS commande_vente,
       CURRENT_DATE - d.date_declaration::DATE AS jours_en_stock,
       CASE WHEN CURRENT_DATE - d.date_declaration::DATE > 90 THEN '🚨 > 90 jours' 
            WHEN CURRENT_DATE - d.date_declaration::DATE > 60 THEN '⚠️ > 60 jours'
            WHEN CURRENT_DATE - d.date_declaration::DATE > 30 THEN '⏰ > 30 jours' 
            ELSE '✓ Récent' END AS anciennete_stock,
       d.qr_code_2eme_choix, o.numero_of, m_machine.numero_machine, 
       e_declarant.nom || ' ' || e_declarant.prenom AS declarant
FROM declarations_2eme_choix d 
JOIN articles_catalogue a ON d.id_article = a.id_article 
JOIN motifs_2eme_choix m ON d.id_motif_principal = m.id_motif
LEFT JOIN equipe_fabrication e_valid ON d.validee_par = e_valid.id_operateur 
LEFT JOIN stock_produits_finis spf ON d.id_stock_pf = spf.id_stock_pf
LEFT JOIN commandes c ON d.id_commande_vente = c.id_commande 
LEFT JOIN clients cl ON d.id_client_vente = cl.id_client
LEFT JOIN ordres_fabrication o ON d.id_of = o.id_of 
LEFT JOIN machines m_machine ON d.id_machine = m_machine.id_machine
LEFT JOIN equipe_fabrication e_declarant ON d.declare_par = e_declarant.id_operateur
WHERE d.statut_stock IN ('stocke', 'en_attente_stockage') 
  AND d.decision_finale = 'accepte_2eme_choix' 
ORDER BY d.date_declaration DESC;

-- ✅ Vues dashboard créées (5 vues)

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

CREATE OR REPLACE FUNCTION get_alertes_operateur(p_fonction VARCHAR)
RETURNS TABLE (id_alerte INTEGER, code_alerte VARCHAR, libelle VARCHAR, message TEXT, priorite VARCHAR, couleur VARCHAR, son_alerte BOOLEAN, date_creation TIMESTAMP, contexte TEXT) AS $$
BEGIN
    RETURN QUERY SELECT aa.id_alerte, ta.code_alerte, ta.libelle, aa.message, aa.priorite_actuelle, ta.couleur_badge, ta.son_alerte, aa.date_creation,
        CONCAT_WS(' | ', CASE WHEN aa.id_machine IS NOT NULL THEN 'Machine: ' || m.numero_machine END, CASE WHEN aa.id_of IS NOT NULL THEN 'OF: ' || o.numero_of END,
                  CASE WHEN aa.valeur_critique IS NOT NULL THEN 'Valeur: ' || aa.valeur_critique END) AS contexte
    FROM alertes_actives aa JOIN types_alertes ta ON aa.id_type_alerte = ta.id_type_alerte LEFT JOIN machines m ON aa.id_machine = m.id_machine LEFT JOIN ordres_fabrication o ON aa.id_of = o.id_of
    WHERE aa.statut = 'active' AND ta.destinataires_fonction LIKE '%' || p_fonction || '%'
    ORDER BY CASE ta.niveau_urgence WHEN 'critique' THEN 1 WHEN 'haute' THEN 2 WHEN 'moyenne' THEN 3 ELSE 4 END, aa.date_creation ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION declarer_2eme_choix(p_origine VARCHAR, p_id_of INTEGER, p_id_article INTEGER, p_quantite DECIMAL, p_id_motif_principal INTEGER,
    p_description_defauts TEXT, p_id_operateur INTEGER, p_id_suivi INTEGER DEFAULT NULL, p_id_lot_coupe INTEGER DEFAULT NULL, p_id_machine INTEGER DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE v_numero_declaration VARCHAR(50); v_id_declaration INTEGER; v_validation_requise BOOLEAN;
BEGIN
    v_numero_declaration := '2C-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('declarations_2eme_choix_id_declaration_seq')::TEXT, 4, '0');
    SELECT validation_obligatoire INTO v_validation_requise FROM motifs_2eme_choix WHERE id_motif = p_id_motif_principal;
    INSERT INTO declarations_2eme_choix (numero_declaration, origine, id_of, id_article, quantite_declaree, id_motif_principal, description_defauts, declare_par, id_suivi, id_lot_coupe, id_machine, validation_requise)
    VALUES (v_numero_declaration, p_origine, p_id_of, p_id_article, p_quantite, p_id_motif_principal, p_description_defauts, p_id_operateur, p_id_suivi, p_id_lot_coupe, p_id_machine, v_validation_requise)
    RETURNING id_declaration INTO v_id_declaration;
    RETURN v_id_declaration;
END;
$$ LANGUAGE plpgsql;

-- ✅ Fonctions utilitaires créées (2 fonctions)

-- ============================================================================
-- LOG FINAL
-- ============================================================================

INSERT INTO logs_systeme (type_action, module, description, niveau_severite)
VALUES ('INIT', 'FLUX_TRACABILITE', 'Tables flux, traçabilité, triggers, vues créés', 'INFO');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ✅ FICHIER 3/3 TERMINÉ (VERSION CORRIGÉE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 
-- 🎉 INSTALLATION COMPLÈTE TERMINÉE !
--
-- ============================================================================
-- 📊 RÉSUMÉ DE L'INSTALLATION
-- ============================================================================
-- ✅ 13 tables flux demandes créées
-- ✅ 5 tables traçabilité 2ème choix créées
-- ✅ 16 motifs 2ème choix insérés
-- ✅ 6 triggers automatiques créés
-- ✅ 5 vues dashboard créées
-- ✅ 2 fonctions utilitaires créées
-- 
-- ============================================================================
-- 🔧 CORRECTIONS APPLIQUÉES
-- ============================================================================
-- ✅ Suppression des triggers existants avant recréation
-- ✅ Correction du doublon 'date_declaration' dans v_stock_2eme_choix
--
-- ============================================================================
-- 📝 PROCHAINES ÉTAPES
-- ============================================================================
-- 1. Vérifiez les tables: SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- 2. Testez les vues: SELECT * FROM v_stock_2eme_choix LIMIT 5;
-- 3. Testez les fonctions: SELECT * FROM get_alertes_operateur('tisseur');
-- 4. Importez vos données Excel
--
-- ✅ Votre système est prêt à l'emploi !
--