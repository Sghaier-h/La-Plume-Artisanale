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

const router = express.Router();

router.get('/', authenticate, getDevis);
router.get('/:id', authenticate, getDevisById);
router.post('/', authenticate, validate(createDevisSchema), createDevis);
router.put('/:id', authenticate, updateDevis);
router.post('/:id/transformer', authenticate, transformerEnCommande);
router.delete('/:id', authenticate, deleteDevis);

export default router;
