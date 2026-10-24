/**
 * Routes ParametresCatalogue - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getParametrageComplet,
  getParametresType,
  getParametreById,
  createParametre,
  updateParametre,
  deleteParametre
} from './legacy-crud-controller.js';
import {
  getParametresCatalogue,
  getParametresCatalogueById,
  createParametresCatalogue,
  updateParametresCatalogue,
  deleteParametresCatalogue
} from './legacy-controller.js';

const router = express.Router();

// â”€â”€â”€ Routes CATALOGUE (nouvelles) â”€â”€â”€ avant /:id pour Ã©viter conflits
// GET /api/parametres-catalogue/complet â†’ tous les paramÃ¨tres en une requÃªte
router.get('/complet', authenticate, getParametrageComplet);

// Types valides : dimensions, couleurs, finitions, tissages, modeles, nombre-couleurs
const TYPES = 'dimensions|couleurs|finitions|tissages|modeles|nombre-couleurs';
router.get(`/:type(${TYPES})`, authenticate, getParametresType);
router.get(`/:type(${TYPES})/:id(\\d+)`, authenticate, getParametreById);
router.post(`/:type(${TYPES})`, authenticate, createParametre);
router.put(`/:type(${TYPES})/:id(\\d+)`, authenticate, updateParametre);
router.delete(`/:type(${TYPES})/:id(\\d+)`, authenticate, deleteParametre);

// â”€â”€â”€ Routes CRUD gÃ©nÃ©riques (compat legacy) â”€â”€â”€
router.get('/', authenticate, getParametresCatalogue);
router.get('/:id(\\d+)', authenticate, getParametresCatalogueById);
router.post('/', authenticate, createParametresCatalogue);
router.put('/:id(\\d+)', authenticate, updateParametresCatalogue);
router.delete('/:id(\\d+)', authenticate, deleteParametresCatalogue);

export default router;
