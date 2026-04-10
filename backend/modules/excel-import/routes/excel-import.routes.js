/**
 * Routes ExcelImport - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getExcelImport,
  getExcelImportById,
  createExcelImport,
  updateExcelImport,
  deleteExcelImport
} from '../controllers/excel-import.controller.js';

const router = express.Router();

router.get('/', authenticate, getExcelImport);
router.get('/:id', authenticate, getExcelImportById);
router.post('/', authenticate, createExcelImport);
router.put('/:id', authenticate, updateExcelImport);
router.delete('/:id', authenticate, deleteExcelImport);

export default router;
