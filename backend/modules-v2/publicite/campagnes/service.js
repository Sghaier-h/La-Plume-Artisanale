// service.js — publicite/campagnes
import { model, baseService } from './model.js';

const STATUTS = ['brouillon','active','en_pause','terminee','archivee','en_revision'];

export const service = {
  ...baseService,

  async listCreatives(idCampagne)         { return model.listCreatives(idCampagne); },
  async getCreative(id)                   { return model.getCreative(id); },
  async createCreative(idCampagne, payload) {
    return model.createCreative({ ...payload, id_campagne: idCampagne });
  },
  async updateCreative(id, payload)       { return model.updateCreative(id, payload); },
  async deleteCreative(id)                { return model.deleteCreative(id); },

  async setStatut(id, statut) {
    if (!STATUTS.includes(statut)) {
      const e = new Error(`Statut invalide : ${statut}`); e.code = 'STATUT_INVALIDE'; e.httpStatus = 400; throw e;
    }
    const row = await model.setStatut(id, statut);
    if (!row) { const e = new Error('Campagne introuvable'); e.code = 'NOT_FOUND'; e.httpStatus = 404; throw e; }
    return row;
  },
};

export default service;
