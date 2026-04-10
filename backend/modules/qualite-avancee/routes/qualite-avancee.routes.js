/**
 * Routes QualiteAvancee - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getQualiteAvancee,
  getQualiteAvanceeById,
  createQualiteAvancee,
  updateQualiteAvancee,
  deleteQualiteAvancee
} from '../controllers/qualite-avancee.controller.js';

const router = express.Router();

router.get('/', authenticate, getQualiteAvancee);
router.get('/:id', authenticate, getQualiteAvanceeById);
router.post('/', authenticate, createQualiteAvancee);
router.put('/:id', authenticate, updateQualiteAvancee);
router.delete('/:id', authenticate, deleteQualiteAvancee);

export default router;
