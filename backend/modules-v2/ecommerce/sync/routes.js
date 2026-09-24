// routes.js — ecommerce/sync
import { Router } from 'express';
import { controller } from './controller.js';

const router = Router();
router.get('/logs',        controller.list);
router.get('/logs/:id',    controller.get);
router.post('/article',    controller.pushArticle);
router.post('/stock',      controller.pushStock);
router.post('/prix',       controller.pushPrix);
router.post('/batch',      controller.pushBatch);

export default router;
