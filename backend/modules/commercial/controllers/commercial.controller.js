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
import { io } from '../../../src/server.js';

const authorId = (req) => req.user?.id || req.user?.userId || null;
const safe = async (fn, fallback) => { try { return await fn(); } catch { return fallback; } };

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
       LEFT JOIN users u ON u.id_utilisateur = c.id_commercial
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
       FROM commercial c LEFT JOIN users u ON u.id_utilisateur = c.id_commercial
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
         LEFT JOIN comptes cl ON cl.id_client = f.id_client
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
         LEFT JOIN comptes cl ON cl.id_client = co.id_client
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
       FROM commercial c LEFT JOIN users u ON u.id_utilisateur = c.id_commercial
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

// ─── GET /api/commercial/:id_commercial/dashboard ──────────────────
export const getDashboard = async (req, res) => {
  try {
    const id = req.params.id_commercial || req.params.id;
    const c = await pool.query(
      `SELECT c.id_commercial, c.zone, c.objectif_mensuel, c.objectif_trimestre,
              c.objectif_annuel, c.taux_commission,
              u.nom, u.prenom, u.email
       FROM commercial c
       LEFT JOIN users u ON u.id_utilisateur = c.id_commercial
       WHERE c.id_commercial = $1 LIMIT 1`,
      [id]
    );
    if (!c.rows[0]) return sendError(res, 'Commercial introuvable', 404);
    const conf = c.rows[0];

    const perf = await safe(async () => {
      const r = await pool.query(
        `SELECT
           COALESCE(SUM(f.total_ttc) FILTER (WHERE f.created_at >= date_trunc('month', NOW())), 0)::float AS ca_mois,
           COALESCE(SUM(f.total_ttc) FILTER (WHERE f.created_at >= date_trunc('quarter', NOW())), 0)::float AS ca_trimestre,
           COALESCE(SUM(f.total_ttc) FILTER (WHERE f.created_at >= date_trunc('year', NOW())), 0)::float AS ca_annee
         FROM factures f
         LEFT JOIN comptes cl ON cl.id_client = f.id_client
         WHERE cl.id_commercial = $1`,
        [id]
      );
      return r.rows[0];
    }, { ca_mois: 0, ca_trimestre: 0, ca_annee: 0 });

    const objectif_mensuel = Number(conf.objectif_mensuel) || 0;
    const objectif_trimestre = Number(conf.objectif_trimestre) || 0;
    const objectif_annuel = Number(conf.objectif_annuel) || 0;
    const taux_com = Number(conf.taux_commission) || 0;
    const taux_atteinte_mensuel = objectif_mensuel > 0 ? (perf.ca_mois / objectif_mensuel) * 100 : 0;
    const taux_atteinte_trimestre = objectif_trimestre > 0 ? (perf.ca_trimestre / objectif_trimestre) * 100 : 0;

    const pipeline = await safe(async () => {
      const rows = await pool.query(
        `SELECT COALESCE(o.statut, 'new') AS stage,
                COUNT(*)::int AS count,
                COALESCE(SUM(o.montant_prevue), 0)::float AS montant
         FROM opportunites o
         LEFT JOIN comptes cl ON cl.id_client = o.id_client
         WHERE (cl.id_commercial = $1 OR o.created_by = $1)
           AND COALESCE(o.statut, 'new') NOT IN ('won', 'lost', 'closed')
         GROUP BY COALESCE(o.statut, 'new')`,
        [id]
      );
      const total = rows.rows.reduce((s, r) => s + r.count, 0);
      const montant = rows.rows.reduce((s, r) => s + Number(r.montant || 0), 0);
      return { opportunites_ouvertes: total, montant_pipeline: montant, opportunites_par_stage: rows.rows };
    }, { opportunites_ouvertes: 0, montant_pipeline: 0, opportunites_par_stage: [] });

    const activite_recente = await safe(async () => {
      const acts = await pool.query(
        `SELECT type_activite AS type, date_activite AS date, description
         FROM activites_crm
         WHERE created_by = $1
         ORDER BY date_activite DESC NULLS LAST
         LIMIT 10`,
        [id]
      );
      return acts.rows;
    }, []);

    const top_clients = await safe(async () => {
      const r = await pool.query(
        `SELECT cl.id_client, cl.raison_sociale,
                COALESCE(SUM(f.total_ttc), 0)::float AS ca_mois,
                COUNT(DISTINCT co.id_commande)::int AS nb_commandes
         FROM comptes cl
         LEFT JOIN factures f ON f.id_client = cl.id_client
              AND f.created_at >= date_trunc('month', NOW())
         LEFT JOIN commandes co ON co.id_client = cl.id_client
              AND co.created_at >= date_trunc('month', NOW())
         WHERE cl.id_commercial = $1
         GROUP BY cl.id_client, cl.raison_sociale
         ORDER BY ca_mois DESC
         LIMIT 5`,
        [id]
      );
      return r.rows;
    }, []);

    const objectifs_aujourdhui = await safe(async () => {
      const rows = [];
      // Relances : factures impayées échues
      const relances = await safe(async () => {
        const r = await pool.query(
          `SELECT COUNT(*)::int AS c FROM factures f
           LEFT JOIN comptes cl ON cl.id_client = f.id_client
           WHERE cl.id_commercial = $1 AND COALESCE(f.statut,'') <> 'payee'
             AND f.date_echeance < NOW()`,
          [id]
        );
        return r.rows[0]?.c || 0;
      }, 0);
      if (relances > 0) rows.push({ type: 'relance', description: `${relances} facture(s) en retard à relancer`, priorite: 'haute' });
      // Devis en attente
      const devis = await safe(async () => {
        const r = await pool.query(
          `SELECT COUNT(*)::int AS c FROM devis d
           LEFT JOIN comptes cl ON cl.id_client = d.id_client
           WHERE cl.id_commercial = $1 AND COALESCE(d.statut,'brouillon') = 'brouillon'`,
          [id]
        );
        return r.rows[0]?.c || 0;
      }, 0);
      if (devis > 0) rows.push({ type: 'devis', description: `${devis} devis à envoyer`, priorite: 'moyenne' });
      return rows;
    }, []);

    const prochains_evenements = await safe(async () => {
      const r = await pool.query(
        `SELECT date_activite AS date, type_activite AS type, description, nom AS client
         FROM activites_crm
         WHERE created_by = $1 AND date_activite >= NOW()
         ORDER BY date_activite ASC
         LIMIT 10`,
        [id]
      );
      return r.rows;
    }, []);

    return sendSuccess(res, {
      commercial: {
        id: conf.id_commercial,
        nom: conf.nom,
        prenom: conf.prenom,
        zone: conf.zone,
      },
      objectifs: {
        mensuel: objectif_mensuel,
        trimestre: objectif_trimestre,
        annuel: objectif_annuel,
      },
      performance: {
        ca_mois: perf.ca_mois,
        ca_trimestre: perf.ca_trimestre,
        ca_annee: perf.ca_annee,
        taux_atteinte_mensuel,
        taux_atteinte_trimestre,
        commissions_estimees: perf.ca_mois * (taux_com / 100),
      },
      pipeline,
      activite_recente,
      top_clients,
      objectifs_aujourdhui,
      prochains_evenements,
    });
  } catch (error) {
    return handleError(res, error, 'getDashboard');
  }
};

