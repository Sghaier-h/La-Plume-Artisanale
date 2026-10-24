-- Seed — Barème IRPP Tunisie 2026 (5 tranches progressives, annuel en DT)
-- Références : Loi de finances Tunisie, barème IRPP salaires
INSERT INTO irpp_bareme (annee_fiscale, ordre_tranche, seuil_bas, seuil_haut, taux_pct, actif) VALUES
    (2026, 1,        0.000,   5000.000,  0.00, TRUE),   -- 0 - 5.000 DT : exonéré
    (2026, 2,     5000.000,  20000.000, 26.00, TRUE),   -- 5.000 - 20.000 : 26%
    (2026, 3,    20000.000,  30000.000, 28.00, TRUE),   -- 20.000 - 30.000 : 28%
    (2026, 4,    30000.000,  50000.000, 32.00, TRUE),   -- 30.000 - 50.000 : 32%
    (2026, 5,    50000.000,       NULL, 35.00, TRUE)    -- > 50.000 : 35%
ON CONFLICT (annee_fiscale, ordre_tranche) DO NOTHING;
