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

const router = express.Router();

router.get('/', authenticate, getFactures);
router.get('/:id', authenticate, getFactureById);
router.post('/', authenticate, validate(createFactureSchema), createFacture);
router.post('/from-commande/:id', authenticate, createFactureFromCommande);
router.post('/from-bl/:id', authenticate, createFactureFromBL);
router.put('/:id', authenticate, updateFacture);
router.delete('/:id', authenticate, deleteFacture);

export default router;
