import * as model from './model.js';
import { getPool } from '../../../src/config/database.js';

export const list   = (o) => model.findAll(o);
export const detail = (id) => model.findById(id);

/** Enregistre un contrôle. Si `est_bloquant` → OF passe `statut='bloque_qc'`. */
export async function enregistrer(ctrl, { id_utilisateur } = {}) {
  const created = await model.insert({ ...ctrl, id_controleur: ctrl.id_controleur ?? id_utilisateur });
  if (created.est_bloquant) {
    await getPool().query(
      `UPDATE ordres_fabrication SET statut = 'bloque_qc', updated_at = NOW() WHERE id_of = $1`,
      [created.id_of]);
  }
  return created;
}

export async function decider(id, { decision, motif, id_utilisateur }) {
  const c = await model.update(id, { decision });
  if (!c) return null;
  // Si laisser_passer_1c → OF débloqué
  if (decision === 'laisser_passer_1c' || decision === 'passer_2c') {
    await getPool().query(
      `UPDATE ordres_fabrication SET statut = 'controle', updated_at = NOW() WHERE id_of = $1 AND statut = 'bloque_qc'`,
      [c.id_of]);
  }
  return c;
}

/**
 * Phase F2 — Taux de conformité sur une période (30j par défaut).
 * total = nombre de contrôles non bloquants + bloquants
 * conformes = contrôles non bloquants
 * taux = round(conformes / total * 1000) / 10 (une décimale)
 */
export async function tauxConformite({ periode = '30j' } = {}) {
  const days = /^(\d+)j$/.test(periode) ? Math.max(1, parseInt(periode, 10)) : 30;
  try {
    const { rows } = await getPool().query(
      `SELECT
         COUNT(*)::int                                              AS total,
         COUNT(*) FILTER (WHERE est_bloquant = false)::int          AS conformes,
         COUNT(*) FILTER (WHERE est_bloquant = true)::int           AS non_conformes
       FROM controles_qualite
       WHERE date_controle >= NOW() - ($1 || ' days')::interval`,
      [String(days)]
    );
    const r = rows[0] || { total: 0, conformes: 0, non_conformes: 0 };
    const taux = r.total > 0 ? Math.round((r.conformes / r.total) * 1000) / 10 : 0;
    return { periode, periode_jours: days, total: r.total, conformes: r.conformes, non_conformes: r.non_conformes, taux };
  } catch {
    return { periode, periode_jours: days, total: 0, conformes: 0, non_conformes: 0, taux: 0 };
  }
}

/** Phase F2 — Derniers contrôles qualité (DashboardControleCentral). */
export async function recents({ limit = 20 } = {}) {
  try {
    const { rows } = await getPool().query(
      `SELECT c.id_ctrl, c.date_controle, c.id_of, c.id_controleur,
              c.est_bloquant, c.decision, c.type_controle, c.observations,
              o.numero_of
         FROM controles_qualite c
         LEFT JOIN ordres_fabrication o ON o.id_of = c.id_of
        ORDER BY c.date_controle DESC
        LIMIT $1`, [limit]
    );
    return rows;
  } catch {
    return [];
  }
}

/**
 * Phase G1 — Répartition par type de défaut (chart secteur DashboardControleCentral).
 * Priorité à `defauts_signales` + `defauts_types.categorie` (groupement par
 * catégorie de défaut). Fallback : agrégation sur `controles_qualite.type_controle`
 * si le join échoue. Retourne [{ type_defaut, count, pct }] triés desc.
 */
export async function parTypeDefaut({ periode = '30j' } = {}) {
  const days = /^(\d+)j$/.test(periode) ? Math.max(1, parseInt(periode, 10)) : 30;
  // 1) Essai sur defauts_signales + defauts_types.categorie
  try {
    const { rows } = await getPool().query(
      `WITH tot AS (
         SELECT COUNT(*)::numeric AS total
           FROM defauts_signales ds
          WHERE ds.date_signalement >= NOW() - ($1 || ' days')::interval
       )
       SELECT dt.categorie::text                                     AS type_defaut,
              COUNT(ds.*)::int                                        AS count,
              CASE WHEN (SELECT total FROM tot) > 0
                   THEN ROUND((COUNT(ds.*) / (SELECT total FROM tot)) * 100, 1)
                   ELSE 0 END                                         AS pct
         FROM defauts_signales ds
         JOIN defauts_types dt ON dt.id_defaut_type = ds.id_defaut_type
        WHERE ds.date_signalement >= NOW() - ($1 || ' days')::interval
        GROUP BY dt.categorie
        ORDER BY count DESC`,
      [String(days)]
    );
    if (rows && rows.length > 0) return rows;
  } catch { /* fall through */ }
  // 2) Fallback : type_controle sur controles_qualite
  try {
    const { rows } = await getPool().query(
      `WITH tot AS (
         SELECT COUNT(*)::numeric AS total
           FROM controles_qualite
          WHERE date_controle >= NOW() - ($1 || ' days')::interval
       )
       SELECT COALESCE(type_controle::text, 'inconnu')               AS type_defaut,
              COUNT(*)::int                                           AS count,
              CASE WHEN (SELECT total FROM tot) > 0
                   THEN ROUND((COUNT(*) / (SELECT total FROM tot)) * 100, 1)
                   ELSE 0 END                                         AS pct
         FROM controles_qualite
        WHERE date_controle >= NOW() - ($1 || ' days')::interval
        GROUP BY type_controle
        ORDER BY count DESC`,
      [String(days)]
    );
    return rows || [];
  } catch {
    return [];
  }
}

