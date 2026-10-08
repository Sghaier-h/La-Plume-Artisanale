/**
 * Contrôleur Utilisateurs — Gestion complète des comptes ERP
 *
 * Endpoints:
 *   GET    /api/utilisateurs                       — Liste (filtrable)
 *   GET    /api/utilisateurs/stats/global          — Statistiques
 *   GET    /api/utilisateurs/groupes               — Groupes disponibles
 *   GET    /api/utilisateurs/:id                   — Détail
 *   POST   /api/utilisateurs                       — Créer (bcrypt)
 *   PUT    /api/utilisateurs/:id                   — Mise à jour (non-password)
 *   PUT    /api/utilisateurs/:id/mot-de-passe      — Changement password
 *   PUT    /api/utilisateurs/:id/reset-mdp         — Reset admin
 *   PUT    /api/utilisateurs/:id/desactiver        — Désactivation
 *   PUT    /api/utilisateurs/:id/activer           — Activation
 *   PUT    /api/utilisateurs/:id/verrouiller       — Verrouillage
 *   PUT    /api/utilisateurs/:id/deverrouiller     — Déverrouillage
 *   DELETE /api/utilisateurs/:id                   — Suppression logique
 *   GET    /api/utilisateurs/:id/roles             — Rôles d'un utilisateur
 *   POST   /api/utilisateurs/:id/roles             — Ajout rôle
 *   DELETE /api/utilisateurs/:id/roles/:id_role    — Retrait rôle
 */

import bcrypt from 'bcrypt';
import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

const currentUserId = (req) => req.user?.id || req.user?.userId || null;
const isAdmin = (req) => req.user?.role === 'ADMIN';

// Colonnes sûres à retourner (jamais mot_de_passe_hash / salt / token)
const SAFE_COLUMNS = `
  u.id_utilisateur AS id, u.nom_utilisateur, u.email, u.id_operateur,
  u.derniere_connexion, u.tentatives_connexion, u.compte_verrouille, u.date_verrouillage,
  u.date_expiration_mdp, u.force_changement_mdp, u.preferences_json,
  u.actif, u.date_creation, u.date_modification, u.created_by, u.updated_by,
  u.photo_emoji, u.photo_url, u.id_groupe, u.prenom, u.nom, u.numero_employe
`;

