/**
 * Routes Modeles - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getModeles,
  getModelesById,
  createModeles,
  updateModeles,
  deleteModeles
} from '../controllers/modeles.controller.js';

const router = express.Router();

router.get('/', authenticate, getModeles);
router.get('/:id', authenticate, getModelesById);
router.post('/', authenticate, createModeles);
router.put('/:id', authenticate, updateModeles);
router.delete('/:id', authenticate, deleteModeles);

export default router;
