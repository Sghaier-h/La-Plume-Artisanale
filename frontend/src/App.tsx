import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import NavigationEnhanced from './components/NavigationEnhanced';
import DashboardSwitcher from './components/DashboardSwitcher';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AppProvider } from './store/AppContext';
import { useApp } from './store/AppContext';
import { NotificationProvider } from './components/erp';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './components/NavigationContext';
import ContextActions from './components/ContextActions';
import Breadcrumbs from './components/Breadcrumbs';
import NotificationCenter from './components/NotificationCenter';
import ChatWidget from './components/ChatWidget';
import TaskNotification from './components/TaskNotification';

// ── Lazy-loaded pages (code splitting) ─────────────────────────────────
// Pages principales (chargées à la demande)
const DashboardAdministrateur = React.lazy(() => import('./pages/DashboardAdministrateur'));
const Articles = React.lazy(() => import('./pages/Articles'));
const Clients = React.lazy(() => import('./pages/Clients'));
const Commandes = React.lazy(() => import('./pages/Commandes'));
const CommandeDetails = React.lazy(() => import('./pages/CommandeDetails'));
const Machines = React.lazy(() => import('./pages/Machines'));
const OF = React.lazy(() => import('./pages/OF'));
const Soustraitants = React.lazy(() => import('./pages/Soustraitants'));
const Parametrage = React.lazy(() => import('./pages/Parametrage'));
const ParametrageComplet = React.lazy(() => import('./pages/erp/ParametrageComplet'));
const MatieresPremieres = React.lazy(() => import('./pages/MatieresPremieres'));
const ArticlesCatalogue = React.lazy(() => import('./pages/ArticlesCatalogue'));
const Fournisseurs = React.lazy(() => import('./pages/Fournisseurs'));
const SuiviFabrication = React.lazy(() => import('./pages/SuiviFabrication'));
const PlanningDragDrop = React.lazy(() => import('./pages/PlanningDragDrop'));
const ParametresCatalogue = React.lazy(() => import('./pages/ParametresCatalogue'));
const TabletteTisseur = React.lazy(() => import('./pages/TabletteTisseur'));
const TabletteMagasinier = React.lazy(() => import('./pages/TabletteMagasinier'));
const TabletteCoupeur = React.lazy(() => import('./pages/TabletteCoupeur'));
const TabletteQualite = React.lazy(() => import('./pages/TabletteQualite'));
const CatalogueProduit = React.lazy(() => import('./pages/CatalogueProduit'));
const Maintenance = React.lazy(() => import('./pages/Maintenance'));
const PlanificationGantt = React.lazy(() => import('./pages/PlanificationGantt'));
const QualiteAvance = React.lazy(() => import('./pages/QualiteAvance'));
const Couts = React.lazy(() => import('./pages/Couts'));
const MultiSociete = React.lazy(() => import('./pages/MultiSociete'));
const Communication = React.lazy(() => import('./pages/Communication'));
const MessagesOperateurs = React.lazy(() => import('./pages/MessagesOperateurs'));
const Ecommerce = React.lazy(() => import('./pages/Ecommerce'));
const FoutaManagementApp = React.lazy(() => import('./pages/FoutaManagement'));
const DashboardTisseur = React.lazy(() => import('./pages/DashboardTisseur'));
const DashboardMagasinierMP = React.lazy(() => import('./pages/DashboardMagasinierMP'));
const TableauBordMecanicien = React.lazy(() => import('./pages/TableauBordMecanicien'));
const DashboardPostCoupe = React.lazy(() => import('./pages/DashboardPostCoupe'));
const DashboardControleCentral = React.lazy(() => import('./pages/DashboardControleCentral'));
const ChefAtelierDashboard = React.lazy(() => import('./pages/ChefAtelierDashboard'));
const TableauBordMagasinPF = React.lazy(() => import('./pages/TableauBordMagasinPF'));
const DashboardChefProduction = React.lazy(() => import('./pages/DashboardChefProduction'));
const DashboardMagasinierSoustraitants = React.lazy(() => import('./pages/DashboardMagasinierSoustraitants'));
const Equipe = React.lazy(() => import('./pages/Equipe'));
const Services = React.lazy(() => import('./pages/Services'));
const Modeles = React.lazy(() => import('./pages/Modeles'));
const ModeleDetails = React.lazy(() => import('./pages/ModeleDetails'));
const ArticleDetails = React.lazy(() => import('./pages/ArticleDetails'));
const ClientDetails = React.lazy(() => import('./pages/ClientDetails'));
const OFDetails = React.lazy(() => import('./pages/OFDetails'));
const CatalogueArticles = React.lazy(() => import('./pages/CatalogueArticles'));
const Devis = React.lazy(() => import('./pages/Devis'));
const BonLivraison = React.lazy(() => import('./pages/BonLivraison'));
const Facture = React.lazy(() => import('./pages/Facture'));
const Avoir = React.lazy(() => import('./pages/Avoir'));
const BonRetour = React.lazy(() => import('./pages/BonRetour'));
const GestionAttributs = React.lazy(() => import('./pages/GestionAttributs'));
const ParametresProduitService = React.lazy(() => import('./pages/ParametresProduitService'));
const Inventaire = React.lazy(() => import('./pages/Inventaire'));
const Entrepot = React.lazy(() => import('./pages/Entrepot'));
const Mouvement = React.lazy(() => import('./pages/Mouvement'));
const ListeColisage = React.lazy(() => import('./pages/ListeColisage'));
const ListePalettes = React.lazy(() => import('./pages/ListePalettes'));
const ProduitFini = React.lazy(() => import('./pages/ProduitFini'));
const SemiFini = React.lazy(() => import('./pages/SemiFini'));
const MatierePremiereStock = React.lazy(() => import('./pages/MatierePremiereStock'));
const Fourniture = React.lazy(() => import('./pages/Fourniture'));
const ImportExcel = React.lazy(() => import('./pages/ImportExcel'));

