import * as M from './model.js';

export const list    = (params)             => M.list(params);
export const get     = (id)                 => M.findById(id);
export const create  = (input, user)        => M.create(input, user?.id_user);
export const update  = (id, patch)          => M.update(id, patch);
export const remove  = (id)                 => M.remove(id);
export const convert = (id, extras, user)   => M.convert(id, extras, user?.id_user);
