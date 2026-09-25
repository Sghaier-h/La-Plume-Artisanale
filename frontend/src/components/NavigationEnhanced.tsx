/**
 * NavigationEnhanced - Navigation améliorée avec sous-menus et permissions
 * Version améliorée du composant Navigation avec gestion des permissions
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../store/AppContext';
import {
  LayoutDashboard, Package, Users, ShoppingBag, Cog, Building2, FileText, Settings,
  Box, Layers, TrendingUp, Truck, Calendar, CheckCircle, DollarSign, MessageSquare, ShoppingCart,
  ChevronDown, ChevronRight, ChevronLeft, Factory, UserCircle, Wrench, Store, Receipt, ArrowLeft, RotateCcw,
  Package2, Briefcase, ArrowRightLeft, Warehouse, ClipboardList, Scissors, Activity, Bell, AlertTriangle,
  Users as UsersIcon, Menu, X, FolderKanban, Cog as CogIcon, Globe, Target, UserPlus, BarChart3, FolderTree,
  Calculator, Home
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import CompanySwitcher from './CompanySwitcher';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string; // Permission requise (ex: 'sale.order.read')
  badge?: number | string;
  children?: MenuItem[];
}

interface MenuCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  items: MenuItem[];
  collapsible?: boolean;
  /** Si true, la catégorie est affichée en haut sans bouton replier/déplier, liens toujours visibles */
  alwaysExpanded?: boolean;
}

interface NavigationEnhancedProps {
  onNavigate?: () => void;
}

