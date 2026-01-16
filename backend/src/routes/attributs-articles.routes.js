import express from 'express';
import {
  getDimensions,
  getCouleurs,
  getFinitions,
  createDimension,
  createCouleur,
  createFinition
} from '../controllers/attributs-articles.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/dimensions', authenticate, getDimensions);
router.get('/couleurs', authenticate, getCouleurs);
router.get('/finitions', authenticate, getFinitions);
router.post('/dimensions', authenticate, createDimension);
router.post('/couleurs', authenticate, createCouleur);
router.post('/finitions', authenticate, createFinition);

export default router;
