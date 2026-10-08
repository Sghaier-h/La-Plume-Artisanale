-- Migration : relances de factures impayées
CREATE TABLE IF NOT EXISTS relances_factures (
  id_relance SERIAL PRIMARY KEY,
  id_facture INTEGER REFERENCES factures(id_facture) ON DELETE CASCADE,
  niveau INTEGER NOT NULL,
  type_relance VARCHAR(32),
  canal VARCHAR(32) DEFAULT 'email',
  date_relance TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  destinataire VARCHAR(255),
  sujet VARCHAR(255),
  contenu TEXT,
  statut VARCHAR(32) DEFAULT 'envoyee',
  error_message TEXT,
  reponse_recue BOOLEAN DEFAULT false,
  date_reponse TIMESTAMP,
  created_by INTEGER
);

CREATE INDEX IF NOT EXISTS idx_relances_facture ON relances_factures(id_facture, niveau);
CREATE INDEX IF NOT EXISTS idx_relances_date ON relances_factures(date_relance);

-- Configuration par défaut (upsert manuel — parametrage utilise un index
-- unique partiel « WHERE cle IS NOT NULL » incompatible avec ON CONFLICT).
DO $$
DECLARE
  seed RECORD;
BEGIN
  FOR seed IN
    SELECT * FROM (VALUES
      ('relances.j1_delai',   '7',    'number'),
      ('relances.j2_delai',   '15',   'number'),
      ('relances.j3_delai',   '30',   'number'),
      ('relances.enabled',    'true', 'boolean'),
      ('relances.cron_hour',  '9',    'number')
    ) AS s(cle, valeur, type_valeur)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM parametrage WHERE cle = seed.cle) THEN
      INSERT INTO parametrage (cle, valeur, type_valeur, categorie, editable_ui, date_creation)
      VALUES (seed.cle, seed.valeur, seed.type_valeur, 'relances', true, NOW());
    END IF;
  END LOOP;
END $$;
