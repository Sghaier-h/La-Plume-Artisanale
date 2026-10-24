import * as model from './model.js';

export const listSessions = (o) => model.listSessions(o);
export const getSession   = (id) => model.findSession(id);
export const listPieces   = (o) => model.listPieces(o);

export const demarrer = (payload) => model.insertSession({
  id_of: payload.id_of, id_operateur: payload.id_operateur,
  id_machine: payload.id_machine ?? null, terminal: payload.terminal ?? null,
  date_debut: new Date(), statut: 'en_cours'
});

export async function ajouterPiece(payload) {
  const p = await model.insertPiece(payload);
  // MAJ agrégats session si liée
  if (payload.id_session_coupe) {
    const totaux = await model.sommesParCategorie(payload.id_of);
    const get = (c) => Number(totaux.find(t => t.categorie === c)?.total ?? 0);
    await model.updateSession(payload.id_session_coupe, {
      total_1er_choix: get('1er_choix'),
      total_2e_choix:  get('2e_choix'),
      total_dechet:    get('dechet'),
      total_ourlet:    get('ourlet_retouche'),
      total_approuve:  get('approuve')
    });
  }
  return p;
}

/** Formules §7.19 :
 *  total_controle = qte_prem+qte_deux+dechet+ourlet
 *  fabrique       = qte_prem+approuve
 */
export async function statsOf(id_of) {
  const totaux = await model.sommesParCategorie(id_of);
  const get = (c) => Number(totaux.find(t => t.categorie === c)?.total ?? 0);
  const qte_prem = get('1er_choix'),
        qte_deux = get('2e_choix'),
        dechet   = get('dechet'),
        ourlet   = get('ourlet_retouche'),
        approuve = get('approuve');
  return {
    qte_prem, qte_deux, dechet, ourlet, approuve,
    total_controle: qte_prem + qte_deux + dechet + ourlet,
    fabrique: qte_prem + approuve,
    taux_2eme_choix: qte_prem ? qte_deux / qte_prem : 0,
    taux_dechet:     qte_prem ? dechet   / qte_prem : 0
  };
}

export async function cloturer(id_session_coupe, { id_of, id_article, id_lot, id_utilisateur }) {
  const stats = await statsOf(id_of);
  await model.updateSession(id_session_coupe, {
    statut: 'termine',
    date_fin: new Date(),
    total_1er_choix: stats.qte_prem,
    total_2e_choix:  stats.qte_deux,
    total_dechet:    stats.dechet,
    total_ourlet:    stats.ourlet,
    total_approuve:  stats.approuve
  });
  // Décompte auto stock PF
  const quantite = stats.fabrique;
  const mvt = quantite > 0
    ? await model.decompteStockPF({ id_of, id_article, quantite, id_lot, id_utilisateur })
    : null;
  return { stats, mouvement_stock: mvt };
}
