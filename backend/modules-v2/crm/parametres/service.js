import * as M from './model.js';

export const list   = (kind, opts)  => M.list(kind, opts);
export const upsert = (kind, item)  => M.upsert(kind, item);
export const remove = (kind, id)    => M.remove(kind, id);
