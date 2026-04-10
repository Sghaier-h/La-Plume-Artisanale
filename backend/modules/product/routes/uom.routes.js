/**
 * Routes uom - Module product
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getUom,
  getUomById,
  createUom,
  updateUom,
  deleteUom
} from '../controllers/uom.controller.js';

const router = express.Router();

router.get('/', authenticate, getUom);
router.get('/:id', authenticate, getUomById);
router.post('/', authenticate, createUom);
router.put('/:id', authenticate, updateUom);
router.delete('/:id', authenticate, deleteUom);

export default router;
