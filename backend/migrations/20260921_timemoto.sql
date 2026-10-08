-- Migration : intégration TimeMoto (Safescan) pour le module pointage
-- Ajoute colonnes source / device_id / imported_at et seed la configuration
-- par défaut dans la table parametrage (préfixe timemoto.*).

ALTER TABLE pointage ADD COLUMN IF NOT EXISTS source VARCHAR(32) DEFAULT 'manuel';
ALTER TABLE pointage ADD COLUMN IF NOT EXISTS device_id VARCHAR(64);
ALTER TABLE pointage ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP;

-- Index utile pour retrouver les imports TimeMoto par date
CREATE INDEX IF NOT EXISTS idx_pointage_source ON pointage(source);
CREATE INDEX IF NOT EXISTS idx_pointage_timemoto_id ON pointage(timemoto_id) WHERE timemoto_id IS NOT NULL;

-- Configuration par défaut (upsert manuel — parametrage utilise un index
-- unique partiel « WHERE cle IS NOT NULL » incompatible avec ON CONFLICT).
DO $$
DECLARE
  seed RECORD;
BEGIN
  FOR seed IN
    SELECT * FROM (VALUES
      ('timemoto.start_time',            '08:00',        'string'),
      ('timemoto.tolerance_minutes',     '5',            'number'),
      ('timemoto.break_minimum_minutes', '30',           'number'),
      ('timemoto.timezone',              'Africa/Tunis', 'string')
    ) AS s(cle, valeur, type_valeur)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM parametrage WHERE cle = seed.cle) THEN
      INSERT INTO parametrage (cle, valeur, type_valeur, categorie, editable_ui, date_creation)
      VALUES (seed.cle, seed.valeur, seed.type_valeur, 'timemoto', true, NOW());
    END IF;
  END LOOP;
END $$;
