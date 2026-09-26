/**
 * Routes Documents — GED
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadDocument,
  downloadDocument,
  getByEntity,
  getStatsGlobal,
  getDossierFabrication,
  exportExcel,
  documentsUpload,
} from '../controllers/documents.controller.js';

// Middleware pour capturer les erreurs multer (limite taille, MIME)
const handleMulter = (mw) => (req, res, next) => mw(req, res, (err) => {
  if (err) return res.status(err.status || 400).json({ success: false, error: { message: err.message } });
  next();
});

const router = express.Router();

router.use(authenticate);

// Routes spécifiques avant /:id
router.get('/stats/global', getStatsGlobal);
router.get('/entity/:type/:id(\\d+)', getByEntity);
router.get('/of/:id(\\d+)/dossier-fabrication', getDossierFabrication);
router.get('/export/excel', exportExcel);
router.post('/upload', handleMulter(documentsUpload.single('file')), uploadDocument);
router.get('/:id(\\d+)/download', downloadDocument);

// CRUD
router.get('/', getDocuments);
router.post('/', createDocument);
router.get('/:id(\\d+)', getDocumentById);
router.put('/:id(\\d+)', updateDocument);
router.delete('/:id(\\d+)', deleteDocument);

export default router;