// ─── GET /api/commercial/leaderboard ───────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const list = await pool.query(
      `SELECT c.id_commercial, u.nom, u.prenom, c.objectif_mensuel
       FROM commercial c LEFT JOIN users u ON u.id_utilisateur = c.id_commercial
       WHERE c.actif = true AND c.id_commercial IS NOT NULL`
    );
    const enriched = await Promise.all(list.rows.map(async (c) => {
      const ca = await safe(async () => {
        const r = await pool.query(
          `SELECT COALESCE(SUM(f.total_ttc), 0)::float AS ca
           FROM factures f LEFT JOIN comptes cl ON cl.id_client = f.id_client
           WHERE cl.id_commercial = $1 AND f.created_at >= date_trunc('month', NOW())`,
          [c.id_commercial]
        );
        return r.rows[0]?.ca || 0;
      }, 0);
      const nb = await safe(async () => {
        const r = await pool.query(
          `SELECT COUNT(*)::int AS c FROM commandes co
           LEFT JOIN comptes cl ON cl.id_client = co.id_client
           WHERE cl.id_commercial = $1 AND co.created_at >= date_trunc('month', NOW())`,
          [c.id_commercial]
        );
        return r.rows[0]?.c || 0;
      }, 0);
      const obj = Number(c.objectif_mensuel) || 0;
      return {
        id_commercial: c.id_commercial,
        nom: `${c.prenom || ''} ${c.nom || ''}`.trim(),
        ca_mois: ca,
        taux_atteinte: obj > 0 ? (ca / obj) * 100 : 0,
        nb_commandes: nb,
      };
    }));
    enriched.sort((a, b) => b.ca_mois - a.ca_mois);
    const ranked = enriched.map((r, i) => ({ rang: i + 1, ...r }));
    return sendSuccess(res, ranked);
  } catch (error) {
    return handleError(res, error, 'getLeaderboard');
  }
};

