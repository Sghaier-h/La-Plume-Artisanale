// controller.js — rh/comptes-employes
import * as service from './service.js';

const ok   = (res, data)         => res.json({ success: true, data, error: null });
const fail = (res, err, code=500)=> res.status(code).json({
  success: false, data: null,
  error: { message: err?.message || String(err), code: err?.code || 'ERR' },
});

export async function list(req, res) {
  try { ok(res, await service.list(req.query)); }
  catch (e) { fail(res, e); }
}

export async function getSolde(req, res) {
  try {
    const item = await service.getSolde(req.params.id);
    if (!item) return fail(res, { message: 'Compte employé introuvable', code: 'NOT_FOUND' }, 404);
    ok(res, item);
  } catch (e) { fail(res, e); }
}

export async function getMouvements(req, res) {
  try { ok(res, await service.getMouvements(req.params.id, req.query)); }
  catch (e) { fail(res, e); }
}

export async function update(req, res) {
  try { ok(res, await service.updateCompte(req.params.id, req.body)); }
  catch (e) { fail(res, e, 400); }
}

export async function creerMouvement(req, res) {
  try {
    const payload = { ...req.body, idEmploye: req.params.id };
    ok(res, await service.creerMouvement(payload, req.user));
  } catch (e) { fail(res, e, 400); }
}

export async function kpi(req, res) {
  try { ok(res, await service.kpi()); }
  catch (e) { fail(res, e); }
}
