-- ============================================================================
-- MODULE STOCK AVANCÉ - INVENTAIRES, MOUVEMENTS, RÉSERVATIONS
-- ============================================================================

-- Table : inventaires
CREATE TABLE IF NOT EXISTS inventaires (
    id_inventaire SERIAL PRIMARY KEY,
    numero_inventaire VARCHAR(50) UNIQUE NOT NULL,
    id_entrepot INTEGER REFERENCES entrepots(id_entrepot),
    date_inventaire DATE NOT NULL DEFAULT CURRENT_DATE,
    date_debut DATE,
    date_fin DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, EN_COURS, TERMINE, VALIDE, ANNULE
    
    -- Totaux
    valeur_theorique NUMERIC(12,2) DEFAULT 0,
    valeur_reelle NUMERIC(12,2) DEFAULT 0,
    ecart_valeur NUMERIC(12,2) DEFAULT 0,
    
    -- Informations
    type_inventaire VARCHAR(30) DEFAULT 'COMPLET',
    -- Types: COMPLET, PARTIEL, CYCLIQUE, ALTERNATIF
    motif TEXT,
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_inventaire
CREATE TABLE IF NOT EXISTS lignes_inventaire (
    id_ligne SERIAL PRIMARY KEY,
    id_inventaire INTEGER NOT NULL REFERENCES inventaires(id_inventaire) ON DELETE CASCADE,
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article),
    id_entrepot INTEGER REFERENCES entrepots(id_entrepot),
    
    -- Quantités
    quantite_theorique NUMERIC(10,3) DEFAULT 0,
    quantite_comptee NUMERIC(10,3) DEFAULT 0,
    quantite_ajustee NUMERIC(10,3) DEFAULT 0,
    ecart_quantite NUMERIC(10,3) DEFAULT 0,
    
    -- Valeurs
    prix_unitaire NUMERIC(10,2),
    valeur_theorique NUMERIC(12,2) DEFAULT 0,
    valeur_reelle NUMERIC(12,2) DEFAULT 0,
    ecart_valeur NUMERIC(12,2) DEFAULT 0,
    
    -- Informations
    numero_lot VARCHAR(50),
    emplacement VARCHAR(100),
    notes TEXT,
    
    -- État
    comptee BOOLEAN DEFAULT FALSE,
    validee BOOLEAN DEFAULT FALSE,
    ajustee BOOLEAN DEFAULT FALSE
);

-- Table : mouvements_stock
CREATE TABLE IF NOT EXISTS mouvements_stock (
    id_mouvement SERIAL PRIMARY KEY,
    type_mouvement VARCHAR(30) NOT NULL,
    -- Types: ENTREE, SORTIE, TRANSFERT, AJUSTEMENT, RETOUR, RESERVATION, LIBERATION
    
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article),
    id_entrepot_origine INTEGER REFERENCES entrepots(id_entrepot),
    id_entrepot_destination INTEGER REFERENCES entrepots(id_entrepot),
    
    quantite NUMERIC(10,3) NOT NULL,
    prix_unitaire NUMERIC(10,2),
    valeur_totale NUMERIC(12,2),
    
    -- Références
    id_reference INTEGER, -- ID du document source (commande, OF, etc.)
    type_reference VARCHAR(50), -- Type: COMMANDE, OF, RECEPTION, LIVRAISON, etc.
    numero_reference VARCHAR(100),
    
    -- Informations
    numero_lot VARCHAR(50),
    date_peremption DATE,
    date_mouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motif TEXT,
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : stock_reel (Vue matérialisée ou table)
CREATE TABLE IF NOT EXISTS stock_reel (
    id_stock SERIAL PRIMARY KEY,
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article),
    id_entrepot INTEGER NOT NULL REFERENCES entrepots(id_entrepot),
    
    -- Quantités
    quantite_disponible NUMERIC(10,3) DEFAULT 0,
    quantite_reservee NUMERIC(10,3) DEFAULT 0,
    quantite_commandee NUMERIC(10,3) DEFAULT 0,
    quantite_prevue NUMERIC(10,3) DEFAULT 0, -- Commandes clients
    
    -- Valeurs
    valeur_stock NUMERIC(12,2) DEFAULT 0,
    prix_moyen_pondere NUMERIC(10,2) DEFAULT 0,
    dernier_prix_achat NUMERIC(10,2) DEFAULT 0,
    
    -- Dates
    date_dernier_mouvement TIMESTAMP,
    date_derniere_entree TIMESTAMP,
    date_derniere_sortie TIMESTAMP,
    
    -- Alertes
    stock_minimum NUMERIC(10,3) DEFAULT 0,
    stock_maximum NUMERIC(10,3) DEFAULT 0,
    alerte_stock_min BOOLEAN DEFAULT FALSE,
    alerte_rupture BOOLEAN DEFAULT FALSE,
    
    UNIQUE(id_article, id_entrepot)
);

