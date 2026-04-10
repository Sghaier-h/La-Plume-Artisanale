/**
 * Routes Documents - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getDocuments,
  getDocumentsById,
  createDocuments,
  updateDocuments,
  deleteDocuments
} from '../controllers/documents.controller.js';

const router = express.Router();

router.get('/', authenticate, getDocuments);
router.get('/:id', authenticate, getDocumentsById);
router.post('/', authenticate, createDocuments);
router.put('/:id', authenticate, updateDocuments);
router.delete('/:id', authenticate, deleteDocuments);

export default router;
