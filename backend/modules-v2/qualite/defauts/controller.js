import * as svc from './service.js';
import { ok, fail, asyncHandler } from '../../_shared/api-envelope.js';

export const listTypes = asyncHandler(async (req, res) => {
  const rows = await svc.listTypes(req.query);
  res.json(ok(rows, { count: rows.length }));
});

export const listSignales = asyncHandler(async (req, res) => {
  const rows = await svc.listSignales(req.query);
  res.json(ok(rows, { count: rows.length }));
});

export const signaler = asyncHandler(async (req, res) => {
  const s = await svc.signaler(req.body, { id_utilisateur: req.user?.id });
  res.status(201).json(ok(s));
});

export const resoudre = asyncHandler(async (req, res) => {
  const s = await svc.resoudre(req.params.id);
  if (!s) return res.status(404).json(fail('NOT_FOUND', 'Défaut signalé introuvable', null, 404));
  res.json(ok(s));
});

export const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.body.url && !req.file) return res.status(400).json(fail('BAD_INPUT', 'url ou fichier requis'));
  const p = await svc.ajouterPhoto({
    id_defaut_signale: req.params.id,
    url: req.body.url ?? req.file?.path,
    mime_type: req.file?.mimetype ?? req.body.mime_type,
    taille_octets: req.file?.size ?? req.body.taille_octets,
    largeur_px: req.body.largeur_px,
    hauteur_px: req.body.hauteur_px,
    id_uploader: req.user?.id,
    ordre: req.body.ordre
  });
  res.status(201).json(ok(p));
});

export const photosDe = asyncHandler(async (req, res) => {
  const rows = await svc.photosDe(req.params.id);
  res.json(ok(rows, { count: rows.length }));
});
