import * as svc from './service.js';
import { ok, fail, asyncHandler } from '../../_shared/api-envelope.js';
import { getPool } from '../../_shared/db.js';

export const listTypes = asyncHandler(async (req, res) => {
  const rows = await svc.listTypes(req.query);
  res.json(ok(rows, { count: rows.length }));
});

export const listSignales = asyncHandler(async (req, res) => {
  const rows = await svc.listSignales(req.query);
  res.json(ok(rows, { count: rows.length }));
});

export const listSignalesSimple = asyncHandler(async (req, res) => {
  const rows = await svc.listSignales(req.query);
  res.json(ok(rows, { count: rows.length }));
});

export const signaler = asyncHandler(async (req, res) => {
  const s = await svc.signaler(req.body, { id_utilisateur: req.user?.id });
  res.status(201).json(ok(s));
});

/**
 * T3c — POST /api/v2/qualite/defauts
 * Payload simplifié : { id_of, type_defaut, gravite, quantite, photo_url?, description? }
 *   - `type_defaut` : code OU id du defauts_types (recherche par code sinon par id)
 *   - `gravite`     : mineur | majeur | critique (stocké dans commentaire si non géré)
 *   - `quantite`    : -> quantite_impactee
 *   - `description` : -> commentaire
 *   - `photo_url`   : si fourni, crée aussi photos_defauts
 * Crée en plus une notification pour chaque utilisateur ayant role CONTROLEUR_QUALITE.
 */
export const signalerSimple = asyncHandler(async (req, res) => {
  const pool = getPool();
  const { id_of, type_defaut, gravite, quantite, photo_url, description } = req.body || {};
  if (!type_defaut) return res.status(400).json(fail('BAD_INPUT', 'type_defaut requis'));

  // Résolution id_defaut_type
  let idDefautType = null;
  if (typeof type_defaut === 'number' || /^\d+$/.test(String(type_defaut))) {
    idDefautType = Number(type_defaut);
  } else {
    const r = await pool.query(
      `SELECT id_defaut_type FROM defauts_types WHERE code = $1 LIMIT 1`,
      [type_defaut]
    );
    if (r.rows[0]) idDefautType = r.rows[0].id_defaut_type;
  }
  if (!idDefautType) {
    return res.status(400).json(fail('BAD_INPUT', `type_defaut inconnu: ${type_defaut}`));
  }

  const signaleur = req.user?.id || req.user?.id_user || null;
  const commentaire = [
    gravite ? `[gravité: ${gravite}]` : null,
    description || null,
  ].filter(Boolean).join(' ') || null;

  // Insert defaut_signale (en catch gracieux si schema diffère)
  let signale = null;
  try {
    const ins = await pool.query(
      `INSERT INTO defauts_signales
         (id_defaut_type, id_of, id_signaleur, quantite_impactee, commentaire)
       VALUES ($1, $2, COALESCE($3, 0), $4, $5)
       RETURNING *`,
      [idDefautType, id_of ?? null, signaleur, quantite ?? null, commentaire]
    );
    signale = ins.rows[0];
  } catch (e) {
    return res.status(200).json(ok({
      stub: true,
      message: 'En attente d\'implémentation DB (defauts_signales)',
      payload: req.body,
      error: e.message,
    }));
  }

  // Photo optionnelle
  if (photo_url) {
    try {
      await pool.query(
        `INSERT INTO photos_defauts (id_defaut_signale, url, id_uploader, ordre)
         VALUES ($1, $2, $3, 0)`,
        [signale.id_defaut_signale, photo_url, signaleur]
      );
    } catch {}
  }

  // Notification CONTROLEUR_QUALITE (best effort, pas bloquant)
  let notified = 0;
  try {
    const dest = await pool.query(
      `SELECT u.id_user
         FROM users u
         LEFT JOIN user_roles ur ON u.id_user = ur.id_user
         LEFT JOIN roles r ON ur.id_role = r.id_role
        WHERE (u.role_principal = 'CONTROLEUR_QUALITE'
               OR r.code = 'CONTROLEUR_QUALITE'
               OR r.code = 'CONTROLEUR'
               OR 'CONTROLEUR_QUALITE' = ANY(COALESCE(u.roles_supplementaires, ARRAY[]::VARCHAR[])))
          AND u.actif = TRUE`
    );
    for (const row of dest.rows) {
      try {
        await pool.query(
          `INSERT INTO notifications
             (id_utilisateur, type_notif, titre, message, priorite,
              entite_type, entite_id)
           VALUES ($1, 'qualite_defaut_signale', $2, $3, $4, 'defaut_signale', $5)`,
          [
            row.id_user,
            `Nouveau défaut signalé${id_of ? ` (OF #${id_of})` : ''}`,
            commentaire || `Défaut type #${idDefautType}`,
            gravite === 'critique' ? 'critique'
              : gravite === 'majeur' ? 'haute' : 'normale',
            signale.id_defaut_signale,
          ]
        );
        notified++;
      } catch {}
    }
  } catch {}

  res.status(201).json(ok(signale, { notified_controleurs: notified }));
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
