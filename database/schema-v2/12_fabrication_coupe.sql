-- =====================================================================
-- Fabrication — Coupe : sessions et journal pièces
-- Réf. docs/domain.md §7.19
-- Journal ligne = {numOF, operateur, date, qte_prem, qte_deux, dechet,
--                  approuve, ourlet, type, terminal, etat, photoUrl}
-- =====================================================================

DO $$ BEGIN
    CREATE TYPE session_coupe_statut_enum AS ENUM ('en_cours','pause','termine','termine_qte_manquante','annule');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS sessions_coupe (
    id_session_coupe    BIGSERIAL PRIMARY KEY,
    id_of               BIGINT NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    id_machine          BIGINT,                    -- table coupe (optionnel)
    id_operateur        BIGINT NOT NULL,
    date_debut          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_fin            TIMESTAMPTZ,
    total_1er_choix     NUMERIC(14,3) NOT NULL DEFAULT 0,
    total_2e_choix      NUMERIC(14,3) NOT NULL DEFAULT 0,
    total_dechet        NUMERIC(14,3) NOT NULL DEFAULT 0,
    total_ourlet        NUMERIC(14,3) NOT NULL DEFAULT 0,
    total_approuve      NUMERIC(14,3) NOT NULL DEFAULT 0,
    surplus             NUMERIC(14,3) NOT NULL DEFAULT 0,
    reste_a_fab         NUMERIC(14,3) NOT NULL DEFAULT 0,
    statut              session_coupe_statut_enum NOT NULL DEFAULT 'en_cours',
    terminal            VARCHAR(50),               -- tablette d'atelier
    notes               TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_sess_coupe_of        ON sessions_coupe(id_of);
CREATE INDEX IF NOT EXISTS ix_sess_coupe_operateur ON sessions_coupe(id_operateur);
CREATE INDEX IF NOT EXISTS ix_sess_coupe_date      ON sessions_coupe(date_debut);
CREATE INDEX IF NOT EXISTS ix_sess_coupe_statut    ON sessions_coupe(statut);

-- ---------------------------------------------------------------------
-- journal_pieces : catégorisation qualité par OF (§7.19)
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE journal_piece_categorie_enum AS ENUM ('1er_choix','2e_choix','dechet','ourlet_retouche','approuve','surplus');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE journal_piece_etat_enum AS ENUM ('brouillon','valide','ajuste','annule');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS journal_pieces (
    id_journal_piece    BIGSERIAL PRIMARY KEY,
    id_of               BIGINT NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    id_session_coupe    BIGINT REFERENCES sessions_coupe(id_session_coupe) ON DELETE SET NULL,
    id_operateur        BIGINT NOT NULL,
    date_saisie         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    categorie           journal_piece_categorie_enum NOT NULL,
    quantite            NUMERIC(14,3) NOT NULL,
    type_piece          VARCHAR(50),
    numero_suivi        VARCHAR(30),     -- -1, -SUR01, -DEU01 (§7.20)
    etat                journal_piece_etat_enum NOT NULL DEFAULT 'valide',
    photo_url           VARCHAR(500),
    commentaire         TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_journal_of        ON journal_pieces(id_of);
CREATE INDEX IF NOT EXISTS ix_journal_session   ON journal_pieces(id_session_coupe);
CREATE INDEX IF NOT EXISTS ix_journal_categorie ON journal_pieces(categorie);
CREATE INDEX IF NOT EXISTS ix_journal_date      ON journal_pieces(date_saisie);
