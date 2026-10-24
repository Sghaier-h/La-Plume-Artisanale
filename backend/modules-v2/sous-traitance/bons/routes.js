import { Router } from 'express';
import * as c from './controller.js';

const r = Router();
r.get('/stats',          c.stats);
r.get('/',               c.list);
r.get('/:id',            c.detail);
r.post('/:id/signer',    c.signer);
r.post('/:id/controle',  c.controle);
export default r;
