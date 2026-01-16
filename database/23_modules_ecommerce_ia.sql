-- ============================================================================
-- MODULE E-COMMERCE AVEC IA - BOUTIQUE EN LIGNE, RECOMMANDATIONS IA
-- ============================================================================

-- Table : boutiques
CREATE TABLE IF NOT EXISTS boutiques (
    id_boutique SERIAL PRIMARY KEY,
    code_boutique VARCHAR(50) UNIQUE NOT NULL,
    nom_boutique VARCHAR(200) NOT NULL,
    url_boutique VARCHAR(500),
    
    -- Configuration
    id_societe INTEGER REFERENCES societes(id_societe),
    theme VARCHAR(50) DEFAULT 'default',
    langue VARCHAR(10) DEFAULT 'fr',
    devise VARCHAR(10) DEFAULT 'TND',
    
    -- IA
    ia_activee BOOLEAN DEFAULT TRUE,
    ia_recommandations BOOLEAN DEFAULT TRUE,
    ia_chatbot BOOLEAN DEFAULT TRUE,
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : produits_boutique
CREATE TABLE IF NOT EXISTS produits_boutique (
    id_produit_boutique SERIAL PRIMARY KEY,
    id_boutique INTEGER NOT NULL REFERENCES boutiques(id_boutique) ON DELETE CASCADE,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    id_produit INTEGER REFERENCES produits(id_produit),
    
    -- Informations
    reference_sku VARCHAR(100) UNIQUE NOT NULL,
    nom_produit VARCHAR(200) NOT NULL,
    description TEXT,
    description_courte TEXT,
    
    -- Prix
    prix_vente_ht NUMERIC(10,2) NOT NULL,
    prix_vente_ttc NUMERIC(10,2) NOT NULL,
    prix_promotion NUMERIC(10,2),
    date_promotion_debut DATE,
    date_promotion_fin DATE,
    
    -- Stock
    stock_disponible INTEGER DEFAULT 0,
    stock_minimum INTEGER DEFAULT 0,
    gerer_stock BOOLEAN DEFAULT TRUE,
    
    -- Images
    images JSONB, -- URLs images
    
    -- SEO
    meta_titre VARCHAR(200),
    meta_description TEXT,
    slug_url VARCHAR(200) UNIQUE,
    
    -- IA
    tags_ia JSONB, -- Tags générés par IA
    description_ia TEXT, -- Description générée par IA
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    en_vedette BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : commandes_ecommerce
CREATE TABLE IF NOT EXISTS commandes_ecommerce (
    id_commande SERIAL PRIMARY KEY,
    id_boutique INTEGER NOT NULL REFERENCES boutiques(id_boutique),
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    
    -- Client
    id_client INTEGER REFERENCES clients(id_client),
    email_client VARCHAR(200) NOT NULL,
    nom_client VARCHAR(200),
    telephone_client VARCHAR(50),
    
    -- Adresses
    adresse_livraison JSONB NOT NULL,
    adresse_facturation JSONB,
    
    -- Totaux
    sous_total_ht NUMERIC(12,2) DEFAULT 0,
    frais_livraison NUMERIC(10,2) DEFAULT 0,
    remise NUMERIC(10,2) DEFAULT 0,
    tva NUMERIC(12,2) DEFAULT 0,
    total_ttc NUMERIC(12,2) NOT NULL,
    
    -- Paiement
    mode_paiement VARCHAR(30),
    statut_paiement VARCHAR(30) DEFAULT 'EN_ATTENTE',
    id_transaction VARCHAR(100),
    
    -- Livraison
    transporteur VARCHAR(100),
    numero_suivi VARCHAR(100),
    statut_livraison VARCHAR(30) DEFAULT 'EN_ATTENTE',
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, CONFIRMEE, EN_PREPARATION, EXPEDIEE, LIVREE, ANNULEE
    
    -- Dates
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_livraison_prevue DATE,
    date_livraison_reelle DATE,
    
    -- Notes
    notes_client TEXT,
    notes_interne TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : recommandations_ia
CREATE TABLE IF NOT EXISTS recommandations_ia (
    id_recommandation SERIAL PRIMARY KEY,
    id_boutique INTEGER NOT NULL REFERENCES boutiques(id_boutique),
    
    -- Type recommandation
    type_recommandation VARCHAR(30) NOT NULL,
    -- Types: PRODUIT_SIMILAIRE, PRODUIT_COMPLEMENTAIRE, PRODUIT_POPULAIRE, PRODUIT_PERSONNALISE
    
    -- Produit source
    id_produit_source INTEGER REFERENCES produits_boutique(id_produit_boutique),
    
    -- Produit recommandé
    id_produit_recommande INTEGER NOT NULL REFERENCES produits_boutique(id_produit_boutique),
    
    -- Score IA
    score_ia NUMERIC(5,2) NOT NULL, -- 0-100
    algorithme_ia VARCHAR(50), -- Type algorithme utilisé
    
    -- Contexte
    contexte JSONB, -- Données utilisées pour la recommandation
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : interactions_ia
CREATE TABLE IF NOT EXISTS interactions_ia (
    id_interaction SERIAL PRIMARY KEY,
    id_boutique INTEGER NOT NULL REFERENCES boutiques(id_boutique),
    
    -- Type interaction
    type_interaction VARCHAR(30) NOT NULL,
    -- Types: RECHERCHE, NAVIGATION, AJOUT_PANIER, ACHAT, CHATBOT
    
    -- Utilisateur
    session_id VARCHAR(100),
    id_client INTEGER REFERENCES clients(id_client),
    
    -- Données
    donnees_interaction JSONB NOT NULL,
    
    -- Résultat IA
    resultat_ia JSONB,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : chatbot_conversations
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id_conversation SERIAL PRIMARY KEY,
    id_boutique INTEGER NOT NULL REFERENCES boutiques(id_boutique),
    
    -- Utilisateur
    session_id VARCHAR(100) NOT NULL,
    id_client INTEGER REFERENCES clients(id_client),
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'ACTIVE',
    
    -- Dernier message
    date_dernier_message TIMESTAMP,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : messages_chatbot
CREATE TABLE IF NOT EXISTS messages_chatbot (
    id_message SERIAL PRIMARY KEY,
    id_conversation INTEGER NOT NULL REFERENCES chatbot_conversations(id_conversation) ON DELETE CASCADE,
    
    -- Direction
    direction VARCHAR(10) NOT NULL, -- USER ou BOT
    
    -- Contenu
    message_text TEXT NOT NULL,
    reponse_ia JSONB, -- Réponse générée par IA
    
    -- Intention
    intention_detectee VARCHAR(100),
    confiance_ia NUMERIC(5,2),
    
    -- Actions
    actions_suggestees JSONB, -- Actions suggérées par l'IA
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX IF NOT EXISTS idx_produits_boutique ON produits_boutique(id_boutique);
CREATE INDEX IF NOT EXISTS idx_produits_boutique_actif ON produits_boutique(actif);
CREATE INDEX IF NOT EXISTS idx_commandes_ecommerce_boutique ON commandes_ecommerce(id_boutique);
CREATE INDEX IF NOT EXISTS idx_commandes_ecommerce_client ON commandes_ecommerce(id_client);
CREATE INDEX IF NOT EXISTS idx_commandes_ecommerce_statut ON commandes_ecommerce(statut);
CREATE INDEX IF NOT EXISTS idx_recommandations_produit ON recommandations_ia(id_produit_source);
CREATE INDEX IF NOT EXISTS idx_interactions_boutique ON interactions_ia(id_boutique);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations ON chatbot_conversations(id_boutique, session_id);

-- Fonction pour générer recommandations IA
CREATE OR REPLACE FUNCTION generer_recommandations_ia(
    id_produit_param INTEGER,
    id_boutique_param INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- TODO: Implémenter algorithme de recommandation IA
    -- - Analyse des ventes similaires
    -- - Analyse des tags produits
    -- - Machine learning (collaborative filtering, content-based)
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_boutiques_updated_at BEFORE UPDATE ON boutiques
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_produits_boutique_updated_at BEFORE UPDATE ON produits_boutique
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_commandes_ecommerce_updated_at BEFORE UPDATE ON commandes_ecommerce
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
