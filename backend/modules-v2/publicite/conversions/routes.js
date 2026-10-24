// routes.js — publicite/conversions
import { Router } from 'express';
import { controller } from './controller.js';

const router = Router();
router.post('/track',           controller.track);        // PUBLIC (pixel/JS front)
router.get('/summary/utm',      controller.summaryByUtm);
router.get('/',                 controller.list);

export default router;
