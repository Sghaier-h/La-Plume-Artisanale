import express from 'express';
import {
  getDimensions,
  getFinitions,
  getTissages,
  getCouleurs,
  getModeles,
  createParametre,
  updateParametre
} from '../controllers/parametres-catalogue.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/dimensions', authenticate, getDimensions);
router.get('/finitions', authenticate, getFinitions);
router.get('/tissages', authenticate, getTissages);
router.get('/couleurs', authenticate, getCouleurs);
router.get('/modeles', authenticate, getModeles);
router.post('/:type', authenticate, createParametre);
router.put('/:type/:id', authenticate, updateParametre);

export default router;
