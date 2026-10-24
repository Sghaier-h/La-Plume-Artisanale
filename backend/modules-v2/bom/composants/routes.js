import { Router } from 'express';
import { controller } from './controller.js';
import { baseController } from './model.js';

const router = Router();
router.get('/', baseController.list);
router.get('/:id', baseController.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', baseController.remove);

export default router;
