-- ============================================================================
-- CREATION/MISE A JOUR DES UTILISATEURS AVEC GROUPES
-- ============================================================================
-- Script généré automatiquement
-- ============================================================================

BEGIN;

-- Utilisateur: AY Amel yaakoubi
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'AY Amel yaakoubi',
    'amel.yaakoubi@laplume-artisanale.tn',
    'AY Amel',
    'yaakoubi',
    NULL,
    '👩',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: CM CHAFIA MAKHZOUG
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'CM CHAFIA MAKHZOUG',
    'chafia.makhzoug@laplume-artisanale.tn',
    'CM CHAFIA',
    'MAKHZOUG',
    NULL,
    '👩',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: EN EL JMEL NAIMA
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'EN EL JMEL NAIMA',
    'jmel.naima@laplume-artisanale.tn',
    'EN EL JMEL',
    'NAIMA',
    NULL,
    '👩',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: HE HABIB ECHAARI
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'HE HABIB ECHAARI',
    'habib.echaari@laplume-artisanale.tn',
    'HE HABIB',
    'ECHAARI',
    '011',
    '👨',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: HS HAMDI SGHAIER
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'HS HAMDI SGHAIER',
    'responsable@laplume-artisanale.tn',
    'HS HAMDI',
    'SGHAIER',
    NULL,
    '👨‍💼',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'COM' LIMIT 1),
    true,
    '$2b$10$placeholder_hash_will_be_updated_by_backend'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Mettre à jour le mot de passe pour l'admin (sera hashé par le backend)
-- Note: Le mot de passe doit être mis à jour via l'API ou le backend

-- Utilisateur: HD Hanen Douiri
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'HD Hanen Douiri',
    'hanen.douiri@laplume-artisanale.tn',
    'HD Hanen',
    'Douiri',
    NULL,
    '👩‍💼',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'COM' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: IL Ikram latrache
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'IL Ikram latrache',
    'ikram.latrache@laplume-artisanale.tn',
    'IL Ikram',
    'latrache',
    NULL,
    '👩',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: KA KARIM ABED
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'KA KARIM ABED',
    'karim.abed@laplume-artisanale.tn',
    'KA KARIM',
    'ABED',
    '002',
    '👨',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: MA MAATALAH AHMED
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'MA MAATALAH AHMED',
    'maatalah.ahmed@laplume-artisanale.tn',
    'MA MAATALAH',
    'AHMED',
    NULL,
    '👨',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: MM MAHBOUBA MSEKNI
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'MM MAHBOUBA MSEKNI',
    'mahbouba.msekni@laplume-artisanale.tn',
    'MM MAHBOUBA',
    'MSEKNI',
    '004',
    '👩',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: MH MAHBOUBA HSEN
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'MH MAHBOUBA HSEN',
    'mahbouba.hsen@laplume-artisanale.tn',
    'MH MAHBOUBA',
    'HSEN',
    NULL,
    '👩',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: MN Manel Ngur
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'MN Manel Ngur',
    'manel.ngur@laplume-artisanale.tn',
    'MN Manel',
    'Ngur',
    NULL,
    '👩',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: MA MOHAMED AOUINET
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'MA MOHAMED AOUINET',
    'mohamed.aouinet@laplume-artisanale.tn',
    'MA MOHAMED',
    'AOUINET',
    '007',
    '👨',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: NC Nafaa chhaibi
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'NC Nafaa chhaibi',
    'nafaa.chhaibi@laplume-artisanale.tn',
    'NC Nafaa',
    'chhaibi',
    NULL,
    '👨',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: NT NAWRES TOUIL
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'NT NAWRES TOUIL',
    'nawres.touil@laplume-artisanale.tn',
    'NT NAWRES',
    'TOUIL',
    '003',
    '👩',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: NL NIDHAL LACHHEB
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'NL NIDHAL LACHHEB',
    'nidhal.lachheb@laplume-artisanale.tn',
    'NL NIDHAL',
    'LACHHEB',
    NULL,
    '👨',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: SC SAID CHARFEDDINE
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'SC SAID CHARFEDDINE',
    'said.charfeddine@laplume-artisanale.tn',
    'SC SAID',
    'CHARFEDDINE',
    NULL,
    '👨',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'ATL' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: SZ SAIDA ZENTENI
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'SZ SAIDA ZENTENI',
    'saida.zenteni@laplume-artisanale.tn',
    'SZ SAIDA',
    'ZENTENI',
    NULL,
    '👩',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Utilisateur: SN SANDID NAZIHA
INSERT INTO utilisateurs (
    nom_utilisateur, email, prenom, nom, numero_employe, photo_emoji, id_groupe, actif, mot_de_passe_hash
)
SELECT
    'SN SANDID NAZIHA',
    'sandid.naziha@laplume-artisanale.tn',
    'SN SANDID',
    'NAZIHA',
    NULL,
    '👩',
    (SELECT id_groupe FROM groupes WHERE code_groupe = 'FAB' LIMIT 1),
    true,
    '$2b$10$HqZARIM2fODYUydfGdS66.qtyPc4LMmncM0ekFvtwmVGCxW4UCFJa'
ON CONFLICT (email) DO UPDATE SET
    nom_utilisateur = EXCLUDED.nom_utilisateur,
    prenom = EXCLUDED.prenom,
    nom = EXCLUDED.nom,
    numero_employe = EXCLUDED.numero_employe,
    photo_emoji = EXCLUDED.photo_emoji,
    id_groupe = EXCLUDED.id_groupe,
    actif = EXCLUDED.actif,
    mot_de_passe_hash = COALESCE(EXCLUDED.mot_de_passe_hash, utilisateurs.mot_de_passe_hash),
    date_modification = CURRENT_TIMESTAMP;

-- Attribuer le rôle ADMIN à Hamdi Sghaier
DO $$
DECLARE
    v_user_id INTEGER;
    v_role_id INTEGER;
BEGIN
    SELECT id_utilisateur INTO v_user_id
    FROM utilisateurs
    WHERE email = 'responsable@laplume-artisanale.tn';
    
    SELECT id_role INTO v_role_id
    FROM roles
    WHERE code_role = 'ADMIN' OR nom_role ILIKE '%admin%'
    LIMIT 1;
    
    IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (id_utilisateur, id_role) DO NOTHING;
        RAISE NOTICE 'Role ADMIN attribue a Hamdi Sghaier';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM utilisateurs WHERE actif = true;
    RAISE NOTICE 'Utilisateurs actifs: %', v_count;
END $$;

COMMIT;
