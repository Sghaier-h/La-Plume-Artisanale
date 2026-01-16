-- ============================================================================
-- MODULE E-COMMERCE AVEC INTELLIGENCE ARTIFICIELLE
-- ============================================================================

-- Table : boutiques_en_ligne
CREATE TABLE IF NOT EXISTS boutiques_en_ligne (
    id_boutique SERIAL PRIMARY KEY,
    code_boutique VARCHAR(50) UNIQUE NOT NULL,
    nom_boutique VARCHAR(200) NOT NULL,
    url_boutique VARCHAR(500),
    
    -- Configuration
    plateforme VARCHAR(50),
    -- Plateformes: WOOCOMMERCE, PRESTASHOP, SHOPIFY, CUSTOM, API
    
    -- API
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    api_url VARCHAR(500),
    
    -- Synchronisation
    synchronisation_auto BOOLEAN DEFAULT TRUE,
    frequence_sync_minutes INTEGER DEFAULT 60,
    derniere_sync TIMESTAMP,
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : produits_ecommerce
CREATE TABLE IF NOT EXISTS produits_ecommerce (
    id_produit_ecom SERIAL PRIMARY KEY,
    id_boutique INTEGER NOT NULL REFERENCES boutiques_en_ligne(id_boutique),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    id_produit INTEGER REFERENCES produits(id_produit),
    
    -- Identifiants externes
    sku_externe VARCHAR(100),
    id_externe VARCHAR(100),
    
    -- Informations
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    description_courte TEXT,
    
    -- Prix
    prix_vente NUMERIC(10,2) NOT NULL,
    prix_promotion NUMERIC(10,2),
    date_debut_promo DATE,
    date_fin_promo DATE,
    
    -- Stock
    stock_disponible INTEGER DEFAULT 0,
    gerer_stock BOOLEAN DEFAULT TRUE,
    stock_illimite BOOLEAN DEFAULT FALSE,
    
    -- Images
    image_principale VARCHAR(500),
    images_galerie TEXT[],
    
    -- Catégories
    categories TEXT[], -- Catégories e-commerce
    
    -- Tags
    tags TEXT[],
    
    -- SEO
    meta_titre VARCHAR(200),
    meta_description TEXT,
    slug_url VARCHAR(200),
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, PUBLIE, ARCHIVE
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_boutique, sku_externe)
);

-- Table : commandes_ecommerce
CREATE TABLE IF NOT EXISTS commandes_ecommerce (
    id_commande_ecom SERIAL PRIMARY KEY,
    id_boutique INTEGER NOT NULL REFERENCES boutiques_en_ligne(id_boutique),
    id_commande INTEGER REFERENCES commandes_clients(id_commande),
    
    -- Identifiants externes
    numero_commande_externe VARCHAR(100) UNIQUE NOT NULL,
    id_externe VARCHAR(100),
    
    -- Client
    id_client INTEGER REFERENCES clients(id_client),
    email_client VARCHAR(200),
    nom_client VARCHAR(200),
    telephone_client VARCHAR(50),
    
    -- Dates
    date_commande TIMESTAMP NOT NULL,
    date_paiement TIMESTAMP,
    date_expedition TIMESTAMP,
    date_livraison TIMESTAMP,
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) NOT NULL,
    frais_livraison NUMERIC(10,2) DEFAULT 0,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, PAYEE, EN_PREPARATION, EXPEDIEE, LIVREE, ANNULEE, REMBOURSEE
    
    -- Paiement
    mode_paiement VARCHAR(50),
    statut_paiement VARCHAR(30),
    
    -- Livraison
    adresse_livraison JSONB,
    transporteur VARCHAR(100),
    numero_suivi VARCHAR(100),
    
    -- Métadonnées
    synchronise BOOLEAN DEFAULT FALSE,
    date_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : ia_recommandations
