import express from 'express';
import {
  getSociete,
  updateSociete,
  getParametresSysteme,
  updateParametreSysteme
} from '../controllers/parametrage.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/societe', authenticate, getSociete);
router.put('/societe', authenticate, updateSociete);
router.get('/systeme', authenticate, getParametresSysteme);
router.put('/systeme/:cle', authenticate, updateParametreSysteme);

export default router;
