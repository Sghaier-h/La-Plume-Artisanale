import express from 'express';
import {
  getControles,
  createControle,
  getNonConformites,
  getStatistiques,
  getDiagrammes
} from '../controllers/qualite-avance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/controles', authenticate, getControles);
router.post('/controles', authenticate, authorize('ADMIN', 'CONTROLEUR_QUALITE'), createControle);
router.get('/non-conformites', authenticate, getNonConformites);
router.get('/statistiques', authenticate, getStatistiques);
router.get('/diagrammes', authenticate, getDiagrammes);

export default router;
