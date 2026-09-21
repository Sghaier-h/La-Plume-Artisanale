/**
 * Routes ArticlesCatalogue - Module modulaire
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../../../src/middleware/auth.middleware.js';

// Config multer : fichiers temporaires dans /tmp/uploads
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'tmp');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /image\/(jpeg|jpg|png|gif|webp)/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Type de fichier non autorisé (jpg/png/gif/webp uniquement)'));
  }
});
import {
  getArticlesCatalogue,
  getArticleCatalogueById,
  createArticleCatalogue,
  updateArticleCatalogue,
  deleteArticleCatalogue,
  getValeursDistinctes,
  getStatsTopModeles,
  getStockArticle,
  getStockTousArticles,
  getArticlesStockBas,
  getVentesArticle,
  getTopVentes,
  getVentesParModeleCtrl,
  getDashboardVentesCtrl,
  getTopCommandes,
  exportArticlesCsv,
  importArticlesCsv,
  uploadPhotoArticle,
  setPhotoUrl,
  deletePhotoArticle
} from '../controllers/articles-catalogue.controller.js';

const router = express.Router();

// Routes nommées AVANT /:id pour éviter les conflits
router.get('/valeurs-distinctes', authenticate, getValeursDistinctes);
router.get('/stats/top-modeles', authenticate, getStatsTopModeles);
router.get('/stock/tous', authenticate, getStockTousArticles);
router.get('/stock/bas', authenticate, getArticlesStockBas);
router.get('/ventes/top', authenticate, getTopVentes);
router.get('/ventes/par-modele', authenticate, getVentesParModeleCtrl);
router.get('/ventes/dashboard', authenticate, getDashboardVentesCtrl);
router.get('/commandes/top', authenticate, getTopCommandes);
router.get('/export/csv', authenticate, exportArticlesCsv);
router.post('/import/csv', authenticate, importArticlesCsv);

// CRUD standard
router.get('/', authenticate, getArticlesCatalogue);
router.get('/:id(\\d+)', authenticate, getArticleCatalogueById);
router.get('/:id(\\d+)/stock', authenticate, getStockArticle);
router.get('/:id(\\d+)/ventes', authenticate, getVentesArticle);

// Photos (upload fichier OU URL externe)
router.post('/:id(\\d+)/photo', authenticate, upload.single('photo'), uploadPhotoArticle);
router.put('/:id(\\d+)/photo-url', authenticate, setPhotoUrl);
router.delete('/:id(\\d+)/photo', authenticate, deletePhotoArticle);
router.post('/', authenticate, createArticleCatalogue);
router.put('/:id', authenticate, updateArticleCatalogue);
router.delete('/:id', authenticate, deleteArticleCatalogue);

export default router;