// ─── GET /api/utilisateurs ────────────────────────────────────────
export const getUtilisateurs = async (req, res) => {
  try {
    const { actif, search, id_groupe, role } = req.query;
    const params = [];
    const where = [];

    if (actif === 'true') where.push('u.actif = true');
    else if (actif === 'false') where.push('u.actif = false');

    if (id_groupe) { params.push(id_groupe); where.push(`u.id_groupe = $${params.length}`); }

    if (search) {
      params.push(`%${search}%`);
      where.push(`(u.email ILIKE $${params.length} OR u.nom ILIKE $${params.length}
                  OR u.prenom ILIKE $${params.length} OR u.nom_utilisateur ILIKE $${params.length})`);
    }

    if (role) {
      params.push(role);
      where.push(`EXISTS (
        SELECT 1 FROM users_roles ur
        LEFT JOIN roles r ON ur.id_role = r.id_role
        WHERE ur.id_utilisateur = u.id_utilisateur
          AND (r.code_role = $${params.length} OR r.nom = $${params.length})
      )`);
    }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const sql = `
      SELECT ${SAFE_COLUMNS},
        COALESCE((
          SELECT string_agg(r.code_role, ',')
          FROM users_roles ur
          LEFT JOIN roles r ON ur.id_role = r.id_role
          WHERE ur.id_utilisateur = u.id_utilisateur
        ), '') AS roles
      FROM users u
      ${whereSql}
      ORDER BY u.date_creation DESC
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getUtilisateurs');
  }
};

// ─── GET /api/utilisateurs/stats/global ───────────────────────────
export const getStatsGlobal = async (req, res) => {
  try {
    const total = await pool.query(`SELECT COUNT(*)::int AS total FROM users WHERE actif = true`);
    const verrouilles = await pool.query(`SELECT COUNT(*)::int AS total FROM users WHERE compte_verrouille = true`);

    let parRole = { rows: [] };
    try {
      parRole = await pool.query(`
        SELECT COALESCE(r.code_role, r.nom, 'SANS_ROLE') AS role, COUNT(*)::int AS count
        FROM users u
        LEFT JOIN users_roles ur ON u.id_utilisateur = ur.id_utilisateur
        LEFT JOIN roles r ON ur.id_role = r.id_role
        WHERE u.actif = true
        GROUP BY COALESCE(r.code_role, r.nom, 'SANS_ROLE')
        ORDER BY count DESC
      `);
    } catch {}

    const recentes = await pool.query(`
      SELECT COUNT(*)::int AS total FROM users
      WHERE derniere_connexion >= NOW() - INTERVAL '7 days'
    `);

    return sendSuccess(res, {
      total_actifs: total.rows[0].total,
      verrouilles: verrouilles.rows[0].total,
      par_role: parRole.rows,
      connexions_recentes: recentes.rows[0].total,
    });
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── GET /api/utilisateurs/groupes ────────────────────────────────
export const getGroupes = async (req, res) => {
  try {
    try {
      const r = await pool.query(`SELECT * FROM groupes ORDER BY 1`);
      return sendSuccess(res, { items: r.rows, total: r.rows.length });
    } catch {
      return sendSuccess(res, { items: [], total: 0 });
    }
  } catch (error) {
    return handleError(res, error, 'getGroupes');
  }
};

// ─── GET /api/utilisateurs/:id ────────────────────────────────────
export const getUtilisateursById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT ${SAFE_COLUMNS} FROM users u WHERE u.id_utilisateur = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Utilisateur introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getUtilisateursById');
  }
};

// ─── POST /api/utilisateurs ───────────────────────────────────────
export const createUtilisateurs = async (req, res) => {
  try {
    const author = currentUserId(req);
    const {
      email, nom, prenom, nom_utilisateur, mot_de_passe,
      id_operateur, id_groupe, role, numero_employe, photo_emoji, photo_url,
    } = req.body || {};

    if (!email || !mot_de_passe) return sendError(res, 'email et mot_de_passe requis', 400);

    const hash = await bcrypt.hash(mot_de_passe, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const ins = await client.query(
        `INSERT INTO users
           (email, nom, prenom, nom_utilisateur, mot_de_passe_hash,
            id_operateur, id_groupe, numero_employe, photo_emoji, photo_url,
            actif, tentatives_connexion, compte_verrouille, force_changement_mdp,
            date_creation, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,0,false,false,NOW(),$11)
         RETURNING ${SAFE_COLUMNS.replace(/u\./g, '')}`,
        [email, nom || null, prenom || null, nom_utilisateur || email,
         hash, id_operateur || null, id_groupe || null, numero_employe || null,
         photo_emoji || null, photo_url || null, author]
      );

      const newUser = ins.rows[0];

      if (role) {
        try {
          await client.query(
            `INSERT INTO users_roles (id_utilisateur, id_role)
             SELECT $1, r.id_role FROM roles r WHERE r.code_role = $2 OR r.nom = $2 LIMIT 1
             ON CONFLICT DO NOTHING`,
            [newUser.id, role]
          );
        } catch {}
      }

      await client.query('COMMIT');
      return sendSuccess(res, newUser, 'Utilisateur créé', 201);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.code === '23505') return sendError(res, 'Email ou nom d\'utilisateur déjà utilisé', 409);
    return handleError(res, error, 'createUtilisateurs');
  }
};

// ─── PUT /api/utilisateurs/:id ────────────────────────────────────
export const updateUtilisateurs = async (req, res) => {
  try {
    const author = currentUserId(req);
    const allowed = ['email', 'nom', 'prenom', 'nom_utilisateur', 'id_operateur',
                     'id_groupe', 'numero_employe', 'photo_emoji', 'photo_url',
                     'preferences_json'];
    const data = req.body || {};
    const fields = allowed.filter((f) => f in data);
    if (!fields.length) return sendError(res, 'Aucune donnée à mettre à jour', 400);

    const values = fields.map((f) => data[f]);
    const setSql = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    values.push(author, req.params.id);

    const r = await pool.query(
      `UPDATE users SET ${setSql}, date_modification = NOW(), updated_by = $${values.length - 1}
       WHERE id_utilisateur = $${values.length}
       RETURNING ${SAFE_COLUMNS.replace(/u\./g, '')}`,
      values
    );
    if (!r.rows[0]) return sendError(res, 'Utilisateur introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Utilisateur mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateUtilisateurs');
  }
};

// ─── PUT /api/utilisateurs/:id/mot-de-passe ───────────────────────
export const changeMotDePasse = async (req, res) => {
  try {
    const author = currentUserId(req);
    const targetId = parseInt(req.params.id, 10);
    const { ancien_mdp, nouveau_mdp } = req.body || {};
    if (!nouveau_mdp) return sendError(res, 'nouveau_mdp requis', 400);

    if (!isAdmin(req) && author !== targetId) {
      return sendError(res, 'Non autorisé à modifier le mot de passe d\'un autre utilisateur', 403);
    }

    const cur = await pool.query(
      `SELECT mot_de_passe_hash FROM users WHERE id_utilisateur = $1`,
      [targetId]
    );
    if (!cur.rows[0]) return sendError(res, 'Utilisateur introuvable', 404);

    if (!isAdmin(req)) {
      if (!ancien_mdp) return sendError(res, 'ancien_mdp requis', 400);
      const ok = await bcrypt.compare(ancien_mdp, cur.rows[0].mot_de_passe_hash || '');
      if (!ok) return sendError(res, 'Ancien mot de passe incorrect', 401);
    }

    const hash = await bcrypt.hash(nouveau_mdp, 10);
    await pool.query(
      `UPDATE utilisateurs
         SET mot_de_passe_hash = $1, force_changement_mdp = false,
             date_modification = NOW(), updated_by = $2
       WHERE id_utilisateur = $3`,
      [hash, author, targetId]
    );
    return sendSuccess(res, { updated: true }, 'Mot de passe modifié');
  } catch (error) {
    return handleError(res, error, 'changeMotDePasse');
  }
};

// ─── PUT /api/utilisateurs/:id/reset-mdp ──────────────────────────
export const resetMotDePasse = async (req, res) => {
  try {
    if (!isAdmin(req)) return sendError(res, 'Réservé aux administrateurs', 403);
    const author = currentUserId(req);
    let { nouveau_mdp } = req.body || {};
    let generated = false;
    if (!nouveau_mdp) {
      nouveau_mdp = Math.random().toString(36).slice(-10) + 'A1!';
      generated = true;
    }
    const hash = await bcrypt.hash(nouveau_mdp, 10);
    const r = await pool.query(
      `UPDATE utilisateurs
         SET mot_de_passe_hash = $1, force_changement_mdp = true,
             tentatives_connexion = 0, compte_verrouille = false,
             date_modification = NOW(), updated_by = $2
       WHERE id_utilisateur = $3
       RETURNING id_utilisateur AS id, email`,
      [hash, author, req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Utilisateur introuvable', 404);
    return sendSuccess(res, {
      ...r.rows[0],
      mot_de_passe_temporaire: generated ? nouveau_mdp : undefined,
    }, 'Mot de passe réinitialisé');
  } catch (error) {
    return handleError(res, error, 'resetMotDePasse');
  }
};

// ─── PUT /api/utilisateurs/:id/desactiver ─────────────────────────
export const desactiver = async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE users SET actif = false, date_modification = NOW(), updated_by = $1
       WHERE id_utilisateur = $2 RETURNING id_utilisateur AS id, actif`,
      [currentUserId(req), req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Utilisateur introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Utilisateur désactivé');
  } catch (error) {
    return handleError(res, error, 'desactiver');
  }
};

// ─── PUT /api/utilisateurs/:id/activer ────────────────────────────
export const activer = async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE users SET actif = true, date_modification = NOW(), updated_by = $1
       WHERE id_utilisateur = $2 RETURNING id_utilisateur AS id, actif`,
      [currentUserId(req), req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Utilisateur introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Utilisateur activé');
  } catch (error) {
    return handleError(res, error, 'activer');
  }
};

// ─── PUT /api/utilisateurs/:id/verrouiller ────────────────────────
export const verrouiller = async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE utilisateurs
         SET compte_verrouille = true, date_verrouillage = NOW(),
             date_modification = NOW(), updated_by = $1
       WHERE id_utilisateur = $2
       RETURNING id_utilisateur AS id, compte_verrouille, date_verrouillage`,
      [currentUserId(req), req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Utilisateur introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Compte verrouillé');
  } catch (error) {
    return handleError(res, error, 'verrouiller');
  }
};

