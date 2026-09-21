/**
 * Routes Warehouse - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getWarehouse,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  // Extensions Fix 6
  getLocations,
  getLocationsTree,
  createLocation,
  getQuants,
  getProductStock,
  getMoves,
  getPickingTypes,
  createPickingType,
} from '../controllers/warehouse.controller.js';

const router = express.Router();

// ─── Endpoints étendus (Fix 6) — DOIVENT être avant /:id ─────────
router.get('/locations/tree', authenticate, getLocationsTree);
router.get('/locations', authenticate, getLocations);
router.post('/locations', authenticate, createLocation);

router.get('/quants', authenticate, getQuants);
router.get('/moves', authenticate, getMoves);

router.get('/products/:id(\\d+)/stock', authenticate, getProductStock);

router.get('/picking-types', authenticate, getPickingTypes);
router.post('/picking-types', authenticate, createPickingType);

// ─── CRUD générique ─────────────────────────────────────────────
router.get('/', authenticate, getWarehouse);
router.post('/', authenticate, createWarehouse);
router.get('/:id(\\d+)', authenticate, getWarehouseById);
router.put('/:id(\\d+)', authenticate, updateWarehouse);
router.delete('/:id(\\d+)', authenticate, deleteWarehouse);

export default router;
