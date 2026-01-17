import axios from 'axios';

// Utiliser localhost en développement, VPS en production
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://fabrication.laplume-artisanale.tn/api'
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs de connexion
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Erreur de connexion au serveur:', error.message);
      // Ne pas afficher d'alerte si on est en mode développement et que l'API n'est pas disponible
      if (process.env.NODE_ENV === 'development') {
        console.warn('Le backend n\'est pas accessible. Vérifiez qu\'il est démarré sur http://localhost:5000');
      }
    }
    
    if (error.response?.status === 401) {
      // Ne rediriger que si on n'est pas déjà sur la page de login
      // et seulement si le token existe (pour éviter les redirections en boucle)
      const token = localStorage.getItem('token');
      if (token && window.location.pathname !== '/login') {
        console.warn('Token invalide ou expiré, déconnexion...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Services API
export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const productionService = {
  getOFs: () => api.get('/production/ofs'),
  getOF: (id: number) => api.get(`/production/ofs/${id}`),
  createOF: (data: any) => api.post('/production/ofs', data),
  updateOF: (id: number, data: any) => api.put(`/production/ofs/${id}`, data),
  getMachines: () => api.get('/production/machines'),
  getPlanning: () => api.get('/production/planning'),
};

export const stockService = {
  getStockMP: () => api.get('/stock/mp'),
  getStockPF: () => api.get('/stock/pf'),
  createTransfert: (data: any) => api.post('/stock/transferts', data),
};

export const planningService = {
  getPlanning: () => api.get('/planning-dragdrop'),
  updatePlanning: (data: any) => api.put('/planning', data),
  assignMachine: (machineId: number, data: any) =>
    api.post('/planning-dragdrop/assigner', { ...data, machineId }),
  reordonnerOF: (machineId: number, ofIds: number[]) =>
    api.post('/planning-dragdrop/reordonner', { machineId, ofIds }),
};

export const articlesService = {
  getArticles: (params?: any) => api.get('/articles', { params }),
  getArticle: (id: number) => api.get(`/articles/${id}`),
  createArticle: (data: any) => api.post('/articles', data),
  updateArticle: (id: number, data: any) => api.put(`/articles/${id}`, data),
  deleteArticle: (id: number) => api.delete(`/articles/${id}`),
  getTypesArticles: () => api.get('/articles/types'),
};

export const clientsService = {
  getClients: (params?: any) => api.get('/clients', { params }),
  getClient: (id: number) => api.get(`/clients/${id}`),
  createClient: (data: any) => api.post('/clients', data),
  updateClient: (id: number, data: any) => api.put(`/clients/${id}`, data),
  deleteClient: (id: number) => api.delete(`/clients/${id}`),
};

export const commandesService = {
  getCommandes: (params?: any) => api.get('/commandes', { params }),
  getCommande: (id: number) => api.get(`/commandes/${id}`),
  createCommande: (data: any) => api.post('/commandes', data),
  updateCommande: (id: number, data: any) => api.put(`/commandes/${id}`, data),
  validerCommande: (id: number) => api.post(`/commandes/${id}/valider`),
};

export const devisService = {
  getDevis: (params?: any) => api.get('/devis', { params }),
  getDevisById: (id: number) => api.get(`/devis/${id}`),
  createDevis: (data: any) => api.post('/devis', data),
  updateDevis: (id: number, data: any) => api.put(`/devis/${id}`, data),
  deleteDevis: (id: number) => api.delete(`/devis/${id}`),
  transformerEnCommande: (id: number, data?: any) => api.post(`/devis/${id}/transformer`, data),
};

export const bonsLivraisonService = {
  getBonsLivraison: (params?: any) => api.get('/bons-livraison', { params }),
  getBonLivraisonById: (id: number) => api.get(`/bons-livraison/${id}`),
  createBonLivraison: (data: any) => api.post('/bons-livraison', data),
  createFromCommande: (id: number, data?: any) => api.post(`/bons-livraison/from-commande/${id}`, data),
  updateBonLivraison: (id: number, data: any) => api.put(`/bons-livraison/${id}`, data),
  deleteBonLivraison: (id: number) => api.delete(`/bons-livraison/${id}`),
};

export const facturesService = {
  getFactures: (params?: any) => api.get('/factures', { params }),
  getFactureById: (id: number) => api.get(`/factures/${id}`),
  createFacture: (data: any) => api.post('/factures', data),
  createFromCommande: (id: number, data?: any) => api.post(`/factures/from-commande/${id}`, data),
  createFromBL: (id: number, data?: any) => api.post(`/factures/from-bl/${id}`, data),
  updateFacture: (id: number, data: any) => api.put(`/factures/${id}`, data),
  deleteFacture: (id: number) => api.delete(`/factures/${id}`),
};

export const avoirsService = {
  getAvoirs: (params?: any) => api.get('/avoirs', { params }),
  getAvoirById: (id: number) => api.get(`/avoirs/${id}`),
  createAvoir: (data: any) => api.post('/avoirs', data),
  createFromFacture: (id: number, data?: any) => api.post(`/avoirs/from-facture/${id}`, data),
  updateAvoir: (id: number, data: any) => api.put(`/avoirs/${id}`, data),
  deleteAvoir: (id: number) => api.delete(`/avoirs/${id}`),
};

export const bonsRetourService = {
  getBonsRetour: (params?: any) => api.get('/bons-retour', { params }),
  getBonRetourById: (id: number) => api.get(`/bons-retour/${id}`),
  createBonRetour: (data: any) => api.post('/bons-retour', data),
  createFromBL: (id: number, data?: any) => api.post(`/bons-retour/from-bl/${id}`, data),
  updateBonRetour: (id: number, data: any) => api.put(`/bons-retour/${id}`, data),
  deleteBonRetour: (id: number) => api.delete(`/bons-retour/${id}`),
};

export const machinesService = {
  getMachines: (params?: any) => api.get('/machines', { params }),
  getMachine: (id: number) => api.get(`/machines/${id}`),
  createMachine: (data: any) => api.post('/machines', data),
  updateMachine: (id: number, data: any) => api.put(`/machines/${id}`, data),
  getTypesMachines: () => api.get('/machines/types'),
  getMachinePlanning: (id: number, params?: any) => api.get(`/machines/${id}/planning`, { params }),
};

export const ofService = {
  getOFs: (params?: any) => api.get('/of', { params }),
  getOF: (id: number) => api.get(`/of/${id}`),
  createOF: (data: any) => api.post('/of', data),
  updateOF: (id: number, data: any) => api.put(`/of/${id}`, data),
  assignerMachine: (id: number, data: any) => api.post(`/of/${id}/assigner-machine`, data),
  demarrerOF: (id: number) => api.post(`/of/${id}/demarrer`),
  terminerOF: (id: number, data?: any) => api.post(`/of/${id}/terminer`, data),
};

export const soustraitantsService = {
  getSoustraitants: (params?: any) => api.get('/soustraitants', { params }),
  getSoustraitant: (id: number) => api.get(`/soustraitants/${id}`),
  createSoustraitant: (data: any) => api.post('/soustraitants', data),
  updateSoustraitant: (id: number, data: any) => api.put(`/soustraitants/${id}`, data),
  getMouvements: (id: number, params?: any) => api.get(`/soustraitants/${id}/mouvements`, { params }),
  enregistrerSortie: (id: number, data: any) => api.post(`/soustraitants/${id}/sortie`, data),
  enregistrerRetour: (id: number, data: any) => api.post(`/soustraitants/${id}/retour`, data),
  getAlertesRetard: () => api.get('/soustraitants/alertes/retard'),
};

export const dashboardService = {
  getKPIs: () => api.get('/dashboard/kpis'),
  getProductionStats: (params?: any) => api.get('/dashboard/production', { params }),
  getCommandesStats: (params?: any) => api.get('/dashboard/commandes', { params }),
  getAlertes: () => api.get('/dashboard/alertes'),
};

export const parametrageService = {
  getSociete: () => api.get('/parametrage/societe'),
  updateSociete: (data: any) => api.put('/parametrage/societe', data),
  getParametresSysteme: () => api.get('/parametrage/systeme'),
  updateParametreSysteme: (cle: string, data: any) => api.put(`/parametrage/systeme/${cle}`, data),
  getParametresModule: (module: string) => api.get(`/parametrage/module/${module}`),
  updateParametresModule: (module: string, data: any) => api.put(`/parametrage/module/${module}`, data),
};

export const utilisateursService = {
  getUtilisateurs: () => api.get('/utilisateurs'),
  getUtilisateur: (id: number) => api.get(`/utilisateurs/${id}`),
  createUtilisateur: (data: any) => api.post('/utilisateurs', data),
  updateUtilisateur: (id: number, data: any) => api.put(`/utilisateurs/${id}`, data),
  deleteUtilisateur: (id: number) => api.delete(`/utilisateurs/${id}`),
  getRoles: () => api.get('/utilisateurs/roles'),
  getDashboards: () => api.get('/utilisateurs/dashboards'),
};

export const matieresPremieresService = {
  getMatieresPremieres: (params?: any) => api.get('/matieres-premieres', { params }),
  getMatierePremiere: (id: number) => api.get(`/matieres-premieres/${id}`),
  createMatierePremiere: (data: any) => api.post('/matieres-premieres', data),
  updateMatierePremiere: (id: number, data: any) => api.put(`/matieres-premieres/${id}`, data),
  getTypesMP: () => api.get('/matieres-premieres/types'),
};

export const suiviFabricationService = {
  getSuivisFabrication: (params?: any) => api.get('/suivi-fabrication', { params }),
  getSuiviFabrication: (id: number) => api.get(`/suivi-fabrication/${id}`),
  createSuiviFabrication: (data: any) => api.post('/suivi-fabrication', data),
  updateSuiviFabrication: (id: number, data: any) => api.put(`/suivi-fabrication/${id}`, data),
  getAvancementOF: (of_id: number) => api.get(`/suivi-fabrication/of/${of_id}/avancement`),
};

export const fournisseursService = {
  getFournisseurs: (params?: any) => api.get('/fournisseurs', { params }),
  getFournisseur: (id: number) => api.get(`/fournisseurs/${id}`),
  createFournisseur: (data: any) => api.post('/fournisseurs', data),
  updateFournisseur: (id: number, data: any) => api.put(`/fournisseurs/${id}`, data),
};

export const parametresCatalogueService = {
  getDimensions: () => api.get('/parametres-catalogue/dimensions'),
  getFinitions: () => api.get('/parametres-catalogue/finitions'),
  getTissages: () => api.get('/parametres-catalogue/tissages'),
  getCouleurs: () => api.get('/parametres-catalogue/couleurs'),
  getModeles: () => api.get('/parametres-catalogue/modeles'),
  createParametre: (type: string, data: any) => api.post(`/parametres-catalogue/${type}`, data),
  updateParametre: (type: string, id: number, data: any) => api.put(`/parametres-catalogue/${type}/${id}`, data),
};

export const articlesCatalogueService = {
  getCatalogue: (params?: any) => api.get('/articles-catalogue', { params }),
  getArticleCatalogue: (id: number) => api.get(`/articles-catalogue/${id}`),
  createArticleCatalogue: (data: any) => api.post('/articles-catalogue', data),
  updateArticleCatalogue: (id: number, data: any) => api.put(`/articles-catalogue/${id}`, data),
};

export const tracabiliteLotsService = {
  getLots: (params?: any) => api.get('/tracabilite-lots', { params }),
  createLot: (data: any) => api.post('/tracabilite-lots', data),
  getQRCodeLot: (id: number) => api.get(`/tracabilite-lots/${id}/qr-code`),
  genererEtiquette: (id: number) => api.post(`/tracabilite-lots/${id}/imprimer-etiquette`),
};

export const qualiteAvanceeService = {
  getControles: (params?: any) => api.get('/qualite-avancee/controles', { params }),
  enregistrerControlePremierePiece: (data: any) => api.post('/qualite-avancee/controle-premiere-piece', data),
  getNonConformites: (params?: any) => api.get('/qualite-avancee/non-conformites', { params }),
  createNonConformite: (data: any) => api.post('/qualite-avancee/non-conformites', data),
  ajouterActionsCorrectives: (id: number, data: any) => api.post(`/qualite-avancee/non-conformites/${id}/actions-correctives`, data),
};

export const documentsService = {
  genererDossierFabrication: (ofId: number) => api.get(`/documents/of/${ofId}/dossier-fabrication`, { responseType: 'blob' }),
  exportExcel: (type: string, params?: any) => api.get(`/documents/export/excel?type=${type}`, { responseType: 'blob', params }),
};

export const tachesService = {
  getTaches: (params?: any) => api.get('/taches', { params }),
  getMesTaches: () => api.get('/taches/mes-taches'),
  getTachesPoste: (poste: string) => api.get(`/taches/poste/${poste}`),
  getTache: (id: number) => api.get(`/taches/${id}`),
  createTache: (data: any) => api.post('/taches', data),
  assignerTache: (id: number, data: any) => api.post(`/taches/${id}/assigner`, data),
  demarrerTache: (id: number) => api.post(`/taches/${id}/demarrer`),
  terminerTache: (id: number, data?: any) => api.post(`/taches/${id}/terminer`, data),
  pauseTache: (id: number) => api.post(`/taches/${id}/pause`),
};

export const notificationsService = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  getNotificationsNonLues: () => api.get('/notifications/non-lues'),
  marquerLue: (id: number) => api.put(`/notifications/${id}/lue`),
  lireToutes: () => api.put('/notifications/lire-toutes'),
  deleteNotification: (id: number) => api.delete(`/notifications/${id}`),
};

export const messagesService = {
  envoyerMessage: (data: any) => api.post('/messages', data),
  getMessages: (params?: any) => api.get('/messages', { params }),
  marquerMessageLu: (id: number) => api.put(`/messages/${id}/lu`),
};

export const maintenanceService = {
  getInterventions: (params?: any) => api.get('/maintenance/interventions', { params }),
  createIntervention: (data: any) => api.post('/maintenance/interventions', data),
  getAlertes: (params?: any) => api.get('/maintenance/alertes', { params }),
  getPlanification: (params?: any) => api.get('/maintenance/planification', { params }),
  getPieces: (params?: any) => api.get('/maintenance/pieces', { params }),
  verifierAlertes: () => api.post('/maintenance/verifier-alertes'),
};

export const planificationGanttService = {
  getProjets: (params?: any) => api.get('/planification-gantt/projets', { params }),
  getTaches: (params?: any) => api.get('/planification-gantt/taches', { params }),
  createTache: (data: any) => api.post('/planification-gantt/taches', data),
  getRessources: () => api.get('/planification-gantt/ressources'),
  getGanttData: (params?: any) => api.get('/planification-gantt/gantt-data', { params }),
};

export const qualiteAvanceService = {
  getControles: (params?: any) => api.get('/qualite-avance/controles', { params }),
  createControle: (data: any) => api.post('/qualite-avance/controles', data),
  getNonConformites: (params?: any) => api.get('/qualite-avance/non-conformites', { params }),
  getStatistiques: (params?: any) => api.get('/qualite-avance/statistiques', { params }),
  getDiagrammes: (params?: any) => api.get('/qualite-avance/diagrammes', { params }),
};

export const coutsService = {
  getBudgets: (params?: any) => api.get('/couts/budgets', { params }),
  getCoutTheorique: (id_of: number) => api.get(`/couts/cout-theorique/${id_of}`),
  getCoutReel: (id_of: number) => api.get(`/couts/cout-reel/${id_of}`),
  analyserEcarts: (id_of: number) => api.get(`/couts/analyse-ecarts/${id_of}`),
};

export const multisocieteService = {
  getSocietes: () => api.get('/multisociete/societes'),
  createSociete: (data: any) => api.post('/multisociete/societes', data),
  getEtablissements: (params?: any) => api.get('/multisociete/etablissements', { params }),
  getTransferts: (params?: any) => api.get('/multisociete/transferts', { params }),
  createTransfert: (data: any) => api.post('/multisociete/transferts', data),
  getConsolidations: (params?: any) => api.get('/multisociete/consolidations', { params }),
};

export const communicationService = {
  getCanaux: () => api.get('/communication/canaux'),
  getMessages: (params?: any) => api.get('/communication/messages', { params }),
  envoyerMessage: (data: any) => api.post('/communication/messages', data),
  getTemplates: (params?: any) => api.get('/communication/templates', { params }),
  getConversations: (params?: any) => api.get('/communication/conversations', { params }),
};

export const ecommerceService = {
  getBoutiques: () => api.get('/ecommerce/boutiques'),
  getProduitsBoutique: (params?: any) => api.get('/ecommerce/produits', { params }),
  getCommandesEcommerce: (params?: any) => api.get('/ecommerce/commandes', { params }),
  getRecommandationsIA: (id_produit: number, params?: any) => api.get(`/ecommerce/recommandations/${id_produit}`, { params }),
  genererRecommandationsIA: (data: any) => api.post('/ecommerce/generer-recommandations', data),
};

export const produitsService = {
  getProduits: (params?: any) => api.get('/produits', { params }),
  getProduit: (id: number) => api.get(`/produits/${id}`),
  createProduit: (data: any) => api.post('/produits', data),
  updateProduit: (id: number, data: any) => api.put(`/produits/${id}`, data),
  deleteProduit: (id: number) => api.delete(`/produits/${id}`),
  getAttributs: () => api.get('/produits/attributs'),
  createAttribut: (data: any) => api.post('/produits/attributs', data),
  updateAttribut: (id: number, data: any) => api.put(`/produits/attributs/${id}`, data),
  deleteAttribut: (id: number) => api.delete(`/produits/attributs/${id}`),
  uploadPhoto: (id: number, formData: FormData) => api.post(`/produits/${id}/upload-photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  genererVariantes: (id: number, data: any) => api.post(`/produits/${id}/variantes/generer`, data),
  genererArticleDepuisVariante: (id: number, varianteId: number) => api.post(`/produits/${id}/variantes/${varianteId}/generer-article`),
  genererTousArticles: (id: number) => api.post(`/produits/${id}/variantes/generer-tous-articles`),
};

export const modelesService = {
  getModeles: (params?: any) => api.get('/modeles', { params }),
  getModele: (id: number) => api.get(`/modeles/${id}`),
  createModele: (data: FormData) => api.post('/modeles', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateModele: (id: number, data: FormData) => api.put(`/modeles/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteModele: (id: number) => api.delete(`/modeles/${id}`),
  uploadPhotoModele: (id: number, formData: FormData) => api.post(`/modeles/${id}/upload-photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const articlesGeneresService = {
  getArticles: (params?: any) => api.get('/articles-generes', { params }),
  getArticle: (id: number) => api.get(`/articles-generes/${id}`),
  createArticle: (data: FormData) => api.post('/articles-generes', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateArticle: (id: number, data: FormData) => api.put(`/articles-generes/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteArticle: (id: number) => api.delete(`/articles-generes/${id}`),
  uploadPhotoArticle: (id: number, formData: FormData) => api.post(`/articles-generes/${id}/upload-photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
