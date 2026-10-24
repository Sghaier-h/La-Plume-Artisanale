// model.js — rh/tv-atelier
// Tables `tv_atelier_config` + `tv_atelier_snapshots`.
// Endpoint /tv/:url_token exposé SANS auth (TV murales, pas de login).
import crypto from 'node:crypto';
import { getPool, withTransaction } from '../../_shared/db.js';

const pool  = getPool();
const TABLE = 'tv_atelier_config';
const PK    = 'id_ecran';

const ALLOWED_COLS = new Set([
  'code','libelle','atelier','resolution','orientation',
  'refresh_seconds','widgets_json','theme','url_token','ip_tv',
  'derniere_connexion','actif',
]);

function pick(payload) {
  const out = {};
  for (const [k, v] of Object.entries(payload || {})) {
    if (ALLOWED_COLS.has(k) && v !== undefined) out[k] = v;
  }
  return out;
}

function newUrlToken() {
  // 32 caractères hex (16 octets aléatoires cryptographiquement sûrs).
  return crypto.randomBytes(16).toString('hex');
}

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  const ALLOWED = new Set(['atelier','actif','code']);
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    if (!ALLOWED.has(k)) continue;
    where.push(`${k} = $${i++}`);
    values.push(v);
  }
  const sql = `SELECT * FROM ${TABLE}
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY ${PK} LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1 LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function findByToken(token) {
  const { rows } = await pool.query(
    `SELECT * FROM ${TABLE} WHERE url_token = $1 AND actif = TRUE LIMIT 1`,
    [token]
  );
  return rows[0] || null;
}

export async function insert(payload) {
  const data = pick(payload);
  if (!data.code || !data.libelle || !data.atelier) {
    throw new Error('code, libelle, atelier requis');
  }
  if (!data.url_token) data.url_token = newUrlToken();
  const cols = Object.keys(data);
  const vals = Object.values(data);
  const ph   = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
    vals
  );
  return rows[0];
}

export async function updateById(id, payload) {
  const data = pick(payload);
  const cols = Object.keys(data);
  if (!cols.length) return findById(id);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE ${TABLE} SET ${set} WHERE ${PK} = $${cols.length + 1} RETURNING *`,
    [...Object.values(data), id]
  );
  return rows[0] || null;
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}

export async function derniereConnexion(idEcran, ip) {
  await pool.query(
    `UPDATE ${TABLE}
        SET derniere_connexion = NOW(),
            ip_tv = COALESCE($2::inet, ip_tv)
      WHERE ${PK} = $1`,
    [idEcran, ip || null]
  );
}

export async function dernierSnapshot(idEcran) {
  const { rows } = await pool.query(
    `SELECT * FROM tv_atelier_snapshots
      WHERE id_ecran = $1
      ORDER BY date_snapshot DESC
      LIMIT 1`,
    [idEcran]
  );
  return rows[0] || null;
}

/**
 * Calcule et insère un nouveau snapshot pour un écran.
 * Sources :
 *   - Top 5 employés semaine en cours (ISO week) : SUM(score_global) par
 *     employé filtré atelier
 *   - Pointages du jour : ratio heures_travaillees / heures_ideal (hardcode 8h)
 *   - controles_qualite du jour : SUM(qte_rebut) → perte_dechet_kg
 *     + SUM(qte_1er_choix), SUM(qte_2e_choix)
 */
