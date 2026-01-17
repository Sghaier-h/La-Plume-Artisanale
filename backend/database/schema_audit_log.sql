-- ============================================================================
-- SYSTÈME D'AUDIT TRAIL - TRACABILITÉ COMPLÈTE DES MODIFICATIONS
-- ============================================================================

-- Table principale pour les logs d'audit
CREATE TABLE IF NOT EXISTS audit_log (
    id_audit SERIAL PRIMARY KEY,
    
    -- Informations sur l'action
    action VARCHAR(20) NOT NULL,
    -- Actions: CREATE, UPDATE, DELETE, READ (pour actions sensibles)
    
    -- Informations sur l'utilisateur
    user_id INTEGER,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    
    -- Informations sur l'entité modifiée
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    record_identifier VARCHAR(255), -- Identifiant lisible (ex: numero_devis, nom_client)
    
    -- Données avant/après modification
    old_values JSONB,
    new_values JSONB,
    
    -- Métadonnées
    ip_address VARCHAR(45), -- Support IPv6
    user_agent TEXT,
    endpoint VARCHAR(255), -- URL de l'API appelée
    method VARCHAR(10), -- GET, POST, PUT, DELETE
    
    -- Horodatage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_table_date ON audit_log(table_name, created_at);

-- Commentaires pour documentation
COMMENT ON TABLE audit_log IS 'Table de traçabilité complète de toutes les modifications du système';
COMMENT ON COLUMN audit_log.action IS 'Type d''action: CREATE, UPDATE, DELETE, READ';
COMMENT ON COLUMN audit_log.table_name IS 'Nom de la table concernée';
COMMENT ON COLUMN audit_log.record_id IS 'ID de l''enregistrement modifié';
COMMENT ON COLUMN audit_log.old_values IS 'Valeurs avant modification (JSON)';
COMMENT ON COLUMN audit_log.new_values IS 'Valeurs après modification (JSON)';

-- Fonction pour obtenir un identifiant lisible d'un enregistrement
CREATE OR REPLACE FUNCTION get_record_identifier(
    p_table_name VARCHAR,
    p_record_id INTEGER
) RETURNS VARCHAR AS $$
DECLARE
    v_identifier VARCHAR(255);
BEGIN
    -- Identifier selon la table
    CASE p_table_name
        WHEN 'devis' THEN
            SELECT numero_devis INTO v_identifier FROM devis WHERE id_devis = p_record_id;
        WHEN 'factures' THEN
            SELECT numero_facture INTO v_identifier FROM factures WHERE id_facture = p_record_id;
        WHEN 'bons_livraison' THEN
            SELECT numero_bl INTO v_identifier FROM bons_livraison WHERE id_bl = p_record_id;
        WHEN 'avoirs' THEN
            SELECT numero_avoir INTO v_identifier FROM avoirs WHERE id_avoir = p_record_id;
        WHEN 'bons_retour' THEN
            SELECT numero_retour INTO v_identifier FROM bons_retour WHERE id_retour = p_record_id;
        WHEN 'clients' THEN
            SELECT nom || ' ' || prenom INTO v_identifier FROM clients WHERE id_client = p_record_id;
        WHEN 'fournisseurs' THEN
            SELECT nom_fournisseur INTO v_identifier FROM fournisseurs WHERE id_fournisseur = p_record_id;
        WHEN 'commandes' THEN
            SELECT numero_commande INTO v_identifier FROM commandes WHERE id_commande = p_record_id;
        WHEN 'of' THEN
            SELECT numero_of INTO v_identifier FROM of WHERE id_of = p_record_id;
        WHEN 'articles_catalogue' THEN
            SELECT reference || ' - ' || designation INTO v_identifier FROM articles_catalogue WHERE id_article = p_record_id;
        WHEN 'utilisateurs' THEN
            SELECT email INTO v_identifier FROM utilisateurs WHERE id_utilisateur = p_record_id;
        ELSE
            v_identifier := 'ID: ' || p_record_id::VARCHAR;
    END CASE;
    
    RETURN COALESCE(v_identifier, 'ID: ' || p_record_id::VARCHAR);
END;
$$ LANGUAGE plpgsql;

-- Vue pour faciliter la consultation des logs d'audit
CREATE OR REPLACE VIEW v_audit_log AS
SELECT 
    al.id_audit,
    al.action,
    al.user_id,
    al.user_email,
    al.user_role,
    al.table_name,
    al.record_id,
    COALESCE(al.record_identifier, get_record_identifier(al.table_name, al.record_id)) as record_identifier,
    al.old_values,
    al.new_values,
    al.ip_address,
    al.endpoint,
    al.method,
    al.created_at,
    -- Différences calculées (si nécessaire)
    CASE 
        WHEN al.action = 'UPDATE' AND al.old_values IS NOT NULL AND al.new_values IS NOT NULL 
        THEN (
            SELECT jsonb_object_agg(key, jsonb_build_object(
                'old', old_values->key,
                'new', new_values->key
            ))
            FROM jsonb_each(al.old_values)
            WHERE (old_values->key)::text IS DISTINCT FROM (new_values->key)::text
        )
        ELSE NULL
    END as changes
FROM audit_log al
ORDER BY al.created_at DESC;

COMMENT ON VIEW v_audit_log IS 'Vue enrichie des logs d''audit avec identifiants lisibles et calculs de différences';

-- Fonction trigger pour mettre à jour updated_at automatiquement
-- (Sera utilisé dans les triggers des tables métier)

-- Exemple de trigger pour une table (à adapter selon les besoins)
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Index supplémentaires pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_audit_user_date ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_table_record_date ON audit_log(table_name, record_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action_date ON audit_log(action, created_at DESC);

-- Statistiques et vues utiles

-- Vue pour les statistiques d'audit par table
CREATE OR REPLACE VIEW v_audit_stats_by_table AS
SELECT 
    table_name,
    action,
    COUNT(*) as count,
    MIN(created_at) as first_action,
    MAX(created_at) as last_action
FROM audit_log
GROUP BY table_name, action
ORDER BY table_name, action;

-- Vue pour les statistiques d'audit par utilisateur
CREATE OR REPLACE VIEW v_audit_stats_by_user AS
SELECT 
    user_id,
    user_email,
    user_role,
    action,
    COUNT(*) as count,
    MIN(created_at) as first_action,
    MAX(created_at) as last_action
FROM audit_log
WHERE user_id IS NOT NULL
GROUP BY user_id, user_email, user_role, action
ORDER BY count DESC;
