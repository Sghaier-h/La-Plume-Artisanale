import { Router } from 'express';
import { controller } from './controller.js';
import { baseController } from './model.js';

const router = Router();
router.get('/', baseController.list);
router.get('/:id', baseController.get);
router.post('/', controller.create);      // override CRUD create pour ref auto
router.put('/:id', baseController.update);
router.delete('/:id', baseController.remove);

export default router;
