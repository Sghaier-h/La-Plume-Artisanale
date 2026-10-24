import { Router } from 'express';
import * as c from './controller.js';
const r = Router();
r.get('/taux-conformite', c.tauxConformite);
r.get('/recents',   c.recents);
// Phase G1 — charts secondaires DashboardControleCentral
r.get('/par-type-defaut',    c.parTypeDefaut);
r.get('/incidents-par-jour', c.incidentsParJour);
r.get('/radar-criteres',     c.radarCriteres);
r.get('/',          c.list);
r.get('/:id',       c.detail);
r.post('/',         c.creer);
r.post('/:id/decider', c.decider);
export default r;
