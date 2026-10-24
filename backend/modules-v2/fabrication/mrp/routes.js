// routes.js — fabrication/mrp
//
// Phase G3 — consolidation : le module legacy `backend/modules/mrp/` a été
// porté verbatim ici (5 ressources : productions, boms, work_centers,
// work_orders, routings).
//
// Routes consolidées sous `/api/v2/fabrication/mrp/*` :
//   /productions  (CRUD + /:id/confirm /start /done + /:id/moves)
//   /boms         (CRUD + /:id/hierarchy /:id/cost)
//   /work-centers (CRUD)
//   /work-orders  (CRUD)
//   /routings     (CRUD)

import express from 'express';
import productionsRouter from './mrp_production.routes.js';
import bomsRouter from './mrp_bom.routes.js';
import workCentersRouter from './mrp_work_center.routes.js';
import workOrdersRouter from './mrp_work_order.routes.js';
import routingsRouter from './mrp_routing.routes.js';

const router = express.Router();

router.use('/productions', productionsRouter);
router.use('/boms', bomsRouter);
router.use('/work-centers', workCentersRouter);
router.use('/work-orders', workOrdersRouter);
router.use('/routings', routingsRouter);

export default router;
