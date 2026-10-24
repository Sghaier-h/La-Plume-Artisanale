-- ============================================================================
-- Phase T1 — Fix FK legacy → v2 (devis, commandes, BL, factures, OF, retours)
-- ============================================================================
--
-- Contexte : la migration CRM v1 → v2 (clients → comptes, utilisateurs → users)
-- a conservé des FKs référençant les anciennes tables `_legacy_clients` et
-- `_legacy_utilisateurs`. Cela empêche le workflow métier (devis → commande →
-- OF → BL → facture) d'utiliser les clients et utilisateurs créés dans les
-- tables v2 (`comptes`, `users`).
--
-- Pré-check effectué : toutes les lignes existantes dans devis/commandes/
-- bons_livraison/factures/bons_retour avec id_client référencent déjà des
-- id_client présents dans `comptes`. De même, `commandes.validee_par` et
-- `ordres_fabrication.cree_par` référencent déjà des id_user présents dans
-- `users`. La migration est donc rétro-compatible sans perte de données.
-- ============================================================================

BEGIN;

-- devis.id_client → comptes(id_client)
ALTER TABLE devis DROP CONSTRAINT IF EXISTS devis_id_client_fkey;
ALTER TABLE devis
  ADD CONSTRAINT devis_id_client_fkey
    FOREIGN KEY (id_client) REFERENCES comptes(id_client) ON DELETE RESTRICT;

-- commandes.id_client → comptes(id_client)
ALTER TABLE commandes DROP CONSTRAINT IF EXISTS commandes_id_client_fkey;
ALTER TABLE commandes
  ADD CONSTRAINT commandes_id_client_fkey
    FOREIGN KEY (id_client) REFERENCES comptes(id_client) ON DELETE RESTRICT;

-- commandes.validee_par → users(id_user)
ALTER TABLE commandes DROP CONSTRAINT IF EXISTS commandes_validee_par_fkey;
ALTER TABLE commandes
  ADD CONSTRAINT commandes_validee_par_fkey
    FOREIGN KEY (validee_par) REFERENCES users(id_user) ON DELETE SET NULL;

-- bons_livraison.id_client → comptes(id_client)
ALTER TABLE bons_livraison DROP CONSTRAINT IF EXISTS bons_livraison_id_client_fkey;
ALTER TABLE bons_livraison
  ADD CONSTRAINT bons_livraison_id_client_fkey
    FOREIGN KEY (id_client) REFERENCES comptes(id_client) ON DELETE RESTRICT;

-- factures.id_client → comptes(id_client)
ALTER TABLE factures DROP CONSTRAINT IF EXISTS factures_id_client_fkey;
ALTER TABLE factures
  ADD CONSTRAINT factures_id_client_fkey
    FOREIGN KEY (id_client) REFERENCES comptes(id_client) ON DELETE RESTRICT;

-- bons_retour.id_client → comptes(id_client)
ALTER TABLE bons_retour DROP CONSTRAINT IF EXISTS bons_retour_id_client_fkey;
ALTER TABLE bons_retour
  ADD CONSTRAINT bons_retour_id_client_fkey
    FOREIGN KEY (id_client) REFERENCES comptes(id_client) ON DELETE RESTRICT;

-- ordres_fabrication.cree_par → users(id_user)
ALTER TABLE ordres_fabrication DROP CONSTRAINT IF EXISTS ordres_fabrication_cree_par_fkey;
ALTER TABLE ordres_fabrication
  ADD CONSTRAINT ordres_fabrication_cree_par_fkey
    FOREIGN KEY (cree_par) REFERENCES users(id_user) ON DELETE SET NULL;

-- Drop legacy trigger `trigger_mettre_a_jour_type_client` qui référence la
-- table `clients` (renommée `comptes`) et une colonne `type_client` qui
-- n'existe plus (remplacée par `type_compte`).
DROP TRIGGER IF EXISTS trigger_mettre_a_jour_type_client ON commandes;
DROP FUNCTION IF EXISTS mettre_a_jour_type_client() CASCADE;

COMMIT;
