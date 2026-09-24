-- =====================================================================
-- SCHEMA V2 — DOMAINE B : Index performance mouvements_stock
-- Fichier : 08_stock_index.sql
-- Cible : requêtes fréquentes dashboards (par date/entrepôt/article/type)
-- =====================================================================

-- Recherche par date (dashboards journaliers, périodes)
CREATE INDEX IF NOT EXISTS idx_mvt_date
    ON mouvements_stock(date_mouvement DESC);

-- Par entrepôt source / destination
CREATE INDEX IF NOT EXISTS idx_mvt_entrepot_source
    ON mouvements_stock(id_entrepot_source, date_mouvement DESC);

CREATE INDEX IF NOT EXISTS idx_mvt_entrepot_dest
    ON mouvements_stock(id_entrepot_destination, date_mouvement DESC);

-- Par article
CREATE INDEX IF NOT EXISTS idx_mvt_article
    ON mouvements_stock(id_article, date_mouvement DESC);

-- Par article × entrepôt destination (KPI stock actuel)
CREATE INDEX IF NOT EXISTS idx_mvt_article_entrepot_dest
    ON mouvements_stock(id_article, id_entrepot_destination, date_mouvement DESC);

-- Par type de mouvement
CREATE INDEX IF NOT EXISTS idx_mvt_type
    ON mouvements_stock(type_mouvement, date_mouvement DESC);

-- Par statut (filtrage en_attente)
CREATE INDEX IF NOT EXISTS idx_mvt_statut
    ON mouvements_stock(statut) WHERE statut <> 'valide';

-- Par document lié (BL, OF, réception…)
CREATE INDEX IF NOT EXISTS idx_mvt_doc_lie
    ON mouvements_stock(type_document_lie, id_document_lie);

-- Par lot (traçabilité MP)
CREATE INDEX IF NOT EXISTS idx_mvt_lot
    ON mouvements_stock(id_lot) WHERE id_lot IS NOT NULL;

-- Par utilisateur (audit)
CREATE INDEX IF NOT EXISTS idx_mvt_effectue_par
    ON mouvements_stock(effectue_par, date_mouvement DESC);

-- Composite : entrepôt × article × date (rapports stock par période)
CREATE INDEX IF NOT EXISTS idx_mvt_composite_dashboard
    ON mouvements_stock(id_entrepot_destination, id_article, type_mouvement, date_mouvement DESC);
