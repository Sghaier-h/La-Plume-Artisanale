import { getPool, withTransaction } from '../../_shared/db.js';

export async function list({ q, statut, canal, id_utilisateur_assigne, limit = 50, offset = 0 }) {
  const wh = ['1=1']; const p = [];
  if (statut) { p.push(statut); wh.push(`l.statut = $${p.length}`); }
  if (canal)  { p.push(canal);  wh.push(`l.canal  = $${p.length}`); }
  if (id_utilisateur_assigne) {
    p.push(id_utilisateur_assigne);
    wh.push(`l.id_utilisateur_assigne = $${p.length}`);
  }
  if (q) {
    p.push(`%${q}%`);
    wh.push(`(l.nom_prospect ILIKE $${p.length} OR l.email ILIKE $${p.length} OR l.societe ILIKE $${p.length})`);
  }
  const where = `WHERE ${wh.join(' AND ')}`;
  p.push(limit); p.push(offset);
  const sql = `
    SELECT l.*,
           u.nom_complet AS utilisateur_assigne_nom,
           c.raison_sociale AS compte_converti_nom, c.code_client AS compte_converti_code
      FROM leads l
      LEFT JOIN users   u ON u.id_user   = l.id_utilisateur_assigne
      LEFT JOIN comptes c ON c.id_client = l.id_client_converti
      ${where}
     ORDER BY l.date_capture DESC
     LIMIT $${p.length - 1} OFFSET $${p.length}`;
  const cnt = await getPool().query(
    `SELECT COUNT(*)::int AS n FROM leads l ${where}`,
    p.slice(0, p.length - 2));
  const { rows } = await getPool().query(sql, p);
  return { rows, total: cnt.rows[0].n };
}

export async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT l.*, u.nom_complet AS utilisateur_assigne_nom
       FROM leads l LEFT JOIN users u ON u.id_user = l.id_utilisateur_assigne
      WHERE l.id_lead = $1`, [id]);
  return rows[0] || null;
}

export async function create(l, userId) {
  const { rows } = await getPool().query(
    `INSERT INTO leads (canal,source_detail,nom_prospect,email,telephone,societe,message,
       id_utilisateur_assigne,statut,motif_perte,date_capture,cree_par)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,'nouveau'),$10,COALESCE($11,NOW()),$12)
     RETURNING id_lead`,
    [l.canal || 'formulaire_web', l.source_detail || null,
     l.nom_prospect || null, l.email || null, l.telephone || null,
     l.societe || null, l.message || null, l.id_utilisateur_assigne || null,
     l.statut || null, l.motif_perte || null, l.date_capture || null, userId || null]);
  return rows[0].id_lead;
}

export async function update(id, patch) {
  const cols = ['canal','source_detail','nom_prospect','email','telephone','societe','message',
                'id_utilisateur_assigne','statut','motif_perte'];
  const set = [], p = [];
  for (const c of cols) if (patch[c] !== undefined) { p.push(patch[c]); set.push(`${c} = $${p.length}`); }
  if (!set.length) return { updated: 0 };
  p.push(id);
  await getPool().query(
    `UPDATE leads SET ${set.join(', ')}, updated_at = NOW() WHERE id_lead = $${p.length}`, p);
  return { updated: 1 };
}

export async function remove(id) {
  await getPool().query(`DELETE FROM leads WHERE id_lead = $1`, [id]);
  return { deleted: 1 };
}

// Conversion lead → compte (transaction)
export async function convert(idLead, extras, userId) {
  return withTransaction(async (client) => {
    const l = (await client.query(`SELECT * FROM leads WHERE id_lead = $1`, [idLead])).rows[0];
    if (!l) { const e = new Error('Lead introuvable'); e.status = 404; e.code = 'not_found'; throw e; }
    if (l.statut === 'converti') {
      const e = new Error('Lead déjà converti'); e.status = 409; e.code = 'already_converted'; throw e;
    }
    // Crée un compte statut=lead à partir des données
    const typeCompte = extras?.type_compte || (l.societe ? 'societe' : 'particulier');
    const raisonSociale = typeCompte === 'societe' ? (extras?.raison_sociale || l.societe || l.nom_prospect) : null;
    const nom          = typeCompte === 'particulier' ? (extras?.nom || l.nom_prospect || 'Prospect') : null;

    const codeClient = extras?.code_client || `CLI-${Date.now()}`;
    const { rows: cRows } = await client.query(
      `INSERT INTO comptes (code_client,type_compte,statut_crm,raison_sociale,nom,prenom,pays,
         source_lead,canal_prefere,notes,cree_par)
       VALUES ($1,$2,'lead',$3,$4,$5,COALESCE($6,'TN'),$7,$8,$9,$10)
       RETURNING id_client`,
      [codeClient, typeCompte, raisonSociale, nom, extras?.prenom || null,
       extras?.pays || 'TN', l.canal, l.canal === 'whatsapp' ? 'whatsapp' :
        (l.canal === 'telegram' ? 'telegram' : (l.canal === 'telephone' ? 'telephone' : 'email')),
       l.message, userId || null]);
    const idClient = cRows[0].id_client;

    // Ajoute un contact principal si on a un email/téléphone
    if (l.nom_prospect || l.email || l.telephone) {
      const [prenom, ...rest] = String(l.nom_prospect || '').split(/\s+/);
      const nomC = rest.join(' ') || prenom || 'Contact';
      await client.query(
        `INSERT INTO contacts (id_client,role,nom,prenom,email,telephone,est_principal)
         VALUES ($1,'responsable',$2,$3,$4,$5,TRUE)`,
        [idClient, nomC, prenom || null, l.email || null, l.telephone || null]);
    }

    // Marque lead converti
    await client.query(
      `UPDATE leads SET statut='converti', id_client_converti=$1, date_conversion=NOW(), updated_at=NOW()
        WHERE id_lead=$2`, [idClient, idLead]);

    // Journal
    await client.query(
      `INSERT INTO historique_commercial (id_client,type_event,direction,sujet,contenu,id_user)
       VALUES ($1,'creation','interne',$2,$3,$4)`,
      [idClient, `Conversion lead #${idLead}`, `Canal: ${l.canal} · ${l.source_detail || ''}`, userId || null]);

    return { id_client: idClient, id_lead: idLead };
  });
}
