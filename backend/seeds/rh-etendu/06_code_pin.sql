-- =============================================================================
-- 06_code_pin.sql — PIN d'identification tablette pour les employés démo
--
-- PIN par défaut : les 4 derniers caractères du matricule (ex. EMP-001 → "0001").
-- Hash SHA-256 simple en démo (le backend bcrypt-hashera à la saisie réelle).
-- Pour la démo on stocke le PIN en clair dans pin_hash + salt vide; le
-- service PIN acceptera `pin_hash = pin` pour une démo locale.
-- =============================================================================

INSERT INTO code_pin_employe (id_employe, pin_hash, salt, pin_longueur)
SELECT e.id_employe,
       SUBSTR(e.matricule, LENGTH(e.matricule)-3, 4),     -- "0001", "0002", ...
       '',
       4
FROM employes e
WHERE e.matricule LIKE 'EMP-%'
ON CONFLICT (id_employe) DO UPDATE SET
  pin_hash = EXCLUDED.pin_hash,
  salt     = EXCLUDED.salt,
  pin_longueur = EXCLUDED.pin_longueur,
  bloque = FALSE,
  nb_tentatives_echec = 0,
  updated_at = NOW();
