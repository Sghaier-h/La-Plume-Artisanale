// controller.js — comptabilite/dossiers-import
import * as service from './service.js';
const ok   = (res, d)       => res.json({ success: true, data: d, error: null });
const fail = (res, e, c=500)=> res.status(c).json({ success: false, data: null, error: { message: e?.message || String(e), code: e?.code || 'ERR' }});

export async function list(req, res)   { try { ok(res, await service.list(req.query)); } catch (e) { fail(res, e); } }
export async function kpi(req, res)    { try { ok(res, await service.kpi()); } catch (e) { fail(res, e); } }
export async function getOne(req, res) {
  try {
    const d = await service.getOne(req.params.id);
    if (!d) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, d);
  } catch (e) { fail(res, e); }
}
export async function create(req, res) { try { ok(res, await service.create(req.body, req.user)); } catch (e) { fail(res, e, 400); } }
export async function update(req, res) { try { ok(res, await service.update(req.params.id, req.body)); } catch (e) { fail(res, e, 400); } }
export async function addLigne(req, res){try { ok(res, await service.addLigne(req.params.id, req.body)); } catch (e) { fail(res, e, 400); } }
export async function addFrais(req, res){try { ok(res, await service.addFrais(req.params.id, req.body)); } catch (e) { fail(res, e, 400); } }
export async function recalculer(req, res){try { ok(res, await service.recalculerCessions(req.params.id, req.body || {}, req.user)); } catch (e) { fail(res, e, 400); } }
