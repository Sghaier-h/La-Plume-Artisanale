/**
 * Routes Production - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getProduction,
  getProductionById,
  createProduction,
  updateProduction,
  deleteProduction
} from '../controllers/production.controller.js';

const router = express.Router();

router.get('/', authenticate, getProduction);
router.get('/:id', authenticate, getProductionById);
router.post('/', authenticate, createProduction);
router.put('/:id', authenticate, updateProduction);
router.delete('/:id', authenticate, deleteProduction);

export default router;
