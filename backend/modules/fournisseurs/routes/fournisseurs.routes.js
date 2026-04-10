/**
 * Routes Fournisseurs - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getFournisseurs,
  getFournisseur,
  createFournisseur,
  updateFournisseur
} from '../controllers/fournisseurs.controller.js';

const router = express.Router();

router.get('/', authenticate, getFournisseurs);
router.get('/:id', authenticate, getFournisseur);
router.post('/', authenticate, createFournisseur);
router.put('/:id', authenticate, updateFournisseur);

export default router;
