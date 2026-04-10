/**
 * Routes Multisociete - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMultisociete,
  getMultisocieteById,
  createMultisociete,
  updateMultisociete,
  deleteMultisociete
} from '../controllers/multisociete.controller.js';
// Fonctions métier sociétés, établissements, transferts, consolidations
import {
  getSocietes,
  getSociete,
  createSociete,
  updateSociete,
  deleteSociete,
  getEtablissements,
  getTransferts,
  createTransfert,
  getConsolidations
} from '../controllers/societes.controller.js';

const router = express.Router();

// Routes nommées AVANT /:id pour éviter les conflits de paramètres
router.get('/societes', authenticate, getSocietes);
router.get('/societes/:id', authenticate, getSociete);
router.post('/societes', authenticate, createSociete);
router.put('/societes/:id', authenticate, updateSociete);
router.delete('/societes/:id', authenticate, deleteSociete);
router.get('/etablissements', authenticate, getEtablissements);
router.get('/transferts', authenticate, getTransferts);
router.post('/transferts', authenticate, createTransfert);
router.get('/consolidations', authenticate, getConsolidations);

// Routes CRUD génériques
router.get('/', authenticate, getMultisociete);
router.get('/:id', authenticate, getMultisocieteById);
router.post('/', authenticate, createMultisociete);
router.put('/:id', authenticate, updateMultisociete);
router.delete('/:id', authenticate, deleteMultisociete);

export default router;
