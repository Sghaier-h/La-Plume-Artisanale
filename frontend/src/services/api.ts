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

// Intercepteur pour ajouter le token et la société active
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajouter l'ID de la société active dans les headers si disponible
    const activeCompanyStr = localStorage.getItem('app_active_company');
    if (activeCompanyStr) {
      try {
        const activeCompany = JSON.parse(activeCompanyStr);
        if (activeCompany?.id_societe) {
          config.headers['X-Active-Company-Id'] = activeCompany.id_societe.toString();
        }
      } catch (e) {
        console.warn('Erreur parsing société active:', e);
      }
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

    if (error.response?.status === 429) {
      // Gérer l'erreur de rate limiting
      const retryAfter = error.response.headers['retry-after'];
      const message = error.response.data?.error?.message || 
        (retryAfter 
          ? `Trop de requêtes. Veuillez patienter ${retryAfter} secondes.`
          : 'Trop de requêtes. Veuillez patienter quelques instants.');
      
      console.warn('Rate limit atteint:', message);
      
      // Afficher une notification si disponible (sera géré par le composant)
      error.rateLimitMessage = message;
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
  getMouvements: (params?: any) => api.get('/stock/mouvements', { params }),
  getMouvement: (id: number) => api.get(`/stock/mouvements/${id}`),
  createMouvement: (data: any) => api.post('/stock/mouvements', data),
  updateMouvement: (id: number, data: any) => api.put(`/stock/mouvements/${id}`, data),
  deleteMouvement: (id: number) => api.delete(`/stock/mouvements/${id}`),
};

export const inventaireService = {
  getInventaires: (params?: any) => api.get('/inventaires', { params }),
  getInventaire: (id: number) => api.get(`/inventaires/${id}`),
  createInventaire: (data: any) => api.post('/inventaires', data),
  updateInventaire: (id: number, data: any) => api.put(`/inventaires/${id}`, data),
  deleteInventaire: (id: number) => api.delete(`/inventaires/${id}`),
  validerInventaire: (id: number, data?: any) => api.post(`/inventaires/${id}/valider`, data),
};

export const entrepotService = {
  getEntrepots: (params?: any) => api.get('/entrepots', { params }),
  getEntrepot: (id: number) => api.get(`/entrepots/${id}`),
  createEntrepot: (data: any) => api.post('/entrepots', data),
  updateEntrepot: (id: number, data: any) => api.put(`/entrepots/${id}`, data),
  deleteEntrepot: (id: number) => api.delete(`/entrepots/${id}`),
};

export const fournitureService = {
  getFournitures: (params?: any) => api.get('/fournitures', { params }),
  getFourniture: (id: number) => api.get(`/fournitures/${id}`),
  createFourniture: (data: any) => api.post('/fournitures', data),
  updateFourniture: (id: number, data: any) => api.put(`/fournitures/${id}`, data),
  deleteFourniture: (id: number) => api.delete(`/fournitures/${id}`),
};

export const planningService = {
  getPlanning: () => api.get('/planning-dragdrop'),
  updatePlanning: (data: any) => api.put('/planning', data),
  assignMachine: (machineId: number, data: any) =>
    api.post('/planning-dragdrop/assigner', { ...data, machineId }),
  reordonnerOF: (machineId: number, ofIds: number[]) =>
    api.post('/planning-dragdrop/reordonner', { machineId, ofIds }),
};

export const clientsService = {
  getClients: (params?: any) => api.get('/clients', { params }),
  getClient: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/clients/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createClient: (data: any) => api.post('/clients', data),
  updateClient: (id: number, data: any) => api.put(`/clients/${id}`, data),
  deleteClient: (id: number, raison?: string) => api.delete(`/clients/${id}`, { data: { raison_desactivation: raison } }),
  getCategories: () => api.get('/clients/categories'),
  getTypesCommerciaux: () => api.get('/clients/types-commerciaux'),
  // Adresses
  getAdresses: (idClient: number, type?: string) => api.get(`/clients/${idClient}/adresses`, { params: { type } }),
  createAdresse: (idClient: number, data: any) => api.post(`/clients/${idClient}/adresses`, data),
  updateAdresse: (idClient: number, idAdresse: number, data: any) => api.put(`/clients/${idClient}/adresses/${idAdresse}`, data),
  deleteAdresse: (idClient: number, idAdresse: number) => api.delete(`/clients/${idClient}/adresses/${idAdresse}`),
  // Contacts
  getContacts: (idClient: number) => api.get(`/clients/${idClient}/contacts`),
  createContact: (idClient: number, data: any) => api.post(`/clients/${idClient}/contacts`, data),
  updateContact: (idClient: number, idContact: number, data: any) => api.put(`/clients/${idClient}/contacts/${idContact}`, data),
  deleteContact: (idClient: number, idContact: number) => api.delete(`/clients/${idClient}/contacts/${idContact}`),
};

export const commandesService = {
  getCommandes: (params?: any) => api.get('/commandes', { params }),
  getCommande: (id: number) => api.get(`/commandes/${id}`),
  createCommande: (data: any) => api.post('/commandes', data),
  updateCommande: (id: number, data: any) => api.put(`/commandes/${id}`, data),
  validerCommande: (id: number) => api.post(`/commandes/${id}/valider`),
  previewOFs: (id: number) => api.get(`/commandes/${id}/preview-ofs`),
  generateOFs: (id: number, payload?: { overrides?: any[]; force?: boolean }) =>
    api.post(`/commandes/${id}/generer-ofs`, payload || {}),
  analyseStock: (id: number) => api.get(`/commandes/${id}/analyse-stock`),
  executerChoix: (id: number, decisions: any[]) =>
    api.post(`/commandes/${id}/executer-choix`, { decisions }),
  getWithOFs: (id: number) => api.get(`/commandes/${id}/with-ofs`),
};

/**
 * Télécharge un PDF depuis une URL d'API et déclenche le save-as navigateur.
 */
export const downloadPdf = async (url: string, filename: string) => {
  const res = await api.get(url, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

export const devisService = {
  getDevis: (params?: any) => api.get('/devis', { params }),
  getDevisById: (id: number) => api.get(`/devis/${id}`),
  createDevis: (data: any) => api.post('/devis', data),
  updateDevis: (id: number, data: any) => api.put(`/devis/${id}`, data),
  deleteDevis: (id: number) => api.delete(`/devis/${id}`),
  transformerEnCommande: (id: number, data?: any) => api.post(`/devis/${id}/transformer`, data),
  downloadPDF: (id: number, numero?: string) => downloadPdf(`/devis/${id}/pdf`, `devis-${numero || id}`),
};

export const bonsLivraisonService = {
  getBonsLivraison: (params?: any) => api.get('/bons-livraison', { params }),
  getBonLivraisonById: (id: number) => api.get(`/bons-livraison/${id}`),
  createBonLivraison: (data: any) => api.post('/bons-livraison', data),
  createFromCommande: (id: number, data?: any) => api.post(`/bons-livraison/from-commande/${id}`, data),
  updateBonLivraison: (id: number, data: any) => api.put(`/bons-livraison/${id}`, data),
  deleteBonLivraison: (id: number) => api.delete(`/bons-livraison/${id}`),
  downloadPDF: (id: number, numero?: string) => downloadPdf(`/bons-livraison/${id}/pdf`, `bl-${numero || id}`),
};

export const facturesService = {
  getFactures: (params?: any) => api.get('/factures', { params }),
  getFactureById: (id: number) => api.get(`/factures/${id}`),
  createFacture: (data: any) => api.post('/factures', data),
  createFromCommande: (id: number, data?: any) => api.post(`/factures/from-commande/${id}`, data),
  createFromBL: (id: number, data?: any) => api.post(`/factures/from-bl/${id}`, data),
  updateFacture: (id: number, data: any) => api.put(`/factures/${id}`, data),
  deleteFacture: (id: number) => api.delete(`/factures/${id}`),
  downloadPDF: (id: number, numero?: string) => downloadPdf(`/factures/${id}/pdf`, `facture-${numero || id}`),
};

export const avoirsService = {
  getAvoirs: (params?: any) => api.get('/avoirs', { params }),
  getAvoirById: (id: number) => api.get(`/avoirs/${id}`),
  createAvoir: (data: any) => api.post('/avoirs', data),
  createFromFacture: (id: number, data?: any) => api.post(`/avoirs/from-facture/${id}`, data),
  updateAvoir: (id: number, data: any) => api.put(`/avoirs/${id}`, data),
  deleteAvoir: (id: number) => api.delete(`/avoirs/${id}`),
  downloadPDF: (id: number, numero?: string) => downloadPdf(`/avoirs/${id}/pdf`, `avoir-${numero || id}`),
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
  deleteMachine: (id: number) => api.delete(`/machines/${id}`),
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
  getDetailComplet: (id: number) => api.get(`/of/${id}/detail-complet`),
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
  getKpisAdmin: () => api.get('/dashboard/kpis-admin'),
  getKpisProduction: () => api.get('/dashboard/kpis-production'),
  getActiviteRecente: (limit = 10) => api.get(`/dashboard/activite-recente?limit=${limit}`),
  getVentesParMois: () => api.get('/dashboard/ventes-par-mois'),
  getTopClients: (limit = 10) => api.get(`/dashboard/top-clients?limit=${limit}`),
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
  getCommerciaux: () => api.get('/utilisateurs/commerciaux'),
  getDashboards: () => api.get('/utilisateurs/dashboards'),
  getEquipe: () => api.get('/utilisateurs/equipe'),
  creerUtilisateurEquipe: (idOperateur: number, data: { email: string; password: string; dashboards: string[] }) =>
    api.post(`/utilisateurs/equipe/${idOperateur}/creer-utilisateur`, data),
  // Rôles / Permissions (RBAC)
  getRolesUtilisateur: (id: number) => api.get(`/utilisateurs/${id}/roles`),
  addRoleUtilisateur: (id: number, id_role: number) => api.post(`/utilisateurs/${id}/roles`, { id_role }),
  removeRoleUtilisateur: (id: number, id_role: number) => api.delete(`/utilisateurs/${id}/roles/${id_role}`),
  getPermissions: () => api.get('/utilisateurs/permissions'),
  getRolePermissions: (id_role: number) => api.get(`/utilisateurs/roles/${id_role}/permissions`),
  updateRolePermissions: (id_role: number, codes: string[]) =>
    api.put(`/utilisateurs/roles/${id_role}/permissions`, { codes }),
  getUserPermissions: (id: number) => api.get(`/utilisateurs/${id}/permissions`),
};

export const auditService = {
  getAuditLogs: (params?: any) => api.get('/audit', { params }),
  getAuditLog: (id: number) => api.get(`/audit/${id}`),
  getAuditStatsByTable: () => api.get('/audit/stats/by-table'),
  getAuditStatsByUser: () => api.get('/audit/stats/by-user'),
  getRecordHistory: (table: string, id: number) => api.get(`/audit/record/${table}/${id}`),
  getAuditedTables: () => api.get('/audit/tables'),
};

export const matieresPremieresService = {
  getMatieresPremieres: (params?: any) => api.get('/matieres-premieres', { params }),
  getMatierePremiere: (id: number) => api.get(`/matieres-premieres/${id}`),
  createMatierePremiere: (data: any) => api.post('/matieres-premieres', data),
  updateMatierePremiere: (id: number, data: any) => api.put(`/matieres-premieres/${id}`, data),
  deleteMatierePremiere: (id: number) => api.delete(`/matieres-premieres/${id}`),
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
  getTypesProduits: () => api.get('/parametres-catalogue/types-produits'),
  getCouleurs: () => api.get('/parametres-catalogue/couleurs'),
  getNombreCouleurs: () => api.get('/parametres-catalogue/nombre-couleurs'),
  getModeles: () => api.get('/parametres-catalogue/modeles'),
  getTypesPersonnalisation: () => api.get('/parametres-catalogue/types-personnalisation'),
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
  getStatsGlobal: () => api.get('/tracabilite-lots/stats/global'),
  scanQR: (code: string) => api.get(`/tracabilite-lots/qr/${encodeURIComponent(code)}`),
  getLotsCoupe: (params?: any) => api.get('/tracabilite-lots/coupe', { params }),
  getLotCoupe: (id: number) => api.get(`/tracabilite-lots/coupe/${id}`),
  createLotCoupe: (data: any) => api.post('/tracabilite-lots/coupe', data),
  updateLotCoupe: (id: number, data: any) => api.put(`/tracabilite-lots/coupe/${id}`, data),
  updateStatutLot: (id: number, statut: string) =>
    api.put(`/tracabilite-lots/coupe/${id}/statut`, { statut }),
  deleteLotCoupe: (id: number) => api.delete(`/tracabilite-lots/coupe/${id}`),
  getLotsByOF: (id_of: number) => api.get(`/tracabilite-lots/of/${id_of}`),
  getChaine: (id: number) => api.get(`/tracabilite-lots/${id}/chaine`),
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
  getMaintenances: (params?: any) => api.get('/maintenance', { params }),
  getMaintenance: (id: number) => api.get(`/maintenance/${id}`),
  createMaintenance: (data: any) => api.post('/maintenance', data),
  updateMaintenance: (id: number, data: any) => api.put(`/maintenance/${id}`, data),
  deleteMaintenance: (id: number) => api.delete(`/maintenance/${id}`),
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
  getControle: (id: number) => api.get(`/qualite-avance/controles/${id}`),
  createControle: (data: any) => api.post('/qualite-avance/controles', data),
  updateControle: (id: number, data: any) => api.put(`/qualite-avance/controles/${id}`, data),
  validerControle: (id: number, data?: any) => api.post(`/qualite-avance/controles/${id}/valider`, data),
  refuserControle: (id: number, data?: any) => api.post(`/qualite-avance/controles/${id}/refuser`, data),
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
  getSocietes: () => api.get('/multisociete'),
  createSociete: (data: any) => api.post('/multisociete', data),
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
  getBoutiques: () => api.get('/ecommerce'),
  getProduitsBoutique: (params?: any) => api.get('/ecommerce/products', { params }),
  getCommandesEcommerce: (params?: any) => api.get('/ecommerce/orders', { params }),
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
  getVariantes: (id: number) => api.get(`/modeles/${id}/variantes`),
  getMatrice: (id: number) => api.get(`/modeles/${id}/matrice`),
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

export const excelImportService = {
  preview: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/excel-import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  upload: (file: File, type: string, mapping: Record<string, string>) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify({ type, mapping }));
    return api.post('/excel-import/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getTemplates: () => api.get('/excel-import/templates'),
};

// Services de gestion avancée - Intégration native dans votre ERP
export const articlesService = {
  getArticles: (params?: any) => api.get('/articles', { params }),
  getArticle: (id: number) => api.get(`/articles/${id}`),
  createArticle: (data: any) => api.post('/articles', data),
  updateArticle: (id: number, data: any) => api.put(`/articles/${id}`, data),
  deleteArticle: (id: number) => api.delete(`/articles/${id}`),
  getTypesArticles: () => api.get('/articles/types'),
};

// ===== SERVICES ERP STANDARDS (Odoo-inspired) =====
// Note: productTemplatesService, productsService, productCategoryService,
// et pricelistsService supprimés — le module backend /api/product/* et l'arbre
// frontend pages/erp/ ont été retirés. Utiliser produitsService à la place.

export const saleOrdersService = {
  getOrders: (params?: any) => api.get('/sale/orders', { params }),
  getOrder: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/sale/orders/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createOrder: (data: any) => api.post('/sale/orders', data),
  updateOrder: (id: number, data: any) => api.put(`/sale/orders/${id}`, data),
  deleteOrder: (id: number) => api.delete(`/sale/orders/${id}`),
  confirmOrder: (id: number) => api.post(`/sale/orders/${id}/confirm`),
  cancelOrder: (id: number) => api.post(`/sale/orders/${id}/cancel`),
  // Relations
  getOrderLines: (orderId: number) => api.get(`/sale/orders/${orderId}/lines`),
  createOrderLine: (orderId: number, data: any) => api.post(`/sale/orders/${orderId}/lines`, data),
  updateOrderLine: (orderId: number, lineId: number, data: any) => 
    api.put(`/sale/orders/${orderId}/lines/${lineId}`, data),
  deleteOrderLine: (orderId: number, lineId: number) => 
    api.delete(`/sale/orders/${orderId}/lines/${lineId}`),
};

export const stockPickingsService = {
  getPickings: (params?: any) => api.get('/stock/pickings', { params }),
  getPicking: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/stock/pickings/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createPicking: (data: any) => api.post('/stock/pickings', data),
  updatePicking: (id: number, data: any) => api.put(`/stock/pickings/${id}`, data),
  deletePicking: (id: number) => api.delete(`/stock/pickings/${id}`),
  validatePicking: (id: number) => api.post(`/stock/pickings/${id}/validate`),
  // Relations
  getPickingMoves: (pickingId: number) => api.get(`/stock/pickings/${pickingId}/moves`),
};

export const productionsService = {
  getProductions: (params?: any) => api.get('/mrp/productions', { params }),
  getProduction: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/mrp/productions/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createProduction: (data: any) => api.post('/mrp/productions', data),
  updateProduction: (id: number, data: any) => api.put(`/mrp/productions/${id}`, data),
  deleteProduction: (id: number) => api.delete(`/mrp/productions/${id}`),
  startProduction: (id: number) => api.post(`/mrp/productions/${id}/start`),
  finishProduction: (id: number) => api.post(`/mrp/productions/${id}/done`),
  confirmProduction: (id: number) => api.post(`/mrp/productions/${id}/confirm`),
  // Relations
  getProductionMoves: (productionId: number) => api.get(`/mrp/productions/${productionId}/moves`),
};

export const accountMovesService = {
  getMoves: (params?: any) => api.get('/account/moves', { params }),
  getMove: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/account/moves/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createMove: (data: any) => api.post('/account/moves', data),
  updateMove: (id: number, data: any) => api.put(`/account/moves/${id}`, data),
  deleteAccountMove: (id: number) => api.delete(`/account/moves/${id}`),
  postMove: (id: number) => api.post(`/account/moves/${id}/post`),
  // Relations
  getMoveLines: (moveId: number) => api.get(`/account/moves/${moveId}/lines`),
};

export const purchaseOrdersService = {
  getOrders: (params?: any) => api.get('/purchase/orders', { params }),
  getOrder: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/purchase/orders/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createOrder: (data: any) => api.post('/purchase/orders', data),
  updateOrder: (id: number, data: any) => api.put(`/purchase/orders/${id}`, data),
  deleteOrder: (id: number) => api.delete(`/purchase/orders/${id}`),
  confirmOrder: (id: number) => api.post(`/purchase/orders/${id}/confirm`),
  // Relations
  getOrderLines: (orderId: number) => api.get(`/purchase/orders/${orderId}/lines`),
};

// Services CRM
export const crmLeadsService = {
  getLeads: (params?: any) => api.get('/crm/leads', { params }),
  getLead: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/crm/leads/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createLead: (data: any) => api.post('/crm/leads', data),
  updateLead: (id: number, data: any) => api.put(`/crm/leads/${id}`, data),
  deleteLead: (id: number) => api.delete(`/crm/leads/${id}`),
  convertToOpportunity: (id: number, data?: any) => api.post(`/crm/leads/${id}/convert`, data),
};

export const crmOpportunitiesService = {
  getOpportunities: (params?: any) => api.get('/crm/opportunities', { params }),
  getOpportunity: (id: number) => api.get(`/crm/opportunities/${id}`),
  createOpportunity: (data: any) => api.post('/crm/opportunities', data),
  updateOpportunity: (id: number, data: any) => api.put(`/crm/opportunities/${id}`, data),
  qualifyOpportunity: (id: number) => api.post(`/crm/opportunities/${id}/qualify`),
  winOpportunity: (id: number) => api.post(`/crm/opportunities/${id}/win`),
  loseOpportunity: (id: number, reason: string) => api.post(`/crm/opportunities/${id}/lose`, { reason }),
};

export const crmStagesService = {
  getStages: (params?: any) => api.get('/crm/stages', { params }),
  getStage: (id: number) => api.get(`/crm/stages/${id}`),
  createStage: (data: any) => api.post('/crm/stages', data),
};

export const crmActivitiesService = {
  getActivities: (params?: any) => api.get('/crm/activities', { params }),
  createActivity: (data: any) => api.post('/crm/activities', data),
  markDone: (id: number) => api.post(`/crm/activities/${id}/done`),
};

export const hrEmployeesService = {
  getEmployees: (params?: any) => api.get('/hr/employees', { params }),
  getEmployee: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/hr/employees/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createEmployee: (data: any) => api.post('/hr/employees', data),
  updateEmployee: (id: number, data: any) => api.put(`/hr/employees/${id}`, data),
  deleteEmployee: (id: number) => api.delete(`/hr/employees/${id}`),
};

export const hrRecruitmentService = {
  getApplicants: (params?: any) => api.get('/hr/recruitments', { params }),
  getApplicant: (id: number) => api.get(`/hr/recruitments/${id}`),
  createApplicant: (data: any) => api.post('/hr/recruitments', data),
  updateApplicant: (id: number, data: any) => api.put(`/hr/recruitments/${id}`, data),
  deleteApplicant: (id: number) => api.delete(`/hr/recruitments/${id}`),
  hireApplicant: (id: number, data?: any) => api.post(`/hr/recruitments/${id}/hire`, data),
  refuseApplicant: (id: number, data?: any) => api.post(`/hr/recruitments/${id}/refuse`, data),
  rejectApplicant: (id: number, data?: any) => api.post(`/hr/recruitments/${id}/reject`, data),
  getStages: (params?: any) => api.get('/hr/recruitments/stages', { params }),
  getStats: () => api.get('/hr/recruitments/stats/global'),
  getFunnel: (days?: number) => api.get('/hr/recruitments/funnel', { params: days ? { days } : {} }),
  getTimeline: (id: number) => api.get(`/hr/recruitments/${id}/timeline`),
  addNote: (id: number, text: string) => api.post(`/hr/recruitments/${id}/notes`, { text }),
  scheduleInterview: (id: number, data: any) => api.post(`/hr/recruitments/${id}/interview`, data),
  getPostes: () => api.get('/hr/recruitments/postes'),
  getAnalytics: () => api.get('/hr/recruitments/analytics/mensuel'),
};

export const hrPayslipsService = {
  getPayslips: (params?: any) => api.get('/hr/payslips', { params }),
  getPayslip: (id: number) => api.get(`/hr/payslips/${id}`),
  createPayslip: (data: any) => api.post('/hr/payslips', data),
  updatePayslip: (id: number, data: any) => api.put(`/hr/payslips/${id}`, data),
  deletePayslip: (id: number) => api.delete(`/hr/payslips/${id}`),
  computePayslip: (id: number) => api.post(`/hr/payslips/${id}/compute`),
  validatePayslip: (id: number) => api.post(`/hr/payslips/${id}/validate`),
};

export const projectsService = {
  getProjects: (params?: any) => api.get('/project/projects', { params }),
  getProject: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/project/projects/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createProject: (data: any) => api.post('/project/projects', data),
  updateProject: (id: number, data: any) => api.put(`/project/projects/${id}`, data),
  deleteProject: (id: number) => api.delete(`/project/projects/${id}`),
};

export const inventoryService = {
  getInventories: (params?: any) => api.get('/inventory/adjustments', { params }),
  getInventory: (id: number) => api.get(`/inventory/adjustments/${id}`),
  createInventory: (data: any) => api.post('/inventory/adjustments', data),
  updateInventory: (id: number, data: any) => api.put(`/inventory/adjustments/${id}`, data),
  deleteInventory: (id: number) => api.delete(`/inventory/adjustments/${id}`),
};

export const qualityChecksService = {
  getChecks: (params?: any) => api.get('/quality/checks', { params }),
  getCheck: (id: number) => api.get(`/quality/checks/${id}`),
  createCheck: (data: any) => api.post('/quality/checks', data),
  updateCheck: (id: number, data: any) => api.put(`/quality/checks/${id}`, data),
  deleteCheck: (id: number) => api.delete(`/quality/checks/${id}`),
};

export const qualityPointsService = {
  getPoints: (params?: any) => api.get('/quality/points', { params }),
  getPoint: (id: number) => api.get(`/quality/points/${id}`),
  createPoint: (data: any) => api.post('/quality/points', data),
  updatePoint: (id: number, data: any) => api.put(`/quality/points/${id}`, data),
  deletePoint: (id: number) => api.delete(`/quality/points/${id}`),
};

export const qualityAlertsService = {
  getAlerts: (params?: any) => api.get('/quality/alerts', { params }),
  getAlert: (id: number) => api.get(`/quality/alerts/${id}`),
  createAlert: (data: any) => api.post('/quality/alerts', data),
  updateAlert: (id: number, data: any) => api.put(`/quality/alerts/${id}`, data),
  deleteAlert: (id: number) => api.delete(`/quality/alerts/${id}`),
};

export const emailService = {
  sendEmail: (data: any) => api.post('/email/send', data),
  sendTaskNotification: (data: any) => api.post('/email/task-notification', data),
  sendOrderConfirmation: (data: any) => api.post('/email/order-confirmation', data),
};

export const whatsappService = {
  sendMessage: (phoneNumber: string, message: string, options?: any) =>
    api.post('/whatsapp/send', { phoneNumber, message, options }),
  sendTemplate: (data: any) => api.post('/whatsapp/template', data),
  sendOrderConfirmation: (data: any) => api.post('/whatsapp/order-confirmation', data),
  sendTaskNotification: (data: any) => api.post('/whatsapp/task-notification', data),
  getDashboardContact: (dashboardName: string) =>
    api.get(`/whatsapp/dashboard/${dashboardName}/contact`),
  sendFromDashboard: (dashboardName: string, phoneNumber: string, message: string, options?: any) =>
    api.post(`/whatsapp/dashboard/${dashboardName}/send`, { phoneNumber, message, options }),
};

export const ecommerceOdooService = {
  getWebsites: () => api.get('/ecommerce'),
  getWebsite: (id: number) => api.get(`/ecommerce/${id}`),
  createWebsite: (data: any) => api.post('/ecommerce', data),
  updateWebsite: (id: number, data: any) => api.put(`/ecommerce/${id}`, data),
  deleteWebsite: (id: number) => api.delete(`/ecommerce/${id}`),
  getProducts: () => api.get('/ecommerce/products'),
  getOrders: () => api.get('/ecommerce/orders'),
};

export const settingsService = {
  getSettings: (module: string) => api.get(`/settings/${module}`),
  updateSettings: (module: string, data: any) => api.put(`/settings/${module}`, data),
};

export const payrollTunisiaService = {
  computePayslip: (data: any) => api.post('/payroll-tunisia/compute', data),
  getSalaryRules: (params?: any) => api.get('/payroll-tunisia/salary-rules', { params }),
  getSalaryStructures: (params?: any) => api.get('/payroll-tunisia/structures', { params }),
  createSalaryStructure: (data: any) => api.post('/payroll-tunisia/structures', data),
  getCNSSRates: () => api.get('/payroll-tunisia/cnss-rates'),
  getIRPPBracket: () => api.get('/payroll-tunisia/irpp-bracket'),
};

export const accountingTunisiaService = {
  getTaxes: (params?: any) => api.get('/accounting-tunisia/taxes', { params }),
  getTaxById: (id: number) => api.get(`/accounting-tunisia/taxes/${id}`),
  getFiscalPositions: (params?: any) => api.get('/accounting-tunisia/fiscal-positions', { params }),
  getTaxReports: (params?: any) => api.get('/accounting-tunisia/tax-reports', { params }),
  generateTaxReport: (data: any) => api.post('/accounting-tunisia/tax-reports/generate', data),
  validateTaxReport: (id: number) => api.post(`/accounting-tunisia/tax-reports/${id}/validate`),
  getChartOfAccounts: (params?: any) => api.get('/accounting-tunisia/chart-of-accounts', { params }),
  initChartOfAccounts: (data: any) => api.post('/accounting-tunisia/chart-of-accounts/init', data),
};

export const warehouseService = {
  getWarehouses: (params?: any) => api.get('/warehouse', { params }),
  createWarehouse: (data: any) => api.post('/warehouse', data),
  getLocations: (params?: any) => api.get('/warehouse/locations', { params }),
  getLocationsTree: (params?: any) => api.get('/warehouse/locations/tree', { params }),
  createLocation: (data: any) => api.post('/warehouse/locations', data),
  getQuants: (params?: any) => api.get('/warehouse/quants', { params }),
  getProductStock: (id: number, params?: any) => api.get(`/warehouse/products/${id}/stock`, { params }),
  getMoves: (params?: any) => api.get('/warehouse/moves', { params }),
  getPickingTypes: (params?: any) => api.get('/warehouse/picking-types', { params }),
  createPickingType: (data: any) => api.post('/warehouse/picking-types', data),
};

export const bomService = {
  getBOMs: (params?: any) => api.get('/mrp/boms', { params }),
  getBOM: (id: number) => api.get(`/mrp/boms/${id}`),
  createBOM: (data: any) => api.post('/mrp/boms', data),
  updateBOM: (id: number, data: any) => api.put(`/mrp/boms/${id}`, data),
  deleteBOM: (id: number) => api.delete(`/mrp/boms/${id}`),
  getBOMHierarchy: (id: number) => api.get(`/mrp/boms/${id}/hierarchy`),
  calculateBOMCost: (id: number) => api.get(`/mrp/boms/${id}/cost`),
};

export const companiesService = {
  getCompanies: (params?: any) => api.get('/companies', { params }),
  getCompany: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/companies/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createCompany: (data: any) => api.post('/companies', data),
  updateCompany: (id: number, data: any) => api.put(`/companies/${id}`, data),
  deleteCompany: (id: number) => api.delete(`/companies/${id}`),
};

export const partnersService = {
  getPartners: (params?: any) => api.get('/partners', { params }),
  getPartner: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/partners/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createPartner: (data: any) => api.post('/partners', data),
  updatePartner: (id: number, data: any) => api.put(`/partners/${id}`, data),
  deletePartner: (id: number) => api.delete(`/partners/${id}`),
};

export const usersService = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/users/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createUser: (data: any) => api.post('/users', data),
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

export const purchaseRequestsService = {
  getRequests: (params?: any) => api.get('/purchase-requests', { params }),
  getRequest: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/purchase-requests/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createRequest: (data: any) => api.post('/purchase-requests', data),
  updateRequest: (id: number, data: any) => api.put(`/purchase-requests/${id}`, data),
  deleteRequest: (id: number) => api.delete(`/purchase-requests/${id}`),
  validateRequest: (id: number) => api.post(`/purchase-requests/${id}/validate`),
  rejectRequest: (id: number, reason?: string) => api.post(`/purchase-requests/${id}/reject`, { reason }),
  getRequestLines: (requestId: number) => api.get(`/purchase-requests/${requestId}/lignes`),
  createRequestLine: (requestId: number, data: any) => api.post(`/purchase-requests/${requestId}/lignes`, data),
  updateRequestLine: (requestId: number, lineId: number, data: any) => 
    api.put(`/purchase-requests/${requestId}/lignes/${lineId}`, data),
  deleteRequestLine: (requestId: number, lineId: number) => 
    api.delete(`/purchase-requests/${requestId}/lignes/${lineId}`),
};

export const purchaseReceptionsService = {
  getReceptions: (params?: any) => api.get('/purchase/receptions', { params }),
  getReception: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/purchase/receptions/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createReception: (data: any) => api.post('/purchase/receptions', data),
  createFromOrder: (orderId: number, data?: any) => api.post('/purchase/receptions/from-order', { id_commande: orderId, ...data }),
  updateReception: (id: number, data: any) => api.put(`/purchase/receptions/${id}`, data),
  deleteReception: (id: number) => api.delete(`/purchase/receptions/${id}`),
  validateReception: (id: number) => api.post(`/purchase/receptions/${id}/validate`),
};

export const bankReconciliationService = {
  getReconciliations: (params?: any) => api.get('/account/reconciliations', { params }),
  getReconciliation: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/account/reconciliations/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createReconciliation: (data: any) => api.post('/account/reconciliations', data),
  updateReconciliation: (id: number, data: any) => api.put(`/account/reconciliations/${id}`, data),
  deleteReconciliation: (id: number) => api.delete(`/account/reconciliations/${id}`),
  validateReconciliation: (id: number) => api.post(`/account/reconciliations/${id}/validate`),
  autoMatch: (id: number) => api.post(`/account/reconciliations/${id}/auto-match`),
  getUnmatchedLines: (id: number) => api.get(`/account/reconciliations/${id}/unmatched-lines`),
  matchLines: (id: number, lineId: number, matchedLineId: number) => 
    api.post(`/account/reconciliations/${id}/match`, { lineId, matchedLineId }),
};

export const crmCampaignsService = {
  getCampaigns: (params?: any) => api.get('/crm/campaigns', { params }),
  getCampaign: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/crm/campaigns/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  createCampaign: (data: any) => api.post('/crm/campaigns', data),
  updateCampaign: (id: number, data: any) => api.put(`/crm/campaigns/${id}`, data),
  deleteCampaign: (id: number) => api.delete(`/crm/campaigns/${id}`),
  startCampaign: (id: number) => api.post(`/crm/campaigns/${id}/start`),
  pauseCampaign: (id: number) => api.post(`/crm/campaigns/${id}/pause`),
  stopCampaign: (id: number) => api.post(`/crm/campaigns/${id}/stop`),
  getCampaignStats: (id: number) => api.get(`/crm/campaigns/${id}/stats`),
};

export const posService = {
  getCaisses: (params?: any) => api.get('/pos/caisses', { params }),
  getCaisse: (id: number) => api.get(`/pos/caisses/${id}`),
  openSession: (data: any) => api.post('/pos/sessions/ouvrir', data),
  closeSession: (sessionId: number, data?: any) => api.post(`/pos/sessions/${sessionId}/fermer`, data),
  getSession: (caisseId: number) => api.get(`/pos/caisses/${caisseId}`),
  createSale: (data: any) => api.post('/pos/ventes', data),
  getSales: (params?: any) => api.get('/pos/ventes', { params }),
  getSale: (id: number) => api.get(`/pos/ventes/${id}`),
};

export const ecommerceProductsService = {
  getProducts: (params?: any) => api.get('/ecommerce/products', { params }),
  getProduct: (id: number) => api.get(`/ecommerce/products/${id}`),
  createProduct: (data: any) => api.post('/ecommerce/products', data),
  updateProduct: (id: number, data: any) => api.put(`/ecommerce/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/ecommerce/products/${id}`),
  publishProduct: (id: number) => api.put(`/ecommerce/products/${id}`, { website_published: true }),
  unpublishProduct: (id: number) => api.put(`/ecommerce/products/${id}`, { website_published: false }),
};

export const ecommerceOrdersService = {
  getOrders: (params?: any) => api.get('/ecommerce/orders', { params }),
  getOrder: (id: number) => api.get(`/ecommerce/orders/${id}`),
  updateOrder: (id: number, data: any) => api.put(`/ecommerce/orders/${id}`, data),
  confirmOrder: (id: number) => api.post(`/ecommerce/orders/${id}/confirm`),
  cancelOrder: (id: number) => api.post(`/ecommerce/orders/${id}/cancel`),
};

export const ecommerceSettingsService = {
  getSettings: () => api.get('/ecommerce/settingss'),
  updateSettings: (data: any) => api.put('/ecommerce/settingss', data),
};

export const multisocieteCompaniesService = {
  getCompanies: (params?: any) => api.get('/multisociete/companies', { params }),
  getCompany: (id: number) => api.get(`/multisociete/companies/${id}`),
  createCompany: (data: any) => api.post('/multisociete/companies', data),
  updateCompany: (id: number, data: any) => api.put(`/multisociete/companies/${id}`, data),
  deleteCompany: (id: number) => api.delete(`/multisociete/companies/${id}`),
};

export const relancesService = {
  getRelances: (params?: any) => api.get('/relances', { params }),
  getRelance: (id: number) => api.get(`/relances/${id}`),
  getRelancesFacture: (idFacture: number) => api.get(`/relances/facture/${idFacture}`),
  getFacturesImpayees: () => api.get('/relances/factures-impayees'),
  getStatsGlobal: () => api.get('/relances/stats/global'),
  genererRelances: (body?: { dry_run?: boolean; force_all?: boolean }) =>
    api.post('/relances/generer', body || {}),
  envoyerRelanceManuelle: (
    idFacture: number,
    body: { niveau: number; canal?: string; destinataire?: string; sujet?: string; contenu?: string },
  ) => api.post(`/relances/facture/${idFacture}/envoyer`, body),
  enregistrerReponse: (id: number, body?: { reponse_recue?: boolean; date_reponse?: string }) =>
    api.put(`/relances/${id}/reponse`, body || {}),
};

export const parametrageService = {
  getAll: (params?: any) => api.get('/parametrage', { params }),
  update: (cle: string, valeur: any) => api.put(`/parametrage/${encodeURIComponent(cle)}`, { valeur }),
};
