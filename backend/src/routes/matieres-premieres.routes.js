import express from 'express';
import {
  getMatieresPremieres,
  getMatierePremiere,
  createMatierePremiere,
  updateMatierePremiere,
  getTypesMP
} from '../controllers/matieres-premieres.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getMatieresPremieres);
router.get('/types', authenticate, getTypesMP);
router.get('/:id', authenticate, getMatierePremiere);
router.post('/', authenticate, createMatierePremiere);
router.put('/:id', authenticate, updateMatierePremiere);

export default router;
