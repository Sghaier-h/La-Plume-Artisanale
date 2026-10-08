-- =============================================================================
-- 04_tarification.sql — Tarifs, lignes tarif, remises, conditions paiement
-- Contrat v2.2 — §4
-- Rappel §4 : type = remise_globale_pct | prix_par_article | palier_quantite
-- =============================================================================

-- -----------------------------------------------------------------------------
-- tarifs (ex grilles_tarif dans le contrat)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tarifs (
  id_grille          SERIAL PRIMARY KEY,
  code               VARCHAR(30) UNIQUE NOT NULL,     -- PART, GC, DIST, EXP_FR ...
  libelle            VARCHAR(150) NOT NULL,
  type               VARCHAR(30) NOT NULL DEFAULT 'remise_globale_pct'
                     CHECK (type IN ('remise_globale_pct','prix_par_article','palier_quantite')),
  remise_pct         NUMERIC(5,2) NOT NULL DEFAULT 0,
  devise             CHAR(3) NOT NULL DEFAULT 'TND',
  taux_tva_defaut    NUMERIC(5,2) NOT NULL DEFAULT 19,
  date_debut         DATE,
  date_fin           DATE,
  est_defaut         BOOLEAN NOT NULL DEFAULT FALSE,   -- fallback pour comptes sans grille
  actif              BOOLEAN NOT NULL DEFAULT TRUE,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cree_par           INT REFERENCES users(id_user) ON DELETE SET NULL,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_par        INT REFERENCES users(id_user) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tarifs_defaut ON tarifs(est_defaut) WHERE est_defaut = TRUE;
CREATE INDEX IF NOT EXISTS idx_tarifs_actif  ON tarifs(actif);
CREATE INDEX IF NOT EXISTS idx_tarifs_devise ON tarifs(devise);

-- FK différée depuis comptes.id_grille_tarif → tarifs.id_grille
ALTER TABLE comptes
  DROP CONSTRAINT IF EXISTS fk_comptes_grille;
ALTER TABLE comptes
  ADD  CONSTRAINT fk_comptes_grille
       FOREIGN KEY (id_grille_tarif) REFERENCES tarifs(id_grille)
       ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS idx_comptes_grille ON comptes(id_grille_tarif);

-- -----------------------------------------------------------------------------
-- tarifs_lignes (prix ou palier par article)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tarifs_lignes (
  id_ligne          SERIAL PRIMARY KEY,
  id_grille         INT NOT NULL REFERENCES tarifs(id_grille)
                    ON DELETE CASCADE ON UPDATE CASCADE,
  id_article        INT NOT NULL,                              -- FK logique vers articles (Phase 2, hors périmètre Domaine A)
  quantite_min      INT NOT NULL DEFAULT 1 CHECK (quantite_min >= 1),
  prix_unitaire_ht  NUMERIC(14,3),                             -- si NULL, remise_pct s'applique sur prix base
  remise_pct        NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_grille, id_article, quantite_min)
);
CREATE INDEX IF NOT EXISTS idx_tlignes_grille  ON tarifs_lignes(id_grille);
CREATE INDEX IF NOT EXISTS idx_tlignes_article ON tarifs_lignes(id_article);

-- -----------------------------------------------------------------------------
-- remises_client (remises spécifiques accordées à un compte, hors grille)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS remises_client (
  id_remise         SERIAL PRIMARY KEY,
  id_client         INT NOT NULL REFERENCES comptes(id_client)
                    ON DELETE CASCADE ON UPDATE CASCADE,
  id_article        INT,                                       -- NULL = remise globale sur toute commande
  type_remise       VARCHAR(20) NOT NULL DEFAULT 'pct'
                    CHECK (type_remise IN ('pct','montant_fixe')),
  valeur            NUMERIC(14,3) NOT NULL,
  devise            CHAR(3) NOT NULL DEFAULT 'TND',
  date_debut        DATE,
  date_fin          DATE,
  motif             VARCHAR(200),
  actif             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cree_par          INT REFERENCES users(id_user) ON DELETE SET NULL,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_remises_client  ON remises_client(id_client);
CREATE INDEX IF NOT EXISTS idx_remises_article ON remises_client(id_article);

-- -----------------------------------------------------------------------------
-- conditions_paiement (catalogue conditions attribuables à un compte / devis)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conditions_paiement (
  id_condition        SERIAL PRIMARY KEY,
  code                VARCHAR(30) UNIQUE NOT NULL,        -- COMPTANT, 30J, 30J_FDM, 60J...
  libelle             VARCHAR(150) NOT NULL,
  jours_echeance      INT NOT NULL DEFAULT 0,             -- 0 = comptant
  fin_de_mois         BOOLEAN NOT NULL DEFAULT FALSE,     -- décalage au dernier jour du mois
  jour_fixe           INT,                                -- 10 = payable le 10 du mois suivant
  escompte_pct        NUMERIC(5,2) NOT NULL DEFAULT 0,    -- escompte si paiement anticipé
  jours_escompte      INT,
  penalites_retard_pct NUMERIC(5,2),                      -- taux annuel
  est_defaut          BOOLEAN NOT NULL DEFAULT FALSE,
  actif               BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cond_paiement_defaut
  ON conditions_paiement(est_defaut) WHERE est_defaut = TRUE;
