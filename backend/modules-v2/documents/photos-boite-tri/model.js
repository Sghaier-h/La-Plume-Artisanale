// model.js — documents/photos-boite-tri (schéma 40 · §14quater.4)
//
// Table `photos_boite_tri` : photos justificatives reçues via Teams / WhatsApp
// / Email / upload direct, en attente de rattachement à une pièce comptable.
// Chaque ligne pointe sur un enregistrement central `documents_archive`
// (dédup SHA-256). L'upload physique (fichier sur disque) est délégué à
// la couche `documents_archive`.

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { getPool, withTransaction } from '../../_shared/db.js';

const pool = getPool();

const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
const PHOTOS_SUBDIR = 'photos-boite-tri';

/**
 * Enregistre un fichier binaire dans le stockage local (par SHA-256), insère
 * ou réutilise une ligne `documents_archive`, puis crée une entrée dans
 * `photos_boite_tri`. Opération atomique.
 *
 * @param {object} input
 * @param {Buffer} input.buffer                – contenu binaire
 * @param {string} input.filename_original     – nom original (ex: receipt.jpg)
 * @param {string} input.mimetype              – mimetype du fichier
 * @param {string} input.source                – 'teams'|'whatsapp'|'email'|'upload_direct'
 * @param {string} [input.expediteur_identifiant]
 * @param {string} [input.expediteur_nom]
 * @param {string} [input.expediteur_message]
 * @param {object} [input.metadata]            – payload JSON brut
 * @param {string} [input.titre]               – titre lisible (fallback)
 */
export async function ingestPhoto(input) {
  const {
    buffer,
    filename_original,
    mimetype,
    source,
    expediteur_identifiant = null,
    expediteur_nom = null,
    expediteur_message = null,
    metadata = {},
    titre = null,
  } = input;

  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('ingestPhoto: `buffer` requis (Buffer)');
  }
  if (!filename_original) throw new Error('ingestPhoto: `filename_original` requis');
  if (!source) throw new Error('ingestPhoto: `source` requis');

  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  const ext = path.extname(filename_original) || mimeToExt(mimetype) || '';
  const filename_stored = `${checksum}${ext}`;
  const path_relatif = path.posix.join(PHOTOS_SUBDIR, filename_stored);

  return withTransaction(async (client) => {
    // 1) Déduplication : si un documents_archive partage ce checksum, on
    //    réutilise son id_document, sinon on insère.
    const { rows: existing } = await client.query(
      `SELECT id_document, filename_stored, path_relatif
         FROM documents_archive
        WHERE checksum_sha256 = $1
        LIMIT 1`,
      [checksum],
    );

    let id_document;
    if (existing[0]) {
      id_document = existing[0].id_document;
    } else {
      // 2) Écriture physique du fichier (hors transaction DB mais avant commit).
      const absDir = path.join(UPLOAD_ROOT, PHOTOS_SUBDIR);
      await fs.mkdir(absDir, { recursive: true });
      await fs.writeFile(path.join(UPLOAD_ROOT, path_relatif), buffer);

      const titreFinal = titre
        || `Photo justificative ${source} ${new Date().toISOString().slice(0, 10)}`;

      const { rows: inserted } = await client.query(
        `INSERT INTO documents_archive
           (titre, type_document, filename_original, filename_stored, mimetype,
            taille_octets, checksum_sha256, storage_backend, path_relatif,
            langue, statut, confidentialite)
         VALUES ($1, 'photo_piece', $2, $3, $4, $5, $6, 'local', $7,
                 'fr', 'valide', 'interne')
         RETURNING id_document`,
        [
          titreFinal,
          filename_original,
          filename_stored,
          mimetype || 'application/octet-stream',
          buffer.length,
          checksum,
          path_relatif,
        ],
      );
      id_document = inserted[0].id_document;
    }

    // 3) Ligne boîte à trier
    const { rows: pbtRows } = await client.query(
      `INSERT INTO photos_boite_tri
         (id_document_archive, source, expediteur_identifiant, expediteur_nom,
          expediteur_message, statut, metadata)
       VALUES ($1,$2,$3,$4,$5,'non_traite',$6::jsonb)
       RETURNING *`,
      [
        id_document,
        source,
        expediteur_identifiant,
        expediteur_nom,
        expediteur_message,
        JSON.stringify(metadata || {}),
      ],
    );
    return { ...pbtRows[0], id_document_archive: id_document, checksum };
  });
}

/**
 * Liste les photos de la boîte à trier avec filtres optionnels.
 */
