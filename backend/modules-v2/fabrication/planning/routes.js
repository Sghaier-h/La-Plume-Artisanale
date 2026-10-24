import { Router } from 'express';
import * as ctrl from './controller.js';
const r = Router();
r.get('/gantt',              ctrl.gantt);
r.post('/:id/assigner',      ctrl.assigner);
r.put('/:id/replanifier',    ctrl.replanifier);
export default r;
