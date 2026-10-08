// routes.js — IA scheduler
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

router.get('/status',            ctrl.status);
router.post('/start',            ctrl.start);
router.post('/stop',             ctrl.stop);
router.post('/reload',           ctrl.reload);
router.post('/trigger/:idAgent', ctrl.trigger);

export default router;
