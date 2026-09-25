import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import NavigationTopBar from './components/NavigationTopBar';
import DashboardSwitcher from './components/DashboardSwitcher';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import UserBar from './components/UserBar';
import TabletteLayout from './components/TabletteLayout';
import { AppProvider } from './store/AppContext';
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
const PrimesRendement = React.lazy(() => import('./pages/PrimesRendement'));
const TvAtelierTissage = React.lazy(() => import('./pages/TvAtelierTissage'));
const TvAtelierFinition = React.lazy(() => import('./pages/TvAtelierFinition'));

// ── RH §11bis (contrats / structure / sanctions-primes / bulletins / paie / formations)
const RhContratsTravail = React.lazy(() => import('./pages/rh/ContratsTravail'));
const RhStructureOrga = React.lazy(() => import('./pages/rh/StructureOrga'));
const RhSanctionsPrimes = React.lazy(() => import('./pages/rh/SanctionsPrimes'));
const RhBulletinsPaie = React.lazy(() => import('./pages/rh/BulletinsPaie'));
const RhPaieTunisie = React.lazy(() => import('./pages/rh/PaieTunisie'));
const RhFormations = React.lazy(() => import('./pages/rh/Formations'));

// ── Ventes §8 (colisage / palettes / transporteurs / paiements / relances)
const VentesListeColisage = React.lazy(() => import('./pages/ventes/ListeColisage'));
const VentesListePalettes = React.lazy(() => import('./pages/ventes/ListePalettes'));
const VentesSuiviTransporteurs = React.lazy(() => import('./pages/ventes/SuiviTransporteurs'));
const VentesPaiementsEcheances = React.lazy(() => import('./pages/ventes/PaiementsEcheances'));
const VentesRelancesFactures = React.lazy(() => import('./pages/ventes/RelancesFactures'));

// ── Comptabilité (Phase 4 · §10 domain.md) ────────────────────────────
const PlanComptes = React.lazy(() => import('./pages/comptabilite/PlanComptes'));
const JournalEcritures = React.lazy(() => import('./pages/comptabilite/JournalEcritures'));
const RapprochementBancaire = React.lazy(() => import('./pages/comptabilite/RapprochementBancaire'));
const FondCaisse = React.lazy(() => import('./pages/comptabilite/FondCaisse'));
const Immobilisations = React.lazy(() => import('./pages/comptabilite/Immobilisations'));
const TvaDeclarations = React.lazy(() => import('./pages/comptabilite/TvaDeclarations'));
const RapportsCompta = React.lazy(() => import('./pages/comptabilite/RapportsCompta'));
const ClotureExercice = React.lazy(() => import('./pages/comptabilite/ClotureExercice'));

// ── Achats & Fournisseurs (§9 domain.md) ─────────────────────────────
const DemandesAchat = React.lazy(() => import('./pages/achats/DemandesAchat'));
const BonsCommande = React.lazy(() => import('./pages/achats/BonsCommande'));
const ReceptionsFF = React.lazy(() => import('./pages/achats/ReceptionsFF'));
const FacturesFournisseur = React.lazy(() => import('./pages/achats/FacturesFournisseur'));
const ContratsServices = React.lazy(() => import('./pages/achats/ContratsServices'));
const DepensesEspeces = React.lazy(() => import('./pages/achats/DepensesEspeces'));
const PaiementsFournisseurs = React.lazy(() => import('./pages/achats/PaiementsFournisseurs'));
const RapprochementBcBlFf = React.lazy(() => import('./pages/achats/RapprochementBcBlFf'));

// ── Pages TODO branchées 2026-09-25 (CRM, Produits, Stock, Fab, Dashboards)
const CrmContacts = React.lazy(() => import('./pages/crm/Contacts'));
const CrmInteractions = React.lazy(() => import('./pages/crm/Interactions'));
const SeoProduits = React.lazy(() => import('./pages/produits/SeoProduits'));
const AlertesStock = React.lazy(() => import('./pages/stock/AlertesStock'));
const VueParCategorie = React.lazy(() => import('./pages/stock/VueParCategorie'));
const PostesTravail = React.lazy(() => import('./pages/fabrication/PostesTravail'));
const MachinesMaintenance = React.lazy(() => import('./pages/fabrication/MachinesMaintenance'));
const SuiviTempsReel = React.lazy(() => import('./pages/fabrication/SuiviTempsReel'));
const FabricationGammes = React.lazy(() => import('./pages/fabrication/Gammes'));
const FabricationOFStockCatalogue = React.lazy(() => import('./pages/fabrication/OFStockCatalogue'));
const FabricationOurdissage = React.lazy(() => import('./pages/fabrication/Ourdissage'));
const FabricationPreparationMP = React.lazy(() => import('./pages/fabrication/PreparationMP'));
const DashboardOurdisseur = React.lazy(() => import('./pages/dashboards/DashboardOurdisseur'));
const DashboardComptable = React.lazy(() => import('./pages/dashboards/DashboardComptable'));
const DashboardRHManager = React.lazy(() => import('./pages/DashboardRHManager'));
const DashboardIA = React.lazy(() => import('./pages/DashboardIA'));

