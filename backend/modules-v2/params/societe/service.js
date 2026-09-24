import * as M from './model.js';

export async function getFull(idSociete = 1) {
  const societe = await M.getSociete(idSociete);
  if (!societe) return null;
  const [adresses, bancaires] = await Promise.all([
    M.listAdresses(idSociete), M.listBancaires(idSociete),
  ]);
  // Ne pas exposer smtp_password
  delete societe.smtp_password;
  return { societe, adresses, bancaires };
}

export const updateSociete   = (id, p) => M.updateSociete(id, p);
export const upsertAdresse   = (id, a) => M.upsertAdresse(id, a);
export const deleteAdresse   = (id, a) => M.deleteAdresse(id, a);
export const upsertBancaire  = (id, b) => M.upsertBancaire(id, b);
export const deleteBancaire  = (id, b) => M.deleteBancaire(id, b);
export const setLogo         = (id, u) => M.setLogoUrl(id, u);