-- Table : reservations_stock
CREATE TABLE IF NOT EXISTS reservations_stock (
    id_reservation SERIAL PRIMARY KEY,
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article),
    id_entrepot INTEGER NOT NULL REFERENCES entrepots(id_entrepot),
    quantite_reservee NUMERIC(10,3) NOT NULL,
    
    -- Référence
    id_reference INTEGER NOT NULL,
    type_reference VARCHAR(50) NOT NULL,
    -- Types: COMMANDE_CLIENT, OF, TRANSFERT, AUTRE
    
    -- Dates
    date_reservation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP,
    date_liberation TIMESTAMP,
    
    -- État
    statut VARCHAR(30) DEFAULT 'ACTIVE',
    -- Statuts: ACTIVE, LIBEREE, CONSOMMEE, EXPIREE
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    notes TEXT
);

-- Table : entrepots
CREATE TABLE IF NOT EXISTS entrepots (
    id_entrepot SERIAL PRIMARY KEY,
    code_entrepot VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    adresse TEXT,
    
    -- Gestion
    responsable INTEGER REFERENCES utilisateurs(id_utilisateur),
    actif BOOLEAN DEFAULT TRUE,
    
    -- Informations
    type_entrepot VARCHAR(30) DEFAULT 'PRINCIPAL',
    -- Types: PRINCIPAL, SECONDAIRE, TRANSIT, VIRTUEL
    notes TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : emplacements
CREATE TABLE IF NOT EXISTS emplacements (
    id_emplacement SERIAL PRIMARY KEY,
    id_entrepot INTEGER NOT NULL REFERENCES entrepots(id_entrepot),
    code_emplacement VARCHAR(100) NOT NULL,
    libelle VARCHAR(200),
    
    -- Type
    type_emplacement VARCHAR(30) DEFAULT 'RANGEMENT',
    -- Types: RANGEMENT, RECEPTION, EXPEDITION, QUARANTAINE, RETOUR
    
    -- Dimensions
    capacite_max NUMERIC(10,3),
    unite_capacite VARCHAR(20), -- m3, kg, palette, etc.
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    UNIQUE(id_entrepot, code_emplacement)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_inventaires_entrepot ON inventaires(id_entrepot);
CREATE INDEX IF NOT EXISTS idx_inventaires_statut ON inventaires(statut);
CREATE INDEX IF NOT EXISTS idx_inventaires_date ON inventaires(date_inventaire);
CREATE INDEX IF NOT EXISTS idx_lignes_inventaire ON lignes_inventaire(id_inventaire);
CREATE INDEX IF NOT EXISTS idx_mouvements_article ON mouvements_stock(id_article);
CREATE INDEX IF NOT EXISTS idx_mouvements_date ON mouvements_stock(date_mouvement);
CREATE INDEX IF NOT EXISTS idx_mouvements_type ON mouvements_stock(type_mouvement);
CREATE INDEX IF NOT EXISTS idx_mouvements_reference ON mouvements_stock(type_reference, id_reference);
CREATE INDEX IF NOT EXISTS idx_stock_reel_article ON stock_reel(id_article);
CREATE INDEX IF NOT EXISTS idx_stock_reel_entrepot ON stock_reel(id_entrepot);
CREATE INDEX IF NOT EXISTS idx_reservations_article ON reservations_stock(id_article);
CREATE INDEX IF NOT EXISTS idx_reservations_statut ON reservations_stock(statut);
CREATE INDEX IF NOT EXISTS idx_reservations_reference ON reservations_stock(type_reference, id_reference);

-- Fonction pour mettre à jour stock réel
CREATE OR REPLACE FUNCTION mettre_a_jour_stock_reel()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculer stock réel à partir des mouvements
    INSERT INTO stock_reel (id_article, id_entrepot, quantite_disponible, date_dernier_mouvement)
    SELECT 
        id_article,
        COALESCE(id_entrepot_destination, id_entrepot_origine) as id_entrepot,
        SUM(CASE 
            WHEN type_mouvement IN ('ENTREE', 'RETOUR', 'LIBERATION') THEN quantite
            WHEN type_mouvement IN ('SORTIE', 'RESERVATION') THEN -quantite
            WHEN type_mouvement = 'TRANSFERT' AND id_entrepot_destination IS NOT NULL THEN quantite
            WHEN type_mouvement = 'TRANSFERT' AND id_entrepot_origine IS NOT NULL THEN -quantite
            ELSE 0
        END) as quantite_disponible,
        MAX(date_mouvement) as date_dernier_mouvement
    FROM mouvements_stock
    WHERE id_article = NEW.id_article
    GROUP BY id_article, COALESCE(id_entrepot_destination, id_entrepot_origine)
    ON CONFLICT (id_article, id_entrepot) DO UPDATE
    SET quantite_disponible = EXCLUDED.quantite_disponible,
        date_dernier_mouvement = EXCLUDED.date_dernier_mouvement;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour stock après mouvement
CREATE TRIGGER trigger_update_stock_reel
AFTER INSERT ON mouvements_stock
FOR EACH ROW
EXECUTE FUNCTION mettre_a_jour_stock_reel();

-- Fonction pour générer numéro inventaire
CREATE OR REPLACE FUNCTION generer_numero_inventaire()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_inventaire FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM inventaires
    WHERE numero_inventaire LIKE 'INV-' || annee || '-%';
    numero := 'INV-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_inventaires_updated_at BEFORE UPDATE ON inventaires
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_entrepots_updated_at BEFORE UPDATE ON entrepots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
