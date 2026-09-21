/**
 * Routes Utilisateurs — Gestion complète des comptes
 */

import express from 'express';
import bcrypt from 'bcrypt';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import {
  getUtilisateurs,
  getUtilisateursById,
  createUtilisateurs,
  updateUtilisateurs,
  deleteUtilisateurs,
  changeMotDePasse,
  resetMotDePasse,
  desactiver,
  activer,
  verrouiller,
  deverrouiller,
  getStatsGlobal,
  getGroupes,
  getRoles,
  addRole,
  removeRole,
} from '../controllers/utilisateurs.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques avant /:id
router.get('/stats/global', getStatsGlobal);
router.get('/groupes', getGroupes);

// Équipe de fabrication
router.get('/equipe', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM equipe_fabrication ORDER BY id_operateur DESC`);
    return sendSuccess(res, r.rows, 'Équipe fabrication');
  } catch (error) {
    return handleError(res, error, 'getEquipe');
  }
});

// Commerciaux
router.get('/commerciaux', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT u.id_utilisateur, u.email, u.nom, u.prenom, u.nom_utilisateur, u.actif, r.code_role AS role
      FROM utilisateurs u
      LEFT JOIN utilisateurs_roles ur ON u.id_utilisateur = ur.id_utilisateur
      LEFT JOIN roles r ON ur.id_role = r.id_role
      WHERE r.code_role IN ('COMMERCIAL','commercial')
      ORDER BY u.id_utilisateur DESC
    `);
    return sendSuccess(res, r.rows, 'Commerciaux');
  } catch (error) {
    return handleError(res, error, 'getCommerciaux');
  }
});

// Création d'un compte utilisateur lié à un membre de l'équipe fabrication
router.post('/equipe/:id_operateur(\\d+)/creer-utilisateur', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body || {};
    if (!email || !mot_de_passe) return sendError(res, 'email et mot_de_passe requis', 400);
    const opRes = await pool.query(`SELECT * FROM equipe_fabrication WHERE id_operateur = $1`, [req.params.id_operateur]);
    if (opRes.rows.length === 0) return sendError(res, 'Opérateur non trouvé', 404);
    const op = opRes.rows[0];
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const insert = await pool.query(
      `INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, id_operateur, actif, date_creation)
       VALUES ($1, $2, $3, $4, $5, true, NOW()) RETURNING id_utilisateur, email, nom, prenom, id_operateur`,
      [email, hash, op.nom || null, op.prenom || null, op.id_operateur]
    );
    return sendSuccess(res, insert.rows[0], 'Utilisateur créé', 201);
  } catch (error) {
    return handleError(res, error, 'creerUtilisateurEquipe');
  }
});

// Liste des rôles disponibles
router.get('/roles', async (req, res) => {
  const fallback = [
    { code_role: 'ADMIN', nom: 'Administrateur' },
    { code_role: 'CHEF_PRODUCTION', nom: 'Chef de production' },
    { code_role: 'COMMERCIAL', nom: 'Commercial' },
    { code_role: 'MAGASINIER', nom: 'Magasinier' },
    { code_role: 'QUALITE', nom: 'Contrôle qualité' },
    { code_role: 'TISSEUR', nom: 'Tisseur' },
    { code_role: 'OPERATEUR', nom: 'Opérateur' },
  ];
  try {
    const r = await pool.query(`SELECT id_role, code_role, nom, description FROM roles ORDER BY id_role ASC`);
    return sendSuccess(res, r.rows.length ? r.rows : fallback, 'Rôles');
  } catch (error) {
    return sendSuccess(res, fallback, 'Rôles (fallback)');
  }
});

// Dashboards disponibles par rôle
router.get('/dashboards', async (req, res) => {
  try {
    const dashboards = [
      { role: 'ADMIN', dashboards: ['dashboard-admin'] },
      { role: 'CHEF_PRODUCTION', dashboards: ['dashboard-chef-production'] },
      { role: 'COMMERCIAL', dashboards: ['dashboard-commercial'] },
      { role: 'MAGASINIER', dashboards: ['dashboard-magasinier'] },
      { role: 'QUALITE', dashboards: ['dashboard-qualite'] },
      { role: 'TISSEUR', dashboards: ['tablette/tisseur'] },
      { role: 'OPERATEUR', dashboards: ['tablette/operateur'] },
    ];
    return sendSuccess(res, dashboards, 'Dashboards par rôle');
  } catch (error) {
    return handleError(res, error, 'getDashboards');
  }
});

