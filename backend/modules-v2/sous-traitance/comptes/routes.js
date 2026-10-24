import { Router } from 'express';
import * as c from './controller.js';

const r = Router();
r.get('/',                 c.list);
r.get('/:id',              c.detail);
r.get('/:id/mouvements',   c.listMouvements);
r.post('/ajustement',      c.ajustement);
r.post('/compensation',    c.compensation);
r.post('/paiement',        c.paiement);
r.post('/creance',         c.creance);
export default r;
