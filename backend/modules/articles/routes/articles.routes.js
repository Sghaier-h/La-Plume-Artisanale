/**
 * Routes Articles - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getTypesArticles
} from '../controllers/articles.controller.js';

const router = express.Router();

router.get('/', authenticate, getArticles);
router.get('/types', authenticate, getTypesArticles);
router.get('/:id', authenticate, getArticle);
router.post('/', authenticate, createArticle);
router.put('/:id', authenticate, updateArticle);
router.delete('/:id', authenticate, deleteArticle);

export default router;
