import { withTransaction } from '../../_shared/db.js';
import { model } from './model.js';

const TYPES_ENTREE = new Set([
  'reception_fournisseur','entree_fabrication','ajustement_positif','retour_client',
]);
const TYPES_SORTIE = new Set([
  'sortie_vente','sortie_of','ajustement_negatif','mise_au_rebut',
]);
const TYPES_TRANSFERT = new Set(['transfert_entrepot']);
const TYPES_LOGIQUES = new Set(['reservation','liberation_reservation']);

/** Numéro auto MVT-YYYYMMDD-NNNNN (timestamp-based fallback). */
function genererNumeroMvt() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `MVT-${ymd}-${seq}`;
}

/** Validation métier avant insertion. */
function valider(payload) {
  const t = payload.type_mouvement;
  if (!t) throw Object.assign(new Error('type_mouvement requis'), { code: 'VALIDATION' });
  if (!payload.id_article) throw Object.assign(new Error('id_article requis'), { code: 'VALIDATION' });
  const qte = Number(payload.quantite);
  if (Number.isNaN(qte)) throw Object.assign(new Error('quantite invalide'), { code: 'VALIDATION' });

  if (TYPES_ENTREE.has(t) && !payload.id_entrepot_destination) {
    throw Object.assign(new Error('id_entrepot_destination requis pour entrée'), { code: 'VALIDATION' });
  }
  if (TYPES_SORTIE.has(t) && !payload.id_entrepot_source) {
    throw Object.assign(new Error('id_entrepot_source requis pour sortie'), { code: 'VALIDATION' });
  }
  if (TYPES_TRANSFERT.has(t) && (!payload.id_entrepot_source || !payload.id_entrepot_destination)) {
    throw Object.assign(new Error('source et destination requises pour transfert'), { code: 'VALIDATION' });
  }
  if (!TYPES_LOGIQUES.has(t) && qte <= 0) {
    throw Object.assign(new Error('quantite doit être > 0'), { code: 'VALIDATION' });
  }
}

/**
 * Enregistre un mouvement de stock atomique.
 * - Un transfert = 2 mouvements liés (sortie source + entrée destination)
 *   insérés dans la MÊME transaction (rollback global si un échoue).
 * - Autres types = 1 mouvement.
 */
async function enregistrer(payload, userId) {
  valider(payload);
  return withTransaction(async (client) => {
    const t = payload.type_mouvement;
    const base = {
      ...payload,
      effectue_par: payload.effectue_par ?? userId ?? null,
      numero_mouvement: payload.numero_mouvement || genererNumeroMvt(),
      statut: payload.statut || 'valide',
      date_mouvement: payload.date_mouvement || new Date(),
    };

    if (TYPES_TRANSFERT.has(t)) {
      // Sortie source
      const sortie = await model.insertInTx(client, {
        ...base,
        numero_mouvement: `${base.numero_mouvement}-S`,
        id_entrepot_destination: null,
        id_emplacement_destination: null,
      });
      // Entrée destination
      const entree = await model.insertInTx(client, {
        ...base,
        numero_mouvement: `${base.numero_mouvement}-E`,
        id_entrepot_source: null,
        id_emplacement_source: null,
      });
      return { transfert: true, sortie, entree };
    }

    const mvt = await model.insertInTx(client, base);
    return mvt;
  });
}

export const service = {
  list: (opts) => model.list(opts),
  get: (id) => model.findById(id),
  enregistrer,
  annuler: (id, userId) => model.updateStatut(id, 'annule', userId),
  valider: (id, userId) => model.updateStatut(id, 'valide', userId),
};
export default service;
