import express from 'express';
import { 
  getDevis, 
  getDevisById, 
  createDevis, 
  updateDevis, 
  transformerEnCommande, 
  deleteDevis 
} from '../controllers/devis.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getDevis);
router.get('/:id', authenticate, getDevisById);
router.post('/', authenticate, createDevis);
router.put('/:id', authenticate, updateDevis);
router.post('/:id/transformer', authenticate, transformerEnCommande);
router.delete('/:id', authenticate, deleteDevis);

export default router;
