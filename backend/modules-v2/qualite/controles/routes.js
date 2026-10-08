import { Router } from 'express';
import * as c from './controller.js';
const r = Router();
r.get('/',          c.list);
r.get('/:id',       c.detail);
r.post('/',         c.creer);
r.post('/:id/decider', c.decider);
export default r;
