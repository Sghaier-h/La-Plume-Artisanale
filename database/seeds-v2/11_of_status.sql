-- Table de référence des statuts OF (l'enum est déjà défini dans 09_fabrication_of.sql).
-- On matérialise en table pour libellés/ordre d'affichage/couleur UI.

CREATE TABLE IF NOT EXISTS ref_of_statuts (
    code_statut  VARCHAR(30) PRIMARY KEY,
    libelle      VARCHAR(80) NOT NULL,
    ordre_ui     INTEGER NOT NULL,
    couleur      VARCHAR(20),
    est_final    BOOLEAN NOT NULL DEFAULT FALSE,
    description  TEXT
);

INSERT INTO ref_of_statuts (code_statut, libelle, ordre_ui, couleur, est_final, description) VALUES
('brouillon',      'Brouillon',                 10, '#9CA3AF', FALSE, 'OF créé, pas encore planifié'),
('planifie',       'Planifié',                  20, '#3B82F6', FALSE, 'Machine attribuée, slots générés'),
('en_attente_mp',  'En attente MP',             30, '#F59E0B', FALSE, 'Matière première indisponible'),
('prep_mp',        'Préparation MP',            40, '#F59E0B', FALSE, 'Magasinier prépare le kit MP'),
('ourdissage',     'Ourdissage',                50, '#8B5CF6', FALSE, 'Chaîne en cours d''ourdissage'),
('tissage',        'Tissage',                   60, '#10B981', FALSE, 'Tissage en cours sur métier'),
('coupe',          'Coupe',                     70, '#06B6D4', FALSE, 'Coupe des pièces'),
('finition',       'Finition',                  80, '#0EA5E9', FALSE, 'Ourlet / frange / lavage / repassage'),
('controle',       'Contrôle qualité',          90, '#6366F1', FALSE, 'Contrôle qualité final'),
('bloque_qc',      'Bloqué QC',                100, '#EF4444', FALSE, 'Contrôle qualité bloquant'),
('termine',        'Terminé',                  110, '#22C55E', FALSE, 'Fabrication terminée, en attente clôture'),
('cloture',        'Clôturé',                  120, '#166534', TRUE,  'OF clôturé, données immuables'),
('livre',          'Livré',                    130, '#065F46', TRUE,  'OF livré au client'),
('annule',         'Annulé',                   140, '#6B7280', TRUE,  'OF annulé')
ON CONFLICT (code_statut) DO UPDATE
   SET libelle = EXCLUDED.libelle,
       ordre_ui = EXCLUDED.ordre_ui,
       couleur = EXCLUDED.couleur,
       est_final = EXCLUDED.est_final,
       description = EXCLUDED.description;