// ─── PUT /api/utilisateurs/:id/deverrouiller ──────────────────────
export const deverrouiller = async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE utilisateurs
         SET compte_verrouille = false, date_verrouillage = NULL,
             tentatives_connexion = 0, date_modification = NOW(), updated_by = $1
       WHERE id_utilisateur = $2
       RETURNING id_utilisateur AS id, compte_verrouille`,
      [currentUserId(req), req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Utilisateur introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Compte déverrouillé');
  } catch (error) {
    return handleError(res, error, 'deverrouiller');
  }
};

// ─── DELETE /api/utilisateurs/:id ─────────────────────────────────
export const deleteUtilisateurs = async (req, res) => {
  try {
    if (!isAdmin(req)) return sendError(res, 'Réservé aux administrateurs', 403);
    const r = await pool.query(
      `UPDATE users SET actif = false, date_modification = NOW(), updated_by = $1
       WHERE id_utilisateur = $2 RETURNING id_utilisateur AS id`,
      [currentUserId(req), req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Utilisateur introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id }, 'Utilisateur supprimé (désactivation logique)');
  } catch (error) {
    return handleError(res, error, 'deleteUtilisateurs');
  }
};

// ─── GET /api/utilisateurs/:id/roles ──────────────────────────────
export const getRoles = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT r.id_role AS id, r.code_role, r.nom, r.description
       FROM users_roles ur
       JOIN roles r ON ur.id_role = r.id_role
       WHERE ur.id_utilisateur = $1`,
      [req.params.id]
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getRoles');
  }
};

