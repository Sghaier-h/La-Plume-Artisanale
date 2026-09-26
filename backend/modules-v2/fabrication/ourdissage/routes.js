import { Router } from 'express';
import * as ctrl from './controller.js';

const r = Router();
r.get('/',              ctrl.list);
r.get('/:id',           ctrl.detail);
r.post('/',             ctrl.creer);
r.post('/simuler-poids',ctrl.simulerPoids);
r.post('/:id/receptionner', ctrl.receptionner);
r.put('/:id/metrage',   ctrl.majMetrage);
export default r;