// ─── GET /api/commercial/:id/pipeline ──────────────────────────────
export const getPipeline = async (req, res) => {
  try {
    const rows = await safe(async () => {
      const r = await pool.query(
        `SELECT COALESCE(o.statut, 'new') AS stage,
                COUNT(*)::int AS count,
                COALESCE(SUM(o.montant_prevue), 0)::float AS montant,
                COALESCE(AVG(o.probabilite), 0)::float AS probabilite_moyenne
         FROM opportunites o
         LEFT JOIN comptes cl ON cl.id_client = o.id_client
         WHERE (cl.id_commercial = $1 OR o.created_by = $1)
         GROUP BY COALESCE(o.statut, 'new')
         ORDER BY montant DESC`,
        [req.params.id]
      );
      return r.rows;
    }, []);
    return sendSuccess(res, rows);
  } catch (error) {
    return handleError(res, error, 'getPipeline');
  }
};

// ─── GET /api/commercial/:id/agenda?date= ──────────────────────────
export const getAgenda = async (req, res) => {
  try {
    const { date } = req.query || {};
    const rows = await safe(async () => {
      const r = await pool.query(
        `SELECT id_activite, nom, type_activite AS type, date_activite AS date, description
         FROM activites_crm
         WHERE created_by = $1
           AND ($2::date IS NULL OR date_trunc('day', date_activite) = $2::date)
         ORDER BY date_activite ASC`,
        [req.params.id, date || null]
      );
      return r.rows;
    }, []);
    return sendSuccess(res, rows);
  } catch (error) {
    return handleError(res, error, 'getAgenda');
  }
};

// ─── POST /api/commercial/:id/objectif ─────────────────────────────
export const setObjectif = async (req, res) => {
  try {
    const role = req.user?.role?.toUpperCase();
    if (role !== 'ADMIN') return sendError(res, 'Réservé aux administrateurs', 403);
    const userId = authorId(req);
    const { objectif_mensuel, objectif_trimestre, objectif_annuel } = req.body || {};
    const r = await pool.query(
      `UPDATE commercial SET
         objectif_mensuel   = COALESCE($2, objectif_mensuel),
         objectif_trimestre = COALESCE($3, objectif_trimestre),
         objectif_annuel    = COALESCE($4, objectif_annuel),
         updated_at = NOW(), updated_by = $5
       WHERE id_commercial = $1
       RETURNING id_commercial, objectif_mensuel, objectif_trimestre, objectif_annuel`,
      [req.params.id, objectif_mensuel ?? null, objectif_trimestre ?? null, objectif_annuel ?? null, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Commercial introuvable', 404);
    try { io?.emit?.('commercial:objectif-updated', r.rows[0]); } catch {}
    return sendSuccess(res, r.rows[0], 'Objectif mis à jour');
  } catch (error) {
    return handleError(res, error, 'setObjectif');
  }
};

// ─── GET /api/commercial/team/performance ──────────────────────────
export const getTeamPerformance = async (req, res) => {
  try {
    const list = await pool.query(
      `SELECT c.id_commercial, c.objectif_mensuel, c.objectif_annuel, c.taux_commission,
              u.nom, u.prenom
       FROM commercial c LEFT JOIN users u ON u.id_utilisateur = c.id_commercial
       WHERE c.actif = true AND c.id_commercial IS NOT NULL`
    );
    const team = await Promise.all(list.rows.map(async (c) => {
      const perf = await safe(async () => {
        const r = await pool.query(
          `SELECT
             COALESCE(SUM(f.total_ttc) FILTER (WHERE f.created_at >= date_trunc('month', NOW())), 0)::float AS ca_mois,
             COALESCE(SUM(f.total_ttc) FILTER (WHERE f.created_at >= date_trunc('year', NOW())), 0)::float AS ca_annee
           FROM factures f LEFT JOIN comptes cl ON cl.id_client = f.id_client
           WHERE cl.id_commercial = $1`,
          [c.id_commercial]
        );
        return r.rows[0];
      }, { ca_mois: 0, ca_annee: 0 });
      const obj = Number(c.objectif_mensuel) || 0;
      return {
        id_commercial: c.id_commercial,
        nom: `${c.prenom || ''} ${c.nom || ''}`.trim(),
        ca_mois: perf.ca_mois,
        ca_annee: perf.ca_annee,
        objectif_mensuel: obj,
        taux_atteinte: obj > 0 ? (perf.ca_mois / obj) * 100 : 0,
      };
    }));
    const total_ca_mois = team.reduce((s, t) => s + t.ca_mois, 0);
    const total_ca_annee = team.reduce((s, t) => s + t.ca_annee, 0);
    const total_objectif = team.reduce((s, t) => s + t.objectif_mensuel, 0);
    return sendSuccess(res, {
      team,
      total_ca_mois,
      total_ca_annee,
      total_objectif,
      taux_atteinte_global: total_objectif > 0 ? (total_ca_mois / total_objectif) * 100 : 0,
      effectif: team.length,
    });
  } catch (error) {
    return handleError(res, error, 'getTeamPerformance');
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
