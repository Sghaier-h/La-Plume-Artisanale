// controller.js — rh/entretiens
import * as service from './service.js';

const ok   = (res, data)          => res.json({ success: true, data, error: null });
const fail = (res, err, code=500) => res.status(code).json({ success: false, data: null, error: { message: err?.message || String(err), code: err?.code || 'ERR' } });

export async function list(req, res) {
  try   { ok(res, await service.list(req.query)); }
  catch (e) { fail(res, e); }
}
export async function getOne(req, res) {
  try {
    const item = await service.getOne(req.params.id);
    if (!item) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, item);
  } catch (e) { fail(res, e); }
}
export async function create(req, res) {
  try   { ok(res, await service.create(req.body, req.user)); }
  catch (e) { fail(res, e, 400); }
}
export async function update(req, res) {
  try   { ok(res, await service.update(req.params.id, req.body)); }
  catch (e) { fail(res, e, 400); }
}
export async function remove(req, res) {
  try   { ok(res, await service.remove(req.params.id)); }
  catch (e) { fail(res, e, 400); }
}

// Dashboard --------------------------------------------------------------
export async function kpi(_req, res) {
  try   { ok(res, await service.kpi()); }
  catch (e) { fail(res, e); }
}
export async function parMois(req, res) {
  try {
    const annee = req.query.annee ? Number(req.query.annee) : new Date().getFullYear();
    ok(res, await service.parMois({ annee }));
  } catch (e) { fail(res, e); }
}
export async function upcoming(req, res) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    ok(res, await service.upcoming({ limit }));
  } catch (e) { fail(res, e); }
}
export async function enRetard(req, res) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    ok(res, await service.enRetard({ limit }));
  } catch (e) { fail(res, e); }
}
