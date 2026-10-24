// model.js — ecommerce/commandes-web
// Table : commandes_web (§11quinquies.4)
import { buildCrud } from '../../_shared/crudFactory.js';
import { getPool, withTransaction } from '../../_shared/db.js';

const crud = buildCrud({
  table: 'commandes_web',
  pk: 'id_commande_web',
  columns: [
    'id_site','reference_externe','canal',
    'id_compte','id_compte_b2b','email_client','telephone_client',
    'payload_json','total_ttc','devise','statut_web',
    'id_commande_erp','id_devis_erp','erreur_import',
    'hash_hmac','ip_source','date_commande_web','date_import_erp',
  ],
  searchColumns: ['reference_externe','email_client'],
  orderBy: 'date_reception DESC',
});

export const model = {
  ...crud.model,

  /** Idempotence : commande déjà reçue pour ce site + reference externe ? */
  async findByReference(idSite, referenceExterne) {
    const { rows } = await getPool().query(
      'SELECT * FROM commandes_web WHERE id_site = $1 AND reference_externe = $2 LIMIT 1',
      [idSite, referenceExterne],
    );
    return rows[0] || null;
  },

  /** Statut / erreur / lien ERP. */
  async setStatut(id, statut, extra = {}) {
    const sets = ['statut_web = $1'];
    const params = [statut];
    let i = 2;
    if (extra.id_commande_erp) { sets.push(`id_commande_erp = $${i++}`); params.push(extra.id_commande_erp); }
    if (extra.id_devis_erp)    { sets.push(`id_devis_erp = $${i++}`);    params.push(extra.id_devis_erp); }
    if (extra.erreur)          { sets.push(`erreur_import = $${i++}`);   params.push(extra.erreur); }
    if (extra.dateImportErp)   { sets.push(`date_import_erp = $${i++}`); params.push(extra.dateImportErp); }
    params.push(id);
    const sql = `UPDATE commandes_web SET ${sets.join(', ')} WHERE id_commande_web = $${i} RETURNING *`;
    const { rows } = await getPool().query(sql, params);
    return rows[0] || null;
  },

  /** Recherche compte CRM existant par email. */
  async findCompteByEmail(email) {
    if (!email) return null;
    const { rows } = await getPool().query(
      'SELECT id_compte FROM comptes WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email],
    );
    return rows[0] || null;
  },

  /** Crée un compte CRM minimal depuis email + payload (nouveau client B2C). */
  async createCompteFromWeb(client, tx = null) {
    const runner = tx || getPool();
    const nom     = client.nom || client.name || client.email?.split('@')[0] || 'Client Web';
    const email   = client.email;
    const tel     = client.telephone || client.phone || null;
    const typeCpte = client.canal === 'B2B' ? 'entreprise' : 'particulier';
    const sql = `
      INSERT INTO comptes (nom, type_compte, email, telephone, source_creation, actif)
      VALUES ($1, $2, $3, $4, 'ecommerce', TRUE)
      RETURNING id_compte`;
    const { rows } = await runner.query(sql, [nom, typeCpte, email, tel]);
    return rows[0].id_compte;
  },

  /** Insère une commande ERP minimale + retour id. Squelette : le module ventes/commandes portera le vrai flux. */
  async insertCommandeErp(cmdWeb, idCompte, tx) {
    const sql = `
      INSERT INTO commandes
        (id_compte, canal, statut, total_ttc, devise, source_creation, reference_externe, date_creation)
      VALUES ($1, $2, 'brouillon', $3, $4, 'ecommerce', $5, NOW())
      RETURNING id_commande`;
    const { rows } = await tx.query(sql, [
      idCompte, cmdWeb.canal, cmdWeb.total_ttc, cmdWeb.devise, cmdWeb.reference_externe,
    ]);
    return rows[0].id_commande;
  },
};

export { withTransaction };
export const baseService    = crud.service;
export const baseController = crud.controller;
