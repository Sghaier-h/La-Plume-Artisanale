-- ============================================================================
-- TABLES POUR TRAÇABILITÉ LOTS
-- ============================================================================

-- Lots Matières Premières (extension de stock_mp)
CREATE TABLE IF NOT EXISTS lots_mp (
    id_lot SERIAL PRIMARY KEY,
    numero_lot VARCHAR(50) UNIQUE NOT NULL,
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    id_stock_mp INTEGER REFERENCES stock_mp(id_stock_mp),
    quantite DECIMAL(10,3) NOT NULL,
    date_reception DATE,
    date_peremption DATE,
    numero_bon_livraison VARCHAR(50),
    numero_facture VARCHAR(50),
    qr_code TEXT, -- Data URL du QR code
    statut VARCHAR(50) DEFAULT 'disponible',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX IF NOT EXISTS idx_lots_mp_numero ON lots_mp(numero_lot);
CREATE INDEX IF NOT EXISTS idx_lots_mp_mp ON lots_mp(id_mp);
