import { baseService, model } from './model.js';

export const service = {
  ...baseService,
  listVariantes: (id) => model.listVariantes(id),
};

export default service;
