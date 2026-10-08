-- =====================================================================
-- Fabrication — Ourdissage
-- Réf. docs/domain.md §7.17
-- Constantes : seuil alerte 500 m, plafond ensouple 5000 m
-- Formule poids : (nb_fils × m × 2) / (NM × 1000)
-- =====================================================================

DO $$ BEGIN
    CREATE TYPE ourdissage_statut_enum AS ENUM (
        'brouillon','preparation','en_cours','ensouple_pret',
        'monte_machine','en_consommation','termine','annule'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS ourdissages (
    id_ourdissage       BIGSERIAL PRIMARY KEY,
    numero_ourdissage   VARCHAR(30) UNIQUE NOT NULL,      -- OURD-YYYY-NNNNN
    id_machine          BIGINT NOT NULL,                  -- métier destinataire
    id_soustraitant     BIGINT,                           -- si ourdissage externe

    id_article_mp       BIGINT NOT NULL,                  -- article MP fil chaîne
    id_lot_mp           BIGINT,                           -- lot MP puisé
    numero_metrique_nm  NUMERIC(6,2) NOT NULL DEFAULT 50, -- NM (défaut 50)
    nb_fils_chaine      INTEGER NOT NULL,
    metrage_cible_m     NUMERIC(10,2) NOT NULL,           -- ≤ 5000
    metrage_reel_m      NUMERIC(10,2),                    -- rempli à réception
    poids_theorique_kg  NUMERIC(12,4) NOT NULL,           -- calculé : (nb_fils*m*2)/(NM*1000)
    poids_reel_kg       NUMERIC(12,4),
    seuil_alerte_m      NUMERIC(10,2) NOT NULL DEFAULT 500,
    plafond_ensouple_m  NUMERIC(10,2) NOT NULL DEFAULT 5000,

    statut              ourdissage_statut_enum NOT NULL DEFAULT 'brouillon',
    date_demande        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_preparation    TIMESTAMPTZ,
    date_reception      TIMESTAMPTZ,
    date_nouage_machine TIMESTAMPTZ,
    date_epuisement     TIMESTAMPTZ,

    id_utilisateur_demande     BIGINT,
    id_utilisateur_ourdisseur  BIGINT,
    notes                      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_ourd_metrage CHECK (metrage_cible_m > 0 AND metrage_cible_m <= plafond_ensouple_m),
    CONSTRAINT chk_ourd_fils    CHECK (nb_fils_chaine > 0),
    CONSTRAINT chk_ourd_nm      CHECK (numero_metrique_nm > 0)
);
CREATE INDEX IF NOT EXISTS ix_ourdissages_machine ON ourdissages(id_machine);
CREATE INDEX IF NOT EXISTS ix_ourdissages_statut  ON ourdissages(statut);
CREATE INDEX IF NOT EXISTS ix_ourdissages_date    ON ourdissages(date_demande);

-- ---------------------------------------------------------------------
-- ourdissage_lots : plusieurs lots MP par ensouple si nécessaire
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ourdissage_lots (
    id_ourdissage_lot  BIGSERIAL PRIMARY KEY,
    id_ourdissage      BIGINT NOT NULL REFERENCES ourdissages(id_ourdissage) ON DELETE CASCADE,
    id_lot_mp          BIGINT NOT NULL,
    id_article_mp      BIGINT NOT NULL,
    quantite_utilisee_kg NUMERIC(12,4) NOT NULL,
    qr_bobine          VARCHAR(50),
    id_mouvement_stock BIGINT,
    date_utilisation   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_ourdissage_lots_ourd ON ourdissage_lots(id_ourdissage);
CREATE INDEX IF NOT EXISTS ix_ourdissage_lots_lot  ON ourdissage_lots(id_lot_mp);
