/**
 * Routes Devis - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { validate } from '../../../src/middleware/validate.middleware.js';
import { createDevisSchema } from '../../../src/middleware/schemas.js';
import {
  getDevis,
  getDevisById,
  createDevis,
  updateDevis,
  transformerEnCommande,
  deleteDevis
} from '../controllers/devis.controller.js';
import {
  streamPDF, drawQuote, fetchDevisFull, loadSociete,
} from '../../../src/services/pdf.service.js';
import { sendError, handleError } from '../../../src/utils/error.helper.js';

const router = express.Router();

router.get('/:id(\\d+)/pdf', authenticate, async (req, res) => {
  try {
    const data = await fetchDevisFull(req.params.id);
    if (!data) return sendError(res, 'Devis introuvable', 404);
    const societe = await loadSociete();
    return streamPDF(
      res,
      `devis-${data.devis.numero_devis || req.params.id}`,
      drawQuote,
      { ...data, societe }
    );
  } catch (error) { return handleError(res, error, 'getDevisPDF'); }
});

router.get('/', authenticate, getDevis);
router.get('/:id', authenticate, getDevisById);
router.post('/', authenticate, validate(createDevisSchema), createDevis);
router.put('/:id', authenticate, updateDevis);
router.post('/:id/transformer', authenticate, transformerEnCommande);
router.delete('/:id', authenticate, deleteDevis);

export default router;
