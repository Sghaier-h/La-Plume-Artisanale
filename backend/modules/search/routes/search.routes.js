/**
 * Routes Search
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { search, quickSearch } from '../controllers/search.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/quick', quickSearch);
router.get('/', search);

export default router;
