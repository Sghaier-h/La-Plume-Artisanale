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
  deleteCommande,
  previewOFs,
  generateOFs,
  analyseStock,
  executerChoix,
  getCommandeWithOFs
} from '../controllers/commandes.controller.js';

const router = express.Router();

// Validation d'une commande
router.post('/:id(\\d+)/valider', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || null;
    const r = await pool.query(
      `UPDATE commandes SET statut = 'validee', date_modification = NOW(), updated_by = $1
       WHERE id_commande = $2 RETURNING *`,
      [userId, req.params.id]
    );
    if (r.rows.length === 0) return sendError(res, 'Commande non trouvée', 404);
    return sendSuccess(
      res,
      { ...r.rows[0], hint: 'Utilisez POST /:id/generer-ofs pour créer les OF' },
      'Commande validée'
    );
  } catch (error) {
    return handleError(res, error, 'validerCommande');
  }
});

// Génération d'Ordres de Fabrication
router.get('/:id(\\d+)/preview-ofs', authenticate, previewOFs);
router.post('/:id(\\d+)/generer-ofs', authenticate, generateOFs);

// Workflow stock/OF
router.get('/:id(\\d+)/analyse-stock', authenticate, analyseStock);
router.post('/:id(\\d+)/executer-choix', authenticate, executerChoix);

// Traçabilité complète: commande + articles_commande + OFs enrichis
router.get('/:id(\\d+)/with-ofs', authenticate, getCommandeWithOFs);

router.get('/', authenticate, getCommandes);
router.get('/:id(\\d+)', authenticate, getCommande);
router.post('/', authenticate, validate(createCommandeSchema), createCommande);
router.put('/:id(\\d+)', authenticate, updateCommande);
router.delete('/:id(\\d+)', authenticate, deleteCommande);

export default router;
