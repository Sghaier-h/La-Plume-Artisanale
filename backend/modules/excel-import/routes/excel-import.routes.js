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
  excelUpload,
} from '../controllers/excel-import.controller.js';

const handleMulter = (mw) => (req, res, next) => mw(req, res, (err) => {
  if (err) return res.status(err.status || 400).json({ success: false, error: { message: err.message } });
  next();
});

const router = express.Router();

// Routes spécifiques (avant /:id)
router.get('/templates', authenticate, getImportTemplates);
router.post('/preview', authenticate, handleMulter(excelUpload.single('file')), previewImport);
router.post('/upload', authenticate, handleMulter(excelUpload.single('file')), uploadImport);

// Routes CRUD génériques
router.get('/', authenticate, getExcelImport);
router.post('/', authenticate, createExcelImport);
router.get('/:id(\\d+)', authenticate, getExcelImportById);
router.put('/:id(\\d+)', authenticate, updateExcelImport);
router.delete('/:id(\\d+)', authenticate, deleteExcelImport);

export default router;
