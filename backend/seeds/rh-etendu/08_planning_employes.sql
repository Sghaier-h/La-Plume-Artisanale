-- =============================================================================
-- 08_planning_employes.sql — Planning employés pour les 14 jours à venir
-- =============================================================================

DELETE FROM planning_employes
 WHERE notes LIKE '[DEMO]%'
   AND date_planning >= CURRENT_DATE;

-- Génère 7 jours de planning par employé actif (matin 08:00-12:00 + am 13:00-17:00)
INSERT INTO planning_employes (
  id_employe, date_planning, horaire_debut, horaire_fin,
  type_shift, statut, notes
)
SELECT e.id_employe,
       d::date,
       (CASE WHEN shift = 'matin' THEN TIME '08:00' ELSE TIME '13:00' END),
       (CASE WHEN shift = 'matin' THEN TIME '12:00' ELSE TIME '17:00' END),
       shift,
       'planifie',
       '[DEMO] Planning hebdo généré automatiquement'
FROM employes e
CROSS JOIN generate_series(CURRENT_DATE, CURRENT_DATE + 6, INTERVAL '1 day') AS d
CROSS JOIN (VALUES ('matin'::varchar), ('apres_midi'::varchar)) AS s(shift)
WHERE e.statut = 'actif'
  AND e.matricule LIKE 'EMP-%'
  AND EXTRACT(DOW FROM d) NOT IN (0, 6)       -- hors week-end
ON CONFLICT (id_employe, date_planning, horaire_debut) DO NOTHING;
