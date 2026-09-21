-- Script SQL pour configurer les contacts WhatsApp pour chaque dashboard
-- Permet de définir un numéro WhatsApp spécifique pour chaque dashboard

-- Insérer les paramètres WhatsApp par dashboard
INSERT INTO ir_config_parameter (key, value, create_date, write_date)
VALUES 
    ('whatsapp.dashboard.Administrateur.contact', '+33 6 12 34 56 78', NOW(), NOW()),
    ('whatsapp.dashboard.Tisseur.contact', '+33 6 12 34 56 79', NOW(), NOW()),
    ('whatsapp.dashboard.Chef Production.contact', '+33 6 12 34 56 80', NOW(), NOW()),
    ('whatsapp.dashboard.Magasinier MP.contact', '+33 6 12 34 56 81', NOW(), NOW()),
    ('whatsapp.dashboard.Contrôle Central.contact', '+33 6 12 34 56 82', NOW(), NOW()),
    ('whatsapp.dashboard.Post Coupe.contact', '+33 6 12 34 56 83', NOW(), NOW()),
    ('whatsapp.dashboard.Chef Atelier.contact', '+33 6 12 34 56 84', NOW(), NOW()),
    ('whatsapp.dashboard.Magasinier Sous-traitants.contact', '+33 6 12 34 56 85', NOW(), NOW()),
    ('whatsapp.dashboard.GPAO.contact', '+33 6 12 34 56 86', NOW(), NOW()),
    ('whatsapp.dashboard.Dashboard Principal.contact', '+33 6 12 34 56 87', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, write_date = NOW();

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Contacts WhatsApp configurés pour tous les dashboards';
END $$;
