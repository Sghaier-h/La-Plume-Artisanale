// controller.js — comptabilite/depenses-especes
import * as service from './service.js';
const ok   = (res, d)       => res.json({ success: true, data: d, error: null });
const fail = (res, e, c=500)=> res.status(c).json({ success: false, data: null, error: { message: e?.message || String(e), code: e?.code || 'ERR' }});

export async function list(req, res)    { try { ok(res, await service.list(req.query)); } catch (e) { fail(res, e); } }
export async function totaux(req, res)  { try { ok(res, await service.totaux(req.query.periode)); } catch (e) { fail(res, e); } }
export async function getOne(req, res)  {
  try {
    const d = await service.getOne(req.params.id);
    if (!d) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, d);
  } catch (e) { fail(res, e); }
}
export async function create(req, res)  { try { ok(res, await service.create(req.body, req.user)); } catch (e) { fail(res, e, 400); } }
export async function update(req, res)  { try { ok(res, await service.update(req.params.id, req.body)); } catch (e) { fail(res, e, 400); } }
export async function remove(req, res)  { try { ok(res, await service.remove(req.params.id)); } catch (e) { fail(res, e, 400); } }
export async function cloturer(req, res){ try { ok(res, await service.cloturer(req.params.periode, req.user)); } catch (e) { fail(res, e, 400); } }
