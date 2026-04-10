/**
 * Routes Settings - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSettings,
  getSettingsById,
  createSettings,
  updateSettings,
  deleteSettings
} from '../controllers/settings.controller.js';

const router = express.Router();

router.get('/', authenticate, getSettings);
router.get('/:id', authenticate, getSettingsById);
router.post('/', authenticate, createSettings);
router.put('/:id', authenticate, updateSettings);
router.delete('/:id', authenticate, deleteSettings);

export default router;
