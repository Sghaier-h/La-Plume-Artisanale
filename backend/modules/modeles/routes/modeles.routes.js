/**
 * Routes Modeles
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getModeles,
  getModelesById,
  createModeles,
  updateModeles,
  deleteModeles,
  getModeleByCode,
  getModelesStatsCategories,
  uploadPhoto,
  uploadPhotoMiddleware,
} from '../controllers/modeles.controller.js';

const router = express.Router();
router.use(authenticate);

router.get('/stats/categories', getModelesStatsCategories);
router.get('/code/:code', getModeleByCode);
router.post('/:id(\\d+)/upload-photo', uploadPhotoMiddleware, uploadPhoto);

router.get('/', getModeles);
router.post('/', createModeles);
router.get('/:id(\\d+)', getModelesById);
router.put('/:id(\\d+)', updateModeles);
router.delete('/:id(\\d+)', deleteModeles);

export default router;
