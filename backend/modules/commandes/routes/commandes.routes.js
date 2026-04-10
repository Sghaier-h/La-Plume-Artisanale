/**
 * Routes Commandes - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { validate } from '../../../src/middleware/validate.middleware.js';
import { createCommandeSchema } from '../../../src/middleware/schemas.js';
import {
  getCommandes,
  getCommande,
  createCommande,
  updateCommande,
  deleteCommande
} from '../controllers/commandes.controller.js';

const router = express.Router();

router.get('/', authenticate, getCommandes);
router.get('/:id', authenticate, getCommande);
router.post('/', authenticate, validate(createCommandeSchema), createCommande);
router.put('/:id', authenticate, updateCommande);
router.delete('/:id', authenticate, deleteCommande);

export default router;
