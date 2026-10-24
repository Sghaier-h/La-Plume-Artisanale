/**
 * backend/modules-v2/multi-societes/routes.js
 *
 * Routes montées sur /api/v2/societes (cf. modules-v2/index.js).
 *
 *   GET    /                      — liste visible pour l'utilisateur
 *   GET    /:id                   — détail
 *   PUT    /:id                   — édition (ADMIN)
 *   POST   /:id/basculer          — change la société courante + JWT raf
 *   GET    /consolide/ventes      — vue consolidée (ADMIN)
 */
import express from 'express';
import { authenticate, requirePermission } from '../_shared/authMiddleware.js';
import { societeContext } from '../_shared/societe-context.js';
import * as C from './controller.js';

const router = express.Router();
router.use(authenticate);
router.use(societeContext);

// Vue consolidée AVANT la route générique /:id — ADMIN uniquement
router.get('/consolide/ventes', requirePermission('societes:consolider'), C.consolideVentes);

router.get ('/',                           C.list);
router.get ('/:id(\\d+)',                  C.get);
router.put ('/:id(\\d+)',                  requirePermission('societes:modifier'), C.update);
router.post('/:id(\\d+)/basculer',         C.basculer);

export default router;
