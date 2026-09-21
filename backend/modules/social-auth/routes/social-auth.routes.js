/**
 * Routes SocialAuth - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSocialAuth,
  getSocialAuthById,
  createSocialAuth,
  updateSocialAuth,
  deleteSocialAuth
} from '../controllers/social-auth.controller.js';

const router = express.Router();

router.get('/', authenticate, getSocialAuth);
router.get('/:id', authenticate, getSocialAuthById);
router.post('/', authenticate, createSocialAuth);
router.put('/:id', authenticate, updateSocialAuth);
router.delete('/:id', authenticate, deleteSocialAuth);

export default router;
