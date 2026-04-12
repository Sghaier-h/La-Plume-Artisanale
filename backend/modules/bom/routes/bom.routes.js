/**
 * Routes BOM — Bill of Materials
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getBomMaster,
  getBomMasterById,
  createBomMaster,
  updateBomMaster,
  deleteBomMaster,
  getBomComposants,
  createBomComposant,
  updateBomComposant,
  deleteBomComposant
} from '../controllers/bom.controller.js';

const router = express.Router();

// ─── BOM Master ───
router.get('/master', authenticate, getBomMaster);
router.get('/master/:id(\\d+)', authenticate, getBomMasterById);
router.post('/master', authenticate, createBomMaster);
router.put('/master/:id(\\d+)', authenticate, updateBomMaster);
router.delete('/master/:id(\\d+)', authenticate, deleteBomMaster);

// ─── BOM Composant ───
router.get('/composant', authenticate, getBomComposants);
router.post('/composant', authenticate, createBomComposant);
router.put('/composant/:id(\\d+)', authenticate, updateBomComposant);
router.delete('/composant/:id(\\d+)', authenticate, deleteBomComposant);

export default router;