// Pages ERP (organisation dans pages/erp/)
const SaleOrdersERP = React.lazy(() => import('./pages/erp/SaleOrders'));
const ProductsERP = React.lazy(() => import('./pages/erp/Products'));
const StockPickingsERP = React.lazy(() => import('./pages/erp/StockPickings'));
const ProductionsERP = React.lazy(() => import('./pages/erp/Productions'));
const AccountMovesERP = React.lazy(() => import('./pages/erp/AccountMoves'));
const PurchaseOrdersERP = React.lazy(() => import('./pages/erp/PurchaseOrders'));
const CRMLeadsERP = React.lazy(() => import('./pages/erp/CRMLeads'));
const OpportunitiesERP = React.lazy(() => import('./pages/erp/Opportunities'));
const PipelineVente = React.lazy(() => import('./pages/erp/PipelineVente'));
const ReportsERP = React.lazy(() => import('./pages/erp/Reports'));
const HREmployeesERP = React.lazy(() => import('./pages/erp/HREmployees'));
const HRRecruitmentERP = React.lazy(() => import('./pages/erp/HRRecruitment'));
const HRPayslipsERP = React.lazy(() => import('./pages/erp/HRPayslips'));
const PayrollTunisia = React.lazy(() => import('./pages/erp/PayrollTunisia'));
const ProjectsERP = React.lazy(() => import('./pages/erp/Projects'));
const InventoryERP = React.lazy(() => import('./pages/erp/Inventory'));
const QualityChecksERP = React.lazy(() => import('./pages/erp/QualityChecks'));
const SuppliersERP = React.lazy(() => import('./pages/erp/Suppliers'));
const SoustraitantsERP = React.lazy(() => import('./pages/erp/Soustraitants'));
const BOMsERP = React.lazy(() => import('./pages/erp/BOMs'));
const ProductCategoriesERP = React.lazy(() => import('./pages/erp/ProductCategories'));
const EcommerceERP = React.lazy(() => import('./pages/erp/Ecommerce'));
const SettingsERP = React.lazy(() => import('./pages/erp/Settings'));
const AIERP = React.lazy(() => import('./pages/erp/AI'));
const AISettingsERP = React.lazy(() => import('./pages/erp/AISettings'));
const SocialAuthERP = React.lazy(() => import('./pages/erp/SocialAuth'));
const CompaniesERP = React.lazy(() => import('./pages/erp/Companies'));
const WarehouseManagement = React.lazy(() => import('./pages/erp/WarehouseManagement'));
const POSERP = React.lazy(() => import('./pages/erp/POS'));
const PurchaseRequestsERP = React.lazy(() => import('./pages/erp/PurchaseRequests'));
const PurchaseReceptionsERP = React.lazy(() => import('./pages/erp/PurchaseReceptions'));
const ChartOfAccountsERP = React.lazy(() => import('./pages/erp/ChartOfAccounts'));
const CRMCampaignsERP = React.lazy(() => import('./pages/erp/CRMCampaigns'));
const BankReconciliationERP = React.lazy(() => import('./pages/erp/BankReconciliation'));
const PartnersERP = React.lazy(() => import('./pages/erp/Partners'));
const PricelistsERP = React.lazy(() => import('./pages/erp/Pricelists'));
const AvoirsERP = React.lazy(() => import('./pages/erp/Avoirs'));
const BonsLivraisonERP = React.lazy(() => import('./pages/erp/BonsLivraison'));
const BonsRetourERP = React.lazy(() => import('./pages/erp/BonsRetour'));
const MachinesERP = React.lazy(() => import('./pages/erp/Machines'));
const MaintenanceERP = React.lazy(() => import('./pages/erp/Maintenance'));
const MatieresPremieresERP = React.lazy(() => import('./pages/erp/MatieresPremieres'));
const ModelesERP = React.lazy(() => import('./pages/erp/Modeles'));
const TachesERP = React.lazy(() => import('./pages/erp/Taches'));
const UtilisateursERP = React.lazy(() => import('./pages/erp/Utilisateurs'));
const CommercialDashboard = React.lazy(() => import('./pages/erp/CommercialDashboard'));
const DevisERP = React.lazy(() => import('./pages/erp/Devis'));
const FacturesERP = React.lazy(() => import('./pages/erp/Factures'));
const HomeERP = React.lazy(() => import('./pages/erp/Home'));
const DashboardsERP = React.lazy(() => import('./pages/erp/Dashboards'));

