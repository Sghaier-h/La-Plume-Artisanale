-- ============================================================================
-- MISE A JOUR DE LA STRUCTURE DES COMMANDES
-- ============================================================================
-- Script pour ajouter les colonnes nécessaires aux tables commandes
-- ============================================================================

BEGIN;

-- ============================================================================
-- 0. CREATION DE LA TABLE PARAMETRES_TYPES_PERSONNALISATION (EN PREMIER)
-- ============================================================================

-- Créer la table des types de personnalisation si elle n'existe pas
CREATE TABLE IF NOT EXISTS parametres_types_personnalisation (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les types de personnalisation (Broderie, Sérigraphie, Autre)
INSERT INTO parametres_types_personnalisation (code, libelle, description, actif) VALUES
('BRO', 'Broderie', 'Personnalisation par broderie', true),
('SER', 'Sérigraphie', 'Personnalisation par sérigraphie', true),
('AUT', 'Autre', 'Autre type de personnalisation', true)
ON CONFLICT (code) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 1. MISE A JOUR DE LA TABLE COMMANDES
-- ============================================================================

DO $$
BEGIN
    -- Ajouter ref_client si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'commandes' AND column_name = 'ref_client'
    ) THEN
        ALTER TABLE commandes ADD COLUMN ref_client VARCHAR(100);
        RAISE NOTICE 'Colonne ref_client ajoutee a commandes';
    END IF;

    -- Ajouter num_commande_client si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'commandes' AND column_name = 'num_commande_client'
    ) THEN
        ALTER TABLE commandes ADD COLUMN num_commande_client VARCHAR(100);
        RAISE NOTICE 'Colonne num_commande_client ajoutee a commandes';
    END IF;

    -- Ajouter date_envoie si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'commandes' AND column_name = 'date_envoie'
    ) THEN
        ALTER TABLE commandes ADD COLUMN date_envoie DATE;
        RAISE NOTICE 'Colonne date_envoie ajoutee a commandes';
    END IF;
END $$;

-- ============================================================================
-- 2. MISE A JOUR DE LA TABLE ARTICLES_COMMANDE
-- ============================================================================

DO $$
BEGIN
    -- Modifier id_article pour permettre NULL (articles hors catalogue/personnalisés)
    -- Vérifier si la colonne existe et a une contrainte NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles_commande' 
        AND column_name = 'id_article'
        AND is_nullable = 'NO'
    ) THEN
        -- Supprimer la contrainte NOT NULL
        ALTER TABLE articles_commande ALTER COLUMN id_article DROP NOT NULL;
        RAISE NOTICE 'Contrainte NOT NULL supprimee pour id_article (permet articles hors catalogue)';
    END IF;
    -- Ajouter ref_commerciale si elle n'existe pas (pour faciliter les requêtes)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles_commande' AND column_name = 'ref_commerciale'
    ) THEN
        ALTER TABLE articles_commande ADD COLUMN ref_commerciale VARCHAR(100);
        RAISE NOTICE 'Colonne ref_commerciale ajoutee a articles_commande';
    END IF;

    -- Ajouter description_article si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles_commande' AND column_name = 'description_article'
    ) THEN
        ALTER TABLE articles_commande ADD COLUMN description_article TEXT;
        RAISE NOTICE 'Colonne description_article ajoutee a articles_commande';
    END IF;

    -- Ajouter dimensions si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles_commande' AND column_name = 'dimensions'
    ) THEN
        ALTER TABLE articles_commande ADD COLUMN dimensions VARCHAR(100);
        RAISE NOTICE 'Colonne dimensions ajoutee a articles_commande';
    END IF;

    -- Ajouter type_finition si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles_commande' AND column_name = 'type_finition'
    ) THEN
        ALTER TABLE articles_commande ADD COLUMN type_finition VARCHAR(100);
        RAISE NOTICE 'Colonne type_finition ajoutee a articles_commande';
    END IF;

    -- Ajouter personnalisation si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles_commande' AND column_name = 'personnalisation'
    ) THEN
        ALTER TABLE articles_commande ADD COLUMN personnalisation BOOLEAN DEFAULT false;
        RAISE NOTICE 'Colonne personnalisation ajoutee a articles_commande';
    END IF;

    -- Ajouter details_personnalisation si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles_commande' AND column_name = 'details_personnalisation'
    ) THEN
        ALTER TABLE articles_commande ADD COLUMN details_personnalisation TEXT;
        RAISE NOTICE 'Colonne details_personnalisation ajoutee a articles_commande';
    END IF;

    -- Ajouter prix_total_ht si elle n'existe pas (ou utiliser montant_ligne)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles_commande' AND column_name = 'prix_total_ht'
    ) THEN
        ALTER TABLE articles_commande ADD COLUMN prix_total_ht DECIMAL(12,2);
        RAISE NOTICE 'Colonne prix_total_ht ajoutee a articles_commande';
    END IF;

    -- Ajouter id_type_personnalisation si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles_commande' AND column_name = 'id_type_personnalisation'
    ) THEN
        ALTER TABLE articles_commande ADD COLUMN id_type_personnalisation INTEGER REFERENCES parametres_types_personnalisation(id);
        RAISE NOTICE 'Colonne id_type_personnalisation ajoutee a articles_commande';
    END IF;

    -- Ajouter fichier_personnalisation si elle n'existe pas (URL ou chemin du fichier)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles_commande' AND column_name = 'fichier_personnalisation'
    ) THEN
        ALTER TABLE articles_commande ADD COLUMN fichier_personnalisation VARCHAR(500);
        RAISE NOTICE 'Colonne fichier_personnalisation ajoutee a articles_commande';
    END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_articles_commande_ref_commerciale ON articles_commande(ref_commerciale);
CREATE INDEX IF NOT EXISTS idx_commandes_ref_client ON commandes(ref_client);
CREATE INDEX IF NOT EXISTS idx_commandes_num_commande_client ON commandes(num_commande_client);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    v_cols_commandes INTEGER;
    v_cols_articles_commande INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_cols_commandes 
    FROM information_schema.columns 
    WHERE table_name = 'commandes' 
    AND column_name IN ('ref_client', 'num_commande_client', 'date_envoie');
    
    SELECT COUNT(*) INTO v_cols_articles_commande 
    FROM information_schema.columns 
    WHERE table_name = 'articles_commande' 
    AND column_name IN ('ref_commerciale', 'description_article', 'dimensions', 'type_finition', 'personnalisation', 'details_personnalisation', 'prix_total_ht');
    
    RAISE NOTICE 'Colonnes ajoutees a commandes: %', v_cols_commandes;
    RAISE NOTICE 'Colonnes ajoutees a articles_commande: %', v_cols_articles_commande;
END $$;

COMMIT;
