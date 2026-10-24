// controller.js — rh/formations
import * as service from './service.js';

const ok   = (res, data)          => res.json({ success: true, data, error: null });
const fail = (res, err, code=500) => res.status(code).json({ success: false, data: null, error: { message: err?.message || String(err), code: err?.code || 'ERR' } });

// CRUD -----------------------------------------------------------------
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

// Participants ---------------------------------------------------------
export async function listParticipants(req, res) {
  try   { ok(res, await service.listParticipants(req.params.id)); }
  catch (e) { fail(res, e); }
}
export async function addParticipant(req, res) {
  try   { ok(res, await service.addParticipant({ ...req.body, id_formation: Number(req.params.id) })); }
  catch (e) { fail(res, e, 400); }
}
export async function removeParticipant(req, res) {
  try   { ok(res, await service.removeParticipant(req.params.pid)); }
  catch (e) { fail(res, e, 400); }
}

// Dashboard ------------------------------------------------------------
export async function kpi(req, res) {
  try {
    const id_societe = req.query.id_societe ? Number(req.query.id_societe) : null;
    ok(res, await service.kpi({ id_societe }));
  } catch (e) { fail(res, e); }
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

// Budget TFP (compat Phase F) ------------------------------------------
export async function budgetTFP(req, res) {
  try {
    const annee = req.query.annee ? Number(req.query.annee) : new Date().getFullYear();
    const data = await service.kpi({});
    // Masse salariale fixée en démo (bulletins v2 agrégés plus tard)
    const masseSalarialeAnnuelle = 38450 * 12;
    const budget = masseSalarialeAnnuelle * 0.02;
    ok(res, {
      annee,
      budget_tnd: budget,
      utilise_tnd: data.cout_annee_tnd,
      restant_tnd: Math.max(0, budget - Number(data.cout_annee_tnd || 0)),
      pct_utilise: budget > 0 ? Math.round((Number(data.cout_annee_tnd || 0) / budget) * 1000) / 10 : 0,
    });
  } catch (e) { fail(res, e); }
}
