import express from 'express';
import { 
  getFactures, 
  getFactureById, 
  createFacture, 
  createFactureFromCommande,
  createFactureFromBL,
  updateFacture, 
  deleteFacture 
} from '../controllers/factures.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getFactures);
router.get('/:id', authenticate, getFactureById);
router.post('/', authenticate, createFacture);
router.post('/from-commande/:id', authenticate, createFactureFromCommande);
router.post('/from-bl/:id', authenticate, createFactureFromBL);
router.put('/:id', authenticate, updateFacture);
router.delete('/:id', authenticate, deleteFacture);

export default router;
