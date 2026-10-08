/**
 * Routes BonsRetour
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendError, handleError } from '../../../src/utils/error.helper.js';
import {
  getBonsRetour,
  getStatsGlobal,
  getBonsRetourById,
  createBonsRetour,
  updateBonsRetour,
  validerBR,
  traiterBR,
  annulerBR,
  deleteBonsRetour,
} from '../controllers/bons-retour.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats/global', getStatsGlobal);

// Créer un bon de retour depuis un BL
router.post('/from-bl/:id_bl(\\d+)', async (req, res, next) => {
  try {
    const idBl = req.params.id_bl;
    const bR = await pool.query(`SELECT * FROM bons_livraison WHERE id_bl = $1`, [idBl]);
    if (bR.rows.length === 0) return sendError(res, 'Bon de livraison non trouvé', 404);
    const bl = bR.rows[0];
    req.body = {
      id_client: bl.id_client,
      id_bl: bl.id_bl,
      id_facture: null,
      motif: req.body?.motif || `Retour du BL ${bl.numero_bl || idBl}`,
      type_retour: req.body?.type_retour || 'client',
      date_retour: req.body?.date_retour || null,
    };
    return createBonsRetour(req, res, next);
  } catch (error) {
    return handleError(res, error, 'brFromBl');
  }
});

router.put('/:id(\\d+)/valider', validerBR);
router.put('/:id(\\d+)/traiter', traiterBR);
router.put('/:id(\\d+)/annuler', annulerBR);

router.get('/',            getBonsRetour);
router.post('/',           createBonsRetour);
router.get('/:id(\\d+)',    getBonsRetourById);
router.put('/:id(\\d+)',    updateBonsRetour);
router.delete('/:id(\\d+)', deleteBonsRetour);

export default router;
