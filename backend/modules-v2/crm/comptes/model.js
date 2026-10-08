import { getPool } from '../../_shared/db.js';

// ------------------------ Comptes ------------------------
export async function list({ q, statut, type_compte, pays, id_commercial, actif,
                             mesComptesOnly, userId, limit = 50, offset = 0 }) {
  const wh = ['1=1']; const p = [];
  if (mesComptesOnly && userId) { p.push(userId); wh.push(`id_commercial = $${p.length}`); }
  else if (id_commercial)       { p.push(id_commercial); wh.push(`id_commercial = $${p.length}`); }
  if (statut)      { p.push(statut);      wh.push(`statut_crm  = $${p.length}`); }
  if (type_compte) { p.push(type_compte); wh.push(`type_compte = $${p.length}`); }
  if (pays)        { p.push(pays);        wh.push(`pays        = $${p.length}`); }
  if (actif !== undefined) { p.push(actif); wh.push(`actif = $${p.length}`); }
  if (q) {
    p.push(`%${q}%`);
    wh.push(`(code_client ILIKE $${p.length} OR raison_sociale ILIKE $${p.length} OR nom ILIKE $${p.length} OR prenom ILIKE $${p.length})`);
  }
  const where = `WHERE ${wh.join(' AND ')}`;
  p.push(limit); p.push(offset);
  const sql = `SELECT id_client,code_client,type_compte,statut_crm,raison_sociale,nom,prenom,
                      pays,id_commercial,id_grille_tarif,actif,created_at,
                      COALESCE(devise,'TND') AS devise
                 FROM comptes ${where}
                ORDER BY id_client DESC LIMIT $${p.length - 1} OFFSET $${p.length}`;
  const cnt = await getPool().query(`SELECT COUNT(*)::int AS n FROM comptes ${where}`, p.slice(0, p.length - 2));
  const { rows } = await getPool().query(sql, p);
  return { rows, total: cnt.rows[0].n };
}

export async function stats({ mesComptesOnly, userId } = {}) {
  const wh = ['1=1']; const p = [];
  if (mesComptesOnly && userId) { p.push(userId); wh.push(`id_commercial = $${p.length}`); }
  const where = `WHERE ${wh.join(' AND ')}`;
  const { rows } = await getPool().query(
    `SELECT
       COUNT(*)::int                                                AS total,
       COUNT(*) FILTER (WHERE statut_crm = 'client')::int           AS clients,
       COUNT(*) FILTER (WHERE statut_crm = 'prospect')::int         AS prospects,
       COUNT(*) FILTER (WHERE statut_crm = 'lead')::int             AS leads,
       COUNT(*) FILTER (WHERE statut_crm = 'archive')::int          AS archives,
       COUNT(*) FILTER (WHERE actif = TRUE)::int                    AS actifs,
       COUNT(*) FILTER (WHERE actif = FALSE)::int                   AS inactifs
       FROM comptes ${where}`, p);
  return rows[0];
}

export async function findById(id) {
  const { rows } = await getPool().query(`SELECT * FROM comptes WHERE id_client = $1`, [id]);
  return rows[0] || null;
}

export async function create(c) {
  const { rows } = await getPool().query(
    `INSERT INTO comptes (code_client, type_compte, statut_crm, raison_sociale, nom, prenom, pays,
       matricule_fiscal, numero_tva_intracom, siret, id_grille_tarif, id_commercial,
       source_lead, canal_prefere, notes, cree_par)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id_client`,
    [c.code_client, c.type_compte || 'societe', c.statut_crm || 'lead',
     c.raison_sociale, c.nom, c.prenom, c.pays || 'TN',
     c.matricule_fiscal, c.numero_tva_intracom, c.siret,
     c.id_grille_tarif, c.id_commercial, c.source_lead, c.canal_prefere, c.notes, c.cree_par || null]);
  return rows[0].id_client;
}

export async function update(id, patch) {
  const cols = ['type_compte','statut_crm','raison_sociale','nom','prenom','pays','matricule_fiscal',
                'numero_tva_intracom','siret','id_grille_tarif','id_commercial','source_lead',
                'canal_prefere','notes','actif',
                'consent_marketing_email','consent_marketing_whatsapp','consent_marketing_telegram'];
  const set = [], p = [];
  for (const c of cols) if (patch[c] !== undefined) { p.push(patch[c]); set.push(`${c} = $${p.length}`); }
  if (!set.length) return { updated: 0 };
  p.push(id);
  await getPool().query(
    `UPDATE comptes SET ${set.join(', ')}, updated_at = NOW() WHERE id_client = $${p.length}`, p);
  return { updated: 1 };
}

