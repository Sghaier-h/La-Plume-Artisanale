import { getPool } from '../../_shared/db.js';

export async function getSociete(idSociete = 1) {
  const { rows } = await getPool().query(
    `SELECT * FROM parametres_societe WHERE id_societe = $1`, [idSociete]);
  return rows[0] || null;
}
export async function listAdresses(idSociete) {
  const { rows } = await getPool().query(
    `SELECT * FROM societe_adresses WHERE id_societe = $1 ORDER BY est_principale DESC, id_adresse`, [idSociete]);
  return rows;
}
export async function listBancaires(idSociete) {
  const { rows } = await getPool().query(
    `SELECT * FROM societe_bancaires WHERE id_societe = $1 AND actif = TRUE ORDER BY est_defaut DESC, id_bancaire`, [idSociete]);
  return rows;
}

export async function updateSociete(idSociete, patch) {
  const cols = ['raison_sociale','forme_juridique','capital_social','devise_capital',
    'matricule_fiscal','code_tva','rc','logo_url','site_web','email_contact',
    'telephone_contact','whatsapp_contact','smtp_host','smtp_port','smtp_user','smtp_password',
    'smtp_ssl','mentions_legales_pdf','conditions_generales_vente'];
  const set = [], params = [];
  for (const c of cols) if (patch[c] !== undefined) { params.push(patch[c]); set.push(`${c} = $${params.length}`); }
  if (!set.length) return { updated: 0 };
  params.push(idSociete);
  await getPool().query(
    `UPDATE parametres_societe SET ${set.join(', ')}, updated_at = NOW()
      WHERE id_societe = $${params.length}`, params);
  return { updated: 1 };
}

export async function upsertAdresse(idSociete, a) {
  if (a.id_adresse) {
    await getPool().query(
      `UPDATE societe_adresses SET type_adresse=$1,libelle=$2,rue=$3,complement=$4,
              code_postal=$5,ville=$6,region=$7,pays=$8,est_principale=$9,updated_at=NOW()
        WHERE id_adresse=$10 AND id_societe=$11`,
      [a.type_adresse, a.libelle, a.rue, a.complement, a.code_postal, a.ville, a.region,
       a.pays || 'TN', !!a.est_principale, a.id_adresse, idSociete]);
    return a.id_adresse;
  }
  const { rows } = await getPool().query(
    `INSERT INTO societe_adresses (id_societe,type_adresse,libelle,rue,complement,code_postal,ville,region,pays,est_principale)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id_adresse`,
    [idSociete, a.type_adresse, a.libelle, a.rue, a.complement, a.code_postal, a.ville, a.region,
     a.pays || 'TN', !!a.est_principale]);
  return rows[0].id_adresse;
}
export async function deleteAdresse(idSociete, id) {
  await getPool().query(
    `DELETE FROM societe_adresses WHERE id_adresse = $1 AND id_societe = $2`, [id, idSociete]);
}

export async function upsertBancaire(idSociete, b) {
  if (b.id_bancaire) {
    await getPool().query(
      `UPDATE societe_bancaires SET libelle=$1,banque=$2,agence=$3,rib=$4,iban=$5,bic=$6,
              devise=$7,est_defaut=$8,actif=COALESCE($9,actif),updated_at=NOW()
        WHERE id_bancaire=$10 AND id_societe=$11`,
      [b.libelle, b.banque, b.agence, b.rib, b.iban, b.bic, b.devise || 'TND',
       !!b.est_defaut, b.actif, b.id_bancaire, idSociete]);
    return b.id_bancaire;
  }
  const { rows } = await getPool().query(
    `INSERT INTO societe_bancaires (id_societe,libelle,banque,agence,rib,iban,bic,devise,est_defaut)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id_bancaire`,
    [idSociete, b.libelle, b.banque, b.agence, b.rib, b.iban, b.bic, b.devise || 'TND', !!b.est_defaut]);
  return rows[0].id_bancaire;
}
export async function deleteBancaire(idSociete, id) {
  await getPool().query(
    `UPDATE societe_bancaires SET actif=FALSE, updated_at=NOW()
      WHERE id_bancaire = $1 AND id_societe = $2`, [id, idSociete]);
}

export async function setLogoUrl(idSociete, url) {
  await getPool().query(
    `UPDATE parametres_societe SET logo_url=$1, updated_at=NOW() WHERE id_societe=$2`,
    [url, idSociete]);
}
