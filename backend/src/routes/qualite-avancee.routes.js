import express from 'express';
import {
  getControles,
  enregistrerControlePremierePiece,
  getNonConformites,
  createNonConformite,
  ajouterActionsCorrectives
} from '../controllers/qualite-avancee.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/controles', authenticate, getControles);
router.post('/controle-premiere-piece', authenticate, authorize('ADMIN', 'QUALITE', 'CONTROLEUR'), enregistrerControlePremierePiece);
router.get('/non-conformites', authenticate, getNonConformites);
router.post('/non-conformites', authenticate, authorize('ADMIN', 'QUALITE', 'CONTROLEUR'), createNonConformite);
router.post('/non-conformites/:id/actions-correctives', authenticate, authorize('ADMIN', 'QUALITE'), ajouterActionsCorrectives);

export default router;
