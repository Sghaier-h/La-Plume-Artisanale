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
} from '../controllers/documents.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques avant /:id
router.get('/stats/global', getStatsGlobal);
router.get('/entity/:type/:id(\\d+)', getByEntity);
router.get('/of/:id(\\d+)/dossier-fabrication', getDossierFabrication);
router.get('/export/excel', exportExcel);
router.post('/upload', uploadDocument);
router.get('/:id(\\d+)/download', downloadDocument);

// CRUD
router.get('/', getDocuments);
router.post('/', createDocument);
router.get('/:id(\\d+)', getDocumentById);
router.put('/:id(\\d+)', updateDocument);
router.delete('/:id(\\d+)', deleteDocument);

export default router;
