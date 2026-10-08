/**
 * Alias /api/articles-generes -> articles_catalogue filtré par dans_catalogue_produit=true.
 */
import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getArticlesCatalogue,
  getArticleCatalogueById,
  createArticleCatalogue,
  updateArticleCatalogue,
  deleteArticleCatalogue
} from '../../articles-catalogue/controllers/articles-catalogue.controller.js';

const router = express.Router();

const injectGeneratedFilter = (req, _res, next) => {
  req.query = { ...req.query, dans_catalogue_produit: 'true' };
  if (req.method !== 'GET' && req.body && typeof req.body === 'object' && req.body.dans_catalogue_produit === undefined) {
    req.body.dans_catalogue_produit = true;
  }
  return next();
};

router.get('/', authenticate, injectGeneratedFilter, getArticlesCatalogue);
router.post('/', authenticate, injectGeneratedFilter, createArticleCatalogue);
router.get('/:id(\\d+)', authenticate, getArticleCatalogueById);
router.put('/:id(\\d+)', authenticate, updateArticleCatalogue);
router.delete('/:id(\\d+)', authenticate, deleteArticleCatalogue);

export default router;
