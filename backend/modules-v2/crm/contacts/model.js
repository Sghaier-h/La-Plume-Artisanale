import { getPool } from '../../_shared/db.js';

// Listing (avec filtrage par compte, recherche, pagination).
export async function list({ q, id_client, role, limit = 50, offset = 0 }) {
  const wh = ['1=1']; const p = [];
  if (id_client) { p.push(id_client); wh.push(`c.id_client = $${p.length}`); }
  if (role)      { p.push(role);      wh.push(`c.role = $${p.length}`); }
  if (q) {
    p.push(`%${q}%`);
    wh.push(`(c.nom ILIKE $${p.length} OR c.prenom ILIKE $${p.length} OR c.email ILIKE $${p.length} OR c.fonction ILIKE $${p.length})`);
  }
  const where = `WHERE ${wh.join(' AND ')}`;
  p.push(limit); p.push(offset);
  const sql = `
    SELECT c.*,
           co.raison_sociale AS compte_raison_sociale,
           co.nom            AS compte_nom_particulier,
           co.code_client
      FROM contacts c
      LEFT JOIN comptes co ON co.id_client = c.id_client
      ${where}
     ORDER BY c.est_principal DESC, c.id_contact DESC
     LIMIT $${p.length - 1} OFFSET $${p.length}`;
  const cnt = await getPool().query(
    `SELECT COUNT(*)::int AS n FROM contacts c ${where}`,
    p.slice(0, p.length - 2),
  );
  const { rows } = await getPool().query(sql, p);
  return { rows, total: cnt.rows[0].n };
}

export async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT c.*, co.raison_sociale AS compte_raison_sociale, co.code_client
       FROM contacts c
       LEFT JOIN comptes co ON co.id_client = c.id_client
      WHERE c.id_contact = $1`, [id]);
  return rows[0] || null;
}

export async function create(c) {
  // Règle : 1 seul principal par compte — désactive les autres si l'appelant demande principal.
  if (c.est_principal) {
    await getPool().query(
      `UPDATE contacts SET est_principal = FALSE WHERE id_client = $1 AND est_principal = TRUE`,
      [c.id_client]);
  }
  const { rows } = await getPool().query(
    `INSERT INTO contacts (id_client,role,civilite,nom,prenom,fonction,email,telephone,whatsapp,est_principal)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id_contact`,
    [c.id_client, c.role || 'autre', c.civilite || null, c.nom, c.prenom || null,
     c.fonction || null, c.email || null, c.telephone || null, c.whatsapp || null,
     !!c.est_principal]);
  return rows[0].id_contact;
}

export async function update(id, patch) {
  const current = await findById(id);
  if (!current) return { updated: 0 };
  if (patch.est_principal === true && !current.est_principal) {
    await getPool().query(
      `UPDATE contacts SET est_principal = FALSE WHERE id_client = $1 AND id_contact <> $2`,
      [current.id_client, id]);
  }
  const cols = ['role','civilite','nom','prenom','fonction','email','telephone','whatsapp','est_principal','actif'];
  const set = [], p = [];
  for (const c of cols) if (patch[c] !== undefined) { p.push(patch[c]); set.push(`${c} = $${p.length}`); }
  if (!set.length) return { updated: 0 };
  p.push(id);
  await getPool().query(
    `UPDATE contacts SET ${set.join(', ')}, updated_at = NOW() WHERE id_contact = $${p.length}`, p);
  return { updated: 1 };
}

export async function remove(id) {
  await getPool().query(`DELETE FROM contacts WHERE id_contact = $1`, [id]);
  return { deleted: 1 };
}
