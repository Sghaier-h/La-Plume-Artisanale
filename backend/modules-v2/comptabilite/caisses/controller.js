// controller.js — comptabilite/caisses
import * as service from './service.js';

const ok    = (res, data)         => res.json({ success: true, data, error: null });
const fail  = (res, err, code=500)=> res.status(code).json({ success: false, data: null, error: { message: err?.message || String(err), code: err?.code || 'ERR' }});

export async function list(req, res)      { try { ok(res, await service.list()); } catch (e) { fail(res, e); } }
export async function getOne(req, res)    {
  try {
    const item = await service.getOne(req.params.id);
    if (!item) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, item);
  } catch (e) { fail(res, e); }
}
export async function create(req, res)    { try { ok(res, await service.create(req.body, req.user)); } catch (e) { fail(res, e, 400); } }
export async function update(req, res)    { try { ok(res, await service.update(req.params.id, req.body)); } catch (e) { fail(res, e, 400); } }
export async function remove(req, res)    { try { ok(res, await service.remove(req.params.id)); } catch (e) { fail(res, e, 400); } }

export async function mouvements(req, res){ try { ok(res, await service.getMouvements(req.params.id, req.query)); } catch (e) { fail(res, e); } }
export async function transfert(req, res) { try { ok(res, await service.transfertInterne(req.body, req.user)); } catch (e) { fail(res, e, 400); } }
export async function routage(req, res)   { try { ok(res, await service.getRoutage()); } catch (e) { fail(res, e); } }
