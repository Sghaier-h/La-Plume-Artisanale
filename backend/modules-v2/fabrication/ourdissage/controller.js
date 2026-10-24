import * as svc from './service.js';
import { calculPoidsChaineKg } from './formule.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.lister({ limit, offset, id_machine: req.query.id_machine, statut: req.query.statut });
  res.json(ok(rows, { limit, offset, count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const o = await svc.detail(req.params.id);
  if (!o) return res.status(404).json(fail('OURD_NOT_FOUND', 'Ourdissage introuvable', null, 404));
  res.json(ok(o));
});

export const creer = asyncHandler(async (req, res) => {
  const o = await svc.creerEnsouple(req.body, { id_utilisateur: req.user?.id });
  res.status(201).json(ok(o));
});

export const receptionner = asyncHandler(async (req, res) => {
  const o = await svc.receptionner(req.params.id, { ...req.body, id_utilisateur: req.user?.id });
  if (!o) return res.status(404).json(fail('OURD_NOT_FOUND', 'Ourdissage introuvable', null, 404));
  res.json(ok(o));
});

export const majMetrage = asyncHandler(async (req, res) => {
  const o = await svc.majMetrage(req.params.id, req.body);
  if (!o) return res.status(404).json(fail('OURD_NOT_FOUND', 'Ourdissage introuvable', null, 404));
  res.json(ok(o));
});

// Endpoint utilitaire : calcul poids côté client sans persistance
export const simulerPoids = asyncHandler(async (req, res) => {
  try {
    const kg = calculPoidsChaineKg({
      nbFils: Number(req.body.nb_fils_chaine),
      metres: Number(req.body.metrage_cible_m),
      nm:     Number(req.body.numero_metrique_nm)
    });
    res.json(ok({ poids_theorique_kg: kg }));
  } catch (e) {
    res.status(400).json(fail('BAD_INPUT', e.message));
  }
});
