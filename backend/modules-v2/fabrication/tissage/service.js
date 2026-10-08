import * as model from './model.js';

export const listSessions = (o) => model.listSessions(o);
export const getSession   = (id) => model.findSession(id);

export async function demarrer({ id_of, id_machine, id_operateur, duites_debut, compteur_debut, notes }) {
  return model.insertSession({
    id_of, id_machine, id_operateur,
    duites_debut: duites_debut ?? null,
    compteur_debut: compteur_debut ?? null,
    date_debut: new Date(),
    statut: 'en_cours',
    notes: notes ?? null
  });
}

export async function pauser(id, motif) {
  return model.updateSession(id, { statut: 'pause' });
}
export async function reprendre(id) {
  return model.updateSession(id, { statut: 'en_cours' });
}

export async function cloturer(id, { duites_fin, compteur_fin, metres_produits }) {
  const s = await model.findSession(id);
  if (!s) return null;
  const duites_total = (duites_fin ?? s.duites_debut ?? 0) - (s.duites_debut ?? 0);
  return model.updateSession(id, {
    duites_fin,
    compteur_fin,
    metres_produits,
    duites_total,
    date_fin: new Date(),
    statut: 'termine'
  });
}

export const declarerIncident = (id, incident) =>
  model.appendIncident(id, { ...incident, horodatage: new Date().toISOString() });
