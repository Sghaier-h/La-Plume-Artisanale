import express from 'express';
import {
  getSuivisFabrication,
  getSuiviFabrication,
  createSuiviFabrication,
  updateSuiviFabrication,
  getAvancementOF
} from '../controllers/suivi-fabrication.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getSuivisFabrication);
router.get('/of/:of_id/avancement', authenticate, getAvancementOF);
router.get('/:id', authenticate, getSuiviFabrication);
router.post('/', authenticate, createSuiviFabrication);
router.put('/:id', authenticate, updateSuiviFabrication);

export default router;
