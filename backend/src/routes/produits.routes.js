import express from 'express';
import {
  getProduits,
  getProduit,
  createProduit,
  updateProduit,
  deleteProduit,
  getAttributs,
  createAttribut,
  uploadPhotoProduit,
  uploadPhoto,
  genererVariantes,
  genererArticleDepuisVariante,
  genererTousArticles
} from '../controllers/produits.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Attributs
router.get('/attributs', authenticate, getAttributs);
router.post('/attributs', authenticate, authorize('ADMIN'), createAttribut);

// Produits
router.get('/', authenticate, getProduits);
router.get('/:id', authenticate, getProduit);
router.post('/', authenticate, authorize('ADMIN', 'COMMERCIAL'), createProduit);
router.put('/:id', authenticate, authorize('ADMIN', 'COMMERCIAL'), updateProduit);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduit);

// Upload photo
router.post('/:id/upload-photo', authenticate, authorize('ADMIN', 'COMMERCIAL'), uploadPhoto, uploadPhotoProduit);

// Variantes et génération articles
router.post('/:id/variantes/generer', authenticate, authorize('ADMIN', 'COMMERCIAL'), genererVariantes);
router.post('/:id/variantes/:varianteId/generer-article', authenticate, authorize('ADMIN', 'COMMERCIAL'), genererArticleDepuisVariante);
router.post('/:id/variantes/generer-tous-articles', authenticate, authorize('ADMIN', 'COMMERCIAL'), genererTousArticles);

export default router;
