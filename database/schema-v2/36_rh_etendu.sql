-- =====================================================================
-- Schéma v2 — RH étendu (Phase C · §11bis + §14quater.5-7 + §14quater.14)
--
-- Enrichit la gestion RH par :
--   • Compte employé (solde courant, RIB bancaire, caisse défaut salaire)
--   • Historique de mouvements du compte (salaires, primes, avances, ...)
--   • Avances sur salaires (demande → approbation → paiement → remboursement)
--   • Ajustements comptes RH (reset zéro, correction solde ...) + code auto
--   • Compensations RH (CNSS, IRPP, acompte privé ...)
--   • PIN d'identification tablette (saisie clavier numérique XL)
--   • Demandes RH génériques (avance / congé / document / problème ...)
--   • Planning employés (horaires, shifts, machines, OF assignés)
--
-- Toutes les créations sont idempotentes (CREATE TABLE IF NOT EXISTS +
-- ALTER TABLE ... ADD COLUMN IF NOT EXISTS). Les ENUM sont implémentés
-- en VARCHAR + CHECK pour garder la souplesse déjà adoptée en schema-v2.
-- =====================================================================

-- ─── 1. Enrichissement de la table `employes` ────────────────────────
-- Ajout du compte-employé (solde + coordonnées banque + caisse défaut).
ALTER TABLE employes
  ADD COLUMN IF NOT EXISTS solde_courant                  NUMERIC(14,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS date_dernier_mouvement         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rib_bancaire                   VARCHAR(40),
  ADD COLUMN IF NOT EXISTS caisse_defaut_paiement_salaire BIGINT;

-- Index pour tri soldes rapides (balance report RH).
CREATE INDEX IF NOT EXISTS idx_employes_solde_courant ON employes(solde_courant);


-- ─── 2. Mouvements de compte employé ─────────────────────────────────
-- Historique append-only de tous les flux financiers d'un compte employé.
CREATE TABLE IF NOT EXISTS comptes_employes_mouvements (
    id_mouvement_emp   BIGSERIAL PRIMARY KEY,
    id_employe         BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    date_mouvement     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type_mvt           VARCHAR(32) NOT NULL
                       CHECK (type_mvt IN (
                         'salaire','prime','avance','remboursement_avance',
                         'ajustement','compensation','retenue','apport_gerant'
                       )),
    sens               CHAR(1) NOT NULL DEFAULT 'C'
                       CHECK (sens IN ('C','D')),       -- C=crédit (dû salarié), D=débit (payé)
    montant            NUMERIC(14,3) NOT NULL,
    libelle            VARCHAR(255),
    id_bulletin        BIGINT,
    id_paiement        BIGINT,
    id_avance          BIGINT,
    id_ajustement      BIGINT,
    id_compensation    BIGINT,
    solde_apres        NUMERIC(14,3),
    cree_par           BIGINT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cem_employe ON comptes_employes_mouvements(id_employe);
CREATE INDEX IF NOT EXISTS idx_cem_date    ON comptes_employes_mouvements(date_mouvement);
CREATE INDEX IF NOT EXISTS idx_cem_type    ON comptes_employes_mouvements(type_mvt);


-- ─── 3. Avances sur salaires ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avances_salaires (
    id_avance              BIGSERIAL PRIMARY KEY,
    id_employe             BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE RESTRICT,
    date_demande           DATE NOT NULL DEFAULT CURRENT_DATE,
    montant_demande        NUMERIC(14,3) NOT NULL CHECK (montant_demande > 0),
    motif                  TEXT,
    date_approbation       DATE,
    approuve_par           BIGINT,
    statut                 VARCHAR(32) NOT NULL DEFAULT 'demande'
                           CHECK (statut IN (
                             'demande','approuvee','refusee','payee',
                             'remboursee_total','remboursee_partiel'
                           )),
    date_paiement          DATE,
    id_paiement            BIGINT,
    id_caisse_source       BIGINT,
    modalite_remboursement VARCHAR(32)
                           CHECK (modalite_remboursement IN (
                             'prochain_salaire','mensualites_2','mensualites_3',
                             'mensualites_6','mensualites_12'
                           )),
    solde_restant_avance   NUMERIC(14,3) DEFAULT 0,
    motif_refus            TEXT,
    cree_par               BIGINT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_avances_employe ON avances_salaires(id_employe);
CREATE INDEX IF NOT EXISTS idx_avances_statut  ON avances_salaires(statut);


-- ─── 4. Ajustements de comptes RH ────────────────────────────────────
-- Reset zéro / correction solde / régularisation avec double validation.
-- Code auto AJ-{NOM}-{YYYY}-{NN}.
CREATE TABLE IF NOT EXISTS ajustements_comptes_rh (
    id_ajustement      BIGSERIAL PRIMARY KEY,
    code_ajustement    VARCHAR(60) NOT NULL UNIQUE,
    id_employe         BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE RESTRICT,
    date_ajustement    DATE NOT NULL DEFAULT CURRENT_DATE,
    montant            NUMERIC(14,3) NOT NULL,
    motif              TEXT NOT NULL,
    type_ajustement    VARCHAR(32) NOT NULL
                       CHECK (type_ajustement IN (
                         'reset_zero','correction_solde','regularisation','autre'
                       )),
    ancienne_valeur    NUMERIC(14,3),
    nouvelle_valeur    NUMERIC(14,3),
    cree_par           BIGINT NOT NULL,
    valide_par         BIGINT,
    date_validation    TIMESTAMPTZ,
    statut_validation  VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                       CHECK (statut_validation IN ('en_attente','validee','rejetee')),
    motif_rejet        TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ajust_employe ON ajustements_comptes_rh(id_employe);
CREATE INDEX IF NOT EXISTS idx_ajust_statut  ON ajustements_comptes_rh(statut_validation);


-- ─── 5. Compensations RH ─────────────────────────────────────────────
-- Compensations croisées (CNSS employé/employeur, IRPP, acompte privé...)
CREATE TABLE IF NOT EXISTS compensations_rh (
    id_comp_rh                   BIGSERIAL PRIMARY KEY,
    id_employe                   BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE RESTRICT,
    date_compensation            DATE NOT NULL DEFAULT CURRENT_DATE,
    type_compensation            VARCHAR(32) NOT NULL
                                 CHECK (type_compensation IN (
                                   'cnss_salarie','cnss_employeur','impot_irpp',
                                   'acompte_prive','avance_remboursement','autre'
                                 )),
    montant_a_compenser          NUMERIC(14,3) NOT NULL,
    source                       VARCHAR(32) NOT NULL
                                 CHECK (source IN (
                                   'salaire','prime','caisse_compensation'
                                 )),
    id_compensation_croisee_liee BIGINT,
    statut                       VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                                 CHECK (statut IN ('en_attente','appliquee','annulee')),
    date_application             TIMESTAMPTZ,
    applique_par                 BIGINT,
    motif                        TEXT,
    cree_par                     BIGINT,
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comp_employe ON compensations_rh(id_employe);
CREATE INDEX IF NOT EXISTS idx_comp_statut  ON compensations_rh(statut);


-- ─── 6. Code PIN d'identification tablette ───────────────────────────
-- 1 PIN par employé (4 à 6 chiffres, hash). 3 échecs → bloqué.
CREATE TABLE IF NOT EXISTS code_pin_employe (
    id_pin                 BIGSERIAL PRIMARY KEY,
    id_employe             BIGINT NOT NULL UNIQUE REFERENCES employes(id_employe) ON DELETE CASCADE,
    pin_hash               VARCHAR(255) NOT NULL,
    salt                   VARCHAR(64)  NOT NULL,
    pin_longueur           SMALLINT NOT NULL DEFAULT 4 CHECK (pin_longueur BETWEEN 4 AND 6),
    date_derniere_maj      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    bloque                 BOOLEAN NOT NULL DEFAULT FALSE,
    nb_tentatives_echec    SMALLINT NOT NULL DEFAULT 0,
    date_blocage           TIMESTAMPTZ,
    debloque_par           BIGINT,
    date_deblocage         TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── 7. Demandes RH génériques (tablette "Mes demandes") ─────────────
CREATE TABLE IF NOT EXISTS demandes_rh (
    id_demande         BIGSERIAL PRIMARY KEY,
    id_employe         BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    type_demande       VARCHAR(32) NOT NULL
                       CHECK (type_demande IN (
                         'avance','conge','attestation_travail','bulletin',
                         'probleme_rh','probleme_atelier','probleme_machine','autre'
                       )),
    objet              VARCHAR(255),
    description        TEXT,
    piece_jointe_path  TEXT,
    signature_svg      TEXT,                           -- signature tactile (SVG inline)
    montant_demande    NUMERIC(14,3),                  -- rempli si type='avance'
    date_debut_conge   DATE,                           -- rempli si type='conge'
    date_fin_conge     DATE,
    statut             VARCHAR(20) NOT NULL DEFAULT 'demande'
                       CHECK (statut IN ('demande','en_cours','approuvee','refusee','cloturee')),
    date_demande       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_traitement    TIMESTAMPTZ,
    traite_par         BIGINT,
    motif_refus        TEXT,
    reponse_rh         TEXT,
    id_avance_liee     BIGINT,                         -- lien avances_salaires si type='avance'
    id_conge_lie       BIGINT,                         -- lien conges si type='conge'
    id_document_archive BIGINT,                        -- documents_archive si type='attestation_travail' / 'bulletin'
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_demrh_employe ON demandes_rh(id_employe);
CREATE INDEX IF NOT EXISTS idx_demrh_statut  ON demandes_rh(statut);
CREATE INDEX IF NOT EXISTS idx_demrh_type    ON demandes_rh(type_demande);


-- ─── 8. Planning employés ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planning_employes (
    id_planning        BIGSERIAL PRIMARY KEY,
    id_employe         BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    date_planning      DATE NOT NULL,
    horaire_debut      TIME NOT NULL,
    horaire_fin        TIME NOT NULL,
    type_shift         VARCHAR(20) NOT NULL DEFAULT 'journee'
                       CHECK (type_shift IN ('matin','apres_midi','nuit','journee')),
    machine_assignee   BIGINT,
    of_assigne         BIGINT,
    statut             VARCHAR(20) NOT NULL DEFAULT 'planifie'
                       CHECK (statut IN ('planifie','confirme','annule')),
    notes              TEXT,
    cree_par           BIGINT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_employe, date_planning, horaire_debut)
);
CREATE INDEX IF NOT EXISTS idx_planemp_date    ON planning_employes(date_planning);
CREATE INDEX IF NOT EXISTS idx_planemp_employe ON planning_employes(id_employe);


-- ─── 9. Pointages terrain (badge-PIN tablette) ───────────────────────
-- Table minimale pour la pointeuse tablette ; coexiste avec `pointages`
-- (TimeMoto). Si `pointages` existe, on complète par une colonne source.
ALTER TABLE pointages
  ADD COLUMN IF NOT EXISTS photo_url_entree  TEXT,
  ADD COLUMN IF NOT EXISTS photo_url_sortie  TEXT,
  ADD COLUMN IF NOT EXISTS id_pin_utilise    BIGINT;

-- Événements horodatés (entrée / sortie / pause début / pause fin).
CREATE TABLE IF NOT EXISTS pointages_evenements (
    id_evt             BIGSERIAL PRIMARY KEY,
    id_employe         BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    date_evt           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type_evt           VARCHAR(16) NOT NULL
                       CHECK (type_evt IN ('entree','sortie','pause_debut','pause_fin')),
    photo_url          TEXT,
    source             VARCHAR(20) NOT NULL DEFAULT 'tablette_pin'
                       CHECK (source IN ('tablette_pin','timemoto','manuel','mobile','badge')),
    id_appareil        VARCHAR(64),
    notes              TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ptevt_employe ON pointages_evenements(id_employe);
CREATE INDEX IF NOT EXISTS idx_ptevt_date    ON pointages_evenements(date_evt);