const NavigationEnhanced: React.FC<NavigationEnhancedProps> = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, toggleSidebar, hasPermission } = useApp();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fonction pour gérer la navigation avec fermeture du menu
  const handleNavigation = (path: string) => {
    navigate(path);
    if (onNavigate) {
      onNavigate();
    }
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

  const toggleItem = (itemPath: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemPath)) {
      newExpanded.delete(itemPath);
    } else {
      newExpanded.add(itemPath);
    }
    setExpandedItems(newExpanded);
  };

  // Vérifier si un item a des enfants actifs
  const hasActiveChild = (item: MenuItem): boolean => {
    if (!item.children) return false;
    return item.children.some(child => 
      location.pathname === child.path || hasActiveChild(child)
    );
  };

  // Filtrer les items selon les permissions
  const filterByPermissions = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // L'admin a accès à tout - skip la vérification de permission
      if (isAdmin) {
        // Pour l'admin, filtrer récursivement les enfants mais garder tous les items
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterByPermissions(item.children);
          (item as any).children = filteredChildren;
          // Garder l'item même si pas d'enfants pour l'admin
          return true;
        }
        return true; // L'admin voit tous les items
      }

      // Pour les non-admins, si hasPermission n'est pas disponible, autoriser l'accès
      // (permet l'accès même si le système de permissions n'est pas complètement configuré)
      if (item.permission && hasPermission) {
        try {
          const [module, action] = item.permission.split('.');
          if (!hasPermission(module, action || 'read')) {
            return false;
          }
        } catch (e) {
          // Si erreur de permission, autoriser l'accès par défaut
          console.warn('Erreur vérification permission:', e);
        }
      }

      // Filtrer les enfants aussi pour les non-admins
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterByPermissions(item.children);
        // Garder l'item si au moins un enfant est visible
        if (filteredChildren.length > 0) {
          // Mettre à jour les enfants filtrés
          (item as any).children = filteredChildren;
          return true;
        }
        return false;
      }

      return true;
    });
  };

  // Vérifier si l'utilisateur est admin (avec vérifications supplémentaires)
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin' || user?.role?.toUpperCase() === 'ADMIN';

  // Obtenir tous les dashboards (chemins doivent correspondre exactement aux routes dans App.tsx)
  const getAllDashboards = () => {
    const allDashboards = [
      { path: '/dashboard-admin', label: 'Dashboard Administrateur', icon: LayoutDashboard, id: 'dashboard', permission: 'dashboard.read' },
      { path: '/dashboard-magasinier-mp', label: 'Dashboard Magasinier MP', icon: Package, id: 'magasinier-mp', permission: 'dashboard.magasinier-mp' },
      { path: '/dashboard-tisseur', label: 'Dashboard Tisseur', icon: Activity, id: 'tisseur', permission: 'dashboard.tisseur' },
      { path: '/mecanicien', label: 'Dashboard Mécanicien & Entretien', icon: Wrench, id: 'mecanicien', permission: 'dashboard.mecanicien' },
      { path: '/dashboard-post-coupe', label: 'Dashboard Post Coupe', icon: Scissors, id: 'post-coupe', permission: 'dashboard.coupe' },
      { path: '/dashboard-controle-central', label: 'Dashboard Contrôle Central', icon: CheckCircle, id: 'controle-central', permission: 'dashboard.controle-central' },
      { path: '/chef-atelier-dashboard', label: 'Dashboard Chef d\'Atelier', icon: Briefcase, id: 'chef-atelier', permission: 'dashboard.chef-atelier' },
      { path: '/magasin-pf', label: 'Dashboard Magasin PF', icon: Package, id: 'magasin-pf', permission: 'dashboard.magasin-pf' },
      { path: '/dashboard-magasinier-soustraitants', label: 'Dashboard Magasinier Soustraitants', icon: Truck, id: 'magasinier-soustraitants', permission: 'dashboard.magasinier-soustraitants' },
      { path: '/dashboard-chef-production', label: 'Dashboard Chef Production', icon: Factory, id: 'chef-production', permission: 'dashboard.chef-production' },
      { path: '/dashboard-admin', label: 'Dashboard Admin (GPAO)', icon: LayoutDashboard, id: 'gpao', permission: 'dashboard.gpao' },
    ];

    if (isAdmin) {
      return allDashboards;
    }

    if (user?.dashboardsAttribues && user.dashboardsAttribues.length > 0) {
      return allDashboards.filter(dash => user.dashboardsAttribues?.includes(dash.id));
    }

    return [];
  };

  // Si opérateur (non admin), ne montrer QUE les dashboards attribués
  // Les opérateurs ne doivent PAS voir les autres modules (Vente, CRM, etc.)
  // DÉSACTIVÉ TEMPORAIREMENT : Permettre l'accès au menu pour tous les utilisateurs
  const shouldShowOnlyDashboards = false; // !isAdmin && user?.dashboardsAttribues && user.dashboardsAttribues.length > 0;

  const menuCategories: MenuCategory[] = shouldShowOnlyDashboards ? [
    // Opérateurs : pas de section Pilotage Dashboard dans le menu (dashboards accessibles via la barre du haut)
  ] : [
    {
      id: 'vente',
      label: 'Vente',
      icon: ShoppingBag,
      permission: 'sale.read',
      items: [
        { 
          path: '/devis', 
          label: 'Devis', 
          icon: FileText,
          permission: 'sale.quotation.read',
          children: [
            { path: '/devis', label: 'Liste des devis', icon: FileText, permission: 'sale.quotation.read' },
            { path: '/devis/create', label: 'Nouveau devis', icon: FileText, permission: 'sale.quotation.write' },
          ]
        },
        { 
          path: '/commandes', 
          label: 'Commandes', 
          icon: ShoppingBag,
          permission: 'sale.order.read',
          children: [
            { path: '/commandes', label: 'Liste des commandes', icon: ShoppingBag, permission: 'sale.order.read' },
            { path: '/sale-orders', label: 'Commandes Avancées', icon: ShoppingCart, permission: 'sale.order.read' },
            { path: '/commandes/create', label: 'Nouvelle commande', icon: ShoppingBag, permission: 'sale.order.write' },
          ]
        },
        { 
          path: '/bon-livraison', 
          label: 'Bon de Livraison', 
          icon: Truck,
          permission: 'stock.picking.read'
        },
        { 
          path: '/facture', 
          label: 'Facture', 
          icon: Receipt,
          permission: 'account.move.read',
          children: [
            { path: '/facture', label: 'Factures clients', icon: Receipt, permission: 'account.move.read' },
            { path: '/account-moves', label: 'Écritures Comptables', icon: Receipt, permission: 'account.move.read' },
            { path: '/reports', label: 'Rapports Comptables', icon: BarChart3, permission: 'account.report.read' },
          ]
        },
        { 
          path: '/avoir', 
          label: 'Avoir', 
          icon: ArrowLeft,
          permission: 'account.move.read'
        },
        { 
          path: '/bon-retour', 
          label: 'Bon de Retour', 
          icon: RotateCcw,
          permission: 'stock.picking.read'
        },
      ]
    },
    {
      id: 'crm',
      label: 'CRM & Clients',
      icon: Users,
      permission: 'crm.read',
      items: [
        { 
          path: '/clients', 
          label: 'Clients', 
          icon: Users,
          permission: 'res.partner.read'
        },
        { 
          path: '/pipeline-vente', 
          label: 'Pipeline de Vente', 
          icon: TrendingUp,
          permission: 'crm.read'
        },
        { 
          path: '/crm/leads', 
          label: 'Pistes / Leads', 
          icon: Users,
          permission: 'crm.lead.read'
        },
        { 
          path: '/opportunities', 
          label: 'Opportunités', 
          icon: Target,
          permission: 'crm.opportunity.read'
        }
      ]
    },
    {
      id: 'fabrication',
      label: 'Fabrication',
      icon: Factory,
      permission: 'mrp.read',
      items: [
        { 
          path: '/bom', 
          label: 'Bill of Material (BOM)', 
          icon: Layers,
          permission: 'mrp.bom.read'
        },
        { 
          path: '/of', 
          label: 'Ordres de Fabrication', 
          icon: FileText,
          permission: 'mrp.production.read'
        },
        { 
          path: '/suivi-fabrication', 
          label: 'Suivi Fabrication', 
          icon: TrendingUp,
          permission: 'mrp.production.read'
        },
        { 
          path: '/planning', 
          label: 'Planning', 
          icon: Calendar,
          permission: 'mrp.production.read'
        },
        { 
          path: '/planification-gantt', 
          label: 'Planification Gantt', 
          icon: Calendar,
          permission: 'mrp.production.read'
        },
        { 
          path: '/qualite-avance', 
          label: 'Qualité Avancée', 
          icon: CheckCircle,
          permission: 'quality.read'
        },
        { 
          path: '/couts', 
          label: 'Coûts', 
          icon: DollarSign,
          permission: 'mrp.cost.read'
        },
      ]
    },
    {
      id: 'produit-service',
      label: 'Produits et Services',
      icon: Package2,
      permission: 'product.read',
      items: [
        { 
          path: '/products', 
          label: 'Produits', 
          icon: Package,
          permission: 'product.template.read'
        },
        { 
          path: '/product-categories', 
          label: 'Catégories', 
          icon: FolderTree,
          permission: 'product.category.read'
        },
        { 
          path: '/modeles', 
          label: 'Modèles', 
          icon: Layers,
          permission: 'product.template.read'
        },
        { 
          path: '/services', 
          label: 'Services', 
          icon: Briefcase,
          permission: 'product.service.read'
        },
        { 
          path: '/matieres-premieres', 
          label: 'Matière Première', 
          icon: Box,
          permission: 'product.product.read'
        },
        { 
          path: '/parametres-produit-service', 
          label: 'Paramètres', 
          icon: Settings,
          permission: 'product.config.write'
        },
      ]
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: Package,
      permission: 'stock.read',
      items: [
        { 
          path: '/produit-fini', 
          label: 'Produit Fini', 
          icon: Package,
          permission: 'stock.quant.read'
        },
        { 
          path: '/semi-fini', 
          label: 'Semi-Fini', 
          icon: Package2,
          permission: 'stock.quant.read'
        },
        { 
          path: '/matiere-premiere-stock', 
          label: 'Matière Première', 
          icon: Box,
          permission: 'stock.quant.read'
        },
        { 
          path: '/stock-pickings', 
          label: 'Livraisons / Réceptions', 
          icon: Truck,
          permission: 'stock.picking.read'
        },
        { 
          path: '/inventaire', 
          label: 'Inventaire', 
          icon: ClipboardList,
          permission: 'stock.inventory.read'
        },
        { 
          path: '/entrepot', 
          label: 'Entrepôt', 
          icon: Warehouse,
          permission: 'stock.location.read'
        },
        { 
          path: '/warehouse-management', 
          label: 'Gestion Entrepôts', 
          icon: Warehouse,
          permission: 'stock.warehouse.read'
        },
        { 
          path: '/mouvement', 
          label: 'Mouvement', 
          icon: ArrowRightLeft,
          permission: 'stock.move.read'
        },
      ]
    },
    {
      id: 'personnel',
      label: 'Personnel',
      icon: Users,
      permission: 'hr.read',
      items: [
        { 
          path: '/hr/employees', 
          label: 'Employés', 
          icon: UserCircle,
          permission: 'hr.employee.read'
        },
        { 
          path: '/hr/recruitment', 
          label: 'Recrutement', 
          icon: UserPlus,
          permission: 'hr.applicant.read'
        },
        { 
          path: '/hr/payslips', 
          label: 'Salaires / Bulletins', 
          icon: DollarSign,
          permission: 'hr.payslip.read'
        },
        { 
          path: '/payroll-tunisia', 
          label: 'Paie Tunisie', 
          icon: Calculator,
          permission: 'hr.payslip.read'
        },
        { 
          path: '/equipe', 
          label: 'Équipe', 
          icon: Users,
          permission: 'hr.employee.read'
        },
      ]
    },
    {
      id: 'fournisseur',
      label: 'Fournisseurs',
      icon: Building2,
      permission: 'purchase.read',
      items: [
        { 
          path: '/fournisseurs', 
          label: 'Liste Fournisseurs', 
          icon: Building2,
          permission: 'res.partner.read'
        },
        { 
          path: '/suppliers', 
          label: 'Gestion Fournisseurs', 
          icon: Building2,
          permission: 'res.partner.read'
        },
        { 
          path: '/purchase-orders', 
          label: 'Commandes Fournisseurs', 
          icon: ShoppingCart,
          permission: 'purchase.order.read'
        },
      ]
    },
    {
      id: 'soustraitants',
      label: 'Sous-traitants',
      icon: Truck,
      permission: 'mrp.read',
      items: [
        { 
          path: '/soustraitants', 
          label: 'Liste Sous-traitants', 
          icon: Truck,
          permission: 'mrp.read'
        },
        { 
          path: '/soustraitants-odoo', 
          label: 'Gestion Sous-traitants', 
          icon: Truck,
          permission: 'mrp.read'
        },
      ]
    },
    {
      id: 'equipement-maintenance',
      label: 'Équipement et Maintenance',
      icon: Wrench,
      permission: 'maintenance.read',
      items: [
        { 
          path: '/machines', 
          label: 'Machines', 
          icon: Factory,
          permission: 'maintenance.machine.read'
        },
        { 
          path: '/maintenance', 
          label: 'Maintenance', 
          icon: Wrench,
          permission: 'maintenance.read'
        },
      ]
    },
    {
      id: 'parametrage',
      label: 'Paramétrage',
      icon: Settings,
      permission: 'base.config.write',
      items: isAdmin ? [
        { 
          path: '/parametrage', 
          label: 'Paramétrage Général', 
          icon: Settings,
          permission: 'base.config.write'
        },
        { 
          path: '/companies', 
          label: 'Gestion des Sociétés', 
          icon: Building2,
          permission: 'base.config.write'
        },
        { 
          path: '/settings', 
          label: 'Paramètres Avancés', 
          icon: Settings,
          permission: 'base.config.write'
        },
        { 
          path: '/parametres-catalogue', 
          label: 'Paramètres Catalogue', 
          icon: Settings,
          permission: 'base.config.write'
        },
        { 
          path: '/multisociete', 
          label: 'Multi-Société', 
          icon: Building2,
          permission: 'base.config.write'
        },
        { 
          path: '/communication', 
          label: 'Communication Externe', 
          icon: MessageSquare,
          permission: 'base.config.write'
        },
        { 
          path: '/messages-operateurs', 
          label: 'Messages Opérateurs', 
          icon: Bell,
          permission: 'base.config.write'
        },
      ] : []
    },
    {
      id: 'ecommerce',
      label: 'E-commerce',
      icon: ShoppingBag,
      permission: 'website.read',
      items: [
        { 
          path: '/ecommerce', 
          label: 'E-commerce', 
          icon: ShoppingBag,
          permission: 'website.read'
        },
        { 
          path: '/ecommerce-odoo', 
          label: 'Gestion E-commerce', 
          icon: Globe,
          permission: 'website.read'
        },
      ]
    },
    {
      id: 'ai',
      label: 'Intelligence Artificielle',
      icon: Activity,
      permission: 'base.config.write',
      items: [
        { 
          path: '/ai', 
          label: 'IA', 
          icon: Activity,
          permission: 'base.config.write'
        }
      ]
    },
  ].map(category => {
    // Filtrer les items de la catégorie
    const filteredItems = filterByPermissions(category.items);
    return { ...category, items: filteredItems };
  }).filter(category => {
    // Si opérateur (non admin), aucune catégorie à afficher dans le menu (dashboards en haut)
    if (shouldShowOnlyDashboards) {
      return false;
    }
    
    // L'admin a accès à toutes les catégories - skip la vérification de permission
    if (isAdmin) {
      return category.items.length > 0;
    }
    
    // Filtrer les catégories selon les permissions pour les non-admins
    // Si hasPermission n'est pas disponible ou si erreur, autoriser l'accès par défaut
    if (category.permission && hasPermission) {
      try {
        const [module, action] = category.permission.split('.');
        if (!hasPermission(module, action || 'read')) {
          return false;
        }
      } catch (e) {
        // Si erreur de permission, autoriser l'accès par défaut
        console.warn('Erreur vérification permission catégorie:', e);
      }
    }
    return category.items.length > 0;
  });

  // Auto-expand les catégories avec des items actifs
  useEffect(() => {
    menuCategories.forEach(category => {
      const hasActive = category.items.some(item => 
        location.pathname === item.path || hasActiveChild(item)
      );
      if (hasActive && !expandedCategories.has(category.id)) {
        setExpandedCategories(prev => new Set([...prev, category.id]));
      }
    });
  }, [location.pathname]);

  return (
    <nav className={`bg-gradient-to-b from-slate-50 via-white to-slate-100 shadow-2xl border-r-2 border-slate-200 w-72 h-screen fixed left-0 top-0 transition-all duration-300 z-50 flex flex-col ${state.ui.sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
      <div className="px-3 pt-3 pb-0 flex-1 min-h-0 flex flex-col overflow-y-auto">
        {/* Header doré + gris métallique */}
        <div className="mb-4">
          <div className="flex items-center justify-between h-14 min-h-[56px] px-3 bg-gradient-to-r from-slate-600 via-slate-500 to-amber-600 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                🚀
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-white text-base drop-shadow-md truncate">ERP La Plume</h1>
                <p className="text-xs text-amber-100 font-medium truncate">Artisanale</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 flex-shrink-0"
              aria-label="Replier le menu"
              title="Replier le menu"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="transform transition-all duration-200 hover:scale-105">
            <GlobalSearch />
          </div>
        </div>

        {/* Accueil en haut */}
        <button
          onClick={() => handleNavigation('/dashboard-admin')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 text-slate-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-slate-100 hover:shadow-md transition-all duration-200"
          title="Accueil"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 transition-colors">
            <Home className="w-5 h-5 text-gray-600" />
          </div>
          <span className="font-semibold text-sm">Accueil</span>
        </button>

        {/* Catégories : occupe l'espace pour que le footer reste en bas sans vide */}
        <div className="flex-1 min-h-0 space-y-1 overflow-y-auto custom-scrollbar">
          {menuCategories.map((category) => {
            const CategoryIcon = category.icon;
            const isExpanded = expandedCategories.has(category.id);
            const hasActiveItem = category.items.some(item =>
              location.pathname === item.path || hasActiveChild(item)
            );

            return (
              <div key={category.id} className="mb-1">
                {/* Bouton catégorie : icône + nom + chevron pour déplier */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    hasActiveItem
                      ? 'bg-gradient-to-r from-slate-600 to-amber-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100 hover:from-amber-50 hover:to-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-1.5 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      hasActiveItem ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <CategoryIcon className={`w-5 h-5 ${hasActiveItem ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <span className={`font-semibold text-sm truncate ${hasActiveItem ? 'text-white' : 'text-gray-700'}`}>
                      {category.label}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    } ${hasActiveItem ? 'text-white' : 'text-gray-500'}`}
                  />
                </button>

                {/* Sous-catégories dépliées au clic */}
                {isExpanded && (
                  <div className="mt-2 ml-2 pl-3 border-l-2 border-amber-200 space-y-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{category.label}</div>
                    {category.items.map((item, index) => {
                      const ItemIcon = item.icon;
                      const isActive = location.pathname === item.path;
                      const hasChildren = item.children && item.children.length > 0;
                      const isItemExpanded = expandedItems.has(item.path);
                      const hasActiveChildItem = hasActiveChild(item);
                      
                      return (
                        <div 
                          key={item.path}
                          className="transform transition-all duration-200 hover:translate-x-1"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center">
                            {hasChildren ? (
                              <button
                                onClick={() => toggleItem(item.path)}
                                className={`group flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm relative overflow-hidden ${
                                  isActive || hasActiveChildItem
                                    ? 'bg-gradient-to-r from-slate-600 to-amber-600 text-white shadow-md font-medium'
                                    : 'text-slate-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-slate-100 hover:shadow-sm'
                                }`}
                              >
                                <div className={`p-1 rounded-lg ${
                                  isActive || hasActiveChildItem
                                    ? 'bg-white/20'
                                    : 'bg-gray-100 group-hover:bg-amber-200'
                                } transition-colors duration-200`}>
                                  <ItemIcon className={`w-4 h-4 ${
                                    isActive || hasActiveChildItem ? 'text-white' : 'text-gray-600'
                                  }`} />
                                </div>
                                <span className={`flex-1 ${isActive || hasActiveChildItem ? 'text-white' : 'text-gray-700'}`}>
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    isActive || hasActiveChildItem
                                      ? 'bg-white/30 text-white'
                                      : 'bg-gradient-to-r from-slate-500 to-amber-500 text-white shadow-sm'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                                <div className={`transition-transform duration-200 ${isItemExpanded ? 'rotate-180' : ''}`}>
                                  <ChevronDown className={`w-3 h-3 ${
                                    isActive || hasActiveChildItem ? 'text-white' : 'text-gray-500'
                                  }`} />
                                </div>
                                {(isActive || hasActiveChildItem) && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleNavigation(item.path)}
                                className={`group flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm relative overflow-hidden text-left ${
                                  isActive
                                    ? 'bg-gradient-to-r from-slate-600 to-amber-600 text-white shadow-md font-medium'
                                    : 'text-slate-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-slate-100 hover:shadow-sm'
                                }`}
                              >
                                <div className={`p-1 rounded-lg ${
                                  isActive
                                    ? 'bg-white/20'
                                    : 'bg-gray-100 group-hover:bg-amber-200'
                                } transition-colors duration-200`}>
                                  <ItemIcon className={`w-4 h-4 ${
                                    isActive ? 'text-white' : 'text-gray-600'
                                  }`} />
                                </div>
                                <span className={`flex-1 ${isActive ? 'text-white' : 'text-gray-700'}`}>
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    isActive
                                      ? 'bg-white/30 text-white'
                                      : 'bg-gradient-to-r from-slate-500 to-amber-500 text-white shadow-sm'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                                {isActive && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                                )}
                              </button>
                            )}
                          </div>
                          
                          {/* Sous-items avec style amélioré */}
                          {hasChildren && isItemExpanded && (
                            <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-amber-200 pl-3 animate-in fade-in slide-in-from-left-2 duration-300">
                              {item.children!.map((child) => {
                                const ChildIcon = child.icon;
                                const isChildActive = location.pathname === child.path;
                                return (
                                  <button
                                    key={child.path}
                                    onClick={() => handleNavigation(child.path)}
                                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm text-left w-full ${
                                      isChildActive
                                        ? 'bg-amber-100 text-amber-800 font-medium shadow-sm'
                                        : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                                    }`}
                                  >
                                    <div className={`p-0.5 rounded ${
                                      isChildActive ? 'bg-blue-200' : 'bg-gray-200 group-hover:bg-amber-200'
                                    } transition-colors duration-200`}>
                                      <ChildIcon className="w-3 h-3" />
                                    </div>
                                    <span>{child.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bloc société / Erreur serveur en bas du slide - réduit l'espace vide */}
        <div className="mt-auto flex-shrink-0 border-t border-slate-200 px-2 py-1">
          <CompanySwitcher />
        </div>
      </div>
    </nav>
  );
};

export default NavigationEnhanced;
