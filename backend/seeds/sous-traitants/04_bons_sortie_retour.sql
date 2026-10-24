-- =====================================================================
-- Seed 04 — Bons sortie / retour ST (démos avec signatures SVG mock)
-- Les bons vivent dans `of_sous_traitance` (schema 14) enrichi par 35.
-- Signatures SVG : courbe très simple générée inline (démonstration).
-- Idempotent via numero_bon unique.
--
-- NOTE : nécessite au moins 1 ordre_fabrication existant.
-- Si vide → les INSERT se font quand même avec id_of fictif (SELECT id_of).
-- =====================================================================

DO $$
DECLARE
    v_id_of BIGINT;
    v_id_chokri BIGINT;
    v_id_salem BIGINT;
    v_id_sobolux BIGINT;
    v_id_adel BIGINT;
    v_id_leyla BIGINT;
    v_id_ali_sassi BIGINT;
    v_id_bent BIGINT;
    v_id_mose BIGINT;
    v_annee INT := EXTRACT(YEAR FROM NOW())::INT;
    v_signature_sortie TEXT := '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100"><path d="M10 60 Q 50 20 90 60 T 170 50 T 290 55" stroke="#2A2A2A" fill="none" stroke-width="2"/></svg>';
    v_signature_retour TEXT := '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100"><path d="M10 55 Q 60 20 110 55 T 200 60 T 290 50" stroke="#2A2A2A" fill="none" stroke-width="2"/></svg>';
