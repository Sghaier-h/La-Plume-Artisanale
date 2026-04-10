/**
 * Routes ArticlesCatalogue - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getArticlesCatalogue,
  getArticlesCatalogueById,
  createArticlesCatalogue,
  updateArticlesCatalogue,
  deleteArticlesCatalogue
} from '../controllers/articles-catalogue.controller.js';

const router = express.Router();

router.get('/', authenticate, getArticlesCatalogue);
router.get('/:id', authenticate, getArticlesCatalogueById);
router.post('/', authenticate, createArticlesCatalogue);
router.put('/:id', authenticate, updateArticlesCatalogue);
router.delete('/:id', authenticate, deleteArticlesCatalogue);

export default router;
