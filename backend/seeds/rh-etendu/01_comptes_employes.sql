-- =============================================================================
-- 01_comptes_employes.sql — Solde initial + RIB bancaire par employé
--
-- Les employés référencés doivent déjà exister (seed §11bis à part). On
-- utilise `UPDATE ... WHERE matricule = ...` pour rester idempotent.
-- Les valeurs sont basées sur « SUIVIS SALAIRE.xlsx » (compta La Plume
-- Comptabilité, Phase C de référence) : la plupart des comptes sont à zéro,
-- quelques-uns en négatif suite à un reset §11bis.3 fin septembre 2026.
-- =============================================================================

-- Création d'employés démo si l'effectif n'est pas déjà peuplé
INSERT INTO employes (matricule, nom, prenom, date_embauche, statut)
VALUES
  ('EMP-001','Salem',     'Mohamed',  '2022-01-10','actif'),
  ('EMP-002','Amdouni',   'Najwa',    '2021-03-05','actif'),
  ('EMP-003','Ben Ali',   'Amira',    '2023-06-15','actif'),
  ('EMP-004','Khemiri',   'Karim',    '2022-09-20','actif'),
  ('EMP-005','Trabelsi',  'Ines',     '2024-02-01','actif'),
  ('EMP-006','Hamdi',     'Sonia',    '2023-11-12','actif'),
  ('EMP-007','Jebali',    'Ahmed',    '2022-05-18','actif'),
  ('EMP-008','Laabidi',   'Fatma',    '2021-10-01','actif'),
  ('EMP-009','Mejri',     'Youssef',  '2023-04-22','actif'),
  ('EMP-010','Nasri',     'Hela',     '2024-07-15','actif'),
  ('EMP-011','Oueslati',  'Riadh',    '2020-08-03','actif'),
  ('EMP-012','Zahaf',     'Mariem',   '2022-12-10','actif')
ON CONFLICT (matricule) DO NOTHING;

-- Mise à jour des RIB et banque (données démo réalistes)
UPDATE employes SET
  rib_bancaire = '08 010 1234567890 12',
  banque       = 'STB — Agence Tunis Centre'
WHERE matricule = 'EMP-001';

UPDATE employes SET
  rib_bancaire = '04 020 2345678901 34',
  banque       = 'BIAT — Agence Nabeul'
WHERE matricule = 'EMP-002';

UPDATE employes SET
  rib_bancaire = '14 030 3456789012 56',
  banque       = 'Attijari Bank — Agence Mahdia'
WHERE matricule = 'EMP-003';

UPDATE employes SET
  rib_bancaire = '08 040 4567890123 78',
  banque       = 'STB — Agence Sousse'
WHERE matricule = 'EMP-004';

UPDATE employes SET
  rib_bancaire = '04 050 5678901234 90',
  banque       = 'BIAT — Agence Nabeul'
WHERE matricule = 'EMP-005';

UPDATE employes SET
  rib_bancaire = '10 060 6789012345 11',
  banque       = 'UIB — Agence Hammamet'
WHERE matricule = 'EMP-006';

UPDATE employes SET
  rib_bancaire = '14 070 7890123456 22',
  banque       = 'Attijari Bank — Agence Tunis'
WHERE matricule = 'EMP-007';

UPDATE employes SET
  rib_bancaire = '08 080 8901234567 33',
  banque       = 'STB — Agence Nabeul'
WHERE matricule = 'EMP-008';

UPDATE employes SET
  rib_bancaire = '04 090 9012345678 44',
  banque       = 'BIAT — Agence Tunis'
WHERE matricule = 'EMP-009';

UPDATE employes SET
  rib_bancaire = '10 100 0123456789 55',
  banque       = 'UIB — Agence Nabeul'
WHERE matricule = 'EMP-010';

UPDATE employes SET
  rib_bancaire = '08 110 1234501234 66',
  banque       = 'STB — Agence Tunis Centre'
WHERE matricule = 'EMP-011';

UPDATE employes SET
  rib_bancaire = '14 120 2345612345 77',
  banque       = 'Attijari Bank — Agence Nabeul'
WHERE matricule = 'EMP-012';

-- Solde courant par employé (valeurs démo, cf. SUIVIS SALAIRE.xlsx)
UPDATE employes SET solde_courant =    0.000, date_dernier_mouvement = NOW() - INTERVAL '2 days'  WHERE matricule = 'EMP-001';
UPDATE employes SET solde_courant = 4764.133, date_dernier_mouvement = NOW() - INTERVAL '7 days'  WHERE matricule = 'EMP-002';
UPDATE employes SET solde_courant = -250.000, date_dernier_mouvement = NOW() - INTERVAL '1 days'  WHERE matricule = 'EMP-003';
UPDATE employes SET solde_courant =    0.000, date_dernier_mouvement = NOW() - INTERVAL '2 days'  WHERE matricule = 'EMP-004';
UPDATE employes SET solde_courant =  120.500, date_dernier_mouvement = NOW() - INTERVAL '3 days'  WHERE matricule = 'EMP-005';
UPDATE employes SET solde_courant =    0.000, date_dernier_mouvement = NOW() - INTERVAL '2 days'  WHERE matricule = 'EMP-006';
UPDATE employes SET solde_courant = -480.000, date_dernier_mouvement = NOW() - INTERVAL '5 days'  WHERE matricule = 'EMP-007';
UPDATE employes SET solde_courant =    0.000, date_dernier_mouvement = NOW() - INTERVAL '2 days'  WHERE matricule = 'EMP-008';
UPDATE employes SET solde_courant =  850.000, date_dernier_mouvement = NOW() - INTERVAL '4 days'  WHERE matricule = 'EMP-009';
UPDATE employes SET solde_courant =    0.000, date_dernier_mouvement = NOW() - INTERVAL '2 days'  WHERE matricule = 'EMP-010';
UPDATE employes SET solde_courant = -120.000, date_dernier_mouvement = NOW() - INTERVAL '6 days'  WHERE matricule = 'EMP-011';
UPDATE employes SET solde_courant =    0.000, date_dernier_mouvement = NOW() - INTERVAL '2 days'  WHERE matricule = 'EMP-012';