export async function archive(id, userId) {
  await getPool().query(
    `UPDATE comptes SET statut_crm = 'archive', actif = FALSE, modifie_par = $2, updated_at = NOW()
      WHERE id_client = $1`, [id, userId || null]);
}

// ------------------------ Contacts / Adresses / Bancaires ------------------------
export async function listContacts(idClient) {
  const { rows } = await getPool().query(
    `SELECT * FROM contacts WHERE id_client = $1 ORDER BY est_principal DESC, id_contact`, [idClient]);
  return rows;
}
export async function upsertContact(idClient, c) {
  if (c.id_contact) {
    await getPool().query(
      `UPDATE contacts SET role=$1,civilite=$2,nom=$3,prenom=$4,fonction=$5,email=$6,telephone=$7,
              whatsapp=$8,est_principal=$9,actif=COALESCE($10,actif),updated_at=NOW()
        WHERE id_contact=$11 AND id_client=$12`,
      [c.role, c.civilite, c.nom, c.prenom, c.fonction, c.email, c.telephone, c.whatsapp,
       !!c.est_principal, c.actif, c.id_contact, idClient]);
    return c.id_contact;
  }
  const { rows } = await getPool().query(
    `INSERT INTO contacts (id_client,role,civilite,nom,prenom,fonction,email,telephone,whatsapp,est_principal)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id_contact`,
    [idClient, c.role || 'autre', c.civilite, c.nom, c.prenom, c.fonction, c.email, c.telephone,
     c.whatsapp, !!c.est_principal]);
  return rows[0].id_contact;
}
export async function deleteContact(idClient, id) {
  await getPool().query(`DELETE FROM contacts WHERE id_contact = $1 AND id_client = $2`, [id, idClient]);
}

export async function listAdresses(idClient) {
  const { rows } = await getPool().query(
    `SELECT * FROM adresses_client WHERE id_client = $1 ORDER BY id_adresse`, [idClient]);
  return rows;
}
export async function upsertAdresse(idClient, a) {
  if (a.id_adresse) {
    await getPool().query(
      `UPDATE adresses_client
          SET libelle=$1,type_facturation=$2,type_livraison=$3,type_siege=$4,
              rue=$5,complement=$6,code_postal=$7,ville=$8,region=$9,pays=$10,
              contact_livraison_nom=$11,contact_livraison_telephone=$12,
              est_defaut_facturation=$13,est_defaut_livraison=$14,updated_at=NOW()
        WHERE id_adresse=$15 AND id_client=$16`,
      [a.libelle, !!a.type_facturation, !!a.type_livraison, !!a.type_siege,
       a.rue, a.complement, a.code_postal, a.ville, a.region, a.pays || 'TN',
       a.contact_livraison_nom, a.contact_livraison_telephone,
       !!a.est_defaut_facturation, !!a.est_defaut_livraison, a.id_adresse, idClient]);
    return a.id_adresse;
  }
  const { rows } = await getPool().query(
    `INSERT INTO adresses_client (id_client,libelle,type_facturation,type_livraison,type_siege,
       rue,complement,code_postal,ville,region,pays,contact_livraison_nom,contact_livraison_telephone,
       est_defaut_facturation,est_defaut_livraison)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id_adresse`,
    [idClient, a.libelle, !!a.type_facturation, !!a.type_livraison, !!a.type_siege,
     a.rue, a.complement, a.code_postal, a.ville, a.region, a.pays || 'TN',
     a.contact_livraison_nom, a.contact_livraison_telephone,
     !!a.est_defaut_facturation, !!a.est_defaut_livraison]);
  return rows[0].id_adresse;
}
export async function deleteAdresse(idClient, id) {
  await getPool().query(`DELETE FROM adresses_client WHERE id_adresse = $1 AND id_client = $2`, [id, idClient]);
}

// ------------------------ Historique ------------------------
export async function listHistorique(idClient, limit = 100) {
  const { rows } = await getPool().query(
    `SELECT * FROM historique_commercial WHERE id_client = $1 ORDER BY created_at DESC LIMIT $2`,
    [idClient, limit]);
  return rows;
}
export async function addHistorique(idClient, h) {
  const { rows } = await getPool().query(
    `INSERT INTO historique_commercial (id_client,id_contact,type_event,direction,sujet,contenu,
       ancien_statut,nouveau_statut,id_user)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id_historique`,
    [idClient, h.id_contact || null, h.type_event, h.direction, h.sujet, h.contenu,
     h.ancien_statut || null, h.nouveau_statut || null, h.id_user || null]);
  return rows[0].id_historique;
}
