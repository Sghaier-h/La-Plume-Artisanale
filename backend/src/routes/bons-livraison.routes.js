import express from 'express';
import { 
  getBonsLivraison, 
  getBonLivraisonById, 
  createBonLivraison, 
  createBLFromCommande,
  updateBonLivraison, 
  deleteBonLivraison 
} from '../controllers/bons-livraison.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getBonsLivraison);
router.get('/:id', authenticate, getBonLivraisonById);
router.post('/', authenticate, createBonLivraison);
router.post('/from-commande/:id', authenticate, createBLFromCommande);
router.put('/:id', authenticate, updateBonLivraison);
router.delete('/:id', authenticate, deleteBonLivraison);

export default router;
