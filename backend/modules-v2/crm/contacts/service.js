import * as M from './model.js';

export const list   = (params) => M.list(params);
export const get    = (id)     => M.findById(id);
export const create = (input)  => M.create(input);
export const update = (id, p)  => M.update(id, p);
export const remove = (id)     => M.remove(id);
