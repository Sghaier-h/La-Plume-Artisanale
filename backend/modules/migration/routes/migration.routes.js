/**
 * Routes Migration - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMigration,
  getMigrationById,
  createMigration,
  updateMigration,
  deleteMigration
} from '../controllers/migration.controller.js';

const router = express.Router();

router.get('/', authenticate, getMigration);
router.get('/:id', authenticate, getMigrationById);
router.post('/', authenticate, createMigration);
router.put('/:id', authenticate, updateMigration);
router.delete('/:id', authenticate, deleteMigration);

export default router;