// ─── POST /api/utilisateurs/:id/roles ─────────────────────────────
export const addRole = async (req, res) => {
  try {
    if (!isAdmin(req)) return sendError(res, 'Réservé aux administrateurs', 403);
    const { id_role } = req.body || {};
    if (!id_role) return sendError(res, 'id_role requis', 400);
    await pool.query(
      `INSERT INTO users_roles (id_utilisateur, id_role)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, id_role]
    );
    return sendSuccess(res, { id_utilisateur: req.params.id, id_role }, 'Rôle ajouté', 201);
  } catch (error) {
    return handleError(res, error, 'addRole');
  }
};

// ─── DELETE /api/utilisateurs/:id/roles/:id_role ──────────────────
export const removeRole = async (req, res) => {
  try {
    if (!isAdmin(req)) return sendError(res, 'Réservé aux administrateurs', 403);
    const r = await pool.query(
      `DELETE FROM users_roles WHERE id_utilisateur = $1 AND id_role = $2 RETURNING id_role`,
      [req.params.id, req.params.id_role]
    );
    if (!r.rows[0]) return sendError(res, 'Rôle non attribué', 404);
    return sendSuccess(res, { id_role: r.rows[0].id_role }, 'Rôle retiré');
  } catch (error) {
    return handleError(res, error, 'removeRole');
  }
};
