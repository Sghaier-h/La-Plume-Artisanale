/**
 * Environment - Contexte d'exécution inspiré d'Odoo
 * Gère l'utilisateur, le contexte et l'accès aux modèles
 */

import { pool } from '../utils/db.js';

export class Environment {
  constructor(userId, context = {}) {
    this.userId = userId;
    this.context = context;
    this.models = new Map();
    this.db = pool;
  }

  /**
   * Obtient un modèle par son nom
   */
  model(modelName) {
    if (!this.models.has(modelName)) {
      throw new Error(`Model ${modelName} not found. Make sure it's registered.`);
    }

    const ModelClass = this.models.get(modelName);
    const instance = new ModelClass();
    instance.setEnvironment(this);
    return instance;
  }

  /**
   * Enregistre un modèle
   */
  registerModel(modelName, ModelClass) {
    this.models.set(modelName, ModelClass);
  }

  /**
   * Crée un nouvel environnement avec un utilisateur différent
   */
  withUser(userId) {
    return new Environment(userId, this.context);
  }

  /**
   * Crée un nouvel environnement avec un contexte différent
   */
  withContext(context) {
    return new Environment(this.userId, { ...this.context, ...context });
  }

  /**
   * Mode superuser (bypass permissions)
   */
  sudo() {
    return new Environment(null, { ...this.context, sudo: true });
  }

  /**
   * Vérifie si l'environnement est en mode superuser
   */
  isSudo() {
    return this.context.sudo === true || this.userId === null;
  }
}

/**
 * Registry - Registre global des modèles
 */
class Registry {
  constructor() {
    this.models = new Map();
    this.environments = new WeakMap();
  }

  /**
   * Enregistre un modèle
   */
  register(modelName, ModelClass) {
    this.models.set(modelName, ModelClass);
  }

  /**
   * Obtient un modèle
   */
  get(modelName) {
    return this.models.get(modelName);
  }

  /**
   * Crée un environnement pour un utilisateur
   */
  createEnvironment(userId, context = {}) {
    const env = new Environment(userId, context);
    
    // Enregistrer tous les modèles dans l'environnement
    for (const [name, ModelClass] of this.models) {
      env.registerModel(name, ModelClass);
    }

    return env;
  }
}

export const registry = new Registry();

export default Environment;
