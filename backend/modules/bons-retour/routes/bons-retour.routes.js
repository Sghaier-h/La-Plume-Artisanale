/**
 * Routes BonsRetour - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getBonsRetour,
  getBonsRetourById,
  createBonsRetour,
  updateBonsRetour,
  deleteBonsRetour
} from '../controllers/bons-retour.controller.js';

const router = express.Router();

router.get('/', authenticate, getBonsRetour);
router.get('/:id', authenticate, getBonsRetourById);
router.post('/', authenticate, createBonsRetour);
router.put('/:id', authenticate, updateBonsRetour);
router.delete('/:id', authenticate, deleteBonsRetour);

export default router;
