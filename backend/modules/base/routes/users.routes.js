/**
 * Routes Users - Module base
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/users.controller.js';

const router = express.Router();

router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, getUserById);
router.post('/', authenticate, createUser);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
