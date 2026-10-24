import * as svc from './service.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.list({ limit, offset,
    id_of: req.query.id_of, id_controleur: req.query.id_controleur,
    est_bloquant: req.query.est_bloquant === 'true' });
  res.json(ok(rows, { count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const c = await svc.detail(req.params.id);
  if (!c) return res.status(404).json(fail('NOT_FOUND', 'Contrôle introuvable', null, 404));
  res.json(ok(c));
});

export const creer = asyncHandler(async (req, res) => {
  const c = await svc.enregistrer(req.body, { id_utilisateur: req.user?.id });
  res.status(201).json(ok(c));
});

export const decider = asyncHandler(async (req, res) => {
  const c = await svc.decider(req.params.id, { ...req.body, id_utilisateur: req.user?.id });
  if (!c) return res.status(404).json(fail('NOT_FOUND', 'Contrôle introuvable', null, 404));
  res.json(ok(c));
});

// Phase F2 — Taux de conformité (DashboardAdministrateur KPI Qualité)
export const tauxConformite = asyncHandler(async (req, res) => {
  const periode = String(req.query.periode || '30j');
  const data = await svc.tauxConformite({ periode });
  res.json(ok(data));
});

// Phase F2 — Contrôles récents (DashboardControleCentral tableau)
export const recents = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const rows = await svc.recents({ limit });
  res.json(ok(rows, { count: rows.length }));
});

// Phase G1 — Répartition par type de défaut (chart secteur DashboardControleCentral)
export const parTypeDefaut = asyncHandler(async (req, res) => {
  const periode = String(req.query.periode || '30j');
  const rows = await svc.parTypeDefaut({ periode });
  res.json(ok(rows, { count: rows.length }));
});

// Phase G1 — Incidents / contrôles bloquants par jour (chart ligne)
export const incidentsParJour = asyncHandler(async (req, res) => {
  const jours = Math.min(Math.max(Number(req.query.jours) || 30, 1), 365);
  const rows = await svc.incidentsParJour({ jours });
  res.json(ok(rows, { count: rows.length }));
});

// Phase G1 — Radar critères qualité (tissage / nouage / coupe / finition / emballage)
export const radarCriteres = asyncHandler(async (_req, res) => {
  const rows = await svc.radarCriteres();
  res.json(ok(rows, { count: rows.length }));
});
