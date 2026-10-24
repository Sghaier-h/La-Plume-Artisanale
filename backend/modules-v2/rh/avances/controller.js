// controller.js — rh/avances
import * as service from './service.js';

const ok   = (res, data)         => res.json({ success: true, data, error: null });
const fail = (res, err, code=500)=> res.status(code).json({
  success: false, data: null,
  error: { message: err?.message || String(err), code: err?.code || 'ERR' },
});

export async function list(req, res)    { try { ok(res, await service.list(req.query)); } catch (e) { fail(res, e); } }
export async function getOne(req, res)  {
  try {
    const row = await service.getOne(req.params.id);
    if (!row) return fail(res, { message: 'Not found', code: 'NOT_FOUND' }, 404);
    ok(res, row);
  } catch (e) { fail(res, e); }
}
export async function create(req, res)  {
  try {
    // Phase T3a — validation metier basique avant insert pour eviter d'exposer
    // les erreurs Postgres 23502 "null value in column id_employe" a l'UI.
    const b = req.body || {};
    const missing = [];
    if (!b.id_employe)       missing.push('id_employe');
    if (b.montant_demande === undefined || b.montant_demande === null || b.montant_demande === '')
      missing.push('montant_demande');
    if (missing.length) {
      return fail(res, { message: `Champs obligatoires manquants : ${missing.join(', ')}`, code: 'VALIDATION' }, 400);
    }
    const n = Number(b.montant_demande);
    if (Number.isNaN(n) || n <= 0) {
      return fail(res, { message: 'montant_demande doit etre un nombre > 0', code: 'VALIDATION' }, 400);
    }
    ok(res, await service.create(req.body, req.user));
  } catch (e) { fail(res, e, 400); }
}
export async function update(req, res)  { try { ok(res, await service.update(req.params.id, req.body)); } catch (e) { fail(res, e, 400); } }
export async function remove(req, res)  { try { ok(res, await service.remove(req.params.id)); } catch (e) { fail(res, e, 400); } }

export async function approuver(req, res) {
  try { ok(res, await service.approuver(req.params.id, req.user)); }
  catch (e) { fail(res, e, 400); }
}
export async function refuser(req, res) {
  try { ok(res, await service.refuser(req.params.id, req.body, req.user)); }
  catch (e) { fail(res, e, 400); }
}
export async function payer(req, res) {
  try { ok(res, await service.payer(req.params.id, req.body, req.user)); }
  catch (e) { fail(res, e, 400); }
}
export async function rembourser(req, res) {
  try { ok(res, await service.rembourser(req.params.id, req.body, req.user)); }
  catch (e) { fail(res, e, 400); }
}
