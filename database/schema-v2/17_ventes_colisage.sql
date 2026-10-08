-- =====================================================================
-- Schéma v2 — Ventes : colisage & palettes
-- Réf. §8.6 (colisage), §16bis (numérotation)
-- Formats: colis C{XXX}-{YYY}-{NNN} — palette PAL{YY}-{seq}
-- Étiquettes: -SUR (surface), -DEU (recto/verso)
-- =====================================================================

CREATE TABLE IF NOT EXISTS colis (
    id_colis            BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) NOT NULL UNIQUE,     -- ex: C042-BL0005-001
    id_bl               BIGINT REFERENCES bons_livraison(id_bl),
    id_commande         BIGINT REFERENCES commandes(id_commande),
    id_palette          BIGINT,
    statut              VARCHAR(20) NOT NULL DEFAULT 'en_cours',
                        -- en_cours | ferme | expedie | livre
    poids_kg            NUMERIC(10,3),
    dimensions          VARCHAR(64),                     -- LxlxH cm
    id_utilisateur_scan BIGINT,
    date_fermeture      TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_colis_bl      ON colis(id_bl);
CREATE INDEX IF NOT EXISTS idx_colis_palette ON colis(id_palette);
CREATE INDEX IF NOT EXISTS idx_colis_statut  ON colis(statut);

CREATE TABLE IF NOT EXISTS colis_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_colis            BIGINT NOT NULL REFERENCES colis(id_colis) ON DELETE CASCADE,
    id_article          BIGINT,
    id_lot              BIGINT,
    designation         VARCHAR(255),
    quantite            NUMERIC(14,3) NOT NULL,
    unite               VARCHAR(16),
    id_utilisateur_scan BIGINT,
    scanned_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_colis_lignes_colis ON colis_lignes(id_colis);

CREATE TABLE IF NOT EXISTS palettes (
    id_palette          BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(16) NOT NULL UNIQUE,     -- ex: PAL26-000123
    id_bl               BIGINT REFERENCES bons_livraison(id_bl),
    statut              VARCHAR(20) NOT NULL DEFAULT 'en_cours', -- en_cours | fermee | expediee
    nb_colis            INT DEFAULT 0,
    poids_kg            NUMERIC(10,3),
    hauteur_cm          NUMERIC(6,1),
    transporteur        VARCHAR(120),
    date_fermeture      TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_palettes_bl ON palettes(id_bl);

ALTER TABLE colis
    DROP CONSTRAINT IF EXISTS fk_colis_palette,
    ADD CONSTRAINT fk_colis_palette FOREIGN KEY (id_palette) REFERENCES palettes(id_palette) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS etiquettes (
    id_etiquette        BIGSERIAL PRIMARY KEY,
    code                VARCHAR(48) NOT NULL UNIQUE,     -- ex: C042-BL0005-001-SUR
    type_etiquette      VARCHAR(4) NOT NULL,             -- SUR | DEU
    id_colis            BIGINT REFERENCES colis(id_colis) ON DELETE CASCADE,
    id_palette          BIGINT REFERENCES palettes(id_palette) ON DELETE CASCADE,
    format              VARCHAR(20) DEFAULT 'A5',
    imprimee            BOOLEAN NOT NULL DEFAULT FALSE,
    printed_at          TIMESTAMPTZ,
    payload_json        JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (type_etiquette IN ('SUR','DEU')),
    CHECK ((id_colis IS NOT NULL) OR (id_palette IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_etiquettes_colis   ON etiquettes(id_colis);
CREATE INDEX IF NOT EXISTS idx_etiquettes_palette ON etiquettes(id_palette);