// CRUD
router.get('/', getUtilisateurs);
router.post('/', createUtilisateurs);
router.get('/:id(\\d+)', getUtilisateursById);
router.put('/:id(\\d+)', updateUtilisateurs);
router.delete('/:id(\\d+)', deleteUtilisateurs);

// Actions
router.put('/:id(\\d+)/mot-de-passe', changeMotDePasse);
router.put('/:id(\\d+)/reset-mdp', resetMotDePasse);
router.put('/:id(\\d+)/desactiver', desactiver);
router.put('/:id(\\d+)/activer', activer);
router.put('/:id(\\d+)/verrouiller', verrouiller);
router.put('/:id(\\d+)/deverrouiller', deverrouiller);

// Rôles
router.get('/:id(\\d+)/roles', getRoles);
router.post('/:id(\\d+)/roles', addRole);
router.delete('/:id(\\d+)/roles/:id_role(\\d+)', removeRole);

// ============================================================
// Permissions (RBAC)
// ============================================================

// Liste de toutes les permissions (groupées par module côté client)
router.get('/permissions', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_permission, code, libelle, module, description
       FROM permissions
       ORDER BY module ASC, code ASC`
    );
    return sendSuccess(res, r.rows, 'Permissions');
  } catch (error) {
    return handleError(res, error, 'getPermissions');
  }
});

// Permissions assignées à un rôle
router.get('/roles/:id_role(\\d+)/permissions', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.id_permission, p.code, p.libelle, p.module, p.description
       FROM role_permissions rp
       JOIN permissions p ON p.id_permission = rp.id_permission
       WHERE rp.id_role = $1
       ORDER BY p.module ASC, p.code ASC`,
      [req.params.id_role]
    );
    return sendSuccess(res, r.rows, 'Permissions du rôle');
  } catch (error) {
    return handleError(res, error, 'getRolePermissions');
  }
});

// Mise à jour bulk des permissions d'un rôle : body { codes: string[] }
router.put('/roles/:id_role(\\d+)/permissions', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_role } = req.params;
    const codes = Array.isArray(req.body?.codes) ? req.body.codes : [];
    await client.query('BEGIN');
    await client.query('DELETE FROM role_permissions WHERE id_role = $1', [id_role]);
    if (codes.length > 0) {
      await client.query(
        `INSERT INTO role_permissions (id_role, id_permission)
         SELECT $1, p.id_permission FROM permissions p WHERE p.code = ANY($2::text[])
         ON CONFLICT DO NOTHING`,
        [id_role, codes]
      );
    }
    await client.query('COMMIT');
    return sendSuccess(res, { id_role: Number(id_role), codes }, 'Permissions mises à jour');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    return handleError(res, error, 'updateRolePermissions');
  } finally {
    client.release();
  }
});

// Permissions effectives d'un utilisateur (union de ses rôles)
router.get('/:id(\\d+)/permissions', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT DISTINCT p.id_permission, p.code, p.libelle, p.module, p.description,
              r.code_role AS source_role
       FROM utilisateurs_roles ur
       JOIN role_permissions rp ON rp.id_role = ur.id_role
       JOIN permissions p ON p.id_permission = rp.id_permission
       JOIN roles r ON r.id_role = ur.id_role
       WHERE ur.id_utilisateur = $1
       ORDER BY p.module ASC, p.code ASC`,
      [req.params.id]
    );
    const codes = Array.from(new Set(r.rows.map((row) => row.code)));
    return sendSuccess(res, { codes, permissions: r.rows }, 'Permissions effectives');
  } catch (error) {
    return handleError(res, error, 'getUserPermissions');
  }
});

export default router;
