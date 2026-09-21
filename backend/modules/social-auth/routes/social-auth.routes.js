/**
 * Routes Social-Auth — Providers OAuth (placeholders)
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getProviders,
  getLinks,
  linkStart,
  callback,
  linkComplete,
  unlink,
  socialLogin,
} from '../controllers/social-auth.controller.js';

const router = express.Router();

// Routes publiques (non authentifiées)
router.get('/providers', getProviders);
router.get('/callback', callback);
router.post('/login', socialLogin);

// Routes authentifiées
router.get('/links', authenticate, getLinks);
router.post('/link/start', authenticate, linkStart);
router.post('/link/complete', authenticate, linkComplete);
router.delete('/link/:provider', authenticate, unlink);

export default router;