export async function genererSnapshot(idEcran) {
  return withTransaction(async (client) => {
    const cfg = await client.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1`, [idEcran]);
    if (!cfg.rows[0]) throw new Error('Écran introuvable');
    const ecran = cfg.rows[0];

    const today = new Date();
    const yyyy_mm_dd = today.toISOString().slice(0, 10);

    // Top 5 semaine (ISO week courante).
    const topRes = await client.query(
      `SELECT s.id_employe,
              e.matricule, e.nom, e.prenom,
              ROUND(SUM(s.score_global)::numeric, 3) AS score_semaine
         FROM primes_scores_journaliers s
         LEFT JOIN employes e ON e.id_employe = s.id_employe
        WHERE s.atelier = $1
          AND EXTRACT(ISOYEAR FROM s.date_journee) = EXTRACT(ISOYEAR FROM CURRENT_DATE)
          AND EXTRACT(WEEK    FROM s.date_journee) = EXTRACT(WEEK    FROM CURRENT_DATE)
        GROUP BY s.id_employe, e.matricule, e.nom, e.prenom
        ORDER BY score_semaine DESC NULLS LAST
        LIMIT 5`,
      [ecran.atelier]
    );

    // KPI journée : pointages
    const ptgRes = await client.query(
      `SELECT COUNT(*)::int AS nb_presents,
              COALESCE(SUM(heures_travaillees), 0)::numeric(10,2) AS h_totales
         FROM pointages
        WHERE date_pointage = $1`,
      [yyyy_mm_dd]
    );
    const nb_presents = ptgRes.rows[0]?.nb_presents || 0;
    const h_totales   = Number(ptgRes.rows[0]?.h_totales || 0);
    // Horaire idéal = 100% (référence contractuelle) ; horaire réel = h_totales / (nb_presents * 8).
    const horaire_ideal_pct = 100;
    const horaire_reel_pct = nb_presents > 0
      ? Number(((h_totales / (nb_presents * 8)) * 100).toFixed(3))
      : 0;

    // Qualité du jour
    const qRes = await client.query(
      `SELECT COALESCE(SUM(qte_1er_choix), 0)::numeric AS q1,
              COALESCE(SUM(qte_2e_choix),  0)::numeric AS q2,
              COALESCE(SUM(qte_rebut),     0)::numeric AS qr
         FROM controles_qualite
        WHERE date_controle::date = $1`,
      [yyyy_mm_dd]
    );
    const q1 = Number(qRes.rows[0]?.q1 || 0);
    const q2 = Number(qRes.rows[0]?.q2 || 0);
    const qr = Number(qRes.rows[0]?.qr || 0);

    // Valorisation perte déchet : ratio par défaut 15 DT/kg (TODO : brancher
    // sur produits.prix_moyen ou params.perte_dechet_dt_per_kg).
    const PRIX_KG_DEFAULT = Number(process.env.PERTE_DECHET_DT_PAR_KG || 15);
    const perte_dechet_kg = qr;
    const perte_dechet_dt = Number((qr * PRIX_KG_DEFAULT).toFixed(3));

    const kpi = {
      atelier: ecran.atelier,
      nb_presents,
      heures_totales_jour: h_totales,
      cible_horaire_h: nb_presents * 8,
      taux_2e_choix_pct: (q1 + q2) > 0 ? Number(((q2 / (q1 + q2)) * 100).toFixed(2)) : 0,
      genere_a: new Date().toISOString(),
    };

    const ins = await client.query(
      `INSERT INTO tv_atelier_snapshots
         (id_ecran, horaire_ideal_pct, horaire_reel_pct, top5_json,
          perte_dechet_kg, perte_dechet_dt, nb_2eme_choix, nb_1er_choix, kpi_json)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9::jsonb)
       RETURNING *`,
      [
        idEcran,
        horaire_ideal_pct, horaire_reel_pct,
        JSON.stringify(topRes.rows),
        perte_dechet_kg, perte_dechet_dt,
        Math.round(q2), Math.round(q1),
        JSON.stringify(kpi),
      ]
    );

    // Purge (garder 30 snapshots max par écran pour éviter que la table gonfle).
    await client.query(
      `DELETE FROM tv_atelier_snapshots
        WHERE id_ecran = $1
          AND id_snapshot NOT IN (
            SELECT id_snapshot FROM tv_atelier_snapshots
             WHERE id_ecran = $1
             ORDER BY date_snapshot DESC
             LIMIT 30
          )`,
      [idEcran]
    );

    return ins.rows[0];
  });
}
