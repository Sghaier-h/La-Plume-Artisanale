/**
 * Routes SuiviFabrication - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSuiviFabrication,
  getSuiviFabricationById,
  createSuiviFabrication,
  updateSuiviFabrication,
  deleteSuiviFabrication
} from '../controllers/suivi-fabrication.controller.js';

const router = express.Router();

router.get('/', authenticate, getSuiviFabrication);
router.get('/:id', authenticate, getSuiviFabricationById);
router.post('/', authenticate, createSuiviFabrication);
router.put('/:id', authenticate, updateSuiviFabrication);
router.delete('/:id', authenticate, deleteSuiviFabrication);

export default router;
