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
import { BreadcrumbProvider } from './components/BreadcrumbContext';
import ContextActions from './components/ContextActions';
import Breadcrumbs from './components/Breadcrumbs';
import NotificationCenter from './components/NotificationCenter';
import ChatWidget from './components/ChatWidget';
import TaskNotification from './components/TaskNotification';

// ── Lazy-loaded pages (code splitting) ─────────────────────────────────
// Pages principales (chargées à la demande)
const DashboardAdministrateur = React.lazy(() => import('./pages/DashboardAdministrateur'));
const DashboardCommercial = React.lazy(() => import('./pages/DashboardCommercial'));
const Articles = React.lazy(() => import('./pages/Articles'));
const Clients = React.lazy(() => import('./pages/Clients'));
const Commandes = React.lazy(() => import('./pages/Commandes'));
const CommandeDetails = React.lazy(() => import('./pages/CommandeDetails'));
const Machines = React.lazy(() => import('./pages/Machines'));
const OF = React.lazy(() => import('./pages/OF'));
const Soustraitants = React.lazy(() => import('./pages/Soustraitants'));
const Parametrage = React.lazy(() => import('./pages/Parametrage'));
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
const Reports = React.lazy(() => import('./pages/Reports'));
const Communication = React.lazy(() => import('./pages/Communication'));
const TracabiliteLots = React.lazy(() => import('./pages/TracabiliteLots'));
const RhRecrutement = React.lazy(() => import('./pages/RhRecrutement'));
const PointageTimeMoto = React.lazy(() => import('./pages/PointageTimeMoto'));
const MessagesOperateurs = React.lazy(() => import('./pages/MessagesOperateurs'));
const Ecommerce = React.lazy(() => import('./pages/Ecommerce'));
const EcommerceB2B = React.lazy(() => import('./pages/EcommerceB2B'));
const PubliciteDigitale = React.lazy(() => import('./pages/PubliciteDigitale'));
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
const RelancesFactures = React.lazy(() => import('./pages/RelancesFactures'));
const Avoir = React.lazy(() => import('./pages/Avoir'));
const BonRetour = React.lazy(() => import('./pages/BonRetour'));
const GestionAttributs = React.lazy(() => import('./pages/GestionAttributs'));
const GestionPermissions = React.lazy(() => import('./pages/GestionPermissions'));
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
const PipelineVente = React.lazy(() => import('./pages/PipelineVente'));
const CrmLeads = React.lazy(() => import('./pages/CrmLeads'));
const Opportunities = React.lazy(() => import('./pages/Opportunities'));
const ConfigurateurPersonnalisation = React.lazy(() => import('./pages/ConfigurateurPersonnalisation'));

