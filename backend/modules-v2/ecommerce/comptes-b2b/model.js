// model.js — ecommerce/comptes-b2b
// Table : comptes_b2b_web (§11quinquies.1bis)
import { buildCrud } from '../../_shared/crudFactory.js';
import { getPool } from '../../_shared/db.js';

const crud = buildCrud({
  table: 'comptes_b2b_web',
  pk: 'id_compte_b2b',
  columns: [
    'id_compte','id_site','email_login','mot_de_passe_hash',
    'kyc_statut','kyc_rc_url','kyc_mf_url','kyc_cin_url',
    'kyc_verifie_par','kyc_date_verification','kyc_motif_refus',
    'delai_paiement_jours','fin_de_mois',
    'plafond_credit_ht','encours_ht','remise_supplementaire_pct',
    'id_grille_tarif','derniere_connexion',
  ],
  searchColumns: ['email_login'],
  orderBy: 'date_creation DESC',
});

export const model = {
  ...crud.model,

  /** MAJ statut KYC (valider / refuser). */
  async setKycStatut(id, statut, userId, motif = null) {
    const sql = `
      UPDATE comptes_b2b_web
         SET kyc_statut = $1,
             kyc_verifie_par = $2,
             kyc_date_verification = NOW(),
             kyc_motif_refus = $3,
             date_modification = NOW()
       WHERE id_compte_b2b = $4
       RETURNING *`;
    const { rows } = await getPool().query(sql, [statut, userId, motif, id]);
    return rows[0] || null;
  },

  /** Sauve URL d'un document KYC (rc / mf / cin). */
  async setKycDocument(id, kind, url) {
    const col = { rc: 'kyc_rc_url', mf: 'kyc_mf_url', cin: 'kyc_cin_url' }[kind];
    if (!col) throw new Error(`Type KYC invalide : ${kind}`);
    const sql = `
      UPDATE comptes_b2b_web
         SET ${col} = $1,
             kyc_statut = CASE WHEN kyc_statut = 'en_attente' THEN 'en_verification' ELSE kyc_statut END,
             date_modification = NOW()
       WHERE id_compte_b2b = $2
       RETURNING *`;
    const { rows } = await getPool().query(sql, [url, id]);
    return rows[0] || null;
  },

  /** Enquête sur les comptes B2B en attente de validation. */
  async listPendingKyc(siteId = null) {
    const params = [];
    let where = "WHERE kyc_statut IN ('en_attente','en_verification')";
    if (siteId) { params.push(siteId); where += ` AND id_site = $${params.length}`; }
    const sql = `SELECT * FROM comptes_b2b_web ${where} ORDER BY date_creation ASC`;
    const { rows } = await getPool().query(sql, params);
    return rows;
  },
};

export const baseService    = crud.service;
export const baseController = crud.controller;
