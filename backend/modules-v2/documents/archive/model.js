// model.js — documents/archive (schéma 37)
// Archive centrale polymorphique : documents_archive + documents_liaisons
import { getPool, withTransaction } from '../../_shared/db.js';
const pool = getPool();

export async function search({ q, type, periode, categorie, tags, limit = 50, offset = 0 } = {}) {
  const where = [`statut IN ('valide','archive')`];
  const vals = []; let i = 1;
  if (q) {
    where.push(`texte_recherche @@ plainto_tsquery('simple', $${i++})`);
    vals.push(q);
  }
  if (type)      { where.push(`type_document = $${i++}`); vals.push(type); }
  if (periode)   { where.push(`periode_fiscale = $${i++}`); vals.push(periode); }
  if (categorie) { where.push(`categorie = $${i++}`); vals.push(categorie); }
  if (tags) {
    const arr = Array.isArray(tags) ? tags : String(tags).split(',').map(s => s.trim()).filter(Boolean);
    if (arr.length) { where.push(`tags && $${i++}::text[]`); vals.push(arr); }
  }
  const sql = `
    SELECT id_document, code_document, titre, description, type_document,
           categorie, tags, langue, filename_original, mimetype, taille_octets,
           date_document, periode_fiscale, id_societe, statut, confidentialite,
           cree_par, date_creation, date_modification
      FROM documents_archive
     WHERE ${where.join(' AND ')}
     ORDER BY date_modification DESC
     LIMIT $${i++} OFFSET $${i}
  `;
  vals.push(limit, offset);
  const { rows } = await pool.query(sql, vals);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM documents_archive WHERE id_document = $1', [id]);
  if (!rows[0]) return null;
  const { rows: liaisons } = await pool.query(
    'SELECT * FROM documents_liaisons WHERE id_document = $1 ORDER BY date_liaison DESC',
    [id],
  );
  return { ...rows[0], liaisons };
}

export async function create(body, user) {
  const { rows } = await pool.query(
    `INSERT INTO documents_archive
       (code_document, titre, description, type_document, categorie, tags, langue,
        filename_original, filename_stored, mimetype, taille_octets, checksum_sha256,
        storage_backend, path_relatif, signature_tactile_svg, ocr_text, ocr_lang,
        date_document, periode_fiscale, id_societe, statut, confidentialite, cree_par)
     VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'fr'),
             $8,$9,$10,$11,$12,
             COALESCE($13,'local'),$14,$15,$16,$17,
             $18,$19,$20,
             COALESCE($21,'valide'),COALESCE($22,'interne'),$23)
     RETURNING *`,
    [body.code_document || null, body.titre, body.description || null,
     body.type_document, body.categorie || null, body.tags || null, body.langue,
     body.filename_original, body.filename_stored, body.mimetype || null,
     body.taille_octets || null, body.checksum_sha256 || null,
     body.storage_backend, body.path_relatif, body.signature_tactile_svg || null,
     body.ocr_text || null, body.ocr_lang || null,
     body.date_document || null, body.periode_fiscale || null,
     body.id_societe || null, body.statut, body.confidentialite,
     user?.id_user || null],
  );
  return rows[0];
}

/** Attache un document à une entité métier (polymorphique). */
export async function attachTo({ id_document, entite_type, entite_id, role_liaison }, user) {
  const { rows } = await pool.query(
    `INSERT INTO documents_liaisons
       (id_document, entite_type, entite_id, role_liaison, cree_par)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id_document, entite_type, entite_id, role_liaison) DO NOTHING
     RETURNING *`,
    [id_document, entite_type, entite_id, role_liaison || 'justificatif', user?.id_user || null],
  );
  return rows[0] || null;
}

export async function detach({ id_document, entite_type, entite_id, role_liaison }) {
  const { rowCount } = await pool.query(
    `DELETE FROM documents_liaisons
      WHERE id_document = $1 AND entite_type = $2 AND entite_id = $3
        AND (role_liaison = $4 OR ($4 IS NULL AND role_liaison IS NULL))`,
    [id_document, entite_type, entite_id, role_liaison || null],
  );
  return { deleted: rowCount };
}

export async function listForEntity({ entite_type, entite_id }) {
  const { rows } = await pool.query(
    `SELECT d.*, l.role_liaison, l.date_liaison
       FROM documents_liaisons l
       JOIN documents_archive  d ON d.id_document = l.id_document
      WHERE l.entite_type = $1 AND l.entite_id = $2
      ORDER BY l.date_liaison DESC`,
    [entite_type, entite_id],
  );
  return rows;
}

export async function softDelete(id, user) {
  const { rows } = await pool.query(
    `UPDATE documents_archive
        SET statut = 'supprime', modifie_par = $2, date_modification = NOW()
      WHERE id_document = $1 RETURNING *`,
    [id, user?.id_user || null],
  );
  return rows[0] || null;
}
