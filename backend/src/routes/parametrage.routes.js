import express from 'express';
import {
  getSociete,
  updateSociete,
  getParametresSysteme,
  updateParametreSysteme,
  getParametresModule,
  updateParametresModule
} from '../controllers/parametrage.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/societe', authenticate, getSociete);
router.put('/societe', authenticate, updateSociete);
router.get('/systeme', authenticate, getParametresSysteme);
router.put('/systeme/:cle', authenticate, updateParametreSysteme);
router.get('/module/:module', authenticate, getParametresModule);
router.put('/module/:module', authenticate, updateParametresModule);

export default router;
