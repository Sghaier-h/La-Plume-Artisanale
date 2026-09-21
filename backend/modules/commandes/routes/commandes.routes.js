/**
 * Routes Commandes - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { validate } from '../../../src/middleware/validate.middleware.js';
import { createCommandeSchema } from '../../../src/middleware/schemas.js';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';
import {
  getCommandes,
  getCommande,
  createCommande,
  updateCommande,
  deleteCommande
} from '../controllers/commandes.controller.js';

const router = express.Router();

// Validation d'une commande
router.post('/:id(\\d+)/valider', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || null;
    const r = await pool.query(
      `UPDATE commandes_clients SET statut = 'validee', date_validation = NOW(), validee_par = $1, updated_at = NOW() WHERE id_commande = $2 RETURNING *`,
      [userId, req.params.id]
    );
    if (r.rows.length === 0) return sendError(res, 'Commande non trouvée', 404);
    return sendSuccess(res, r.rows[0], 'Commande validée');
  } catch (error) {
    return handleError(res, error, 'validerCommande');
  }
});

router.get('/', authenticate, getCommandes);
router.get('/:id', authenticate, getCommande);
router.post('/', authenticate, validate(createCommandeSchema), createCommande);
router.put('/:id', authenticate, updateCommande);
router.delete('/:id', authenticate, deleteCommande);

export default router;