// ── Marketing / E-commerce / Mon compte ──────────────────────────────
const MarketingSegments = React.lazy(() => import('./pages/marketing/SegmentsClients'));
const MarketingStats = React.lazy(() => import('./pages/marketing/StatsPerformance'));
const EcomStockSync = React.lazy(() => import('./pages/ecommerce-app/StockSynchronise'));
const EcomStats = React.lazy(() => import('./pages/ecommerce-app/StatsWeb'));
const EcomPanierAbandonne = React.lazy(() => import('./pages/ecommerce-app/PanierAbandonne'));
const EcomFidelite = React.lazy(() => import('./pages/ecommerce-app/Fidelite'));
const EcomVitrine = React.lazy(() => import('./pages/ecommerce-app/VitrinePublique'));
const MonProfil = React.lazy(() => import('./pages/mon-compte/Profil'));
const MonEmailPerso = React.lazy(() => import('./pages/mon-compte/EmailPerso'));
const MonWhatsAppPerso = React.lazy(() => import('./pages/mon-compte/WhatsAppPerso'));

// ── IA agents (§11ter + §14bis.6bis) ──────────────────────────────────
const IaAgentsActifs = React.lazy(() => import('./pages/ia/AgentsActifs'));
const IaConstats = React.lazy(() => import('./pages/ia/ConstatsATraiter'));
const IaRapports = React.lazy(() => import('./pages/ia/RapportsGeneres'));
const IaConfiguration = React.lazy(() => import('./pages/ia/ConfigurationAgents'));
const IaCoutsLLM = React.lazy(() => import('./pages/ia/CoutsLLM'));

// ── Paramètres §15 (12 sous-items) ────────────────────────────────────
const ParamSociete = React.lazy(() => import('./pages/parametres/ParamSociete'));
const ParamCrm = React.lazy(() => import('./pages/parametres/ParamCrm'));
const ParamVente = React.lazy(() => import('./pages/parametres/ParamVente'));
const ParamAchats = React.lazy(() => import('./pages/parametres/ParamAchats'));
const ParamComptabilite = React.lazy(() => import('./pages/parametres/ParamComptabilite'));
const ParamStock = React.lazy(() => import('./pages/parametres/ParamStock'));
const ParamFabrication = React.lazy(() => import('./pages/parametres/ParamFabrication'));
const ParamTransporteurs = React.lazy(() => import('./pages/parametres/ParamTransporteurs'));
const ParamCommissions = React.lazy(() => import('./pages/parametres/ParamCommissions'));
const ParamCommunication = React.lazy(() => import('./pages/parametres/ParamCommunication'));
const ParamPaysTva = React.lazy(() => import('./pages/parametres/ParamPaysTva'));
const ParamUtilisateursRoles = React.lazy(() => import('./pages/parametres/ParamUtilisateursRoles'));

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

// Rôles tablette atelier (§15 « (tablette) » → Tisseur / Coupeur / Ourdisseur)
const PRIVATE_TABLETTE_ROLES = new Set(['TISSEUR', 'COUPEUR', 'OURDISSEUR']);

