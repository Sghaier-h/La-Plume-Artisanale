import { Router } from 'express';
import * as c from './controller.js';
const r = Router();
r.post('/:id/receptionner', c.receptionner);
r.post('/:id/litige',       c.litige);
r.get('/:id/historique',    c.historique);
export default r;
