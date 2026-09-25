import * as M from './model.js';

export const list   = (params)     => M.list(params);
export const get    = (id)         => M.findById(id);
export const create = (input, u)   => M.create(input, u?.id_user);
export const update = (id, patch)  => M.update(id, patch);
export const remove = (id)         => M.remove(id);
