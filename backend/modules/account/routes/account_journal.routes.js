/**
 * Routes account_journal - Module account
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getAccountJournal,
  getAccountJournalById,
  createAccountJournal,
  updateAccountJournal,
  deleteAccountJournal
} from '../controllers/account_journal.controller.js';

const router = express.Router();

router.get('/', authenticate, getAccountJournal);
router.get('/:id', authenticate, getAccountJournalById);
router.post('/', authenticate, createAccountJournal);
router.put('/:id', authenticate, updateAccountJournal);
router.delete('/:id', authenticate, deleteAccountJournal);

export default router;
