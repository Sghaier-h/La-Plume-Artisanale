/**
 * Décorateurs API inspirés d'Odoo
 * @api.depends, @api.constrains, @api.onchange, etc.
 */

/**
 * Décorateur @depends - Définit les dépendances d'un champ calculé
 */
export function depends(...fields) {
  return function(target, propertyKey, descriptor) {
    if (!target._depends) {
      target._depends = new Map();
    }
    target._depends.set(propertyKey, fields);
    return descriptor;
  };
}

/**
 * Décorateur @constrains - Valide des contraintes
 */
export function constrains(...fields) {
  return function(target, propertyKey, descriptor) {
    if (!target._constrains) {
      target._constrains = new Map();
    }
    target._constrains.set(propertyKey, fields);
    return descriptor;
  };
}

/**
 * Décorateur @onchange - Déclenche une action quand un champ change
 */
export function onchange(...fields) {
  return function(target, propertyKey, descriptor) {
    if (!target._onchange) {
      target._onchange = new Map();
    }
    target._onchange.set(propertyKey, fields);
    return descriptor;
  };
}

/**
 * Décorateur @model - Marque une méthode comme méthode de classe
 */
export function model(target, propertyKey, descriptor) {
  descriptor.value._isModelMethod = true;
  return descriptor;
}

/**
 * Décorateur @readonly - Marque un champ comme en lecture seule
 */
export function readonly(target, propertyKey) {
  if (!target._readonly) {
    target._readonly = new Set();
  }
  target._readonly.add(propertyKey);
}

/**
 * Décorateur @required - Marque un champ comme requis
 */
export function required(target, propertyKey) {
  if (!target._required) {
    target._required = new Set();
  }
  target._required.add(propertyKey);
}

export default {
  depends,
  constrains,
  onchange,
  model,
  readonly,
  required
};