// Composant pour rediriger vers le premier dashboard de l'utilisateur
const NavigateToUserDashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const userRole = user.role?.toUpperCase() || '';
  
  // Mapping des dashboards par nom
  const dashboardPaths: { [key: string]: string } = {
    'dashboard': '/dashboard-admin',
    'admin': '/dashboard-admin',
    'tisseur': '/dashboard-tisseur',
    'chef-production': '/dashboard-chef-production',
    'magasinier-mp': '/dashboard-magasinier-mp',
    'controle-central': '/dashboard-controle-central',
    'post-coupe': '/dashboard-post-coupe',
    'chef-atelier': '/chef-atelier',
    'magasinier-soustraitants': '/dashboard-magasinier-soustraitants',
    'gpao': '/dashboard-admin',
  };
  
  // Mapping rôle -> dashboard par défaut (si pas de dashboard attribué)
  const roleToDashboard: { [key: string]: string } = {
    'ADMIN': '/dashboard-admin',
    'TISSEUR': '/dashboard-tisseur',
    'CHEF_PRODUCTION': '/dashboard-chef-production',
    'CHEF_PRODUCT': '/dashboard-chef-production',
    'MAGASINIER': '/dashboard-magasinier-mp',
    'COUPEUR': '/dashboard-post-coupe',
    'CONTROLEUR': '/dashboard-controle-central',
    'CONTROLEUR_QUALITE': '/dashboard-controle-central',
    'QUALITE': '/dashboard-controle-central',
    'CHEF_ATELIER': '/chef-atelier',
    'MAGASINIER_SOUSTRAITANTS': '/dashboard-magasinier-soustraitants',
    'GPAO': '/dashboard-admin',
  };
  
  // Si admin, toujours rediriger vers dashboard-admin
  if (userRole === 'ADMIN') {
    return <Navigate to="/dashboard-admin" replace />;
  }
  
  // Si des dashboards sont attribués, utiliser le premier
  const dashboardsAttribues = user.dashboardsAttribues || [];
  if (dashboardsAttribues.length > 0) {
    const firstDashboard = dashboardPaths[dashboardsAttribues[0]];
    if (firstDashboard) {
      return <Navigate to={firstDashboard} replace />;
    }
  }
  
  // Sinon, utiliser le mapping rôle -> dashboard par défaut
  const defaultDashboard = roleToDashboard[userRole];
  if (defaultDashboard) {
    return <Navigate to={defaultDashboard} replace />;
  }
  
  // Fallback: dashboard admin
  return <Navigate to="/dashboard-admin" replace />;
};

