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
} from '../controllers/parametres-crud.controller.js';
import {
  getParametresCatalogue,
  getParametresCatalogueById,
  createParametresCatalogue,
  updateParametresCatalogue,
  deleteParametresCatalogue
} from '../controllers/parametres-catalogue.controller.js';

const router = express.Router();

// ─── Routes CATALOGUE (nouvelles) ─── avant /:id pour éviter conflits
// GET /api/parametres-catalogue/complet → tous les paramètres en une requête
router.get('/complet', authenticate, getParametrageComplet);

// Types valides : dimensions, couleurs, finitions, tissages, modeles, nombre-couleurs
const TYPES = 'dimensions|couleurs|finitions|tissages|modeles|nombre-couleurs';
router.get(`/:type(${TYPES})`, authenticate, getParametresType);
router.get(`/:type(${TYPES})/:id(\\d+)`, authenticate, getParametreById);
router.post(`/:type(${TYPES})`, authenticate, createParametre);
router.put(`/:type(${TYPES})/:id(\\d+)`, authenticate, updateParametre);
router.delete(`/:type(${TYPES})/:id(\\d+)`, authenticate, deleteParametre);

// ─── Routes CRUD génériques (compat legacy) ───
router.get('/', authenticate, getParametresCatalogue);
router.get('/:id(\\d+)', authenticate, getParametresCatalogueById);
router.post('/', authenticate, createParametresCatalogue);
router.put('/:id(\\d+)', authenticate, updateParametresCatalogue);
router.delete('/:id(\\d+)', authenticate, deleteParametresCatalogue);

export default router;
