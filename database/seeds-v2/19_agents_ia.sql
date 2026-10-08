-- Seed — 10 agents IA (§11ter)
INSERT INTO agents_config (code, nom, categorie, description, cron_schedule, canaux_notification, parametres) VALUES
    ('STOCK_MONITOR',         'Agent Stock',         'stock',
     'Surveille seuils, ruptures, dormance des articles et lots proches péremption.',
     '0 6 * * *', '["email","in_app"]'::jsonb, '{"seuil_dormance_j":90}'::jsonb),

    ('PRODUCTION_MONITOR',    'Agent Production',    'production',
     'Détecte retards OF, goulots de charge, écarts objectifs.',
     '0 */4 * * *', '["in_app","whatsapp"]'::jsonb, '{"seuil_retard_h":24}'::jsonb),

    ('QUALITE_MONITOR',       'Agent Qualité',       'qualite',
     'Analyse taux de défauts, retours SAV, non-conformités récurrentes.',
     '0 7 * * *', '["email","in_app"]'::jsonb, '{"seuil_defaut_pct":3.0}'::jsonb),

    ('FINANCE_MONITOR',       'Agent Finance',       'finance',
     'Suit trésorerie, échéances, retards paiement clients, TVA à décaisser.',
     '0 8 * * *', '["email","in_app"]'::jsonb, '{"seuil_retard_j":15}'::jsonb),

    ('COMMERCIAL_MONITOR',    'Agent Commercial',    'commercial',
     'Analyse pipeline devis, taux conversion, clients silencieux, objectifs.',
     '0 9 * * 1', '["email","in_app"]'::jsonb, '{"periode_silence_j":60}'::jsonb),

    ('FOURNISSEURS_MONITOR',  'Agent Fournisseurs',  'fournisseurs',
     'Surveille performances fournisseurs (délais, qualité, prix).',
     '0 8 * * 1', '["email","in_app"]'::jsonb, '{}'::jsonb),

    ('RH_MONITOR',            'Agent RH',            'rh',
     'Détecte absentéisme, HS excessives, contrats à échéance, congés déséquilibrés.',
     '0 7 * * 1', '["email","in_app"]'::jsonb, '{"seuil_absent_pct":5}'::jsonb),

    ('RAPPORT_QUOTIDIEN',     'Rapport Quotidien',   'rapport',
     'Synthèse quotidienne production/ventes/incidents pour la direction.',
     '30 18 * * *', '["email","in_app"]'::jsonb, '{"destinataires":["direction"]}'::jsonb),

    ('RAPPORT_HEBDO',         'Rapport Hebdomadaire','rapport',
     'Bilan hebdo KPI stratégiques + agents findings synthèse.',
     '0 8 * * 1', '["email"]'::jsonb, '{}'::jsonb),

    ('RAPPORT_MENSUEL',       'Rapport Mensuel',     'rapport',
     'Bilan mensuel complet : ventes, marges, RH, cash, TVA, findings.',
     '0 9 1 * *', '["email"]'::jsonb, '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;
