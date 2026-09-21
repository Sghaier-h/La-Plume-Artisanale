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

export default router;
