import * as svc from './service.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.listOfs({
    limit, offset,
    statut: req.query.statut,
    id_machine_prevue: req.query.id_machine_prevue,
    id_commande: req.query.id_commande
  });
  res.json(ok(rows, { limit, offset, count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const of = await svc.getOf(req.params.id);
  if (!of) return res.status(404).json(fail('OF_NOT_FOUND', 'OF introuvable', null, 404));
  res.json(ok(of));
});

export const creer = asyncHandler(async (req, res) => {
  const of = await svc.creerOf(req.body, { id_utilisateur: req.user?.id });
  res.status(201).json(ok(of));
});

export const autoDepuisCommande = asyncHandler(async (req, res) => {
  const { id_commande } = req.params;
  const { lignes } = req.body;
  if (!Array.isArray(lignes) || !lignes.length)
    return res.status(400).json(fail('BAD_INPUT', 'lignes requis'));
  const ofs = await svc.autoCreerDepuisCommande({ id_commande, lignes, id_utilisateur: req.user?.id });
  res.status(201).json(ok(ofs, { count: ofs.length }));
});

export const changerStatut = asyncHandler(async (req, res) => {
  const of = await svc.changerStatut(req.params.id, req.body.statut, {
    motif: req.body.motif,
    id_utilisateur: req.user?.id
  });
  res.json(ok(of));
});

export const maj = asyncHandler(async (req, res) => {
  const of = await svc.majOf(req.params.id, req.body);
  if (!of) return res.status(404).json(fail('OF_NOT_FOUND', 'OF introuvable', null, 404));
  res.json(ok(of));
});

export const supprimer = asyncHandler(async (req, res) => {
  const del = await svc.supprimerOf(req.params.id);
  if (!del) return res.status(404).json(fail('OF_NOT_FOUND', 'OF introuvable', null, 404));
  res.status(204).end();
});