/**
 * Phase G1 — Incidents / contrôles bloquants par jour (chart ligne, 30j).
 * CTE generate_series + LEFT JOIN sur controles_qualite (est_bloquant OR
 * decision = 'rework'/'rebut'). Retourne [{ date, incidents }].
 */
export async function incidentsParJour({ jours = 30 } = {}) {
  try {
    const { rows } = await getPool().query(
      `WITH days AS (
         SELECT generate_series(
                  (CURRENT_DATE - ($1::int - 1))::date,
                  CURRENT_DATE::date,
                  INTERVAL '1 day'
                )::date AS d
       )
       SELECT TO_CHAR(d.d, 'YYYY-MM-DD')               AS date,
              COALESCE(COUNT(c.id_ctrl)
                FILTER (WHERE c.est_bloquant = TRUE
                           OR c.decision IN ('rework','rebut')), 0)::int AS incidents
         FROM days d
         LEFT JOIN controles_qualite c
                ON DATE(c.date_controle) = d.d
        GROUP BY d.d
        ORDER BY d.d ASC`,
      [jours]
    );
    return rows || [];
  } catch {
    // Fallback : série vide mais remplie à 0 pour éviter chart vide
    try {
      const out = [];
      const today = new Date();
      for (let i = jours - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        out.push({ date: d.toISOString().slice(0, 10), incidents: 0 });
      }
      return out;
    } catch {
      return [];
    }
  }
}

/**
 * Phase G1 — Radar critères qualité.
 * Essaie d'extraire les clés d'une colonne JSONB `controles_criteres` sur
 * `controles_qualite` (si présente) → moyenne sur 90j. Sinon, utilise
 * `defauts_signales` + `defauts_types.categorie` pour dériver un score
 * inverse (plus de défauts → score plus bas). Fallback : valeurs par défaut
 * raisonnables sur les 5 critères prévus par le dashboard.
 */
export async function radarCriteres() {
  const CRITERES = ['tissage', 'nouage', 'coupe', 'finition', 'emballage'];
  // 1) Essai sur colonne JSONB `controles_criteres`
  try {
    const { rows } = await getPool().query(
      `SELECT key AS subject,
              ROUND(AVG((value)::numeric)::numeric, 2) AS value
         FROM controles_qualite c,
              LATERAL jsonb_each_text(c.controles_criteres)
        WHERE c.date_controle >= NOW() - INTERVAL '90 days'
        GROUP BY key
        ORDER BY key`
    );
    if (rows && rows.length > 0) {
      return rows.map(r => ({ subject: r.subject, value: Number(r.value) || 0 }));
    }
  } catch { /* colonne absente — fall through */ }
  // 2) Essai dérivation depuis defauts_signales (score = 10 - impact normalisé)
  try {
    const { rows } = await getPool().query(
      `SELECT dt.categorie::text AS cat, COUNT(*)::int AS n
         FROM defauts_signales ds
         JOIN defauts_types dt ON dt.id_defaut_type = ds.id_defaut_type
        WHERE ds.date_signalement >= NOW() - INTERVAL '90 days'
        GROUP BY dt.categorie`
    );
    if (rows && rows.length > 0) {
      const max = Math.max(1, ...rows.map(r => Number(r.n) || 0));
      const map = Object.fromEntries(rows.map(r => [String(r.cat), Number(r.n) || 0]));
      return CRITERES.map(sub => {
        // mapping conservatoire : clé exacte sinon 0 défauts → score 10
        const n = Number(map[sub] || 0);
        const score = Math.max(0, Math.min(10, Math.round((10 - (n / max) * 10) * 10) / 10));
        return { subject: sub.charAt(0).toUpperCase() + sub.slice(1), value: score };
      });
    }
  } catch { /* fall through */ }
  // 3) Fallback : valeurs par défaut
  return CRITERES.map(sub => ({
    subject: sub.charAt(0).toUpperCase() + sub.slice(1),
    value: 0,
  }));
}
