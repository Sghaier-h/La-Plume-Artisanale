// Logique métier OF (§7.5, §7.14, §7.15)
import * as model from './model.js';
import { nextOfCommande, nextOfStock, formatComplement } from '../../_shared/numero-sequence.js';

export const listOfs   = (opts) => model.findAll(opts);
export const getOf     = (id)   => model.findById(id);
export const getByNumero = (n)  => model.findByNumero(n);

/**
 * Création OF. Le numéro est généré via NumeroSequenceService (§16bis).
 *   - type_of=commande  → OF{6}
 *   - type_of=stock     → CA{4}
 *   - type_of=complement→ <parent>.<n>
 */
export async function creerOf(payload, { id_utilisateur } = {}) {
  const of = { ...payload };
  if (!of.type_of) of.type_of = of.id_commande ? 'commande' : 'stock';

  if (!of.numero_of) {
    if (of.type_of === 'complement' && of.id_of_parent) {
      const parent = await model.findById(of.id_of_parent);
      if (!parent) throw new Error('OF parent introuvable');
      const suffixe = (parent.numero_of.split('.')[1] ? Number(parent.numero_of.split('.')[1]) + 1 : 1);
      of.numero_of = formatComplement(parent.numero_of.split('.')[0], suffixe);
      of.priorite = 'urgente';
      of.ordre_planif_machine = 0;
    } else if (of.type_of === 'stock') {
      of.numero_of = await nextOfStock();
    } else {
      of.numero_of = await nextOfCommande();
    }
  }
  of.created_by = id_utilisateur ?? null;
  of.updated_by = id_utilisateur ?? null;
  return model.insert(of);
}

/** Auto-création OF depuis une commande validée (§7.14 CREATION). */
export async function autoCreerDepuisCommande({ id_commande, lignes, id_utilisateur }) {
  const ofs = [];
  for (const l of lignes) {
    const numero_of = await nextOfCommande();
    const of = await model.insert({
      numero_of,
      type_of: 'commande',
      id_article: l.id_article,
      id_bom: l.id_bom ?? null,
      id_gamme: l.id_gamme ?? null,
      id_commande,
      id_ligne_commande: l.id_ligne_commande,
      quantite_prevue: l.quantite_prevue,
      priorite: l.priorite ?? 'normale',
      statut: 'brouillon',
      chef_production_id_utilisateur: id_utilisateur ?? null,
      created_by: id_utilisateur ?? null,
      updated_by: id_utilisateur ?? null
    });
    ofs.push(of);
  }
  return ofs;
}

/** Transition de statut avec journal (§7.14). */
export async function changerStatut(id_of, nouveau, { motif, id_utilisateur } = {}) {
  const of = await model.findById(id_of);
  if (!of) throw new Error('OF introuvable');
  if (of.statut === nouveau) return of;
  const updated = await model.update(id_of, { statut: nouveau });
  await model.insertStatusTransition(id_of, of.statut, nouveau, motif ?? null, id_utilisateur ?? null);
  return updated;
}

export const majOf = (id, patch) => model.update(id, patch);
export const supprimerOf = (id)  => model.remove(id);
