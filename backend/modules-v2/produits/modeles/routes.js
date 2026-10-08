import { Router } from 'express';
import { controller } from './controller.js';
import { baseRoutes } from './model.js';

const router = Router();
router.get('/:id/variantes', controller.listVariantes);
router.use('/', baseRoutes);

export default router;