export async function list({
  statut,
  source,
  expediteur,
  date_from,
  date_to,
  limit = 100,
  offset = 0,
} = {}) {
  const where = [];
  const vals = [];
  let i = 1;

  if (statut)     { where.push(`statut = $${i++}`);     vals.push(statut); }
  else            { where.push(`statut IN ('non_traite','en_cours')`); }
  if (source)     { where.push(`source = $${i++}`);     vals.push(source); }
  if (expediteur) { where.push(`expediteur_identifiant ILIKE $${i++}`); vals.push(`%${expediteur}%`); }
  if (date_from)  { where.push(`date_reception >= $${i++}`); vals.push(date_from); }
  if (date_to)    { where.push(`date_reception <= $${i++}`); vals.push(date_to); }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  vals.push(limit, offset);
  const sql = `
    SELECT * FROM v_photos_boite_tri
    ${whereClause}
    ORDER BY date_reception DESC
    LIMIT $${i++} OFFSET $${i}
  `;
  const { rows } = await pool.query(sql, vals);
  return rows;
}

export async function count({ statut = 'non_traite', source } = {}) {
  const vals = [statut];
  let sql = 'SELECT COUNT(*)::int AS n FROM photos_boite_tri WHERE statut = $1';
  if (source) { sql += ' AND source = $2'; vals.push(source); }
  const { rows } = await pool.query(sql, vals);
  return rows[0]?.n ?? 0;
}

export async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM v_photos_boite_tri WHERE id_photo = $1',
    [id],
  );
  return rows[0] || null;
}

/**
 * Rattache une photo à une pièce comptable. Marque le statut `rattache` et
 * crée la liaison polymorphique dans `documents_liaisons`.
 */
export async function rattacher({ id_photo, type, id, notes }, user) {
  if (!['depense_espece', 'facture_fournisseur', 'apport_gerant', 'paiement'].includes(type)) {
    throw Object.assign(new Error(`Type de rattachement invalide : ${type}`), { code: 'INVALID_TYPE' });
  }

  return withTransaction(async (client) => {
    const { rows: photoRows } = await client.query(
      `SELECT id_document_archive, statut FROM photos_boite_tri WHERE id_photo = $1 FOR UPDATE`,
      [id_photo],
    );
    const photo = photoRows[0];
    if (!photo) throw Object.assign(new Error('Photo introuvable'), { code: 'NOT_FOUND' });

    // Liaison polymorphique (idempotent via UNIQUE constraint)
    await client.query(
      `INSERT INTO documents_liaisons
         (id_document, entite_type, entite_id, role_liaison, cree_par)
       VALUES ($1, $2, $3, 'justificatif', $4)
       ON CONFLICT (id_document, entite_type, entite_id, role_liaison) DO NOTHING`,
      [photo.id_document_archive, type, id, user?.id_user || null],
    );

    const { rows: updated } = await client.query(
      `UPDATE photos_boite_tri
          SET statut             = 'rattache',
              rattache_a_type    = $2,
              rattache_a_id      = $3,
              rattache_par       = $4,
              rattache_at        = NOW(),
              notes_rattachement = $5,
              modifie_par        = $4
        WHERE id_photo = $1
        RETURNING *`,
      [id_photo, type, id, user?.id_user || null, notes || null],
    );
    return updated[0];
  });
}

export async function ignorer({ id_photo, notes }, user) {
  const { rows } = await pool.query(
    `UPDATE photos_boite_tri
        SET statut             = 'ignore',
            notes_rattachement = COALESCE($2, notes_rattachement),
            modifie_par        = $3
      WHERE id_photo = $1
      RETURNING *`,
    [id_photo, notes || null, user?.id_user || null],
  );
  if (!rows[0]) throw Object.assign(new Error('Photo introuvable'), { code: 'NOT_FOUND' });
  return rows[0];
}

export async function marquerEnCours({ id_photo }, user) {
  const { rows } = await pool.query(
    `UPDATE photos_boite_tri
        SET statut = 'en_cours', modifie_par = $2
      WHERE id_photo = $1 AND statut = 'non_traite'
      RETURNING *`,
    [id_photo, user?.id_user || null],
  );
  return rows[0] || null;
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function mimeToExt(mt) {
  switch ((mt || '').toLowerCase()) {
    case 'image/jpeg': return '.jpg';
    case 'image/png':  return '.png';
    case 'image/webp': return '.webp';
    case 'image/heic': return '.heic';
    case 'image/heif': return '.heif';
    case 'application/pdf': return '.pdf';
    default: return '';
  }
}
