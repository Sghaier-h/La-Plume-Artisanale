import express from 'express';
import { 
  getBonsRetour, 
  getBonRetourById, 
  createBonRetour, 
  createBonRetourFromBL,
  updateBonRetour, 
  deleteBonRetour 
} from '../controllers/bons-retour.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getBonsRetour);
router.get('/:id', authenticate, getBonRetourById);
router.post('/', authenticate, createBonRetour);
router.post('/from-bl/:id', authenticate, createBonRetourFromBL);
router.put('/:id', authenticate, updateBonRetour);
router.delete('/:id', authenticate, deleteBonRetour);

export default router;
