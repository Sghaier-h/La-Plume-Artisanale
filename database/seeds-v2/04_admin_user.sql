-- =============================================================================
-- 04_admin_user.sql — Utilisateur admin initial (DEV UNIQUEMENT)
--
-- Mot de passe en clair : "admin123"
-- ATTENTION : la colonne mot_de_passe_hash contient ici la chaîne littérale
--             `PLAIN:admin123` — le backend au premier démarrage détecte ce
--             préfixe et re-hashe automatiquement en bcrypt cost 12 avant
--             d'écraser la valeur (voir backend/modules-v2/auth/service.js).
-- =============================================================================

INSERT INTO users (
  email, username, mot_de_passe_hash,
  nom, prenom,
  role_principal, roles_supplementaires, actif, est_verifie
) VALUES (
  'admin@laplume-artisanale.tn',
  'admin',
  'PLAIN:admin123',
  'Admin',
  'Système',
  'ADMIN',
  '{}',
  TRUE,
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Lier l'admin à son rôle ADMIN dans user_roles
INSERT INTO user_roles (id_user, id_role, est_principal)
SELECT u.id_user, r.id_role, TRUE
FROM users u, roles r
WHERE u.email = 'admin@laplume-artisanale.tn'
  AND r.code  = 'ADMIN'
ON CONFLICT DO NOTHING;
