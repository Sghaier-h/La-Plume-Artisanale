import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, Package, Users, ShoppingBag, Cog, Building2, FileText, LogOut, Settings, 
  Box, Layers, TrendingUp, Truck, Calendar, CheckCircle, DollarSign, MessageSquare, ShoppingCart,
  ChevronDown, ChevronRight, Factory, UserCircle, Wrench, Store, Receipt, ArrowLeft, RotateCcw,
  Package2, Briefcase, ArrowRightLeft, Warehouse, ClipboardList, Scissors, Activity, Bell, AlertTriangle, Truck
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['dashboard']));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'ADMIN';

  // Filtrer les dashboards selon les attributions de l'utilisateur
  const getAllDashboards = () => {
    const allDashboards = [
      { path: '/dashboard-admin', label: 'Dashboard Administrateur', icon: LayoutDashboard, id: 'dashboard' },
      { path: '/magasinier-mp', label: 'Dashboard Magasinier MP', icon: Package, id: 'magasinier-mp' },
      { path: '/tisseur', label: 'Dashboard Tisseur', icon: Activity, id: 'tisseur' },
      { path: '/mecanicien', label: 'Dashboard Mécanicien & Entretien', icon: Wrench, id: 'mecanicien' },
      { path: '/coupe', label: 'Dashboard Coupe', icon: Scissors, id: 'coupe' },
      { path: '/controle-central', label: 'Dashboard Contrôle Central', icon: CheckCircle, id: 'controle-central' },
      { path: '/chef-atelier', label: 'Dashboard Chef d\'Atelier', icon: Briefcase, id: 'chef-atelier' },
      { path: '/magasin-pf', label: 'Dashboard Magasin PF', icon: Package, id: 'magasin-pf' },
      { path: '/magasinier-soustraitants', label: 'Dashboard Magasinier Soustraitants', icon: Truck, id: 'magasinier-soustraitants' },
      { path: '/chef-production', label: 'Dashboard Chef Production', icon: Factory, id: 'chef-production' },
    ];

    // L'admin voit tous les dashboards
    if (isAdmin) {
      return allDashboards;
    }

    // Sinon, filtrer selon les dashboards attribués
    if (user?.dashboardsAttribues && user.dashboardsAttribues.length > 0) {
      return allDashboards.filter(dash => user.dashboardsAttribues?.includes(dash.id));
    }

    // Si pas de dashboard attribué et pas admin, ne rien afficher
    return [];
  };

  const menuCategories: MenuCategory[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      items: getAllDashboards()
    },
    {
      id: 'vente',
      label: 'Vente',
      icon: ShoppingBag,
      items: [
        { path: '/devis', label: 'Devis', icon: FileText },
        { path: '/commandes', label: 'Commandes', icon: ShoppingBag },
        { path: '/bon-livraison', label: 'Bon de Livraison', icon: Truck },
        { path: '/facture', label: 'Facture', icon: Receipt },
        { path: '/avoir', label: 'Avoir', icon: ArrowLeft },
        { path: '/bon-retour', label: 'Bon de Retour', icon: RotateCcw },
      ]
    },
    {
      id: 'fabrication',
      label: 'Fabrication',
      icon: Factory,
      items: [
        { path: '/of', label: 'Ordres de Fabrication', icon: FileText },
        { path: '/suivi-fabrication', label: 'Suivi Fabrication', icon: TrendingUp },
        { path: '/planning', label: 'Planning', icon: Calendar },
        { path: '/planification-gantt', label: 'Planification Gantt', icon: Calendar },
        { path: '/qualite-avance', label: 'Qualité Avancée', icon: CheckCircle },
        { path: '/couts', label: 'Coûts', icon: DollarSign },
      ]
    },
    {
      id: 'resource-humaine',
      label: 'Ressource Humaine',
      icon: UserCircle,
      items: [
        { path: '/equipe', label: 'Équipe', icon: Users },
        { path: '/soustraitants', label: 'Sous-traitants', icon: Building2 },
      ]
    },
    {
      id: 'ecommerce',
      label: 'E-commerce',
      icon: ShoppingCart,
      items: [
        { path: '/ecommerce', label: 'E-commerce IA', icon: ShoppingCart },
        { path: '/catalogue-produit', label: 'Catalogue Produit', icon: Package },
      ]
    },
    {
      id: 'produit-service',
      label: 'Produit et Service',
      icon: Package2,
      items: [
        { path: '/modeles', label: 'Modèles', icon: Layers },
        { path: '/articles', label: 'Articles', icon: Package },
        { path: '/services', label: 'Services', icon: Briefcase },
        { path: '/matieres-premieres', label: 'Matière Première', icon: Box },
        { path: '/parametres-produit-service', label: 'Paramètres', icon: Settings },
      ]
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      items: [
        { path: '/clients', label: 'Gestion Clients', icon: Users },
      ]
    },
    {
      id: 'fournisseurs',
      label: 'Fournisseurs',
      icon: Truck,
      items: [
        { path: '/fournisseurs', label: 'Gestion Fournisseurs', icon: Truck },
      ]
    },
    {
      id: 'equipement',
      label: 'Équipement',
      icon: Wrench,
      items: [
        { path: '/machines', label: 'Machines', icon: Cog },
        { path: '/maintenance', label: 'Maintenance', icon: Wrench },
      ]
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: Package,
      items: [
        { path: '/produit-fini', label: 'Produit Fini', icon: Package },
        { path: '/semi-fini', label: 'Semi-Fini', icon: Package2 },
        { path: '/matiere-premiere-stock', label: 'Matière Première', icon: Box },
        { path: '/fourniture', label: 'Fourniture', icon: ShoppingBag },
        { path: '/inventaire', label: 'Inventaire', icon: ClipboardList },
        { path: '/entrepot', label: 'Entrepôt', icon: Warehouse },
        { path: '/mouvement', label: 'Mouvement', icon: ArrowRightLeft },
        { path: '/liste-colisage', label: 'Liste de Colisage', icon: Package },
        { path: '/liste-palettes', label: 'Liste des Palettes', icon: Layers },
      ]
    },
    {
      id: 'parametrage',
      label: 'Paramétrage',
      icon: Settings,
      items: isAdmin ? [
        { path: '/parametrage', label: 'Paramétrage Général', icon: Settings },
        { path: '/parametres-catalogue', label: 'Paramètres Catalogue', icon: Settings },
        { path: '/multisociete', label: 'Multi-Société', icon: Building2 },
        { path: '/communication', label: 'Communication Externe', icon: MessageSquare },
        { path: '/messages-operateurs', label: 'Messages Opérateurs', icon: Bell },
      ] : []
    },
  ].filter(category => category.items.length > 0);

  return (
    <nav className="bg-white shadow-lg border-r border-gray-200 w-64 min-h-screen fixed left-0 top-0">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            🚀
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">ERP La Plume</h1>
            <p className="text-xs text-gray-500">Artisanale</p>
          </div>
        </div>

        <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto">
          {menuCategories.map((category) => {
            const CategoryIcon = category.icon;
            const isExpanded = expandedCategories.has(category.id);
            const hasActiveItem = category.items.some(item => location.pathname === item.path);
            
            return (
              <div key={category.id} className="mb-1">
                {/* En-tête de catégorie */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                    hasActiveItem
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="w-5 h-5" />
                    <span className="font-semibold text-sm">{category.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {/* Items de la catégorie */}
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-2">
                    {category.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                            isActive
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="px-4 py-2 mb-4">
            <div className="text-sm font-medium text-gray-700">{user?.nom || user?.email}</div>
            <div className="text-xs text-gray-500">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
