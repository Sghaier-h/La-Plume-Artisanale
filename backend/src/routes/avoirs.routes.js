import express from 'express';
import { 
  getAvoirs, 
  getAvoirById, 
  createAvoir, 
  createAvoirFromFacture,
  updateAvoir, 
  deleteAvoir 
} from '../controllers/avoirs.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getAvoirs);
router.get('/:id', authenticate, getAvoirById);
router.post('/', authenticate, createAvoir);
router.post('/from-facture/:id', authenticate, createAvoirFromFacture);
router.put('/:id', authenticate, updateAvoir);
router.delete('/:id', authenticate, deleteAvoir);

export default router;
