import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import DashboardAdministrateur from './pages/DashboardAdministrateur';
import Articles from './pages/Articles';
import Clients from './pages/Clients';
import Commandes from './pages/Commandes';
import Machines from './pages/Machines';
import OF from './pages/OF';
import Soustraitants from './pages/Soustraitants';
import Parametrage from './pages/Parametrage';
import MatieresPremieres from './pages/MatieresPremieres';
import ArticlesCatalogue from './pages/ArticlesCatalogue';
import Fournisseurs from './pages/Fournisseurs';
import SuiviFabrication from './pages/SuiviFabrication';
import PlanningDragDrop from './pages/PlanningDragDrop';
import ParametresCatalogue from './pages/ParametresCatalogue';
import TabletteTisseur from './pages/TabletteTisseur';
import TabletteMagasinier from './pages/TabletteMagasinier';
import TabletteCoupeur from './pages/TabletteCoupeur';
import TabletteQualite from './pages/TabletteQualite';
import CatalogueProduit from './pages/CatalogueProduit';
import Maintenance from './pages/Maintenance';
import PlanificationGantt from './pages/PlanificationGantt';
import QualiteAvance from './pages/QualiteAvance';
import Couts from './pages/Couts';
import MultiSociete from './pages/MultiSociete';
import Communication from './pages/Communication';
import MessagesOperateurs from './pages/MessagesOperateurs';
import Ecommerce from './pages/Ecommerce';
import FoutaManagementApp from './pages/FoutaManagement';
import DashboardTisseur from './pages/DashboardTisseur';
import DashboardMagasinierMP from './pages/DashboardMagasinierMP';
import TableauBordMecanicien from './pages/TableauBordMecanicien';
import DashboardPostCoupe from './pages/DashboardPostCoupe';
import DashboardControleCentral from './pages/DashboardControleCentral';
import ChefAtelierDashboard from './pages/ChefAtelierDashboard';
import TableauBordMagasinPF from './pages/TableauBordMagasinPF';
import DashboardChefProduction from './pages/DashboardChefProduction';
import DashboardMagasinierSoustraitants from './pages/DashboardMagasinierSoustraitants';
import Equipe from './pages/Equipe';
import Services from './pages/Services';
import Modeles from './pages/Modeles';
import CatalogueArticles from './pages/CatalogueArticles';
import Devis from './pages/Devis';
import BonLivraison from './pages/BonLivraison';
import Facture from './pages/Facture';
import Avoir from './pages/Avoir';
import BonRetour from './pages/BonRetour';
import GestionAttributs from './pages/GestionAttributs';
import ParametresProduitService from './pages/ParametresProduitService';
import Inventaire from './pages/Inventaire';
import Entrepot from './pages/Entrepot';
import Mouvement from './pages/Mouvement';
import ListeColisage from './pages/ListeColisage';
import ListePalettes from './pages/ListePalettes';
import ProduitFini from './pages/ProduitFini';
import SemiFini from './pages/SemiFini';
import MatierePremiereStock from './pages/MatierePremiereStock';
import Fourniture from './pages/Fourniture';
import ProtectedRoute from './components/ProtectedRoute';

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
      {showNav && <Navigation />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Navigate to="/dashboard-admin" replace />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Navigate to="/dashboard-admin" replace />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard-admin"
            element={
              <ProtectedRoute requiredDashboard="dashboard" showNav={true}>
                <DashboardAdministrateur />
              </ProtectedRoute>
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
            path="/articles"
            element={
              <PrivateRoute>
                <Articles />
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
            path="/tisseur"
            element={
              <PrivateRoute showNav={true}>
                <DashboardTisseur />
              </PrivateRoute>
            }
          />
          <Route
            path="/magasinier-mp"
            element={
              <PrivateRoute showNav={true}>
                <DashboardMagasinierMP />
              </PrivateRoute>
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
            path="/coupe"
            element={
              <PrivateRoute showNav={true}>
                <DashboardPostCoupe />
              </PrivateRoute>
            }
          />
          <Route
            path="/controle-central"
            element={
              <PrivateRoute showNav={true}>
                <DashboardControleCentral />
              </PrivateRoute>
            }
          />
          <Route
            path="/chef-atelier"
            element={
              <PrivateRoute showNav={true}>
                <ChefAtelierDashboard />
              </PrivateRoute>
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
            path="/magasinier-soustraitants"
            element={
              <ProtectedRoute requiredDashboard="magasinier-soustraitants" showNav={true}>
                <DashboardMagasinierSoustraitants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chef-production"
            element={
              <ProtectedRoute requiredDashboard="chef-production" showNav={true}>
                <DashboardChefProduction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gestion"
            element={
              <PrivateRoute showNav={false}>
                <FoutaManagementApp />
              </PrivateRoute>
            }
          />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;

