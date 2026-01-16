import express from 'express';
import {
  getCatalogue,
  getArticleCatalogue,
  createArticleCatalogue,
  updateArticleCatalogue
} from '../controllers/articles-catalogue.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getCatalogue);
router.get('/:id', authenticate, getArticleCatalogue);
router.post('/', authenticate, createArticleCatalogue);
router.put('/:id', authenticate, updateArticleCatalogue);

export default router;
