// routes.js — recrutement
//
// Point de montage canonique v2 : /api/v2/rh/candidatures (voir modules-v2/index.js).
// Alias legacy : server.js monte aussi ce routeur sur /api/hr/recruitments pour la
// compatibilité pages Phase B (RhRecrutement.tsx) et services legacy consolidés.
//
// Les endpoints riches (stages, stats/global, funnel, timeline, notes, interview,
// hire/reject/refuse, postes, analytics/mensuel) proviennent du legacy
// backend/modules/hr/controllers/hr_recruitment.controller.js et sont désormais
// hébergés exclusivement ici après la suppression du module HR legacy.
import { Router } from 'express';
import * as ctrl from './controller.js';
import attachLegacyRecruitmentRoutes from './legacy-handlers.js';

const router = Router();

// Routes legacy enrichies (déclarent explicitement authenticate sur chaque route).
// Attachées en premier pour que les chemins spécifiques (/stages, /stats/global,
// /funnel, /postes, /analytics/mensuel, /:id/timeline, /:id/notes,
// /:id/interview, /:id/hire, /:id/reject, /:id/refuse) prennent le pas sur le
// CRUD générique.
attachLegacyRecruitmentRoutes(router);

// NB : les routes CRUD legacy (`GET /`, `GET /:id(\\d+)`, `POST /`, `PUT /:id(\\d+)`,
// `DELETE /:id(\\d+)`) sont fournies par attachLegacyRecruitmentRoutes ci-dessus et
// opèrent sur `hr_applicants`. Le CRUD v2 ci-dessous (service.js) est désactivé pour
// éviter un double enregistrement conflictuel ; il reste disponible pour une
// future migration (passer en priorité en inversant l'ordre).
// router.get('/',        ctrl.list);
// router.get('/:id',     ctrl.getOne);
// router.post('/',       ctrl.create);
// router.put('/:id',     ctrl.update);
// router.delete('/:id',  ctrl.remove);

export default router;
