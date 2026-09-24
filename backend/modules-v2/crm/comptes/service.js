import * as M from './model.js';
import { next as nextNumero } from '../../params/numerotation/service.js';

// ABAC : COMMERCIAL ne voit que ses comptes (§2.4)
function scopeFor(user) {
  return user?.role_principal === 'COMMERCIAL'
    ? { mesComptesOnly: true, userId: user.id_user }
    : {};
}

export async function list(params, user) {
  return M.list({ ...params, ...scopeFor(user) });
}

export async function get(id, user) {
  const c = await M.findById(id);
  if (!c) return null;
  if (user?.role_principal === 'COMMERCIAL' && c.id_commercial !== user.id_user) {
    const e = new Error('Compte hors périmètre'); e.status = 403; e.code = 'forbidden'; throw e;
  }
  const [contacts, adresses, historique] = await Promise.all([
    M.listContacts(id), M.listAdresses(id), M.listHistorique(id, 30),
  ]);
  return { ...c, contacts, adresses, historique };
}

export async function create(input, user) {
  // Auto-attribution commercial pour un COMMERCIAL
  if (user?.role_principal === 'COMMERCIAL') input.id_commercial = user.id_user;
  input.cree_par = user?.id_user;

  // Générer code_client via NumeroSequenceService (code CLI)
  let code_client = input.code_client;
  if (!code_client) {
    try {
      const num = await nextNumero({
        id_societe: input.id_societe || 1,
        code_document: 'CLI',
        contexte: `create_compte`,
        id_user: user?.id_user,
      });
      code_client = num.numero;
    } catch (e) {
      // fallback si CLI pas configuré (test/dev)
      code_client = `CLI-${Date.now()}`;
    }
  }
  const id = await M.create({ ...input, code_client });
  await M.addHistorique(id, {
    type_event: 'creation', direction: 'interne',
    sujet: 'Création du compte', id_user: user?.id_user,
  });
  return M.findById(id);
}

export async function update(id, patch, user) {
  const current = await M.findById(id);
  if (!current) { const e = new Error('Introuvable'); e.status = 404; e.code = 'not_found'; throw e; }
  if (user?.role_principal === 'COMMERCIAL' && current.id_commercial !== user.id_user) {
    const e = new Error('Compte hors périmètre'); e.status = 403; e.code = 'forbidden'; throw e;
  }
  const out = await M.update(id, patch);
  // Journal transitions statut
  if (patch.statut_crm && patch.statut_crm !== current.statut_crm) {
    await M.addHistorique(id, {
      type_event: 'changement_statut', direction: 'interne',
      ancien_statut: current.statut_crm, nouveau_statut: patch.statut_crm,
      id_user: user?.id_user,
    });
  }
  return out;
}

export async function archive(id, user) {
  await M.archive(id, user?.id_user);
  await M.addHistorique(id, { type_event: 'archivage', direction: 'interne', id_user: user?.id_user });
  return { archived: true };
}

// Contacts / Adresses / Historique
export const listContacts    = (idClient) => M.listContacts(idClient);
export const upsertContact   = (idClient, c) => M.upsertContact(idClient, c);
export const deleteContact   = (idClient, id) => M.deleteContact(idClient, id);
export const listAdresses    = (idClient) => M.listAdresses(idClient);
export const upsertAdresse   = (idClient, a) => M.upsertAdresse(idClient, a);
export const deleteAdresse   = (idClient, id) => M.deleteAdresse(idClient, id);
export const listHistorique  = (idClient, l) => M.listHistorique(idClient, l);
export const addHistorique   = (idClient, h) => M.addHistorique(idClient, h);
