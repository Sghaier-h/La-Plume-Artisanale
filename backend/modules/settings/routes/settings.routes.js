/**
 * Routes Settings — Préférences utilisateur
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSettings,
  getDefaults,
  resetSettings,
  getUserSettings,
  getSettingByCle,
  upsertSetting,
  deleteSetting,
} from '../controllers/settings.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques d'abord
router.get('/defaults', getDefaults);
router.post('/reset', resetSettings);
router.get('/user/:id_user(\\d+)', getUserSettings);

// Racine
router.get('/', getSettings);

// Par clé (dernier — attrape le reste)
router.get('/:cle', getSettingByCle);
router.put('/:cle', upsertSetting);
router.delete('/:cle', deleteSetting);

export default router;
