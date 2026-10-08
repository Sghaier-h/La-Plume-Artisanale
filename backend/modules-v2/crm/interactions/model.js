import { getPool } from '../../_shared/db.js';

export async function list({ q, id_client, id_lead, id_contact, type, direction, id_utilisateur,
                             suivi_en_retard, limit = 50, offset = 0 }) {
  const wh = ['1=1']; const p = [];
  if (id_client)      { p.push(id_client);      wh.push(`i.id_client = $${p.length}`); }
  if (id_lead)        { p.push(id_lead);        wh.push(`i.id_lead   = $${p.length}`); }
  if (id_contact)     { p.push(id_contact);     wh.push(`i.id_contact= $${p.length}`); }
  if (type)           { p.push(type);           wh.push(`i.type      = $${p.length}`); }
  if (direction)      { p.push(direction);      wh.push(`i.direction = $${p.length}`); }
  if (id_utilisateur) { p.push(id_utilisateur); wh.push(`i.id_utilisateur = $${p.length}`); }
  if (suivi_en_retard) {
    wh.push(`(i.suivi_effectue = FALSE AND i.suivi_date IS NOT NULL AND i.suivi_date < NOW())`);
  }
  if (q) {
    p.push(`%${q}%`);
    wh.push(`(i.sujet ILIKE $${p.length} OR i.contenu ILIKE $${p.length})`);
  }
  const where = `WHERE ${wh.join(' AND ')}`;
  p.push(limit); p.push(offset);
  const sql = `
    SELECT i.*,
           co.raison_sociale AS compte_raison_sociale,
           co.nom  AS compte_nom_particulier,
           co.code_client,
           ct.nom  AS contact_nom, ct.prenom AS contact_prenom,
           u.nom_complet AS utilisateur_nom,
           l.nom_prospect AS lead_nom
      FROM interactions_crm i
      LEFT JOIN comptes  co ON co.id_client  = i.id_client
      LEFT JOIN contacts ct ON ct.id_contact = i.id_contact
      LEFT JOIN users    u  ON u.id_user     = i.id_utilisateur
      LEFT JOIN leads    l  ON l.id_lead     = i.id_lead
      ${where}
     ORDER BY i.date_interaction DESC
     LIMIT $${p.length - 1} OFFSET $${p.length}`;
  const cnt = await getPool().query(
    `SELECT COUNT(*)::int AS n FROM interactions_crm i ${where}`,
    p.slice(0, p.length - 2));
  const { rows } = await getPool().query(sql, p);
  return { rows, total: cnt.rows[0].n };
}

export async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT i.*, co.raison_sociale AS compte_raison_sociale,
            ct.nom AS contact_nom, ct.prenom AS contact_prenom,
            u.nom_complet AS utilisateur_nom
       FROM interactions_crm i
       LEFT JOIN comptes co ON co.id_client = i.id_client
       LEFT JOIN contacts ct ON ct.id_contact = i.id_contact
       LEFT JOIN users u ON u.id_user = i.id_utilisateur
      WHERE i.id_interaction = $1`, [id]);
  return rows[0] || null;
}

export async function create(i, userId) {
  const { rows } = await getPool().query(
    `INSERT INTO interactions_crm (id_client,id_lead,id_contact,type,sujet,contenu,direction,
       id_utilisateur,date_interaction,suivi_date,suivi_effectue)
     VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'sortant'),$8,COALESCE($9,NOW()),$10,COALESCE($11,FALSE))
     RETURNING id_interaction`,
    [i.id_client || null, i.id_lead || null, i.id_contact || null,
     i.type, i.sujet || null, i.contenu || null, i.direction || null,
     i.id_utilisateur || userId || null, i.date_interaction || null,
     i.suivi_date || null, i.suivi_effectue]);
  return rows[0].id_interaction;
}

export async function update(id, patch) {
  const cols = ['id_client','id_lead','id_contact','type','sujet','contenu','direction',
                'suivi_date','suivi_effectue','date_interaction'];
  const set = [], p = [];
  for (const c of cols) if (patch[c] !== undefined) { p.push(patch[c]); set.push(`${c} = $${p.length}`); }
  if (!set.length) return { updated: 0 };
  p.push(id);
  await getPool().query(
    `UPDATE interactions_crm SET ${set.join(', ')}, updated_at = NOW() WHERE id_interaction = $${p.length}`, p);
  return { updated: 1 };
}

export async function remove(id) {
  await getPool().query(`DELETE FROM interactions_crm WHERE id_interaction = $1`, [id]);
  return { deleted: 1 };
}
