// controller.js — documents/archive
import * as service from './service.js';
const ok   = (res, d)       => res.json({ success: true, data: d, error: null });
const fail = (res, e, c=500)=> res.status(c).json({ success: false, data: null, error: { message: e?.message || String(e), code: e?.code || 'ERR' }});

export async function search(req, res)   { try { ok(res, await service.search(req.query)); } catch (e) { fail(res, e); } }
export async function getOne(req, res)   {
  try {
    const d = await service.getOne(req.params.id);
    if (!d) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, d);
  } catch (e) { fail(res, e); }
}
export async function create(req, res)   { try { ok(res, await service.create(req.body, req.user)); } catch (e) { fail(res, e, 400); } }
export async function attach(req, res)   { try { ok(res, await service.attach(req.body, req.user)); } catch (e) { fail(res, e, 400); } }
export async function detach(req, res)   { try { ok(res, await service.detach(req.body)); } catch (e) { fail(res, e, 400); } }
export async function forEntity(req, res){ try { ok(res, await service.forEntity(req.query)); } catch (e) { fail(res, e); } }
export async function remove(req, res)   { try { ok(res, await service.remove(req.params.id, req.user)); } catch (e) { fail(res, e, 400); } }
