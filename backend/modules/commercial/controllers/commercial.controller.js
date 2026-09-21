/**
 * Contrôleur Commercial — équipe commerciale et objectifs
 *
 * Endpoints:
 *   GET    /api/commercial                     — Liste
 *   GET    /api/commercial/stats/global        — Stats globales
 *   GET    /api/commercial/:id/performance     — Performance d'un commercial
 *   GET    /api/commercial/:id                 — Détail
 *   POST   /api/commercial                     — Créer
 *   PUT    /api/commercial/:id                 — Modifier
 *   DELETE /api/commercial/:id                 — Supprimer
 */

import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

const authorId = (req) => req.user?.id || req.user?.userId || null;

(async () => {
  try {
    await pool.query(`
      ALTER TABLE commercial
        ADD COLUMN IF NOT EXISTS id_commercial INTEGER,
        ADD COLUMN IF NOT EXISTS zone VARCHAR(100),
        ADD COLUMN IF NOT EXISTS objectif_mensuel NUMERIC(14,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS objectif_trimestre NUMERIC(14,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS objectif_annuel NUMERIC(14,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS taux_commission NUMERIC(5,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT true
    `);
  } catch (err) {
    console.warn('[commercial] migration ALTER TABLE échouée:', err.message);
  }
})();

// ─── GET /api/commercial ───────────────────────────────────────────
export const getCommercial = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.id_commercial AS id, c.id_commercial AS user_id, c.zone,
              c.objectif_mensuel, c.objectif_trimestre, c.objectif_annuel,
              c.taux_commission, c.actif, c.created_at,
              u.email, u.nom, u.prenom
       FROM commercial c
       LEFT JOIN utilisateurs u ON u.id_utilisateur = c.id_commercial
       WHERE c.id_commercial IS NOT NULL
       ORDER BY c.created_at DESC`
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getCommercial');
  }
};

// ─── GET /api/commercial/stats/global ──────────────────────────────
export const getStatsGlobal = async (req, res) => {
  try {
    const totalActifs = await pool.query(
      `SELECT COUNT(*)::int AS c FROM commercial WHERE actif = true AND id_commercial IS NOT NULL`
    );
    let ca_total_periode = 0;
    try {
      const r = await pool.query(
        `SELECT COALESCE(SUM(f.total_ttc), 0)::float AS ca
         FROM factures f
         WHERE f.created_at >= date_trunc('month', NOW())`
      );
      ca_total_periode = r.rows[0]?.ca || 0;
    } catch {}
    const commerciaux = await pool.query(
      `SELECT c.id_commercial, u.email, u.nom, u.prenom, c.objectif_mensuel
       FROM commercial c LEFT JOIN utilisateurs u ON u.id_utilisateur = c.id_commercial
       WHERE c.actif = true AND c.id_commercial IS NOT NULL`
    );
    const top5 = commerciaux.rows.slice(0, 5).map((c) => ({ ...c, ca_mois: 0 }));
    const taux_atteinte_moyen = commerciaux.rows.length ? 0 : 0;
    return sendSuccess(res, {
      total_actifs: totalActifs.rows[0].c,
      ca_total_periode,
      taux_atteinte_moyen,
      top_5_commerciaux: top5,
      note: 'clients.id_commercial optionnel — taux d\'atteinte à 0 si absent',
    });
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── GET /api/commercial/:id/performance ───────────────────────────
export const getPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const c = await pool.query(
      `SELECT id_commercial, objectif_mensuel, objectif_annuel, taux_commission
       FROM commercial WHERE id_commercial = $1 LIMIT 1`,
      [id]
    );
    if (!c.rows[0]) return sendError(res, 'Commercial introuvable', 404);
    const conf = c.rows[0];

    let ca_mois = 0, ca_annee = 0, nb_commandes_mois = 0;
    let note = null;
    try {
      const r = await pool.query(
        `SELECT
           COALESCE(SUM(f.total_ttc) FILTER (WHERE f.created_at >= date_trunc('month', NOW())), 0)::float AS ca_mois,
           COALESCE(SUM(f.total_ttc) FILTER (WHERE f.created_at >= date_trunc('year', NOW())), 0)::float AS ca_annee
         FROM factures f
         LEFT JOIN clients cl ON cl.id_client = f.id_client
         WHERE cl.id_commercial = $1`,
        [id]
      );
      ca_mois = r.rows[0].ca_mois; ca_annee = r.rows[0].ca_annee;
    } catch (e) {
      note = 'clients.id_commercial introuvable — valeurs à zéro';
    }
    try {
      const r = await pool.query(
        `SELECT COUNT(*)::int AS c FROM commandes co
         LEFT JOIN clients cl ON cl.id_client = co.id_client
         WHERE cl.id_commercial = $1 AND co.created_at >= date_trunc('month', NOW())`,
        [id]
      );
      nb_commandes_mois = r.rows[0]?.c || 0;
    } catch {}

    const objectif = Number(conf.objectif_mensuel) || 0;
    const taux = Number(conf.taux_commission) || 0;
    const taux_atteinte = objectif > 0 ? (ca_mois / objectif) * 100 : 0;
    const commissions_estimees = ca_mois * (taux / 100);

    return sendSuccess(res, {
      id_commercial: conf.id_commercial,
      ca_mois, ca_annee, nb_commandes_mois,
      objectif_mensuel: objectif, taux_atteinte, commissions_estimees, note,
    });
  } catch (error) {
    return handleError(res, error, 'getPerformance');
  }
};

// ─── GET /api/commercial/:id ───────────────────────────────────────
export const getCommercialById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT c.*, c.id_commercial AS id, u.email, u.nom, u.prenom
       FROM commercial c LEFT JOIN utilisateurs u ON u.id_utilisateur = c.id_commercial
       WHERE c.id_commercial = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Commercial introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getCommercialById');
  }
};

// ─── POST /api/commercial ──────────────────────────────────────────
export const createCommercial = async (req, res) => {
  try {
    const userId = authorId(req);
    const {
      id_commercial, zone, objectif_mensuel, objectif_trimestre,
      objectif_annuel, taux_commission,
    } = req.body || {};
    if (!id_commercial) return sendError(res, 'id_commercial (utilisateur) requis', 400);

    const r = await pool.query(
      `INSERT INTO commercial
         (id_commercial, zone, objectif_mensuel, objectif_trimestre, objectif_annuel,
          taux_commission, actif, created_at, created_by, name)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), $7, $8)
       RETURNING id_commercial AS id, id_commercial, zone, objectif_mensuel,
                 objectif_trimestre, objectif_annuel, taux_commission, actif`,
      [
        id_commercial, zone || null,
        objectif_mensuel || 0, objectif_trimestre || 0, objectif_annuel || 0,
        taux_commission || 0, userId, `commercial-${id_commercial}`,
      ]
    );
    return sendSuccess(res, r.rows[0], 'Commercial créé', 201);
  } catch (error) {
    return handleError(res, error, 'createCommercial');
  }
};

// ─── PUT /api/commercial/:id ───────────────────────────────────────
export const updateCommercial = async (req, res) => {
  try {
    const userId = authorId(req);
    const {
      zone, objectif_mensuel, objectif_trimestre, objectif_annuel, taux_commission, actif,
    } = req.body || {};
    const r = await pool.query(
      `UPDATE commercial SET
         zone = COALESCE($2, zone),
         objectif_mensuel = COALESCE($3, objectif_mensuel),
         objectif_trimestre = COALESCE($4, objectif_trimestre),
         objectif_annuel = COALESCE($5, objectif_annuel),
         taux_commission = COALESCE($6, taux_commission),
         actif = COALESCE($7, actif),
         updated_at = NOW(), updated_by = $8
       WHERE id_commercial = $1
       RETURNING id_commercial AS id, id_commercial, zone, objectif_mensuel,
                 objectif_trimestre, objectif_annuel, taux_commission, actif`,
      [
        req.params.id, zone ?? null,
        objectif_mensuel ?? null, objectif_trimestre ?? null, objectif_annuel ?? null,
        taux_commission ?? null, actif ?? null, userId,
      ]
    );
    if (!r.rows[0]) return sendError(res, 'Commercial introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Commercial mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateCommercial');
  }
};

// ─── DELETE /api/commercial/:id ────────────────────────────────────
export const deleteCommercial = async (req, res) => {
  try {
    const r = await pool.query(
      `DELETE FROM commercial WHERE id_commercial = $1 RETURNING id_commercial`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Commercial introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_commercial }, 'Commercial supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteCommercial');
  }
};