// Wrapper pour les dashboards (plein écran avec switcher)
const DashboardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSwitcher />
      {children}
    </div>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode; showNav?: boolean }> = ({ children, showNav = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {showNav && <NavigationWrapper />}
      {showNav && <SidebarToggleButton />}
      <ContentWrapper showNav={showNav}>
        <Breadcrumbs />
        {children}
      </ContentWrapper>
    </>
  );
};

const NavigationWrapper: React.FC = () => {
  return <NavigationEnhanced />;
};

/** Bouton flèche pour afficher / masquer le menu gauche (toujours visible) */
const SidebarToggleButton: React.FC = () => {
  let state: any = null;
  let toggleSidebar: (() => void) | undefined;
  try {
    const appContext = useApp();
    state = appContext?.state;
    toggleSidebar = appContext?.toggleSidebar;
  } catch {
    return null;
  }
  const collapsed = state?.ui?.sidebarCollapsed ?? false;
  if (!toggleSidebar) return null;
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={`fixed z-[60] top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-14 rounded-r-lg shadow-md transition-all duration-300 bg-gradient-to-r from-slate-600 to-amber-600 text-white hover:from-slate-500 hover:to-amber-500 ${
        collapsed ? 'left-0' : 'left-64'
      }`}
      aria-label={collapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
      title={collapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
    >
      {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
    </button>
  );
};

const ContentWrapper: React.FC<{ showNav: boolean; children: React.ReactNode }> = ({ showNav, children }) => {
  let state: any = null;
  try {
    const appContext = useApp();
    state = appContext?.state;
  } catch {
    // Context not available, use defaults
  }
  
  return (
    <div className={showNav ? (state?.ui?.sidebarCollapsed ? 'ml-0' : 'ml-64') : ''}>
      {children}
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <NavigationProvider>
      <div className="App">
        <NotificationCenter />
        <ContextActions />
        <ChatWidget />
        <TaskNotification />
        <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute showNav={false}>
                <HomeERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/erp/home"
            element={
              <PrivateRoute showNav={false}>
                <HomeERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/erp/dashboards"
            element={
              <PrivateRoute showNav={false}>
                <DashboardsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <NavigateToUserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard-admin"
            element={
              <PrivateRoute showNav={true}>
                <DashboardAdministrateur />
              </PrivateRoute>
            }
          />
          <Route path="/dashboard-administrateur" element={<Navigate to="/dashboard-admin" replace />} />
          <Route
            path="/modeles"
            element={
              <PrivateRoute>
                <Modeles />
              </PrivateRoute>
            }
          />
          <Route
            path="/modeles/:id"
            element={
              <PrivateRoute>
                <ModeleDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/articles"
            element={
              <PrivateRoute>
                <Articles />
              </PrivateRoute>
            }
          />
          <Route
            path="/articles/:id"
            element={
              <PrivateRoute>
                <ArticleDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalogue-articles"
            element={
              <PrivateRoute>
                <CatalogueArticles />
              </PrivateRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <Clients />
              </PrivateRoute>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <PrivateRoute>
                <ClientDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/devis"
            element={
              <PrivateRoute>
                <Devis />
              </PrivateRoute>
            }
          />
          <Route
            path="/commandes"
            element={
              <PrivateRoute>
                <Commandes />
              </PrivateRoute>
            }
          />
          <Route
            path="/commandes/:id"
            element={
              <PrivateRoute>
                <CommandeDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/sale-orders"
            element={
              <PrivateRoute>
                <SaleOrdersERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/products"
            element={
              <PrivateRoute>
                <ProductsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/product-categories"
            element={
              <PrivateRoute showNav={true}>
                <ProductCategoriesERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/stock-pickings"
            element={
              <PrivateRoute>
                <StockPickingsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/productions"
            element={
              <PrivateRoute>
                <ProductionsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/account-moves"
            element={
              <PrivateRoute>
                <AccountMovesERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <PrivateRoute>
                <PurchaseOrdersERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/crm/leads"
            element={
              <PrivateRoute>
                <CRMLeadsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/pipeline-vente"
            element={
              <PrivateRoute>
                <PipelineVente />
              </PrivateRoute>
            }
          />
          <Route
            path="/opportunities"
            element={
              <PrivateRoute>
                <OpportunitiesERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/hr/employees"
            element={
              <PrivateRoute>
                <HREmployeesERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/hr/recruitment"
            element={
              <PrivateRoute>
                <HRRecruitmentERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/hr/payslips"
            element={
              <PrivateRoute>
                <HRPayslipsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/payroll-tunisia"
            element={
              <PrivateRoute>
                <PayrollTunisia />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <ProjectsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <PrivateRoute>
                <InventoryERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/warehouse-management"
            element={
              <PrivateRoute>
                <WarehouseManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/quality/checks"
            element={
              <PrivateRoute>
                <QualityChecksERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <PrivateRoute>
                <SuppliersERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/soustraitants-odoo"
            element={
              <PrivateRoute>
                <SoustraitantsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/bom"
            element={
              <PrivateRoute>
                <BOMsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/ecommerce-odoo"
            element={
              <PrivateRoute>
                <EcommerceERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <PrivateRoute>
                <AIERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/ai/settings"
            element={
              <PrivateRoute>
                <AISettingsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/social-auth"
            element={
              <PrivateRoute>
                <SocialAuthERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <PrivateRoute>
                <CompaniesERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/bon-livraison"
            element={
              <PrivateRoute>
                <BonLivraison />
              </PrivateRoute>
            }
          />
          <Route
            path="/facture"
            element={
              <PrivateRoute>
                <Facture />
              </PrivateRoute>
            }
          />
          <Route
            path="/avoir"
            element={
              <PrivateRoute>
                <Avoir />
              </PrivateRoute>
            }
          />
          <Route
            path="/bon-retour"
            element={
              <PrivateRoute>
                <BonRetour />
              </PrivateRoute>
            }
          />
          <Route
            path="/machines"
            element={
              <PrivateRoute>
                <Machines />
              </PrivateRoute>
            }
          />
          <Route
            path="/of"
            element={
              <PrivateRoute>
                <OF />
              </PrivateRoute>
            }
          />
          <Route
            path="/of/:id"
            element={
              <PrivateRoute>
                <OFDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/soustraitants"
            element={
              <PrivateRoute>
                <Soustraitants />
              </PrivateRoute>
            }
          />
          <Route
            path="/equipe"
            element={
              <PrivateRoute>
                <Equipe />
              </PrivateRoute>
            }
          />
          <Route
            path="/parametrage"
            element={
              <PrivateRoute>
                <ParametrageComplet />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <ReportsERP />
              </PrivateRoute>
            }
          />
          {/* Routes ERP - Modules supplémentaires */}
          <Route
            path="/partners"
            element={
              <PrivateRoute>
                <PartnersERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/pricelists"
            element={
              <PrivateRoute>
                <PricelistsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/avoirs"
            element={
              <PrivateRoute>
                <AvoirsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/bons-livraison-odoo"
            element={
              <PrivateRoute>
                <BonsLivraisonERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/bons-retour-odoo"
            element={
              <PrivateRoute>
                <BonsRetourERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/machines-odoo"
            element={
              <PrivateRoute>
                <MachinesERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance-odoo"
            element={
              <PrivateRoute>
                <MaintenanceERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/matieres-premieres-odoo"
            element={
              <PrivateRoute>
                <MatieresPremieresERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/modeles-odoo"
            element={
              <PrivateRoute>
                <ModelesERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/taches"
            element={
              <PrivateRoute>
                <TachesERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/utilisateurs"
            element={
              <PrivateRoute>
                <UtilisateursERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/commercial-dashboard"
            element={
              <PrivateRoute>
                <CommercialDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/purchase-requests"
            element={
              <PrivateRoute>
                <PurchaseRequestsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/purchase-receptions"
            element={
              <PrivateRoute>
                <PurchaseReceptionsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/pos-odoo"
            element={
              <PrivateRoute>
                <POSERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/chart-of-accounts"
            element={
              <PrivateRoute>
                <ChartOfAccountsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/crm/campaigns"
            element={
              <PrivateRoute>
                <CRMCampaignsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/bank-reconciliation"
            element={
              <PrivateRoute>
                <BankReconciliationERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/devis-odoo"
            element={
              <PrivateRoute>
                <DevisERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/factures-odoo"
            element={
              <PrivateRoute>
                <FacturesERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/import-excel"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <ImportExcel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <PrivateRoute>
                <Services />
              </PrivateRoute>
            }
          />
          <Route
            path="/matieres-premieres"
            element={
              <PrivateRoute>
                <MatieresPremieres />
              </PrivateRoute>
            }
          />
          <Route
            path="/articles-catalogue"
            element={
              <PrivateRoute>
                <ArticlesCatalogue />
              </PrivateRoute>
            }
          />
          <Route
            path="/catalogue-produit"
            element={
              <PrivateRoute>
                <CatalogueProduit />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <PrivateRoute>
                <Maintenance />
              </PrivateRoute>
            }
          />
          <Route
            path="/planification-gantt"
            element={
              <PrivateRoute>
                <PlanificationGantt />
              </PrivateRoute>
            }
          />
          <Route
            path="/qualite-avance"
            element={
              <PrivateRoute>
                <QualiteAvance />
              </PrivateRoute>
            }
          />
          <Route
            path="/couts"
            element={
              <PrivateRoute>
                <Couts />
              </PrivateRoute>
            }
          />
          <Route
            path="/multisociete"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <MultiSociete />
              </ProtectedRoute>
            }
          />
          <Route
            path="/communication"
            element={
              <PrivateRoute>
                <Communication />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages-operateurs"
            element={
              <PrivateRoute>
                <MessagesOperateurs />
              </PrivateRoute>
            }
          />
          <Route
            path="/ecommerce"
            element={
              <PrivateRoute>
                <Ecommerce />
              </PrivateRoute>
            }
          />
          <Route
            path="/fournisseurs"
            element={
              <PrivateRoute>
                <Fournisseurs />
              </PrivateRoute>
            }
          />
          <Route
            path="/suivi-fabrication"
            element={
              <PrivateRoute>
                <SuiviFabrication />
              </PrivateRoute>
            }
          />
          <Route
            path="/planning"
            element={
              <PrivateRoute>
                <PlanningDragDrop />
              </PrivateRoute>
            }
          />
          <Route
            path="/parametres-catalogue"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <ParametresCatalogue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tablette/tisseur"
            element={
              <PrivateRoute showNav={false}>
                <TabletteTisseur />
              </PrivateRoute>
            }
          />
          <Route
            path="/tablette/magasinier"
            element={
              <PrivateRoute showNav={false}>
                <TabletteMagasinier />
              </PrivateRoute>
            }
          />
          <Route
            path="/tablette/coupeur"
            element={
              <PrivateRoute showNav={false}>
                <TabletteCoupeur />
              </PrivateRoute>
            }
          />
          <Route
            path="/tablette/qualite"
            element={
              <PrivateRoute showNav={false}>
                <TabletteQualite />
              </PrivateRoute>
            }
          />
          <Route
            path="/gestion"
            element={
              <PrivateRoute>
                <FoutaManagementApp />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard-tisseur"
            element={
              <ProtectedRoute requiredDashboard="tisseur" showNav={false}>
                <DashboardTisseur />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tisseur"
            element={
              <Navigate to="/dashboard-tisseur" replace />
            }
          />
          <Route
            path="/dashboard-magasinier-mp"
            element={
              <ProtectedRoute requiredDashboard="magasinier-mp" showNav={false}>
                <DashboardMagasinierMP />
              </ProtectedRoute>
            }
          />
          <Route
            path="/magasinier-mp"
            element={
              <Navigate to="/dashboard-magasinier-mp" replace />
            }
          />
          <Route
            path="/mecanicien"
            element={
              <PrivateRoute showNav={true}>
                <TableauBordMecanicien />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard-post-coupe"
            element={
              <ProtectedRoute requiredDashboard="post-coupe" showNav={false}>
                <DashboardPostCoupe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coupe"
            element={
              <Navigate to="/dashboard-post-coupe" replace />
            }
          />
          <Route
            path="/dashboard-controle-central"
            element={
              <ProtectedRoute requiredDashboard="controle-central" showNav={false}>
                <DashboardControleCentral />
              </ProtectedRoute>
            }
          />
          <Route
            path="/controle-central"
            element={
              <Navigate to="/dashboard-controle-central" replace />
            }
          />
          <Route
            path="/chef-atelier"
            element={
              <Navigate to="/chef-atelier-dashboard" replace />
            }
          />
          <Route
            path="/chef-atelier-dashboard"
            element={
              <ProtectedRoute requiredDashboard="chef-atelier" showNav={false}>
                <ChefAtelierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/magasin-pf"
            element={
              <ProtectedRoute requiredDashboard="magasin-pf" showNav={true}>
                <TableauBordMagasinPF />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-magasinier-soustraitants"
            element={
              <ProtectedRoute requiredDashboard="magasinier-soustraitants" showNav={false}>
                <DashboardMagasinierSoustraitants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/magasinier-soustraitants"
            element={
              <Navigate to="/dashboard-magasinier-soustraitants" replace />
            }
          />
          <Route
            path="/dashboard-chef-production"
            element={
              <ProtectedRoute requiredDashboard="chef-production" showNav={false}>
                <DashboardChefProduction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chef-production"
            element={
              <Navigate to="/dashboard-chef-production" replace />
            }
          />
          <Route path="/dashboard-gpao" element={<Navigate to="/dashboard-admin" replace />} />
          <Route
            path="/gestion-attributs"
            element={
              <PrivateRoute>
                <GestionAttributs />
              </PrivateRoute>
            }
          />
          <Route
            path="/parametres-produit-service"
            element={
              <PrivateRoute>
                <ParametresProduitService />
              </PrivateRoute>
            }
          />
          <Route
            path="/produit-fini"
            element={
              <PrivateRoute>
                <ProduitFini />
              </PrivateRoute>
            }
          />
          <Route
            path="/semi-fini"
            element={
              <PrivateRoute>
                <SemiFini />
              </PrivateRoute>
            }
          />
          <Route
            path="/matiere-premiere-stock"
            element={
              <PrivateRoute>
                <MatierePremiereStock />
              </PrivateRoute>
            }
          />
          <Route
            path="/fourniture"
            element={
              <PrivateRoute>
                <Fourniture />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventaire"
            element={
              <PrivateRoute>
                <Inventaire />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepot"
            element={
              <PrivateRoute>
                <Entrepot />
              </PrivateRoute>
            }
          />
          <Route
            path="/mouvement"
            element={
              <PrivateRoute>
                <Mouvement />
              </PrivateRoute>
            }
          />
          <Route
            path="/liste-colisage"
            element={
              <PrivateRoute>
                <ListeColisage />
              </PrivateRoute>
            }
          />
          <Route
            path="/liste-palettes"
            element={
              <PrivateRoute>
                <ListePalettes />
              </PrivateRoute>
            }
          />
          {/* Nouveaux modules ERP */}
          <Route
            path="/pos"
            element={
              <PrivateRoute>
                <POSERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/purchase-requests"
            element={
              <PrivateRoute>
                <PurchaseRequestsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/purchase-receptions"
            element={
              <PrivateRoute>
                <PurchaseReceptionsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/chart-of-accounts"
            element={
              <PrivateRoute>
                <ChartOfAccountsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/crm/campaigns"
            element={
              <PrivateRoute>
                <CRMCampaignsERP />
              </PrivateRoute>
            }
          />
          <Route
            path="/account/reconciliations"
            element={
              <PrivateRoute>
                <BankReconciliationERP />
              </PrivateRoute>
            }
          />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </div>
    </NavigationProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AppProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