// ── Portail Client (auth séparée) ────────────────────────────────────
const PortailLogin = React.lazy(() => import('./pages/portail/PortailLogin'));
const PortailReset = React.lazy(() => import('./pages/portail/PortailReset'));
const PortailDashboard = React.lazy(() => import('./pages/portail/PortailDashboard'));
const PortailCommandes = React.lazy(() => import('./pages/portail/PortailCommandes'));
const PortailCommandeDetail = React.lazy(() => import('./pages/portail/PortailCommandeDetail'));
const PortailFactures = React.lazy(() => import('./pages/portail/PortailFactures'));
const PortailBL = React.lazy(() => import('./pages/portail/PortailBL'));
const PortailDevis = React.lazy(() => import('./pages/portail/PortailDevis'));
const PortailDemandes = React.lazy(() => import('./pages/portail/PortailDemandes'));
const PortailProfil = React.lazy(() => import('./pages/portail/PortailProfil'));
const PortailPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('portail_token') : null;
  if (!token) return <Navigate to="/portail/login" replace />;
  return <>{children}</>;
};

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
    'dashboard-commercial': '/dashboard-commercial',
    'commercial': '/dashboard-commercial',
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
    'COMMERCIAL': '/dashboard-commercial',
    'COMMERCIALE': '/dashboard-commercial',
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
      <BreadcrumbProvider>
      <div className="App">
        <NotificationCenter />
        <ContextActions />
        <ChatWidget />
        <TaskNotification />
        <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Portail Client — auth séparée, hors PrivateRoute admin */}
          <Route path="/portail/login" element={<PortailLogin />} />
          <Route path="/portail/reset-password/:token" element={<PortailReset />} />
          <Route path="/portail" element={<PortailPrivateRoute><PortailDashboard /></PortailPrivateRoute>} />
          <Route path="/portail/commandes" element={<PortailPrivateRoute><PortailCommandes /></PortailPrivateRoute>} />
          <Route path="/portail/commandes/:id" element={<PortailPrivateRoute><PortailCommandeDetail /></PortailPrivateRoute>} />
          <Route path="/portail/factures" element={<PortailPrivateRoute><PortailFactures /></PortailPrivateRoute>} />
          <Route path="/portail/bons-livraison" element={<PortailPrivateRoute><PortailBL /></PortailPrivateRoute>} />
          <Route path="/portail/devis" element={<PortailPrivateRoute><PortailDevis /></PortailPrivateRoute>} />
          <Route path="/portail/demandes" element={<PortailPrivateRoute><PortailDemandes /></PortailPrivateRoute>} />
          <Route path="/portail/profil" element={<PortailPrivateRoute><PortailProfil /></PortailPrivateRoute>} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <NavigateToUserDashboard />
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
          {/* Redirections pour compatibilité menu ↔ pages existantes */}
          <Route path="/products" element={<Navigate to="/articles" replace />} />
          <Route path="/product-categories" element={<Navigate to="/parametres-catalogue" replace />} />
          <Route path="/sale-orders" element={<Navigate to="/commandes" replace />} />
          <Route path="/purchase-orders" element={<Navigate to="/fournisseurs" replace />} />
          <Route path="/suppliers" element={<Navigate to="/fournisseurs" replace />} />
          <Route path="/warehouse-management" element={<Navigate to="/entrepot" replace />} />
          <Route path="/stock-pickings" element={<Navigate to="/bon-livraison" replace />} />
          <Route path="/hr/employees" element={<Navigate to="/equipe" replace />} />
          <Route path="/hr/recruitment" element={<Navigate to="/rh-recrutement" replace />} />
          <Route path="/hr/payslips" element={<Navigate to="/rh/pointage-timemoto" replace />} />
          <Route path="/payroll-tunisia" element={<Navigate to="/rh/pointage-timemoto" replace />} />
          <Route path="/companies" element={<Navigate to="/multisociete" replace />} />
          <Route path="/settings" element={<Navigate to="/parametrage" replace />} />
          <Route path="/account-moves" element={<Navigate to="/facture" replace />} />
          <Route path="/bom" element={<Navigate to="/modeles" replace />} />
          <Route path="/ai" element={<Navigate to="/dashboard-admin" replace />} />
          <Route path="/devis/create" element={<Navigate to="/devis?new=1" replace />} />
          <Route path="/commandes/create" element={<Navigate to="/commandes?new=1" replace />} />
          <Route path="/ecommerce-odoo" element={<Navigate to="/ecommerce" replace />} />
          <Route path="/soustraitants-odoo" element={<Navigate to="/soustraitants" replace />} />
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
            path="/dashboard-commercial"
            element={
              <PrivateRoute showNav={true}>
                <DashboardCommercial />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard-commercial/:id_commercial"
            element={
              <PrivateRoute showNav={true}>
                <DashboardCommercial />
              </PrivateRoute>
            }
          />
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
            path="/relances"
            element={
              <PrivateRoute>
                <RelancesFactures />
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
                <Parametrage />
              </PrivateRoute>
            }
          />
          <Route
            path="/parametres/permissions"
            element={
              <PrivateRoute>
                <GestionPermissions />
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
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
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
            path="/tracabilite-lots"
            element={
              <PrivateRoute>
                <TracabiliteLots />
              </PrivateRoute>
            }
          />
          <Route
            path="/rh-recrutement"
            element={
              <PrivateRoute>
                <RhRecrutement />
              </PrivateRoute>
            }
          />
          <Route
            path="/rh/pointage-timemoto"
            element={
              <PrivateRoute>
                <PointageTimeMoto />
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
            path="/ecommerce-b2b"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'MARKETING']}>
                <EcommerceB2B />
              </ProtectedRoute>
            }
          />
          <Route
            path="/publicite"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'MARKETING']}>
                <PubliciteDigitale />
              </ProtectedRoute>
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
          <Route
            path="/pipeline-vente"
            element={
              <PrivateRoute>
                <PipelineVente />
              </PrivateRoute>
            }
          />
          <Route
            path="/crm/leads"
            element={
              <PrivateRoute>
                <CrmLeads />
              </PrivateRoute>
            }
          />
          <Route
            path="/opportunities"
            element={
              <PrivateRoute>
                <Opportunities />
              </PrivateRoute>
            }
          />
          {/* Configurateur personnalisation §5.8 — deux variantes (avec ou sans id) */}
          <Route
            path="/configurateur"
            element={
              <PrivateRoute>
                <ConfigurateurPersonnalisation />
              </PrivateRoute>
            }
          />
          <Route
            path="/configurateur/:articleId"
            element={
              <PrivateRoute>
                <ConfigurateurPersonnalisation />
              </PrivateRoute>
            }
          />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </div>
      </BreadcrumbProvider>
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
