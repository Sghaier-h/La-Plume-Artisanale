/**
 * Routes Matières Premières
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import {
  getMatieresPremieres,
  getMatierePremiereById,
  getMatiereByCode,
  createMatierePremiere,
  updateMatierePremiere,
  deleteMatierePremiere,
  restaurerMatierePremiere,
  getMatieresPremieresStats,
  getAlertesStock,
} from '../controllers/matieres-premieres.controller.js';

const router = express.Router();
router.use(authenticate);

// Routes spécifiques AVANT /:id
router.get('/types', async (req, res) => {
  try {
    const q = `SELECT DISTINCT id_type_mp AS id FROM matieres_premieres WHERE id_type_mp IS NOT NULL ORDER BY id_type_mp`;
    const result = await pool.query(q);
    return sendSuccess(res, result.rows, 'Types MP');
  } catch (error) {
    return handleError(res, error, 'getTypesMP');
  }
});
router.get('/stats/global', getMatieresPremieresStats);
router.get('/alertes/stock', getAlertesStock);
router.get('/code/:code', getMatiereByCode);

// CRUD standard
router.get('/', getMatieresPremieres);
router.post('/', createMatierePremiere);
router.get('/:id(\\d+)', getMatierePremiereById);
router.put('/:id(\\d+)', updateMatierePremiere);
router.put('/:id(\\d+)/restaurer', restaurerMatierePremiere);
router.delete('/:id(\\d+)', deleteMatierePremiere);

export default router;
