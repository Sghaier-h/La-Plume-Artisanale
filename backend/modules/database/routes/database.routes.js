/**
 * Routes Database - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getDatabase,
  getDatabaseById,
  createDatabase,
  updateDatabase,
  deleteDatabase
} from '../controllers/database.controller.js';

const router = express.Router();

router.get('/', authenticate, getDatabase);
router.get('/:id', authenticate, getDatabaseById);
router.post('/', authenticate, createDatabase);
router.put('/:id', authenticate, updateDatabase);
router.delete('/:id', authenticate, deleteDatabase);

export default router;
