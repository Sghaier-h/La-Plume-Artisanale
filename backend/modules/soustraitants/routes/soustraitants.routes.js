/**
 * Routes Soustraitants - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSoustraitants,
  getSoustraitantsById,
  createSoustraitants,
  updateSoustraitants,
  deleteSoustraitants
} from '../controllers/soustraitants.controller.js';

const router = express.Router();

router.get('/', authenticate, getSoustraitants);
router.get('/:id', authenticate, getSoustraitantsById);
router.post('/', authenticate, createSoustraitants);
router.put('/:id', authenticate, updateSoustraitants);
router.delete('/:id', authenticate, deleteSoustraitants);

export default router;
