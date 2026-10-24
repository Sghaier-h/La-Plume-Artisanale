// model.js — rh/avertissements
// Avertissements automatiques du personnel (§11bis + §14ter.17c).
import { getPool } from '../../_shared/db.js';
const pool = getPool();

const TABLE = 'avertissements_rh';
const PK    = 'id_avertissement';

export async function findAll({ limit = 200, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    if (k === 'date_debut') { where.push(`a.date_envoi >= $${i++}`); values.push(v); continue; }
    if (k === 'date_fin')   { where.push(`a.date_envoi <= $${i++}`); values.push(v); continue; }
    where.push(`a.${k} = $${i++}`);
    values.push(v);
  }
  const sql = `
    SELECT a.*, e.matricule, e.nom, e.prenom
      FROM ${TABLE} a
      JOIN employes e ON e.id_employe = a.id_employe
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY a.date_envoi DESC, a.${PK} DESC
     LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT a.*, e.matricule, e.nom, e.prenom
       FROM ${TABLE} a
       JOIN employes e ON e.id_employe = a.id_employe
      WHERE a.${PK} = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function findForEmploye(idEmploye, { limit = 100 } = {}) {
  const { rows } = await pool.query(
    `SELECT a.*, e.matricule, e.nom, e.prenom
       FROM ${TABLE} a
       JOIN employes e ON e.id_employe = a.id_employe
      WHERE a.id_employe = $1
      ORDER BY a.date_envoi DESC, a.${PK} DESC
      LIMIT $2`,
    [idEmploye, limit]
  );
  return rows;
}

export async function kpi(filters = {}) {
  const where = [];
  const values = [];
  let i = 1;
  if (filters.id_societe) { where.push(`id_societe = $${i++}`); values.push(filters.id_societe); }
  const sql = `
    SELECT niveau,
           COUNT(*)::int AS total,
           SUM(CASE WHEN statut = 'nouveau' THEN 1 ELSE 0 END)::int AS non_lus,
           SUM(CASE WHEN statut = 'contestee' THEN 1 ELSE 0 END)::int AS contestes
      FROM ${TABLE}
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     GROUP BY niveau`;
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function insert(payload) {
  const cols = [
    'id_employe','type','niveau','message',
    'periode_debut','periode_fin','auto_genere','genere_par',
    'statut','id_societe','id_document_archive',
  ];
  const vals = cols.map((c) => payload[c] ?? null);
  const { rows } = await pool.query(
    `INSERT INTO ${TABLE} (${cols.join(',')})
     VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')})
     RETURNING *`,
    vals
  );
  return rows[0];
}

export async function markRead(id) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET statut = CASE WHEN statut = 'nouveau' THEN 'lu' ELSE statut END,
            date_lu = COALESCE(date_lu, NOW()),
            updated_at = NOW()
      WHERE ${PK} = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

export async function accuserReception(id, { signature_svg }) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET statut = 'traitee',
            signature_svg = $1,
            date_accuse_reception = NOW(),
            date_lu = COALESCE(date_lu, NOW()),
            updated_at = NOW()
      WHERE ${PK} = $2 RETURNING *`,
    [signature_svg || null, id]
  );
  return rows[0] || null;
}

export async function contester(id, { raison }) {
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET statut = 'contestee',
            raison_contestation = $1,
            date_contestation = NOW(),
            date_lu = COALESCE(date_lu, NOW()),
            updated_at = NOW()
      WHERE ${PK} = $2 RETURNING *`,
    [raison || null, id]
  );
  return rows[0] || null;
}

export async function listReglesActives() {
  const { rows } = await pool.query(
    `SELECT * FROM avertissements_regles WHERE actif = TRUE ORDER BY code ASC`
  );
  return rows;
}

/**
 * Scanner idempotent : parcourt les règles actives et crée des avertissements
 * pour les employés dépassant les seuils sur `periode_jours`. Évite les doublons
 * en vérifiant qu'aucun avertissement du même type n'a été envoyé dans la fenêtre
 * `periode_jours`.
 */
export async function runScan({ now = new Date() } = {}) {
  const regles = await listReglesActives();
  const created = [];

  for (const regle of regles) {
    const periode = regle.periode_jours || 30;
    const seuil = regle.seuil_valeur || 5;
    const niveau = regle.niveau_declenche || 'attention';
    const code = regle.code;
    const dateDebut = new Date(now.getTime() - periode * 86400_000);

    let candidats = [];

    if (code === 'retard_repete') {
      // Pointages entrée > 08:00 locale sur `periode_jours`
      const { rows } = await pool.query(
        `SELECT id_employe, COUNT(*)::int AS nb
           FROM pointages_evenements
          WHERE type_evt = 'entree'
            AND date_evt >= $1
            AND date_evt <= $2
            AND EXTRACT(HOUR FROM date_evt) >= 8
            AND EXTRACT(MINUTE FROM date_evt) > 0
          GROUP BY id_employe
         HAVING COUNT(*) >= $3`,
        [dateDebut, now, seuil]
      );
      candidats = rows.map((r) => ({ id_employe: r.id_employe, nb: r.nb }));
    } else if (code === 'absence_non_just') {
      // Jours planifiés sans pointage « entree » sur `periode_jours`.
      const { rows } = await pool.query(
        `SELECT p.id_employe, COUNT(*)::int AS nb
           FROM planning_employes p
      LEFT JOIN pointages_evenements e
             ON e.id_employe = p.id_employe
            AND DATE(e.date_evt) = p.date_planning
            AND e.type_evt = 'entree'
          WHERE p.date_planning BETWEEN $1 AND $2
            AND p.statut IN ('planifie','confirme')
            AND e.id_evt IS NULL
          GROUP BY p.id_employe
         HAVING COUNT(*) >= $3`,
        [dateDebut.toISOString().slice(0, 10), now.toISOString().slice(0, 10), seuil]
      );
      candidats = rows.map((r) => ({ id_employe: r.id_employe, nb: r.nb }));
    } else {
      // Les autres règles ne sont pas calculables depuis pointages seuls.
      continue;
    }

    for (const c of candidats) {
      // Dédup : y a-t-il déjà un avertissement du même type dans la fenêtre ?
      const { rows: existing } = await pool.query(
        `SELECT 1 FROM ${TABLE}
          WHERE id_employe = $1 AND type = $2
            AND date_envoi >= $3
          LIMIT 1`,
        [c.id_employe, code, dateDebut]
      );
      if (existing.length) continue;

      const template = regle.message_template
        || `Détection automatique : ${c.nb} occurrence(s) de ${regle.nom} sur ${periode} jours.`;
      const message = template
        .replace('{nb}', String(c.nb))
        .replace('{periode}', String(periode))
        .replace('{seuil}', String(seuil));

      const inserted = await insert({
        id_employe: c.id_employe,
        type: code,
        niveau,
        message,
        periode_debut: dateDebut.toISOString().slice(0, 10),
        periode_fin:   now.toISOString().slice(0, 10),
        auto_genere: true,
        genere_par: 'scanner',
        statut: 'nouveau',
        id_societe: regle.id_societe || null,
      });
      created.push(inserted);
    }
  }

  return { created_count: created.length, created };
}
