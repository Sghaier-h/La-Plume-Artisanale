/**
 * Routes Mobile - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMobile,
  getMobileById,
  createMobile,
  updateMobile,
  deleteMobile
} from '../controllers/mobile.controller.js';

const router = express.Router();

router.get('/', authenticate, getMobile);
router.get('/:id', authenticate, getMobileById);
router.post('/', authenticate, createMobile);
router.put('/:id', authenticate, updateMobile);
router.delete('/:id', authenticate, deleteMobile);

export default router;
