/**
 * Routes Search - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSearch,
  getSearchById,
  createSearch,
  updateSearch,
  deleteSearch
} from '../controllers/search.controller.js';

const router = express.Router();

router.get('/', authenticate, getSearch);
router.get('/:id', authenticate, getSearchById);
router.post('/', authenticate, createSearch);
router.put('/:id', authenticate, updateSearch);
router.delete('/:id', authenticate, deleteSearch);

export default router;
