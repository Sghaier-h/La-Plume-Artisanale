import express from 'express';
import { getCommandes, getCommande, createCommande, updateCommande, validerCommande } from '../controllers/commandes.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getCommandes);
router.get('/:id', authenticate, getCommande);
router.post('/', authenticate, createCommande);
router.put('/:id', authenticate, updateCommande);
router.post('/:id/valider', authenticate, validerCommande);

export default router;
