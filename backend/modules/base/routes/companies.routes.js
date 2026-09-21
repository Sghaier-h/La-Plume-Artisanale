/**
 * Routes Companies - Module base
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
} from '../controllers/companies.controller.js';

const router = express.Router();

router.get('/', authenticate, getCompanies);
router.get('/:id', authenticate, getCompanyById);
router.post('/', authenticate, createCompany);
router.put('/:id', authenticate, updateCompany);
router.delete('/:id', authenticate, deleteCompany);

export default router;
