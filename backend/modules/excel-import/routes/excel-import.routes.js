/**
 * Routes ExcelImport
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getImportTemplates,
  previewImport,
  uploadImport,
  getExcelImport,
  getExcelImportById,
  createExcelImport,
  updateExcelImport,
  deleteExcelImport,
} from '../controllers/excel-import.controller.js';

const router = express.Router();

// Routes spécifiques (avant /:id)
router.get('/templates', authenticate, getImportTemplates);
router.post('/preview', authenticate, previewImport);
router.post('/upload', authenticate, uploadImport);

// Routes CRUD génériques
router.get('/', authenticate, getExcelImport);
router.post('/', authenticate, createExcelImport);
router.get('/:id(\\d+)', authenticate, getExcelImportById);
router.put('/:id(\\d+)', authenticate, updateExcelImport);
router.delete('/:id(\\d+)', authenticate, deleteExcelImport);

export default router;
