// routes.js — qualite/avance
//
// Phase G3 — fusion de 3 modules legacy :
//   - `backend/modules/qualite-avance/`  (controles, non-conformites, declarations)
//   - `backend/modules/qualite-avancee/` (variante orthographique + endpoints FE)
//   - `backend/modules/quality/`         (checks, points, alerts — modèle Odoo)
//
// Routes consolidées sous `/api/v2/qualite/avance` :
//   /                                 → routes qualite-avancee (orthographe FE moderne)
//                                       délègue elle-même à qualite-avance (compat totale).
//   /checks                           → quality_check (modèle Odoo)
//   /points                           → quality_point
//   /alerts                           → quality_alert

import express from 'express';
import qualiteAvanceeRouter from './legacy-qae-routes.js';
import checksRouter from './legacy-check-routes.js';
import pointsRouter from './legacy-point-routes.js';
import alertsRouter from './legacy-alert-routes.js';

const router = express.Router();

// Sous-rubriques Odoo (CRUD standard sous préfixes)
router.use('/checks', checksRouter);
router.use('/points', pointsRouter);
router.use('/alerts', alertsRouter);

// Route racine = routes "qualite-avancee" FE moderne (qui délègue elle-même à qualite-avance)
router.use('/', qualiteAvanceeRouter);

export default router;
