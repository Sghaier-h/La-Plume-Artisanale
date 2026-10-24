// service.js — documents/photos-boite-tri (§14quater.4)
import * as model from './model.js';

export const ingestPhoto     = (input)        => model.ingestPhoto(input);
export const list            = (q)            => model.list(q);
export const count           = (q)            => model.count(q);
export const getOne          = (id)           => model.findById(id);
export const rattacher       = (body, user)   => model.rattacher(body, user);
export const ignorer         = (body, user)   => model.ignorer(body, user);
export const marquerEnCours  = (body, user)   => model.marquerEnCours(body, user);
