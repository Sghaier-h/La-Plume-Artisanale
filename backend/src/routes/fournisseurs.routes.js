import express from 'express';
import {
  getFournisseurs,
  getFournisseur,
  createFournisseur,
  updateFournisseur
} from '../controllers/fournisseurs.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getFournisseurs);
router.get('/:id', authenticate, getFournisseur);
router.post('/', authenticate, createFournisseur);
router.put('/:id', authenticate, updateFournisseur);

export default router;