const PrivateRoute: React.FC<{ children: React.ReactNode; showNav?: boolean }> = ({ children, showNav = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ borderBottom: '2px solid var(--accent-terracotta)' }}></div>
          <p className="mt-4" style={{ color: 'var(--fg-secondary)' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const roleUpper = (user as any)?.role?.toUpperCase() || '';
  const isTabletteRole = PRIVATE_TABLETTE_ROLES.has(roleUpper);

  // Rôles tablette → UserBar + TabletteLayout kiosque (pas de sidebar)
  if (showNav && isTabletteRole) {
    return (
      <>
        <UserBar />
        <TabletteLayout>{children}</TabletteLayout>
      </>
    );
  }

  // Autres rôles bureau → UserBar + sidebar §15 filtrée
  return (
    <PrivateRouteBody showNav={showNav}>
      {children}
    </PrivateRouteBody>
  );
};

// NavigationTopBar occupe le haut (48px), UserBar juste dessous (48px).
// Le contenu commence à 96px du haut (48 + 48) et prend toute la largeur.
const PrivateRouteBody: React.FC<{ showNav: boolean; children: React.ReactNode }> = ({ showNav, children }) => {
  return (
    <>
      {showNav && <NavigationWrapper />}
      {/* topOffset=0 → UserBar utilise var(--nav-height) publiée par NavigationTopBar */}
      <UserBar />
      <ContentWrapper showNav={showNav}>
        <Breadcrumbs />
        {children}
      </ContentWrapper>
    </>
  );
};

const NavigationWrapper: React.FC = () => {
  return <NavigationTopBar />;
};

const ContentWrapper: React.FC<{ showNav: boolean; children: React.ReactNode }> = ({ showNav, children }) => {
  // La hauteur du NavigationTopBar est dynamique (wrap sur plusieurs lignes
  // si écran étroit). Elle est publiée dans la CSS var --nav-height par
  // NavigationTopBar via ResizeObserver. UserBar fait 48px fixe.
  const paddingTop = showNav
    ? 'calc(var(--nav-height, 48px) + 48px)'   // menu + UserBar
    : '48px';                                    // UserBar seule
  return (
    <div
      style={{
        marginLeft: 0,
        paddingTop,
        minHeight: '100vh',
      }}
    >
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

          {/* ─── TV atelier — routes PUBLIQUES, sans sidebar ni login ────────
              §11bis.7bis · écrans muraux 55" plein écran, actualisation 30 s.
              Placées AVANT tout PrivateRoute pour rester hors layout. */}
          <Route path="/tv/tissage/:token" element={<TvAtelierTissage />} />
          <Route path="/tv/finition/:token" element={<TvAtelierFinition />} />
          {/* Variantes sans token — utile en démo / preview */}
          <Route path="/tv/tissage" element={<TvAtelierTissage />} />
          <Route path="/tv/finition" element={<TvAtelierFinition />} />

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
          <Route path="/hr/payslips" element={<Navigate to="/rh/bulletins" replace />} />
          <Route path="/payroll-tunisia" element={<Navigate to="/rh/paie-tunisie" replace />} />
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
          {/* Primes de rendement hors bulletin §11bis.7bis
              Accès : ADMIN | RH_MANAGER | COMPTABLE */}
          <Route
            path="/primes-rendement"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'RH_MANAGER', 'COMPTABLE']}>
                <PrimesRendement />
              </ProtectedRoute>
            }
          />
          {/* ─── RH §11bis — Contrats · Structure · Sanctions/Primes · Bulletins · Paie · Formations
              Accès : ADMIN | RH_MANAGER | COMPTABLE */}
          <Route
            path="/rh/contrats"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'RH_MANAGER', 'COMPTABLE']}>
                <RhContratsTravail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rh/structure"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'RH_MANAGER', 'COMPTABLE']}>
                <RhStructureOrga />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rh/sanctions-primes"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'RH_MANAGER', 'COMPTABLE']}>
                <RhSanctionsPrimes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rh/bulletins"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'RH_MANAGER', 'COMPTABLE']}>
                <RhBulletinsPaie />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rh/paie-tunisie"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'RH_MANAGER', 'COMPTABLE']}>
                <RhPaieTunisie />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rh/formations"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'RH_MANAGER', 'COMPTABLE']}>
                <RhFormations />
              </ProtectedRoute>
            }
          />

          {/* ─── Ventes §8 — Colisage · Palettes · Transporteurs · Paiements · Relances
              Accès : ADMIN | COMMERCIAL | COMPTABLE */}
          <Route
            path="/ventes/colisage"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <VentesListeColisage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventes/palettes"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <VentesListePalettes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventes/transporteurs"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <VentesSuiviTransporteurs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventes/paiements-echeances"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <VentesPaiementsEcheances />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventes/relances-factures"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <VentesRelancesFactures />
              </ProtectedRoute>
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

          {/* ─── Achats & Fournisseurs §9 domain.md ─────────────────────
              Accès : ADMIN | COMMERCIAL | COMPTABLE */}
          <Route
            path="/achats/demandes"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <DemandesAchat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achats/bc"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <BonsCommande />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achats/receptions"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <ReceptionsFF />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achats/factures-ff"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <FacturesFournisseur />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achats/contrats-services"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <ContratsServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achats/depenses-especes"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <DepensesEspeces />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achats/paiements-ff"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <PaiementsFournisseurs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achats/rapprochement"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'COMPTABLE']}>
                <RapprochementBcBlFf />
              </ProtectedRoute>
            }
          />

          {/* ─── Comptabilité (Phase 4 · §10 domain.md) ───────────────────
              SYSCOA simplifié adapté Tunisie · Accès : ADMIN | COMPTABLE */}
          <Route
            path="/comptabilite/plan-comptes"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMPTABLE']}>
                <PlanComptes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comptabilite/journal"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMPTABLE']}>
                <JournalEcritures />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comptabilite/rapprochement"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMPTABLE']}>
                <RapprochementBancaire />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comptabilite/caisse"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMPTABLE']}>
                <FondCaisse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comptabilite/immobilisations"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMPTABLE']}>
                <Immobilisations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comptabilite/tva"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMPTABLE']}>
                <TvaDeclarations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comptabilite/rapports"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMPTABLE']}>
                <RapportsCompta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comptabilite/cloture"
            element={
              <ProtectedRoute requiredRole={['ADMIN', 'COMPTABLE']}>
                <ClotureExercice />
              </ProtectedRoute>
            }
          />

          {/* ── CRM (§3) ────────────────────────────────────────────── */}
          <Route path="/crm/contacts" element={<ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL']}><CrmContacts /></ProtectedRoute>} />
          <Route path="/crm/interactions" element={<ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL']}><CrmInteractions /></ProtectedRoute>} />

          {/* ── Produits (§5.6) ─────────────────────────────────────── */}
          <Route path="/produits/seo-web" element={<ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'MARKETING']}><SeoProduits /></ProtectedRoute>} />

          {/* ── Stock §6.9 alertes + §6.1 vue catégorie ────────────── */}
          <Route path="/stock/alertes" element={<ProtectedRoute><AlertesStock /></ProtectedRoute>} />
          <Route path="/stock/vue-categories" element={<ProtectedRoute><VueParCategorie /></ProtectedRoute>} />

          {/* ── Fabrication (§7.4 postes / §7 machines / temps réel) ─ */}
          <Route path="/fabrication/postes" element={<ProtectedRoute requiredRole={['ADMIN', 'CHEF_PRODUCTION', 'CHEF_ATELIER']}><PostesTravail /></ProtectedRoute>} />
          <Route path="/fabrication/machines-maintenance" element={<ProtectedRoute requiredRole={['ADMIN', 'CHEF_PRODUCTION', 'MECANICIEN']}><MachinesMaintenance /></ProtectedRoute>} />
          <Route path="/fabrication/temps-reel" element={<ProtectedRoute requiredRole={['ADMIN', 'CHEF_PRODUCTION', 'CHEF_ATELIER']}><SuiviTempsReel /></ProtectedRoute>} />
          <Route path="/fabrication/gammes" element={<ProtectedRoute requiredRole={['ADMIN', 'CHEF_PRODUCTION', 'CHEF_ATELIER']}><FabricationGammes /></ProtectedRoute>} />
          <Route path="/fabrication/of-stock-ca" element={<ProtectedRoute requiredRole={['ADMIN', 'CHEF_PRODUCTION', 'CHEF_ATELIER']}><FabricationOFStockCatalogue /></ProtectedRoute>} />
          <Route path="/fabrication/ourdissage" element={<ProtectedRoute requiredRole={['ADMIN', 'CHEF_PRODUCTION', 'CHEF_ATELIER']}><FabricationOurdissage /></ProtectedRoute>} />
          <Route path="/fabrication/preparation-mp" element={<ProtectedRoute requiredRole={['ADMIN', 'CHEF_PRODUCTION', 'CHEF_ATELIER']}><FabricationPreparationMP /></ProtectedRoute>} />

          {/* ── Dashboards manquants §14 ───────────────────────────── */}
          <Route path="/dashboard-ourdisseur" element={<ProtectedRoute requiredRole={['ADMIN', 'OURDISSEUR', 'CHEF_PRODUCTION']}><DashboardOurdisseur /></ProtectedRoute>} />
          <Route path="/dashboard-comptable" element={<ProtectedRoute requiredRole={['ADMIN', 'COMPTABLE']}><DashboardComptable /></ProtectedRoute>} />
          <Route path="/dashboard-rh-manager" element={<ProtectedRoute requiredRole={['ADMIN', 'RH_MANAGER', 'RH_ASSISTANT']}><DashboardRHManager /></ProtectedRoute>} />
          <Route path="/dashboard-ia" element={<ProtectedRoute requiredRole={['ADMIN', 'COMMERCIAL', 'CHEF_PRODUCTION', 'CHEF_ATELIER', 'RH_MANAGER']}><DashboardIA /></ProtectedRoute>} />

          {/* ── Marketing (§11.3-5) ────────────────────────────────── */}
          <Route path="/marketing/segments" element={<ProtectedRoute requiredRole={['ADMIN', 'MARKETING']}><MarketingSegments /></ProtectedRoute>} />
          <Route path="/marketing/stats" element={<ProtectedRoute requiredRole={['ADMIN', 'MARKETING']}><MarketingStats /></ProtectedRoute>} />

          {/* ── E-commerce (§11quinquies) ──────────────────────────── */}
          <Route path="/ecommerce/stock-sync" element={<ProtectedRoute requiredRole={['ADMIN', 'MARKETING']}><EcomStockSync /></ProtectedRoute>} />
          <Route path="/ecommerce/stats" element={<ProtectedRoute requiredRole={['ADMIN', 'MARKETING', 'COMMERCIAL']}><EcomStats /></ProtectedRoute>} />
          <Route path="/ecommerce/panier-abandonne" element={<ProtectedRoute requiredRole={['ADMIN', 'MARKETING']}><EcomPanierAbandonne /></ProtectedRoute>} />
          <Route path="/ecommerce/fidelite" element={<ProtectedRoute requiredRole={['ADMIN', 'MARKETING']}><EcomFidelite /></ProtectedRoute>} />
          <Route path="/ecommerce/vitrine" element={<ProtectedRoute requiredRole={['ADMIN', 'MARKETING']}><EcomVitrine /></ProtectedRoute>} />

          {/* ── Mon compte (tous les rôles) ────────────────────────── */}
          <Route path="/mon-compte/profil" element={<ProtectedRoute><MonProfil /></ProtectedRoute>} />
          <Route path="/mon-compte/email" element={<ProtectedRoute><MonEmailPerso /></ProtectedRoute>} />
          <Route path="/mon-compte/whatsapp" element={<ProtectedRoute><MonWhatsAppPerso /></ProtectedRoute>} />

          {/* ── IA agents (§11ter + §14bis.6bis) — ADMIN ───────────── */}
          <Route path="/ia/agents-actifs" element={<ProtectedRoute requiredRole="ADMIN"><IaAgentsActifs /></ProtectedRoute>} />
          <Route path="/ia/constats" element={<ProtectedRoute requiredRole="ADMIN"><IaConstats /></ProtectedRoute>} />
          <Route path="/ia/rapports" element={<ProtectedRoute requiredRole="ADMIN"><IaRapports /></ProtectedRoute>} />
          <Route path="/ia/configuration" element={<ProtectedRoute requiredRole="ADMIN"><IaConfiguration /></ProtectedRoute>} />
          <Route path="/ia/couts-llm" element={<ProtectedRoute requiredRole="ADMIN"><IaCoutsLLM /></ProtectedRoute>} />

          {/* ── Paramètres §15 (12 sous-items) — ADMIN ─────────────── */}
          <Route path="/parametres/societe" element={<ProtectedRoute requiredRole="ADMIN"><ParamSociete /></ProtectedRoute>} />
          <Route path="/parametres/crm" element={<ProtectedRoute requiredRole="ADMIN"><ParamCrm /></ProtectedRoute>} />
          <Route path="/parametres/vente" element={<ProtectedRoute requiredRole="ADMIN"><ParamVente /></ProtectedRoute>} />
          <Route path="/parametres/achats" element={<ProtectedRoute requiredRole="ADMIN"><ParamAchats /></ProtectedRoute>} />
          <Route path="/parametres/comptabilite" element={<ProtectedRoute requiredRole="ADMIN"><ParamComptabilite /></ProtectedRoute>} />
          <Route path="/parametres/stock" element={<ProtectedRoute requiredRole="ADMIN"><ParamStock /></ProtectedRoute>} />
          <Route path="/parametres/fabrication" element={<ProtectedRoute requiredRole="ADMIN"><ParamFabrication /></ProtectedRoute>} />
          <Route path="/parametres/transporteurs" element={<ProtectedRoute requiredRole="ADMIN"><ParamTransporteurs /></ProtectedRoute>} />
          <Route path="/parametres/commissions" element={<ProtectedRoute requiredRole="ADMIN"><ParamCommissions /></ProtectedRoute>} />
          <Route path="/parametres/communication" element={<ProtectedRoute requiredRole="ADMIN"><ParamCommunication /></ProtectedRoute>} />
          <Route path="/parametres/pays-tva" element={<ProtectedRoute requiredRole="ADMIN"><ParamPaysTva /></ProtectedRoute>} />
          <Route path="/parametres/utilisateurs-roles" element={<ProtectedRoute requiredRole="ADMIN"><ParamUtilisateursRoles /></ProtectedRoute>} />
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
