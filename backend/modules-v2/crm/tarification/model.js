import { getPool } from '../../_shared/db.js';

// -------- Tarifs --------
export async function listTarifs({ actif } = {}) {
  const wh = []; const p = [];
  if (actif !== undefined) { p.push(!!actif); wh.push(`actif = $${p.length}`); }
  const where = wh.length ? `WHERE ${wh.join(' AND ')}` : '';
  const { rows } = await getPool().query(
    `SELECT * FROM tarifs ${where} ORDER BY est_defaut DESC, code`, p);
  return rows;
}
export async function findTarif(id) {
  const { rows } = await getPool().query(`SELECT * FROM tarifs WHERE id_grille = $1`, [id]);
  return rows[0] || null;
}
export async function listLignes(idGrille) {
  const { rows } = await getPool().query(
    `SELECT * FROM tarifs_lignes WHERE id_grille = $1 ORDER BY id_article, quantite_min`, [idGrille]);
  return rows;
}
export async function createTarif(t) {
  const { rows } = await getPool().query(
    `INSERT INTO tarifs (code,libelle,type,remise_pct,devise,taux_tva_defaut,date_debut,date_fin,est_defaut,actif,notes,cree_par)
     VALUES ($1,$2,$3,COALESCE($4,0),COALESCE($5,'TND'),COALESCE($6,19),$7,$8,COALESCE($9,FALSE),COALESCE($10,TRUE),$11,$12)
     RETURNING id_grille`,
    [t.code, t.libelle, t.type || 'remise_globale_pct',
     t.remise_pct, t.devise, t.taux_tva_defaut, t.date_debut, t.date_fin,
     t.est_defaut, t.actif, t.notes, t.cree_par || null]);
  return rows[0].id_grille;
}
export async function updateTarif(id, patch) {
  const cols = ['code','libelle','type','remise_pct','devise','taux_tva_defaut','date_debut','date_fin','est_defaut','actif','notes'];
  const set = [], p = [];
  for (const c of cols) if (patch[c] !== undefined) { p.push(patch[c]); set.push(`${c} = $${p.length}`); }
  if (!set.length) return { updated: 0 };
  p.push(id);
  await getPool().query(`UPDATE tarifs SET ${set.join(', ')}, updated_at = NOW() WHERE id_grille = $${p.length}`, p);
  return { updated: 1 };
}
export async function deleteTarif(id) {
  await getPool().query(`UPDATE tarifs SET actif = FALSE, updated_at = NOW() WHERE id_grille = $1`, [id]);
}

export async function upsertLigne(idGrille, l) {
  if (l.id_ligne) {
    await getPool().query(
      `UPDATE tarifs_lignes SET id_article=$1,quantite_min=$2,prix_unitaire_ht=$3,remise_pct=$4,updated_at=NOW()
        WHERE id_ligne=$5 AND id_grille=$6`,
      [l.id_article, l.quantite_min || 1, l.prix_unitaire_ht, l.remise_pct || 0, l.id_ligne, idGrille]);
    return l.id_ligne;
  }
  const { rows } = await getPool().query(
    `INSERT INTO tarifs_lignes (id_grille,id_article,quantite_min,prix_unitaire_ht,remise_pct)
     VALUES ($1,$2,$3,$4,$5) RETURNING id_ligne`,
    [idGrille, l.id_article, l.quantite_min || 1, l.prix_unitaire_ht, l.remise_pct || 0]);
  return rows[0].id_ligne;
}
export async function deleteLigne(idGrille, idLigne) {
  await getPool().query(`DELETE FROM tarifs_lignes WHERE id_ligne = $1 AND id_grille = $2`, [idLigne, idGrille]);
}

// -------- Remises client --------
export async function listRemises({ id_client, actif } = {}) {
  const wh = ['1=1']; const p = [];
  if (id_client) { p.push(id_client); wh.push(`id_client = $${p.length}`); }
  if (actif !== undefined) { p.push(!!actif); wh.push(`actif = $${p.length}`); }
  const { rows } = await getPool().query(
    `SELECT * FROM remises_client WHERE ${wh.join(' AND ')} ORDER BY created_at DESC`, p);
  return rows;
}
export async function upsertRemise(r) {
  if (r.id_remise) {
    await getPool().query(
      `UPDATE remises_client SET id_client=$1,id_article=$2,type_remise=$3,valeur=$4,devise=$5,
              date_debut=$6,date_fin=$7,motif=$8,actif=COALESCE($9,actif),updated_at=NOW()
        WHERE id_remise=$10`,
      [r.id_client, r.id_article || null, r.type_remise || 'pct', r.valeur, r.devise || 'TND',
       r.date_debut, r.date_fin, r.motif, r.actif, r.id_remise]);
    return r.id_remise;
  }
  const { rows } = await getPool().query(
    `INSERT INTO remises_client (id_client,id_article,type_remise,valeur,devise,date_debut,date_fin,motif,actif,cree_par)
     VALUES ($1,$2,$3,$4,COALESCE($5,'TND'),$6,$7,$8,COALESCE($9,TRUE),$10) RETURNING id_remise`,
    [r.id_client, r.id_article || null, r.type_remise || 'pct', r.valeur, r.devise,
     r.date_debut, r.date_fin, r.motif, r.actif, r.cree_par || null]);
  return rows[0].id_remise;
}
export async function deleteRemise(id) {
  await getPool().query(`UPDATE remises_client SET actif = FALSE, updated_at = NOW() WHERE id_remise = $1`, [id]);
}
