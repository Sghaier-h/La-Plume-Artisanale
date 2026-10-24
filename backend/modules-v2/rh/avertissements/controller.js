// controller.js — rh/avertissements
import * as service from './service.js';

const ok   = (res, data)          => res.json({ success: true, data, error: null });
const fail = (res, err, code=500) => res.status(code).json({
  success: false, data: null,
  error: { message: err?.message || String(err), code: err?.code || 'ERR' },
});

export async function list(req, res) {
  try { ok(res, await service.list(req.query)); } catch (e) { fail(res, e); }
}
export async function kpi(req, res) {
  try { ok(res, await service.kpi(req.query)); } catch (e) { fail(res, e); }
}
export async function mes(req, res) {
  try { ok(res, await service.listMes(req)); }
  catch (e) { fail(res, e, e?.code === 'TABLETTE_TOKEN' ? 401 : 500); }
}
export async function getOne(req, res) {
  try {
    const row = await service.getOne(req.params.id);
    if (!row) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, row);
  } catch (e) { fail(res, e); }
}
export async function create(req, res) {
  try { ok(res, await service.create(req.body, req.user)); }
  catch (e) { fail(res, e, 400); }
}
export async function accuserReception(req, res) {
  try { ok(res, await service.accuserReception(req.params.id, req.body, req)); }
  catch (e) { fail(res, e, e?.code === 'TABLETTE_TOKEN' ? 401 : e?.code === 'FORBIDDEN' ? 403 : 400); }
}
export async function contester(req, res) {
  try { ok(res, await service.contester(req.params.id, req.body, req)); }
  catch (e) { fail(res, e, e?.code === 'TABLETTE_TOKEN' ? 401 : e?.code === 'FORBIDDEN' ? 403 : 400); }
}
export async function scan(req, res) {
  try { ok(res, await service.scan()); } catch (e) { fail(res, e); }
}
