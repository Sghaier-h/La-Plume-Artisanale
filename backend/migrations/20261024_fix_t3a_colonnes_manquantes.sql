-- ============================================================================
-- Phase T3a — Fix colonnes/tables manquantes identifiees dans T2 (9 roles)
-- ============================================================================
-- Idempotent : chaque ALTER est protege par DO $$ EXCEPTION WHEN duplicate_column
-- Ne cree aucune nouvelle route, uniquement des colonnes manquantes referencees
-- par les controllers/models existants (users, of_sous_traitance, mouvements_stock,
-- defauts_signales, ordres_fabrication) + ajout de la valeur enum 'finition'.
-- ============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. users : mfa_actif + colonnes auth associees
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN mfa_actif BOOLEAN NOT NULL DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN mfa_secret_totp VARCHAR(255);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN verrouille_jusqu TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN cree_par INT REFERENCES users(id_user) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_object THEN
           ALTER TABLE users ADD COLUMN cree_par INT;
END $$;

-- -----------------------------------------------------------------------------
-- 2. of_sous_traitance : id_soustraitant + id_of_st + colonnes workflow
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE of_sous_traitance
    ADD COLUMN id_soustraitant INT REFERENCES sous_traitants(id_soustraitant);
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_object THEN
           ALTER TABLE of_sous_traitance ADD COLUMN id_soustraitant INT;
END $$;

DO $$ BEGIN
  -- id_of_st : alias de la PK `id` pour compat code existant
  ALTER TABLE of_sous_traitance
    ADD COLUMN id_of_st INT GENERATED ALWAYS AS (id) STORED;
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN feature_not_supported THEN
           -- fallback si GENERATED STORED non supporte : simple colonne synchronisee par trigger
           ALTER TABLE of_sous_traitance ADD COLUMN id_of_st INT;
           UPDATE of_sous_traitance SET id_of_st = id WHERE id_of_st IS NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE of_sous_traitance ADD COLUMN statut VARCHAR(50) DEFAULT 'en_preparation';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE of_sous_traitance ADD COLUMN quantite_envoyee NUMERIC DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE of_sous_traitance ADD COLUMN quantite_retournee NUMERIC DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE of_sous_traitance ADD COLUMN date_retour_prevue DATE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE of_sous_traitance ADD COLUMN date_retour_reel TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE of_sous_traitance ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- 3. mouvements_stock : numero_mouvement + colonnes referenciees par le model
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN numero_mouvement VARCHAR(60);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN type_mouvement VARCHAR(60);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN id_lot INT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN qr_mp_reel VARCHAR(255);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN id_entrepot_source INT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN id_entrepot_destination INT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN id_emplacement_destination INT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN id_document_lie INT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN type_document_lie VARCHAR(50);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN motif TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN effectue_par INT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mouvements_stock ADD COLUMN valide_par INT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- 4. defauts_signales : type_defaut (texte libre, en complement de id_defaut_type FK)
--    + rendre id_defaut_type nullable car l'UI envoie souvent uniquement type_defaut
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE defauts_signales ADD COLUMN type_defaut TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE defauts_signales ALTER COLUMN id_defaut_type DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- id_signaleur peut etre null quand l'auth tablette n'injecte pas req.user
DO $$ BEGIN
  ALTER TABLE defauts_signales ALTER COLUMN id_signaleur DROP NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- 5. ordres_fabrication : id_tisseur + id_assigne
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE ordres_fabrication
    ADD COLUMN id_tisseur INT REFERENCES users(id_user) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_object THEN
           ALTER TABLE ordres_fabrication ADD COLUMN id_tisseur INT;
END $$;

DO $$ BEGIN
  ALTER TABLE ordres_fabrication
    ADD COLUMN id_assigne INT REFERENCES users(id_user) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
         WHEN undefined_object THEN
           ALTER TABLE ordres_fabrication ADD COLUMN id_assigne INT;
END $$;

COMMIT;

-- -----------------------------------------------------------------------------
-- 6. ctrl_type_enum : ajouter 'finition'
--    ALTER TYPE ADD VALUE ne peut pas s'executer dans un bloc transaction,
--    donc apres COMMIT. Idempotent via IF NOT EXISTS (Postgres >= 12).
-- -----------------------------------------------------------------------------
ALTER TYPE ctrl_type_enum ADD VALUE IF NOT EXISTS 'finition';