CREATE TABLE IF NOT EXISTS ia_recommandations (
    id_recommandation SERIAL PRIMARY KEY,
    id_produit INTEGER REFERENCES produits(id_produit),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    
    -- Type recommandation
    type_recommandation VARCHAR(30) NOT NULL,
    -- Types: PRODUITS_SIMILAIRES, PRODUITS_COMPLEMENTAIRES, TENDANCES, PERSONNALISE
    
    -- Produits recommandés
    produits_recommandes INTEGER[], -- IDs produits
    articles_recommandes INTEGER[], -- IDs articles
    
    -- Score
    score_pertinence NUMERIC(5,2) DEFAULT 0, -- 0-100
    score_confiance NUMERIC(5,2) DEFAULT 0, -- 0-100
    
    -- Métadonnées
    modele_ia VARCHAR(100), -- Nom du modèle IA utilisé
    date_calcul TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Table : ia_analyse_ventes
CREATE TABLE IF NOT EXISTS ia_analyse_ventes (
    id_analyse SERIAL PRIMARY KEY,
    
    -- Période
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    
    -- Analyse
    type_analyse VARCHAR(30) NOT NULL,
    -- Types: TENDANCE, SAISONNALITE, PREVISION, SEGMENTATION
    
    -- Résultats
    resultats JSONB NOT NULL,
    -- Structure selon type_analyse
    
    -- Prédictions
    predictions JSONB,
    
    -- Métadonnées
    modele_ia VARCHAR(100),
    precision_modele NUMERIC(5,2),
    date_calcul TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : chatbot_conversations
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id_conversation_chatbot SERIAL PRIMARY KEY,
    id_boutique INTEGER REFERENCES boutiques_en_ligne(id_boutique),
    
    -- Session
    session_id VARCHAR(255) UNIQUE NOT NULL,
    id_client INTEGER REFERENCES clients(id_client),
    
    -- Canal
    canal VARCHAR(30) DEFAULT 'WEB',
    -- Canaux: WEB, WHATSAPP, FACEBOOK, AUTRE
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'ACTIVE',
    -- Statuts: ACTIVE, TERMINEE, TRANSFEREE_HUMAIN
    
    -- Métadonnées
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP,
    nombre_messages INTEGER DEFAULT 0,
    satisfaction INTEGER, -- 1-5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : chatbot_messages
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id_message_chatbot SERIAL PRIMARY KEY,
    id_conversation INTEGER NOT NULL REFERENCES chatbot_conversations(id_conversation_chatbot) ON DELETE CASCADE,
    
    -- Direction
    direction VARCHAR(10) NOT NULL,
    -- Directions: USER, BOT, SYSTEM
    
    -- Contenu
    contenu TEXT NOT NULL,
    type_contenu VARCHAR(30) DEFAULT 'TEXTE',
    -- Types: TEXTE, IMAGE, PRODUIT, PANIER, COMMANDE
    
    -- Intention
    intention_detectee VARCHAR(100),
    entites_extrait JSONB,
    
    -- Réponse IA
    reponse_ia BOOLEAN DEFAULT FALSE,
    confiance_reponse NUMERIC(5,2),
    
    -- Métadonnées
    date_message TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : ia_entrainement
CREATE TABLE IF NOT EXISTS ia_entrainement (
    id_entrainement SERIAL PRIMARY KEY,
    modele_ia VARCHAR(100) NOT NULL,
    
    -- Type
    type_modele VARCHAR(30) NOT NULL,
    -- Types: RECOMMANDATION, CHATBOT, PREVISION, CLASSIFICATION
    
    -- Données
    donnees_entrainement JSONB,
    parametres_modele JSONB,
    
    -- Résultats
    precision_entrainement NUMERIC(5,2),
    precision_validation NUMERIC(5,2),
    metriques JSONB,
    
    -- État
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, EN_COURS, TERMINE, ERREUR
    
    -- Métadonnées
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    duree_secondes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_boutiques_actif ON boutiques_en_ligne(actif);
CREATE INDEX IF NOT EXISTS idx_produits_ecom_boutique ON produits_ecommerce(id_boutique);
CREATE INDEX IF NOT EXISTS idx_produits_ecom_article ON produits_ecommerce(id_article);
CREATE INDEX IF NOT EXISTS idx_produits_ecom_statut ON produits_ecommerce(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_ecom_boutique ON commandes_ecommerce(id_boutique);
CREATE INDEX IF NOT EXISTS idx_commandes_ecom_client ON commandes_ecommerce(id_client);
CREATE INDEX IF NOT EXISTS idx_commandes_ecom_statut ON commandes_ecommerce(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_ecom_date ON commandes_ecommerce(date_commande);
CREATE INDEX IF NOT EXISTS idx_recommandations_produit ON ia_recommandations(id_produit);
CREATE INDEX IF NOT EXISTS idx_recommandations_type ON ia_recommandations(type_recommandation);
CREATE INDEX IF NOT EXISTS idx_analyse_ventes_periode ON ia_analyse_ventes(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_analyse_ventes_type ON ia_analyse_ventes(type_analyse);
CREATE INDEX IF NOT EXISTS idx_chatbot_session ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_client ON chatbot_conversations(id_client);
CREATE INDEX IF NOT EXISTS idx_chatbot_statut ON chatbot_conversations(statut);
CREATE INDEX IF NOT EXISTS idx_messages_chatbot_conv ON chatbot_messages(id_conversation);
CREATE INDEX IF NOT EXISTS idx_messages_chatbot_date ON chatbot_messages(date_message);

-- Triggers
CREATE TRIGGER trigger_boutiques_updated_at BEFORE UPDATE ON boutiques_en_ligne
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_produits_ecom_updated_at BEFORE UPDATE ON produits_ecommerce
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_commandes_ecom_updated_at BEFORE UPDATE ON commandes_ecommerce
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Fonction pour synchroniser commande e-commerce
CREATE OR REPLACE FUNCTION synchroniser_commande_ecommerce(id_commande_ecom_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    -- Créer commande client depuis commande e-commerce
    -- Cette fonction sera appelée par le backend
    
    UPDATE commandes_ecommerce
    SET synchronise = TRUE,
        date_sync = CURRENT_TIMESTAMP
    WHERE id_commande_ecom = id_commande_ecom_param;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
