/**
 * Routes ArticlesCatalogue - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getArticlesCatalogue,
  getArticleCatalogueById,
  createArticleCatalogue,
  updateArticleCatalogue,
  deleteArticleCatalogue,
  getValeursDistinctes,
  getStatsTopModeles
} from '../controllers/articles-catalogue.controller.js';

const router = express.Router();

// Routes nommées AVANT /:id pour éviter les conflits
router.get('/valeurs-distinctes', authenticate, getValeursDistinctes);
router.get('/stats/top-modeles', authenticate, getStatsTopModeles);

// CRUD standard
router.get('/', authenticate, getArticlesCatalogue);
router.get('/:id', authenticate, getArticleCatalogueById);
router.post('/', authenticate, createArticleCatalogue);
router.put('/:id', authenticate, updateArticleCatalogue);
router.delete('/:id', authenticate, deleteArticleCatalogue);

export default router;
