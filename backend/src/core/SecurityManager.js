/**
 * SecurityManager - Gestionnaire de sécurité inspiré d'Odoo
 * Gère les permissions et règles d'accès
 */

import fs from 'fs';
import path from 'path';

export class SecurityManager {
  constructor() {
    this.accessRights = new Map();
    this.recordRules = new Map();
  }

  /**
   * Charge les permissions d'un module
   */
  async loadModuleSecurity(moduleName) {
    const accessPath = path.join(
      process.cwd(),
      'backend',
      'modules',
      moduleName,
      'security',
      'ir.model.access.json'
    );

    const rulesPath = path.join(
      process.cwd(),
      'backend',
      'modules',
      moduleName,
      'security',
      'ir_rules.json'
    );

    // Charger les permissions
    if (fs.existsSync(accessPath)) {
      const accessData = JSON.parse(fs.readFileSync(accessPath, 'utf8'));
      for (const [model, rules] of Object.entries(accessData)) {
        if (!this.accessRights.has(model)) {
          this.accessRights.set(model, []);
        }
        this.accessRights.get(model).push(...rules);
      }
    }

    // Charger les règles d'accès
    if (fs.existsSync(rulesPath)) {
      const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
      for (const [model, rules] of Object.entries(rulesData)) {
        if (!this.recordRules.has(model)) {
          this.recordRules.set(model, []);
        }
        this.recordRules.get(model).push(...rules);
      }
    }
  }

  /**
   * Vérifie les permissions d'accès à un modèle
   */
  checkAccess(user, modelName, operation) {
    const userGroups = user.groups || [];
    const modelRights = this.accessRights.get(modelName) || [];

    for (const right of modelRights) {
      // Vérifier si l'utilisateur appartient au groupe
      if (userGroups.includes(right.group)) {
        // Vérifier la permission pour l'opération
        const permField = `perm_${operation}`;
        if (right[permField]) {
          return true;
        }
      }
    }

    // Vérifier si l'utilisateur est admin
    if (user.role === 'ADMIN') {
      return true;
    }

    return false;
  }

  /**
   * Applique les règles d'accès (record rules)
   */
  applyRecordRules(user, modelName, domain = []) {
    const userGroups = user.groups || [];
    const modelRules = this.recordRules.get(modelName) || [];

    let finalDomain = [...domain];

    for (const rule of modelRules) {
      // Vérifier si l'utilisateur appartient au groupe
      if (rule.groups.some(group => userGroups.includes(group))) {
        // Appliquer le domaine de la règle
        if (rule.domain && rule.domain.length > 0) {
          // Convertir le domaine avec les variables utilisateur
          const ruleDomain = this._evaluateDomain(rule.domain, user);
          
          // Combiner avec le domaine existant (ET logique)
          finalDomain = ['&', ...finalDomain, ...ruleDomain];
        }
      }
    }

    return finalDomain;
  }

  /**
   * Évalue un domaine en remplaçant les variables
   */
  _evaluateDomain(domain, user) {
    const evaluated = [];

    for (const item of domain) {
      if (Array.isArray(item) && item.length === 3) {
        const [field, operator, value] = item;
        
        // Remplacer les variables utilisateur
        let evaluatedValue = value;
        if (typeof value === 'string') {
          if (value === 'user.id') {
            evaluatedValue = user.id;
          } else if (value.startsWith('user.')) {
            const userField = value.split('.')[1];
            evaluatedValue = user[userField];
          }
        }

        evaluated.push([field, operator, evaluatedValue]);
      } else {
        evaluated.push(item);
      }
    }

    return evaluated;
  }

  /**
   * Middleware Express pour vérifier les permissions
   */
  middleware(modelName, operation) {
    return async (req, res, next) => {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Vérifier les permissions
      if (!this.checkAccess(user, modelName, operation)) {
        return res.status(403).json({ 
          error: `You don't have permission to ${operation} ${modelName}` 
        });
      }

      // Appliquer les règles d'accès au domaine de recherche
      if (req.query.domain) {
        try {
          const domain = JSON.parse(req.query.domain);
          req.query.domain = this.applyRecordRules(user, modelName, domain);
        } catch (error) {
          // Ignorer si le domaine n'est pas valide
        }
      }

      next();
    };
  }

  /**
   * Charge la sécurité pour tous les modules chargés
   */
  async loadSecurity(moduleManager) {
    if (!moduleManager) {
      console.warn('⚠️ ModuleManager non fourni, chargement de la sécurité ignoré');
      return;
    }

    const loadedModules = moduleManager.listModules();
    for (const module of loadedModules) {
      try {
        await this.loadModuleSecurity(module.name);
      } catch (error) {
        // Ignorer les erreurs de chargement de sécurité (fichiers optionnels)
        console.warn(`⚠️ Erreur chargement sécurité pour ${module.name}:`, error.message);
      }
    }
  }
}

export const securityManager = new SecurityManager();

export default SecurityManager;
