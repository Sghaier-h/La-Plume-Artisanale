/**
 * Contrôleur Qualité Avancée — La Plume Artisanale
 *
 * Pont vers les vraies tables métier :
 *   - controle_premiere_piece      (contrôles début de production)
 *   - non_conformites              (NC détectées, traitement, résolution)
 *   - declarations_2eme_choix      (déclassements qualité)
 *
 * La table `qualite_avance` d'origine reste un stub — ce module s'appuie
 * sur les tables réelles listées ci-dessus pour tout l'IO.
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try { _io = (await import('../../../src/server.js')).io; } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

const pad3 = (n) => String(n).padStart(3, '0');
const ymd = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
};

const nextNumeroNc = async () => {
  const r = await pool.query(
    `SELECT COUNT(*)::int AS c FROM non_conformites WHERE DATE(date_detection) = CURRENT_DATE`
  );
  return `NC-${ymd()}-${pad3((r.rows[0].c || 0) + 1)}`;
};

const nextNumeroDeclaration = async () => {
  const r = await pool.query(
    `SELECT COUNT(*)::int AS c FROM declarations_2eme_choix WHERE DATE(date_declaration) = CURRENT_DATE`
  );
  return `DEC-${ymd()}-${pad3((r.rows[0].c || 0) + 1)}`;
};

// ─── Contrôles première pièce ─────────────────────────────────────
const CONTROLE_SELECT = `
  SELECT
    cpp.*,
    cpp.id_controle AS id,
    m.numero_machine,
    of_.numero_of,
    e.prenom || ' ' || e.nom AS operateur_nom
  FROM controle_premiere_piece cpp
  LEFT JOIN machines m           ON cpp.id_machine   = m.id_machine
  LEFT JOIN ordres_fabrication of_ ON cpp.id_of      = of_.id_of
  LEFT JOIN equipe_fabrication e ON cpp.id_operateur = e.id_operateur
`;

export const getControles = async (req, res) => {
  try {
    const { id_machine, id_of, conformite, date_debut, date_fin, limit = 200 } = req.query;
    const params = [];
    const where = [];
    if (id_machine) { params.push(id_machine); where.push(`cpp.id_machine = $${params.length}`); }
    if (id_of)      { params.push(id_of);      where.push(`cpp.id_of = $${params.length}`); }
    if (conformite) { params.push(conformite); where.push(`cpp.conformite = $${params.length}`); }
    if (date_debut) { params.push(date_debut); where.push(`cpp.date_controle >= $${params.length}`); }
    if (date_fin)   { params.push(date_fin);   where.push(`cpp.date_controle <= $${params.length}`); }
    params.push(parseInt(limit, 10) || 200);
    const sql = `
      ${CONTROLE_SELECT}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY cpp.date_controle DESC NULLS LAST, cpp.id_controle DESC
      LIMIT $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getControles');
  }
};

export const getControleById = async (req, res) => {
  try {
    const r = await pool.query(`${CONTROLE_SELECT} WHERE cpp.id_controle = $1 LIMIT 1`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Contrôle introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getControleById');
  }
};

export const createControle = async (req, res) => {
  try {
    const userId = authorId(req);
    const {
      id_machine, id_of, poids_mesure, poids_attendu,
      largeur_mesure, largeur_attendue,
      densite_trame, densite_chaine, aspect_visuel, conformite, observations,
      actions_correctives, id_operateur,
    } = req.body || {};

    const ecart_poids = (poids_mesure != null && poids_attendu != null)
      ? Number(poids_mesure) - Number(poids_attendu) : null;
    const ecart_largeur = (largeur_mesure != null && largeur_attendue != null)
      ? Number(largeur_mesure) - Number(largeur_attendue) : null;

    const r = await pool.query(
      `INSERT INTO controle_premiere_piece (
         id_machine, id_of, date_controle, id_operateur,
         poids_mesure, poids_attendu, ecart_poids,
         largeur_mesure, largeur_attendue, ecart_largeur,
         densite_trame, densite_chaine, aspect_visuel, conformite,
         observations, actions_correctives, created_by
       ) VALUES ($1,$2,NOW(),$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *, id_controle AS id`,
      [
        id_machine || null, id_of || null, id_operateur || userId || null,
        poids_mesure ?? null, poids_attendu ?? null, ecart_poids,
        largeur_mesure ?? null, largeur_attendue ?? null, ecart_largeur,
        densite_trame ?? null, densite_chaine ?? null,
        aspect_visuel ?? null, conformite ?? null,
        observations ?? null, actions_correctives ?? null, userId,
      ]
    );
    return sendSuccess(res, r.rows[0], 'Contrôle créé', 201);
  } catch (error) {
    return handleError(res, error, 'createControle');
  }
};

export const updateControle = async (req, res) => {
  try {
    const userId = authorId(req);
    const data = req.body || {};
    if (data.poids_mesure != null && data.poids_attendu != null) {
      data.ecart_poids = Number(data.poids_mesure) - Number(data.poids_attendu);
    }
    if (data.largeur_mesure != null && data.largeur_attendue != null) {
      data.ecart_largeur = Number(data.largeur_mesure) - Number(data.largeur_attendue);
    }
    const excluded = ['id_controle', 'id', 'created_at', 'created_by', 'date_controle'];
    const fields = Object.keys(data).filter((f) => !excluded.includes(f));
    if (!fields.length) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => data[f]);
    values.push(userId, req.params.id);
    const r = await pool.query(
      `UPDATE controle_premiere_piece SET ${set}, updated_by = $${values.length - 1}
       WHERE id_controle = $${values.length} RETURNING *, id_controle AS id`,
      values
    );
    if (!r.rows[0]) return sendError(res, 'Contrôle introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Contrôle mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateControle');
  }
};

export const deleteControle = async (req, res) => {
  try {
    const r = await pool.query(
      `DELETE FROM controle_premiere_piece WHERE id_controle = $1 RETURNING id_controle`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Contrôle introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_controle }, 'Contrôle supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteControle');
  }
};

// ─── Non-conformités ──────────────────────────────────────────────
const NC_SELECT = `
  SELECT
    nc.*,
    nc.id_non_conformite AS id,
    m.numero_machine,
    of_.numero_of,
    e.prenom || ' ' || e.nom AS declare_par_nom
  FROM non_conformites nc
  LEFT JOIN machines m             ON nc.id_machine   = m.id_machine
  LEFT JOIN ordres_fabrication of_ ON nc.id_of        = of_.id_of
  LEFT JOIN equipe_fabrication e   ON nc.declare_par  = e.id_operateur
`;

export const getNonConformites = async (req, res) => {
  try {
    const { statut, priorite, id_of, id_machine, date_debut, date_fin, limit = 200 } = req.query;
    const params = [];
    const where = [];
    if (statut)     { params.push(statut);     where.push(`nc.statut = $${params.length}`); }
    if (priorite)   { params.push(priorite);   where.push(`nc.priorite = $${params.length}`); }
    if (id_of)      { params.push(id_of);      where.push(`nc.id_of = $${params.length}`); }
    if (id_machine) { params.push(id_machine); where.push(`nc.id_machine = $${params.length}`); }
    if (date_debut) { params.push(date_debut); where.push(`nc.date_detection >= $${params.length}`); }
    if (date_fin)   { params.push(date_fin);   where.push(`nc.date_detection <= $${params.length}`); }
    params.push(parseInt(limit, 10) || 200);
    const sql = `
      ${NC_SELECT}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY nc.date_detection DESC NULLS LAST, nc.id_non_conformite DESC
      LIMIT $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getNonConformites');
  }
};

export const getNonConformiteById = async (req, res) => {
  try {
    const r = await pool.query(`${NC_SELECT} WHERE nc.id_non_conformite = $1 LIMIT 1`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Non-conformité introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getNonConformiteById');
  }
};

export const createNonConformite = async (req, res) => {
  try {
    const userId = authorId(req);
    const {
      numero_nc, id_suivi, id_of, id_machine, id_type_nc,
      description_probleme, quantite_affectee, valeur_perte,
      declare_par, priorite, action_immediate, observations,
    } = req.body || {};

    const numero = numero_nc || (await nextNumeroNc());

    const r = await pool.query(
      `INSERT INTO non_conformites (
         numero_nc, date_detection, id_suivi, id_of, id_machine, id_type_nc,
         description_probleme, quantite_affectee, valeur_perte, declare_par,
         priorite, statut, action_immediate, observations, created_by
       ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ouverte', $11, $12, $13)
       RETURNING *, id_non_conformite AS id`,
      [
        numero, id_suivi || null, id_of || null, id_machine || null, id_type_nc || null,
        description_probleme || null, quantite_affectee ?? null, valeur_perte ?? null,
        declare_par || userId || null, priorite || 'normale',
        action_immediate || null, observations || null, userId,
      ]
    );
    const row = r.rows[0];
    try {
      const io = await getIo();
      if (io) io.emit('qualite:nc:new', row);
    } catch {}
    return sendSuccess(res, row, 'Non-conformité créée', 201);
  } catch (error) {
    return handleError(res, error, 'createNonConformite');
  }
};

export const updateNonConformite = async (req, res) => {
  try {
    const userId = authorId(req);
    const data = req.body || {};
    const excluded = ['id_non_conformite', 'id', 'created_at', 'created_by', 'numero_nc'];
    const fields = Object.keys(data).filter((f) => !excluded.includes(f));
    if (!fields.length) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => data[f]);
    values.push(userId, req.params.id);
    const r = await pool.query(
      `UPDATE non_conformites SET ${set}, updated_by = $${values.length - 1}
       WHERE id_non_conformite = $${values.length} RETURNING *, id_non_conformite AS id`,
      values
    );
    if (!r.rows[0]) return sendError(res, 'Non-conformité introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Non-conformité mise à jour');
  } catch (error) {
    return handleError(res, error, 'updateNonConformite');
  }
};

export const traiterNonConformite = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE non_conformites
         SET statut = 'en_traitement',
             date_debut_traitement = NOW(),
             traite_par = COALESCE(traite_par, $2),
             updated_by = $2
       WHERE id_non_conformite = $1
       RETURNING *, id_non_conformite AS id`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Non-conformité introuvable', 404);
    try {
      const io = await getIo();
      if (io) io.emit('qualite:nc:updated', r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0], 'Non-conformité prise en charge');
  } catch (error) {
    return handleError(res, error, 'traiterNonConformite');
  }
};

export const resoudreNonConformite = async (req, res) => {
  try {
    const userId = authorId(req);
    const { cause_racine, action_corrective, action_preventive, decision_qualite,
            quantite_acceptee, quantite_2eme_choix, quantite_rebut, cout_resolution } = req.body || {};
    const r = await pool.query(
      `UPDATE non_conformites
         SET statut = 'resolue',
             date_resolution = NOW(),
             duree_resolution = CASE
               WHEN date_debut_traitement IS NOT NULL
               THEN EXTRACT(EPOCH FROM (NOW() - date_debut_traitement)) / 60
               ELSE NULL END,
             cause_racine = COALESCE($2, cause_racine),
             action_corrective = COALESCE($3, action_corrective),
             action_preventive = COALESCE($4, action_preventive),
             decision_qualite = COALESCE($5, decision_qualite),
             quantite_acceptee = COALESCE($6, quantite_acceptee),
             quantite_2eme_choix = COALESCE($7, quantite_2eme_choix),
             quantite_rebut = COALESCE($8, quantite_rebut),
             cout_resolution = COALESCE($9, cout_resolution),
             updated_by = $10
       WHERE id_non_conformite = $1
       RETURNING *, id_non_conformite AS id`,
      [req.params.id, cause_racine ?? null, action_corrective ?? null, action_preventive ?? null,
       decision_qualite ?? null, quantite_acceptee ?? null, quantite_2eme_choix ?? null,
       quantite_rebut ?? null, cout_resolution ?? null, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Non-conformité introuvable', 404);
    try {
      const io = await getIo();
      if (io) io.emit('qualite:nc:resolved', r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0], 'Non-conformité résolue');
  } catch (error) {
    return handleError(res, error, 'resoudreNonConformite');
  }
};

export const validerNonConformite = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE non_conformites
         SET statut = 'validee', valide_par = $2, date_validation = NOW(), updated_by = $2
       WHERE id_non_conformite = $1
       RETURNING *, id_non_conformite AS id`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Non-conformité introuvable', 404);
    try {
      const io = await getIo();
      if (io) io.emit('qualite:nc:validated', r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0], 'Non-conformité validée');
  } catch (error) {
    return handleError(res, error, 'validerNonConformite');
  }
};

// ─── Déclarations 2ème choix ──────────────────────────────────────
const DEC_SELECT = `
  SELECT
    d.*,
    d.id_declaration AS id,
    m.numero_machine,
    of_.numero_of,
    a.designation AS article_designation,
    a.code_article
  FROM declarations_2eme_choix d
  LEFT JOIN machines m             ON d.id_machine = m.id_machine
  LEFT JOIN ordres_fabrication of_ ON d.id_of      = of_.id_of
  LEFT JOIN articles_catalogue a   ON d.id_article = a.id_article
`;

export const getDeclarations = async (req, res) => {
  try {
    const { statut_validation, origine, id_of, id_machine, date_debut, date_fin, limit = 200 } = req.query;
    const params = [];
    const where = [];
    if (statut_validation) { params.push(statut_validation); where.push(`d.statut_validation = $${params.length}`); }
    if (origine)   { params.push(origine);   where.push(`d.origine = $${params.length}`); }
    if (id_of)     { params.push(id_of);     where.push(`d.id_of = $${params.length}`); }
    if (id_machine){ params.push(id_machine);where.push(`d.id_machine = $${params.length}`); }
    if (date_debut){ params.push(date_debut);where.push(`d.date_declaration >= $${params.length}`); }
    if (date_fin)  { params.push(date_fin);  where.push(`d.date_declaration <= $${params.length}`); }
    params.push(parseInt(limit, 10) || 200);
    const sql = `
      ${DEC_SELECT}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY d.date_declaration DESC NULLS LAST, d.id_declaration DESC
      LIMIT $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getDeclarations');
  }
};

export const createDeclaration = async (req, res) => {
  try {
    const userId = authorId(req);
    const data = req.body || {};
    const numero = data.numero_declaration || (await nextNumeroDeclaration());
    const excluded = ['id_declaration', 'id', 'created_at', 'created_by', 'date_declaration', 'numero_declaration'];
    const fields = Object.keys(data).filter((f) => !excluded.includes(f) && data[f] !== undefined);

    const cols = ['numero_declaration', 'date_declaration', ...fields, 'created_by'];
    const vals = [numero, new Date(), ...fields.map((f) => data[f]), userId];
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    const r = await pool.query(
      `INSERT INTO declarations_2eme_choix (${cols.join(', ')})
       VALUES (${placeholders})
       RETURNING *, id_declaration AS id`,
      vals
    );
    return sendSuccess(res, r.rows[0], 'Déclaration créée', 201);
  } catch (error) {
    return handleError(res, error, 'createDeclaration');
  }
};

// ─── Stats globales ───────────────────────────────────────────────
export const getStatsGlobal = async (_req, res) => {
  try {
    const [controles, nc, dec] = await Promise.all([
      pool.query(`SELECT
          COUNT(*)::int AS controles_total,
          COALESCE(ROUND(100.0 * SUM(CASE WHEN conformite = true THEN 1 ELSE 0 END)::numeric
                        / NULLIF(COUNT(*), 0), 2), 0) AS conformite_pct
        FROM controle_premiere_piece`),
      pool.query(`SELECT
          COUNT(*) FILTER (WHERE statut IN ('ouverte','en_traitement'))::int AS nc_ouvertes,
          COUNT(*) FILTER (WHERE statut IN ('resolue','validee'))::int         AS nc_resolues
        FROM non_conformites`),
      pool.query(`SELECT COUNT(*)::int AS declarations_2eme_choix_total FROM declarations_2eme_choix`),
    ]);
    const perte = await pool.query(
      `SELECT COALESCE(SUM(COALESCE(valeur_perte, 0)), 0)::numeric AS v FROM non_conformites`
    );
    return sendSuccess(res, {
      controles_total: controles.rows[0].controles_total,
      conformite_pct: Number(controles.rows[0].conformite_pct || 0),
      nc_ouvertes: nc.rows[0].nc_ouvertes,
      nc_resolues: nc.rows[0].nc_resolues,
      declarations_2eme_choix_total: dec.rows[0].declarations_2eme_choix_total,
      valeur_perte_totale: Number(perte.rows[0].v || 0),
    });
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── Exports rétro-compat (anciens noms attendus par le loader) ────
export const getQualiteAvance = getControles;
export const getQualiteAvanceById = getControleById;
export const createQualiteAvance = createControle;
export const updateQualiteAvance = updateControle;
export const deleteQualiteAvance = deleteControle;
