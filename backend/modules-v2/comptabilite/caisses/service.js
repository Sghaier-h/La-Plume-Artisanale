// service.js — comptabilite/caisses (Phase A §14quater.1)
import * as model from './model.js';

export async function list()       { return model.listCaisses(); }
export async function getOne(id)   { return model.findById(id); }
export async function create(body, user) {
  const payload = {
    code:          body.code,
    libelle:       body.libelle,
    type_caisse:   body.type_caisse || 'custom',
    ordre:         body.ordre != null ? Number(body.ordre) : 100,
    solde_initial: body.solde_initial != null ? Number(body.solde_initial) : 0,
    solde_theorique: body.solde_initial != null ? Number(body.solde_initial) : 0,
    actif:         body.actif !== false,
    compte_compta: body.compte_compta || '54',
    responsable:   user?.id_user || null,
  };
  return model.insert(payload);
}
export async function update(id, body) {
  const allowed = ['code','libelle','type_caisse','ordre','actif','compte_compta','responsable'];
  const payload = {};
  for (const k of allowed) if (k in body) payload[k] = body[k];
  return model.updateById(id, payload);
}
export async function remove(id)   { return model.softDelete(id); }

export async function getMouvements(id, query = {}) {
  const { limit = 100, offset = 0, date_from, date_to } = query;
  return model.listMouvements(id, { limit: +limit, offset: +offset, date_from, date_to });
}

export async function transfertInterne(body, user) {
  const { id_caisse_source, id_caisse_dest, montant, libelle } = body;
  if (!id_caisse_source || !id_caisse_dest) throw new Error('id_caisse_source & id_caisse_dest requis');
  if (id_caisse_source === id_caisse_dest)  throw new Error('Caisses source et destination identiques');
  const m = Number(montant);
  if (!(m > 0)) throw new Error('Montant doit être strictement positif');
  return model.transfert({
    id_caisse_source: +id_caisse_source,
    id_caisse_dest:   +id_caisse_dest,
    montant: m,
    libelle: libelle || 'Transfert interne',
    cree_par: user?.id_user || null,
  });
}

export async function getRoutage() { return model.listRoutage(); }
