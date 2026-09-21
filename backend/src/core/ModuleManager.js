/**
 * Module Manager - Système de gestion des modules inspiré d'Odoo
 * Gère le chargement, les dépendances et l'ordre d'installation des modules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ModuleManager {
  constructor() {
    this.modules = new Map();
    this.loadedModules = new Set();
    this.modulePath = path.join(__dirname, '../../modules');
  }

  /**
   * Découvre tous les modules disponibles
   */
  async discoverModules() {
    if (!fs.existsSync(this.modulePath)) {
      fs.mkdirSync(this.modulePath, { recursive: true });
      return;
    }

    const moduleDirs = fs.readdirSync(this.modulePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of moduleDirs) {
      const manifestPath = path.join(this.modulePath, moduleName, 'manifest.js');
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = await import(`../../modules/${moduleName}/manifest.js`);
          this.modules.set(moduleName, {
            name: moduleName,
            manifest: manifest.default || manifest,
            path: path.join(this.modulePath, moduleName)
          });
        } catch (error) {
          console.error(`Error loading module ${moduleName}:`, error);
        }
      }
    }
  }

  /**
   * Construit le graphe de dépendances
   */
  buildDependencyGraph() {
    const graph = new Map();
    const inDegree = new Map();

    // Initialiser le graphe
    for (const [name, module] of this.modules) {
      graph.set(name, []);
      inDegree.set(name, 0);
    }

    // Construire les dépendances
    for (const [name, module] of this.modules) {
      const depends = module.manifest.depends || [];
      for (const dep of depends) {
        if (this.modules.has(dep)) {
          graph.get(dep).push(name);
          inDegree.set(name, inDegree.get(name) + 1);
        }
      }
    }

    return { graph, inDegree };
  }

  /**
   * Trie topologique pour déterminer l'ordre de chargement
   */
  topologicalSort() {
    const { graph, inDegree } = this.buildDependencyGraph();
    const queue = [];
    const result = [];

    // Trouver les modules sans dépendances
    for (const [name, degree] of inDegree) {
      if (degree === 0) {
        queue.push(name);
      }
    }

    // Traitement
    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);

      for (const neighbor of graph.get(current)) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  /**
   * Charge un module
   */
  async loadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      return;
    }

    const module = this.modules.get(moduleName);
    if (!module) {
      throw new Error(`Module ${moduleName} not found`);
    }

    // Charger les dépendances d'abord (optionnelles)
    const depends = module.manifest.depends || [];
    for (const dep of depends) {
      try {
        await this.loadModule(dep);
      } catch (error) {
        // Si la dépendance n'existe pas, afficher un avertissement mais continuer
        if (error.message && error.message.includes('not found')) {
          console.warn(`⚠️ Dépendance manquante (ignorée): ${dep} (requise par ${moduleName})`);
        } else {
          // Pour les autres erreurs, propager l'erreur
          throw error;
        }
      }
    }

    // Charger le module
    try {
      // Charger les modèles
      if (module.manifest.models) {
        for (const modelPath of module.manifest.models) {
          try {
            await import(`../../modules/${moduleName}/${modelPath}`);
          } catch (error) {
            console.warn(`⚠️ Modèle non trouvé (ignoré): ${moduleName}/${modelPath}`);
          }
        }
      }

      // Charger les contrôleurs
      if (module.manifest.controllers) {
        for (const controllerPath of module.manifest.controllers) {
          try {
            await import(`../../modules/${moduleName}/${controllerPath}`);
          } catch (error) {
            console.warn(`⚠️ Contrôleur non trouvé (ignoré): ${moduleName}/${controllerPath}`);
          }
        }
      }

      // Charger les routes
      if (module.manifest.routes) {
        for (const routePath of module.manifest.routes) {
          try {
            await import(`../../modules/${moduleName}/${routePath}`);
          } catch (error) {
            console.warn(`⚠️ Route non trouvée (ignorée): ${moduleName}/${routePath}`);
          }
        }
      }

      // Exécuter le hook post-load (optionnel)
      if (module.manifest.postLoad) {
        try {
          const postLoad = await import(`../../modules/${moduleName}/${module.manifest.postLoad}`);
          if (postLoad.default && typeof postLoad.default === 'function') {
            await postLoad.default();
          }
        } catch (error) {
          console.warn(`⚠️ Hook postLoad non trouvé (ignoré): ${moduleName}/${module.manifest.postLoad}`);
        }
      }

      this.loadedModules.add(moduleName);
      console.log(`✅ Module ${moduleName} loaded`);
    } catch (error) {
      console.error(`❌ Error loading module ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Charge tous les modules dans l'ordre correct
   */
  async loadAllModules() {
    await this.discoverModules();
    const loadOrder = this.topologicalSort();

    for (const moduleName of loadOrder) {
      await this.loadModule(moduleName);
    }

    return Array.from(this.loadedModules);
  }

  /**
   * Obtient les informations d'un module
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * Liste tous les modules disponibles
   */
  listModules() {
    return Array.from(this.modules.values());
  }
}

export default new ModuleManager();
