/**
 * Routes Factures - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { validate } from '../../../src/middleware/validate.middleware.js';
import { createFactureSchema } from '../../../src/middleware/schemas.js';
import {
  getFactures,
  getFactureById,
  createFacture,
  createFactureFromCommande,
  createFactureFromBL,
  updateFacture,
  deleteFacture
} from '../controllers/factures.controller.js';
import {
  streamPDF, drawInvoice, fetchFactureFull, loadSociete,
} from '../../../src/services/pdf.service.js';
import { sendError, handleError } from '../../../src/utils/error.helper.js';

const router = express.Router();

router.get('/:id(\\d+)/pdf', authenticate, async (req, res) => {
  try {
    const data = await fetchFactureFull(req.params.id);
    if (!data) return sendError(res, 'Facture introuvable', 404);
    const societe = await loadSociete();
    return streamPDF(
      res,
      `facture-${data.facture.numero_facture || req.params.id}`,
      drawInvoice,
      { ...data, societe }
    );
  } catch (error) { return handleError(res, error, 'getFacturePDF'); }
});

router.get('/', authenticate, getFactures);
router.get('/:id', authenticate, getFactureById);
router.post('/', authenticate, validate(createFactureSchema), createFacture);
router.post('/from-commande/:id', authenticate, createFactureFromCommande);
router.post('/from-bl/:id', authenticate, createFactureFromBL);
router.put('/:id', authenticate, updateFacture);
router.delete('/:id', authenticate, deleteFacture);

export default router;