BEGIN
    -- Récupération ID OF existant (NULL si aucun)
    SELECT id_of INTO v_id_of FROM ordres_fabrication ORDER BY id_of ASC LIMIT 1;

    SELECT id_soustraitant INTO v_id_chokri    FROM sous_traitants WHERE code = 'ST-OURD-001'       LIMIT 1;
    SELECT id_soustraitant INTO v_id_salem     FROM sous_traitants WHERE code = 'ST-NOUA-001'       LIMIT 1;
    SELECT id_soustraitant INTO v_id_sobolux   FROM sous_traitants WHERE code = 'ST-TEIN-SOBOLUX'   LIMIT 1;
    SELECT id_soustraitant INTO v_id_adel      FROM sous_traitants WHERE code = 'ST-COUT-ADEL'      LIMIT 1;
    SELECT id_soustraitant INTO v_id_leyla     FROM sous_traitants WHERE code = 'ST-FRAN-LEYLA'     LIMIT 1;
    SELECT id_soustraitant INTO v_id_ali_sassi FROM sous_traitants WHERE code = 'ST-FRAN-ALI'       LIMIT 1;
    SELECT id_soustraitant INTO v_id_bent      FROM sous_traitants WHERE code = 'ST-COUT-BENTAISSA' LIMIT 1;
    SELECT id_soustraitant INTO v_id_mose      FROM sous_traitants WHERE code = 'ST-PERS-MOSE'      LIMIT 1;

    IF v_id_of IS NULL THEN
        RAISE NOTICE '[seed-st] Aucun ordre_fabrication — bons de sortie non créés.';
        RETURN;
    END IF;

    -- Bons mix (en_preparation, expedie, retour_complet)
    INSERT INTO of_sous_traitance
        (numero_bon, id_of, id_soustraitant, date_envoi_prevue, date_envoi_reel,
         date_retour_prevue, date_retour_reel, quantite_envoyee, quantite_retournee,
         cout_prestation_ht, statut, signature_sortie_svg, signature_recepteur_svg,
         signature_retour_svg, date_livraison_prevue, instructions_speciales, notes)
    VALUES
        -- Chokri — ourdissage en cours
        ('BSST-' || v_annee || '-00001', v_id_of, v_id_chokri,
         (NOW() - INTERVAL '10 days')::date, NOW() - INTERVAL '10 days',
         (NOW() + INTERVAL '5 days')::date, NULL, 5000, 0, 250.000, 'chez_st',
         v_signature_sortie, v_signature_sortie, NULL,
         (NOW() + INTERVAL '5 days')::date, 'COTON 2/50 laize 215 — ensouple M2305',
         'Démo seed - ourdissage courant.'),

        -- Salem — nouage retourné complet
        ('BSST-' || v_annee || '-00002', v_id_of, v_id_salem,
         (NOW() - INTERVAL '20 days')::date, NOW() - INTERVAL '20 days',
         (NOW() - INTERVAL '15 days')::date, NOW() - INTERVAL '15 days',
         12, 12, 180.000, 'retour_complet',
         v_signature_sortie, v_signature_sortie, v_signature_retour,
         (NOW() - INTERVAL '15 days')::date, 'Nouage 12 ensouples', 'Retourné complet signé.'),

        -- Sobolux — teinture, retour partiel
        ('BSST-' || v_annee || '-00003', v_id_of, v_id_sobolux,
         (NOW() - INTERVAL '25 days')::date, NOW() - INTERVAL '25 days',
         (NOW() - INTERVAL '10 days')::date, NOW() - INTERVAL '12 days',
         60, 42, 510.000, 'en_retour_partiel',
         v_signature_sortie, v_signature_sortie, v_signature_retour,
         (NOW() - INTERVAL '10 days')::date, 'Teinture Kaki + Cèdre', '18 Kg encore à retourner.'),

        -- Adel — couture retour complet avec contrôle qualité OK
        ('BSST-' || v_annee || '-00004', v_id_of, v_id_adel,
         (NOW() - INTERVAL '15 days')::date, NOW() - INTERVAL '15 days',
         (NOW() - INTERVAL '5 days')::date, NOW() - INTERVAL '5 days',
         240, 240, 360.000, 'retour_complet',
         v_signature_sortie, v_signature_sortie, v_signature_retour,
         (NOW() - INTERVAL '5 days')::date, 'Ourlet NATXLR-T07-04-07', 'Contrôle qualité OK.'),

        -- Leyla — franges retour complet
        ('BSST-' || v_annee || '-00005', v_id_of, v_id_leyla,
         (NOW() - INTERVAL '12 days')::date, NOW() - INTERVAL '12 days',
         (NOW() - INTERVAL '5 days')::date, NOW() - INTERVAL '6 days',
         280, 280, 210.000, 'retour_complet',
         v_signature_sortie, v_signature_sortie, v_signature_retour,
         (NOW() - INTERVAL '5 days')::date, 'Franges manuelles SACFEPMA', NULL),

        -- Ali Sassi — bon avec litige (anomalie)
        ('BSST-' || v_annee || '-00006', v_id_of, v_id_ali_sassi,
         (NOW() - INTERVAL '45 days')::date, NOW() - INTERVAL '45 days',
         (NOW() - INTERVAL '30 days')::date, NOW() - INTERVAL '20 days',
         120, 100, 96.000, 'litige',
         v_signature_sortie, v_signature_sortie, v_signature_retour,
         (NOW() - INTERVAL '30 days')::date, 'Franges IB1020 — retour tardif',
         'Anomalie : 20 pièces manquantes au retour.'),

        -- Bent Aissa — gros bon FOUTA SAC
        ('BSST-' || v_annee || '-00007', v_id_of, v_id_bent,
         (NOW() - INTERVAL '150 days')::date, NOW() - INTERVAL '150 days',
         (NOW() - INTERVAL '140 days')::date, NOW() - INTERVAL '142 days',
         2273, 2273, 2727.600, 'retour_complet',
         v_signature_sortie, v_signature_sortie, v_signature_retour,
         (NOW() - INTERVAL '140 days')::date, 'Couture FOUTA SAC CM-FT0023', 'Grosse série 2500 pcs - OK.'),

        -- Mose — personnalisation DES1020 en cours
        ('BSST-' || v_annee || '-00008', v_id_of, v_id_mose,
         (NOW() - INTERVAL '7 days')::date, NOW() - INTERVAL '7 days',
         (NOW() + INTERVAL '10 days')::date, NULL,
         1650, 0, 9900.000, 'expedie',
         v_signature_sortie, v_signature_sortie, NULL,
         (NOW() + INTERVAL '10 days')::date, 'DES1020-ND personnalisation sérigraphie', NULL)
    ON CONFLICT (numero_bon) DO UPDATE SET
        statut = EXCLUDED.statut,
        quantite_retournee = EXCLUDED.quantite_retournee,
        signature_sortie_svg = EXCLUDED.signature_sortie_svg,
        signature_retour_svg = EXCLUDED.signature_retour_svg,
        updated_at = NOW();
END $$;
