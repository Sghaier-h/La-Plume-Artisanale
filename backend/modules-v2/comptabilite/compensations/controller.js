// controller.js — comptabilite/compensations
import * as service from './service.js';
const ok   = (res, d)       => res.json({ success: true, data: d, error: null });
const fail = (res, e, c=500)=> res.status(c).json({ success: false, data: null, error: { message: e?.message || String(e), code: e?.code || 'ERR' }});

export async function list(req, res)    { try { ok(res, await service.list(req.query)); } catch (e) { fail(res, e); } }
export async function getOne(req, res)  {
  try {
    const d = await service.getOne(req.params.id);
    if (!d) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, d);
  } catch (e) { fail(res, e); }
}
export async function create(req, res)  { try { ok(res, await service.create(req.body, req.user)); } catch (e) { fail(res, e, 400); } }
export async function valider(req, res) {
  try {
    const d = await service.valider(req.params.id, req.user);
    if (!d) return fail(res, { message: 'Impossible de valider : statut non brouillon', code: 'CANNOT_VALIDATE' }, 400);
    ok(res, d);
  } catch (e) { fail(res, e, 400); }
}
export async function annuler(req, res) {
  try {
    const d = await service.annuler(req.params.id, req.body);
    if (!d) return fail(res, { message: 'Impossible d\'annuler', code: 'CANNOT_CANCEL' }, 400);
    ok(res, d);
  } catch (e) { fail(res, e, 400); }
}
