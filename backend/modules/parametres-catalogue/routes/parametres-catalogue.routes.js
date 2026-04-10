/**
 * Routes ParametresCatalogue - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getParametresCatalogue,
  getParametresCatalogueById,
  createParametresCatalogue,
  updateParametresCatalogue,
  deleteParametresCatalogue
} from '../controllers/parametres-catalogue.controller.js';

const router = express.Router();

router.get('/', authenticate, getParametresCatalogue);
router.get('/:id', authenticate, getParametresCatalogueById);
router.post('/', authenticate, createParametresCatalogue);
router.put('/:id', authenticate, updateParametresCatalogue);
router.delete('/:id', authenticate, deleteParametresCatalogue);

export default router;
