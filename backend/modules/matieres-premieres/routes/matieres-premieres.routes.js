/**
 * Routes MatieresPremieres - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMatieresPremieres,
  getMatieresPremieresById,
  createMatieresPremieres,
  updateMatieresPremieres,
  deleteMatieresPremieres
} from '../controllers/matieres-premieres.controller.js';

const router = express.Router();

router.get('/', authenticate, getMatieresPremieres);
router.get('/:id', authenticate, getMatieresPremieresById);
router.post('/', authenticate, createMatieresPremieres);
router.put('/:id', authenticate, updateMatieresPremieres);
router.delete('/:id', authenticate, deleteMatieresPremieres);

export default router;
