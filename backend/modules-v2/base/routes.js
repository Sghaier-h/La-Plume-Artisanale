// routes.js — base (T3c)
// Alias courts pour les référentiels globaux :
//   GET /api/v2/base/roles        — liste des rôles (alias de /api/v2/users/roles)
//   GET /api/v2/base/permissions  — liste des permissions (alias de /api/v2/users/permissions)
//
// Mounté en lecture seule, sans middleware d'authentification pour permettre au
// front d'alimenter les écrans de sélection de rôle avant login si besoin.
import { Router } from 'express';
import { getPool } from '../_shared/db.js';
import { ok, asyncHandler } from '../_shared/api-envelope.js';

const router = Router();

router.get('/roles', asyncHandler(async (_req, res) => {
  try {
    const r = await getPool().query(
      `SELECT id_role, code, libelle, description, systeme, actif
         FROM roles
        ORDER BY COALESCE(ordre_affichage, 9999), code`
    );
    return res.json(ok(r.rows, { count: r.rows.length }));
  } catch (e) {
    // Fallback : table peut-être nommée `roles_role` ou code_role (schema legacy)
    try {
      const r = await getPool().query(
        `SELECT id_role, code_role AS code, nom_role AS libelle,
                description, FALSE AS systeme,
                COALESCE(actif, TRUE) AS actif
           FROM roles`
      );
      return res.json(ok(r.rows, { count: r.rows.length, legacy: true }));
    } catch (e2) {
      return res.json(ok([], { count: 0, message: 'En attente d\'implémentation DB (roles)' }));
    }
  }
}));

router.get('/permissions', asyncHandler(async (_req, res) => {
  try {
    const r = await getPool().query(
      `SELECT id_permission, code, domaine, action, scope, libelle
         FROM permissions
        ORDER BY domaine, action`
    );
    return res.json(ok(r.rows, { count: r.rows.length }));
  } catch (e) {
    return res.json(ok([], { count: 0, message: 'En attente d\'implémentation DB (permissions)' }));
  }
}));

export default router;
