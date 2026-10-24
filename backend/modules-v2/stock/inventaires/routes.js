import { Router } from 'express';
import { controller } from './controller.js';
import { baseController } from './model.js';

const router = Router();
router.get('/', baseController.list);
router.get('/:id', baseController.get);
router.get('/:id/lignes', controller.listLignes);
router.post('/:id/lignes', controller.addLigne);
router.post('/', controller.create);
router.put('/:id', baseController.update);
router.delete('/:id', baseController.remove);
export default router;
