/**
 * Routes QualiteAvance - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getQualiteAvance,
  getQualiteAvanceById,
  createQualiteAvance,
  updateQualiteAvance,
  deleteQualiteAvance
} from '../controllers/qualite-avance.controller.js';

const router = express.Router();

router.get('/', authenticate, getQualiteAvance);
router.get('/:id', authenticate, getQualiteAvanceById);
router.post('/', authenticate, createQualiteAvance);
router.put('/:id', authenticate, updateQualiteAvance);
router.delete('/:id', authenticate, deleteQualiteAvance);

export default router;
