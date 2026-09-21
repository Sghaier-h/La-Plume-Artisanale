/**
 * Page d'accueil principale - La Plume Artisanale
 * Vue améliorée avec logique claire et organisation par catégories
 * Version optimisée avec fonctionnalités avancées
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../components/erp';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ShoppingCart, Package, Factory, Users, FileText, Settings, 
  BarChart3, CreditCard, Truck, ClipboardList, Wrench, 
  ShoppingBag, UserCircle, Building2, Boxes, Layers,
  Receipt, FileCheck, Target, TrendingUp,
  Warehouse, ClipboardCheck, Briefcase, DollarSign,
  Zap, Globe, Archive, Search, ChevronDown, ChevronUp,
  LayoutDashboard, Store, Tag, Users2, FileBarChart,
  PackageSearch, ClipboardCopy, Star, Clock, X,
  Grid3x3, List, Filter, Sparkles, TrendingDown, 
  Command, Moon, Sun, Bell, HelpCircle, Bookmark, Palette
} from 'lucide-react';

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
  category: string;
  color: string;
  description?: string;
  priority?: number;
  tags?: string[]; // Tags pour recherche avancée
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface QuickStats {
  totalModules: number;
  recentModules: number;
  favoriteModules: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { info } = useNotifications();
  const { theme, themeColors, isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['dashboards', 'vente']));
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentModules, setRecentModules] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'categories'>('categories');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [stats, setStats] = useState<QuickStats>({
    totalModules: 0,
    recentModules: 0,
    favoriteModules: 0
  });
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [moduleAnimations, setModuleAnimations] = useState<Set<string>>(new Set());

  // Charger les favoris et modules récents depuis localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('erp_favorites');
      const savedRecent = localStorage.getItem('erp_recent_modules');
      const savedViewMode = localStorage.getItem('erp_home_view_mode');
      const savedExpanded = localStorage.getItem('erp_expanded_categories');
      
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
      
      if (savedRecent) {
        setRecentModules(JSON.parse(savedRecent));
      }

      if (savedViewMode && ['grid', 'list', 'categories'].includes(savedViewMode)) {
        setViewMode(savedViewMode as 'grid' | 'list' | 'categories');
      }

      if (savedExpanded) {
        setExpandedCategories(new Set(JSON.parse(savedExpanded)));
      }
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    }
  }, []);

  // Sauvegarder les catégories étendues
  useEffect(() => {
    try {
      localStorage.setItem('erp_expanded_categories', JSON.stringify(Array.from(expandedCategories)));
    } catch (error) {
      console.error('Erreur sauvegarde catégories:', error);
    }
  }, [expandedCategories]);

  // Sauvegarder le mode d'affichage
  useEffect(() => {
    try {
      localStorage.setItem('erp_home_view_mode', viewMode);
    } catch (error) {
      console.error('Erreur sauvegarde mode:', error);
    }
  }, [viewMode]);

  // Catégories avec descriptions
  const categories: Category[] = useMemo(() => [
    { 
      id: 'dashboards', 
      name: 'Dashboards', 
      icon: <LayoutDashboard size={20} />, 
      color: '#6366f1',
      description: 'Tableaux de bord et analyses'
    },
    { 
      id: 'vente', 
      name: 'Vente', 
      icon: <ShoppingCart size={20} />, 
      color: '#10b981',
      description: 'Gestion commerciale et ventes'
    },
    { 
      id: 'achat', 
      name: 'Achat', 
      icon: <ShoppingBag size={20} />, 
      color: '#f59e0b',
      description: 'Achats et fournisseurs'
    },
    { 
      id: 'stock', 
      name: 'Stock', 
      icon: <Warehouse size={20} />, 
      color: '#3b82f6',
      description: 'Inventaire et entrepôts'
    },
    { 
      id: 'production', 
      name: 'Production', 
      icon: <Factory size={20} />, 
      color: '#ef4444',
      description: 'Fabrication et planification'
    },
    { 
      id: 'crm', 
      name: 'CRM', 
      icon: <Target size={20} />, 
      color: '#8b5cf6',
      description: 'Relation client et opportunités'
    },
    { 
      id: 'comptabilite', 
      name: 'Comptabilité', 
      icon: <FileBarChart size={20} />, 
      color: '#14b8a6',
      description: 'Comptabilité et finances'
    },
    { 
      id: 'rh', 
      name: 'Ressources Humaines', 
      icon: <Users size={20} />, 
      color: '#ec4899',
      description: 'Personnel et paie'
    },
    { 
      id: 'projets', 
      name: 'Projets', 
      icon: <Briefcase size={20} />, 
      color: '#6366f1',
      description: 'Gestion de projets'
    },
    { 
      id: 'autres', 
      name: 'Autres', 
      icon: <Settings size={20} />, 
      color: '#64748b',
      description: 'Configuration et outils'
    },
  ], []);

  // Modules organisés par catégorie
  const modules: Module[] = useMemo(() => [
    // Dashboards
    { 
      id: 'dashboards', 
      name: 'Dashboards', 
      icon: <LayoutDashboard size={32} />, 
      path: '/erp/dashboards', 
      category: 'dashboards', 
      color: '#6366f1', 
      description: 'Tous les tableaux de bord',
      priority: 1,
      tags: ['dashboard', 'analyse', 'statistiques']
    },
    
    // Vente
    { id: 'sale-orders', name: 'Commandes Vente', icon: <ShoppingCart size={32} />, path: '/sale-orders', category: 'vente', color: '#6366f1', description: 'Gestion des commandes de vente', priority: 1, tags: ['vente', 'commande', 'client'] },
    { id: 'products', name: 'Produits', icon: <Package size={32} />, path: '/products', category: 'vente', color: '#8b5cf6', description: 'Catalogue des produits', priority: 2, tags: ['produit', 'catalogue', 'article'] },
    { id: 'partners', name: 'Clients', icon: <Users size={32} />, path: '/partners', category: 'vente', color: '#ec4899', description: 'Gestion des clients', priority: 3, tags: ['client', 'partenaire', 'contact'] },
    { id: 'devis', name: 'Devis', icon: <FileText size={32} />, path: '/devis', category: 'vente', color: '#f59e0b', description: 'Création et suivi des devis', priority: 4, tags: ['devis', 'offre', 'proposition'] },
    { id: 'factures', name: 'Factures', icon: <Receipt size={32} />, path: '/factures', category: 'vente', color: '#10b981', description: 'Gestion des factures', priority: 5, tags: ['facture', 'facturation', 'paiement'] },
    { id: 'avoirs', name: 'Avoirs', icon: <FileCheck size={32} />, path: '/avoirs', category: 'vente', color: '#ef4444', description: 'Notes de crédit', priority: 6, tags: ['avoir', 'remboursement', 'crédit'] },
    { id: 'bons-livraison', name: 'Bons de Livraison', icon: <Truck size={32} />, path: '/bon-livraison', category: 'vente', color: '#3b82f6', description: 'Livraisons clients', priority: 7, tags: ['livraison', 'expédition', 'transport'] },
    { id: 'bons-retour', name: 'Bons de Retour', icon: <Truck size={32} />, path: '/bon-retour', category: 'vente', color: '#f97316', description: 'Retours clients', priority: 8, tags: ['retour', 'réclamation'] },
    { id: 'pricelists', name: 'Listes de Prix', icon: <Tag size={32} />, path: '/pricelists', category: 'vente', color: '#14b8a6', description: 'Tarifs et listes de prix', priority: 9, tags: ['prix', 'tarif', 'liste'] },
    { id: 'pos', name: 'Point de Vente', icon: <Store size={32} />, path: '/pos', category: 'vente', color: '#a855f7', description: 'Terminal de vente', priority: 10, tags: ['pos', 'caisse', 'point de vente'] },
    { id: 'ecommerce', name: 'E-commerce', icon: <ShoppingBag size={32} />, path: '/ecommerce-odoo', category: 'vente', color: '#06b6d4', description: 'Boutique en ligne', priority: 11, tags: ['ecommerce', 'boutique', 'en ligne'] },
    
    // Achat
    { id: 'purchase-orders', name: 'Commandes Achat', icon: <ShoppingCart size={32} />, path: '/purchase-orders', category: 'achat', color: '#6366f1', description: 'Commandes fournisseurs', priority: 1, tags: ['achat', 'commande', 'fournisseur'] },
    { id: 'suppliers', name: 'Fournisseurs', icon: <Building2 size={32} />, path: '/suppliers', category: 'achat', color: '#8b5cf6', description: 'Gestion des fournisseurs', priority: 2, tags: ['fournisseur', 'achat', 'partenaire'] },
    { id: 'purchase-requests', name: 'Demandes d\'Achat', icon: <ClipboardList size={32} />, path: '/purchase-requests', category: 'achat', color: '#ec4899', description: 'Demandes d\'achat', priority: 3, tags: ['demande', 'achat', 'requête'] },
    { id: 'purchase-receptions', name: 'Réceptions', icon: <PackageSearch size={32} />, path: '/purchase-receptions', category: 'achat', color: '#f59e0b', description: 'Réception des marchandises', priority: 4, tags: ['réception', 'réception', 'livraison'] },
    
    // Stock
    { id: 'inventory', name: 'Inventaire', icon: <Boxes size={32} />, path: '/inventory', category: 'stock', color: '#10b981', description: 'Gestion des stocks', priority: 1, tags: ['inventaire', 'stock', 'comptage'] },
    { id: 'stock-pickings', name: 'Transferts', icon: <Truck size={32} />, path: '/stock-pickings', category: 'stock', color: '#3b82f6', description: 'Mouvements de stock', priority: 2, tags: ['transfert', 'mouvement', 'stock'] },
    { id: 'warehouse', name: 'Entrepôts', icon: <Warehouse size={32} />, path: '/warehouse-management', category: 'stock', color: '#6366f1', description: 'Gestion des entrepôts', priority: 3, tags: ['entrepôt', 'magasin', 'stockage'] },
    { id: 'product-categories', name: 'Catégories', icon: <Layers size={32} />, path: '/product-categories', category: 'stock', color: '#8b5cf6', description: 'Catégories de produits', priority: 4, tags: ['catégorie', 'classification'] },
    
    // Production
    { id: 'productions', name: 'Ordres de Fabrication', icon: <Factory size={32} />, path: '/productions', category: 'production', color: '#f59e0b', description: 'Planification de production', priority: 1, tags: ['production', 'fabrication', 'of'] },
    { id: 'boms', name: 'Nomenclatures', icon: <Layers size={32} />, path: '/bom', category: 'production', color: '#10b981', description: 'Bills of Materials', priority: 2, tags: ['bom', 'nomenclature', 'composant'] },
    { id: 'machines', name: 'Machines', icon: <Wrench size={32} />, path: '/machines', category: 'production', color: '#6366f1', description: 'Gestion des machines', priority: 3, tags: ['machine', 'équipement'] },
    { id: 'maintenance', name: 'Maintenance', icon: <Wrench size={32} />, path: '/maintenance', category: 'production', color: '#ef4444', description: 'Maintenance préventive', priority: 4, tags: ['maintenance', 'réparation'] },
    { id: 'quality-checks', name: 'Contrôle Qualité', icon: <ClipboardCheck size={32} />, path: '/quality/checks', category: 'production', color: '#10b981', description: 'Contrôles qualité', priority: 5, tags: ['qualité', 'contrôle', 'qc'] },
    { id: 'matieres-premieres', name: 'Matières Premières', icon: <Package size={32} />, path: '/matieres-premieres', category: 'production', color: '#3b82f6', description: 'Gestion des matières premières', priority: 6, tags: ['matière première', 'mp', 'matériau'] },
    { id: 'modeles', name: 'Modèles', icon: <FileText size={32} />, path: '/modeles', category: 'production', color: '#8b5cf6', description: 'Modèles de produits', priority: 7, tags: ['modèle', 'template'] },
    { id: 'soustraitants', name: 'Sous-traitants', icon: <Users2 size={32} />, path: '/soustraitants-odoo', category: 'production', color: '#ec4899', description: 'Gestion des sous-traitants', priority: 8, tags: ['sous-traitant', 'externalisation'] },
    
    // CRM
    { id: 'crm-leads', name: 'Pistes', icon: <Target size={32} />, path: '/crm/leads', category: 'crm', color: '#6366f1', description: 'Gestion des pistes', priority: 1, tags: ['piste', 'lead', 'prospect'] },
    { id: 'opportunities', name: 'Opportunités', icon: <TrendingUp size={32} />, path: '/opportunities', category: 'crm', color: '#10b981', description: 'Suivi des opportunités', priority: 2, tags: ['opportunité', 'affaire', 'deal'] },
    { id: 'pipeline-vente', name: 'Pipeline Vente', icon: <BarChart3 size={32} />, path: '/pipeline-vente', category: 'crm', color: '#3b82f6', description: 'Pipeline commercial', priority: 3, tags: ['pipeline', 'vente', 'commercial'] },
    { id: 'crm-campaigns', name: 'Campagnes', icon: <Zap size={32} />, path: '/crm-campaigns', category: 'crm', color: '#f59e0b', description: 'Campagnes marketing', priority: 4, tags: ['campagne', 'marketing'] },
    
    // Comptabilité
    { id: 'account-moves', name: 'Écritures Comptables', icon: <FileBarChart size={32} />, path: '/account-moves', category: 'comptabilite', color: '#10b981', description: 'Écritures comptables', priority: 1, tags: ['comptabilité', 'écriture', 'journal'] },
    { id: 'chart-of-accounts', name: 'Plan Comptable', icon: <Archive size={32} />, path: '/chart-of-accounts', category: 'comptabilite', color: '#6366f1', description: 'Plan de comptes', priority: 2, tags: ['plan comptable', 'compte'] },
    { id: 'bank-reconciliation', name: 'Rapprochement Bancaire', icon: <CreditCard size={32} />, path: '/bank-reconciliation', category: 'comptabilite', color: '#3b82f6', description: 'Rapprochements bancaires', priority: 3, tags: ['rapprochement', 'banque', 'reconciliation'] },
    
    // RH
    { id: 'hr-employees', name: 'Employés', icon: <UserCircle size={32} />, path: '/hr/employees', category: 'rh', color: '#6366f1', description: 'Gestion des employés', priority: 1, tags: ['employé', 'rh', 'personnel'] },
    { id: 'hr-recruitment', name: 'Recrutement', icon: <Users size={32} />, path: '/hr/recruitment', category: 'rh', color: '#8b5cf6', description: 'Processus de recrutement', priority: 2, tags: ['recrutement', 'candidat'] },
    { id: 'hr-payslips', name: 'Bulletins de Paie', icon: <Receipt size={32} />, path: '/hr/payslips', category: 'rh', color: '#10b981', description: 'Gestion de la paie', priority: 3, tags: ['paie', 'bulletin', 'salaire'] },
    { id: 'payroll-tunisia', name: 'Paie Tunisie', icon: <DollarSign size={32} />, path: '/payroll-tunisia', category: 'rh', color: '#f59e0b', description: 'Paie conforme Tunisie', priority: 4, tags: ['paie', 'tunisie', 'cnss'] },
    
    // Projets
    { id: 'projects', name: 'Projets', icon: <Briefcase size={32} />, path: '/projects', category: 'projets', color: '#6366f1', description: 'Gestion de projets', priority: 1, tags: ['projet', 'gestion'] },
    { id: 'taches', name: 'Tâches', icon: <ClipboardCopy size={32} />, path: '/taches', category: 'projets', color: '#8b5cf6', description: 'Suivi des tâches', priority: 2, tags: ['tâche', 'todo'] },
    
    // Autres
    { id: 'companies', name: 'Sociétés', icon: <Building2 size={32} />, path: '/companies', category: 'autres', color: '#6366f1', description: 'Multi-sociétés', priority: 1, tags: ['société', 'entreprise', 'multi'] },
    { id: 'utilisateurs', name: 'Utilisateurs', icon: <Users2 size={32} />, path: '/utilisateurs', category: 'autres', color: '#8b5cf6', description: 'Gestion des utilisateurs', priority: 2, tags: ['utilisateur', 'user', 'compte'] },
    { id: 'reports', name: 'Rapports', icon: <BarChart3 size={32} />, path: '/reports', category: 'autres', color: '#10b981', description: 'Rapports et analyses', priority: 3, tags: ['rapport', 'analyse', 'statistique'] },
    { id: 'settings', name: 'Paramètres', icon: <Settings size={32} />, path: '/settings', category: 'autres', color: '#64748b', description: 'Configuration système', priority: 4, tags: ['paramètre', 'configuration', 'settings'] },
    { id: 'ai', name: 'Intelligence Artificielle', icon: <Zap size={32} />, path: '/ai', category: 'autres', color: '#f59e0b', description: 'Outils IA', priority: 5, tags: ['ia', 'ai', 'intelligence'] },
    { id: 'social-auth', name: 'Authentification Sociale', icon: <Globe size={32} />, path: '/social-auth', category: 'autres', color: '#3b82f6', description: 'Connexions sociales', priority: 6, tags: ['auth', 'social', 'connexion'] },
  ], []);

  // Calculer les statistiques
  useEffect(() => {
    setStats({
      totalModules: modules.length,
      recentModules: recentModules.length,
      favoriteModules: favorites.size
    });
  }, [modules.length, recentModules.length, favorites.size]);

  // Recherche intelligente avec suggestions
  useEffect(() => {
    if (searchTerm.length > 0) {
      const term = searchTerm.toLowerCase();
      const suggestions = modules
        .filter(module => {
          const nameMatch = module.name.toLowerCase().includes(term);
          const descMatch = module.description?.toLowerCase().includes(term);
          const tagsMatch = module.tags?.some(tag => tag.toLowerCase().includes(term));
          return nameMatch || descMatch || tagsMatch;
        })
        .slice(0, 5)
        .map(m => m.name);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, modules]);

  // Filtrer les modules avec recherche avancée
  const filteredModules = useMemo(() => {
    let filtered = modules;

    // Filtre par favoris
    if (showFavoritesOnly) {
      filtered = filtered.filter(m => favorites.has(m.id));
    }

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    // Recherche textuelle (nom, description, tags)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(module => {
        const nameMatch = module.name.toLowerCase().includes(term);
        const descMatch = module.description?.toLowerCase().includes(term);
        const tagsMatch = module.tags?.some(tag => tag.toLowerCase().includes(term));
        return nameMatch || descMatch || tagsMatch;
      });
    }

    return filtered;
  }, [searchTerm, selectedCategory, modules, showFavoritesOnly, favorites]);

  // Grouper les modules par catégorie
  const modulesByCategory = useMemo(() => {
    const grouped: Record<string, Module[]> = {};
    filteredModules.forEach(module => {
      if (!grouped[module.category]) {
        grouped[module.category] = [];
      }
      grouped[module.category].push(module);
    });
    
    // Trier par priorité dans chaque catégorie
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => (a.priority || 999) - (b.priority || 999));
    });
    
    return grouped;
  }, [filteredModules]);

  // Modules récents (avec détails)
  const recentModulesWithDetails = useMemo(() => {
    return recentModules
      .map(id => modules.find(m => m.id === id))
      .filter((m): m is Module => m !== undefined)
      .slice(0, 6);
  }, [recentModules, modules]);

  // Modules favoris (avec détails)
  const favoriteModulesWithDetails = useMemo(() => {
    return Array.from(favorites)
      .map(id => modules.find(m => m.id === id))
      .filter((m): m is Module => m !== undefined);
  }, [favorites, modules]);

  const handleModuleClick = useCallback((module: Module) => {
    // Animation d'entrée
    setModuleAnimations(prev => new Set([...prev, module.id]));
    setTimeout(() => {
      setModuleAnimations(prev => {
        const next = new Set(prev);
        next.delete(module.id);
        return next;
      });
    }, 300);

    // Ajouter aux modules récents
    const newRecent = [module.id, ...recentModules.filter(id => id !== module.id)].slice(0, 10);
    setRecentModules(newRecent);
    try {
      localStorage.setItem('erp_recent_modules', JSON.stringify(newRecent));
    } catch (error) {
      console.error('Erreur sauvegarde récents:', error);
    }
    
    navigate(module.path);
  }, [navigate, recentModules]);

  const toggleFavorite = useCallback((moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(moduleId)) {
      newFavorites.delete(moduleId);
      info('Favori retiré');
    } else {
      newFavorites.add(moduleId);
      info('Ajouté aux favoris');
    }
    setFavorites(newFavorites);
    try {
      localStorage.setItem('erp_favorites', JSON.stringify(Array.from(newFavorites)));
    } catch (error) {
      console.error('Erreur sauvegarde favoris:', error);
    }
  }, [favorites, info]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  }, []);

  const getCategoryModules = useCallback((categoryId: string) => {
    return modulesByCategory[categoryId] || [];
  }, [modulesByCategory]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setShowFavoritesOnly(false);
  }, []);

  // Raccourcis clavier avancés
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K pour focus la recherche
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"][placeholder*="Rechercher"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      // Escape pour effacer la recherche
      if (e.key === 'Escape' && searchTerm) {
        clearSearch();
        setShowSuggestions(false);
      }
      // Ctrl/Cmd + / pour afficher l'aide
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        info('Raccourcis : Ctrl+K (Recherche), Escape (Effacer), Ctrl+/ (Aide)');
      }
      // Navigation avec flèches dans les suggestions
      if (showSuggestions && searchSuggestions.length > 0) {
        // Implémentation navigation clavier des suggestions si nécessaire
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [searchTerm, clearSearch, showSuggestions, searchSuggestions, info]);

  // Rendu d'un module avec style premium moderne
  const renderModule = useCallback((module: Module, compact: boolean = false) => {
    // Couleurs modernes inspirées de l'image (teal, bleu, orange, violet)
    const colorPalette = [
      '#14b8a6', // teal
      '#3b82f6', // blue
      '#f59e0b', // orange
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#10b981', // green
      '#ef4444', // red
      '#06b6d4', // cyan
    ];
    const moduleColor = colorPalette[module.id.charCodeAt(0) % colorPalette.length];
    const isHovered = hoveredModule === module.id;
    const isAnimated = moduleAnimations.has(module.id);
    
    return (
      <div
        key={module.id}
        onClick={() => handleModuleClick(module)}
        onMouseEnter={() => setHoveredModule(module.id)}
        onMouseLeave={() => setHoveredModule(null)}
        style={{
          background: themeColors.surface,
          backdropFilter: 'blur(10px)',
          borderRadius: 'clamp(16px, 3vw, 24px)',
          padding: 'clamp(20px, 4vw, 28px)',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: isHovered 
            ? `0 20px 40px ${themeColors.shadow}, 0 0 0 1px ${moduleColor}20, 0 0 60px ${moduleColor}15`
            : `0 4px 16px ${themeColors.shadow}, 0 2px 4px ${themeColors.shadow}`,
          border: `2px solid ${isHovered ? `${moduleColor}40` : themeColors.border}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'clamp(12px, 2vw, 16px)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: compact ? 'clamp(120px, 20vw, 140px)' : 'clamp(160px, 25vw, 180px)',
          justifyContent: 'center',
          width: '100%',
          transform: isAnimated ? 'scale(0.95)' : isHovered ? 'translateY(-12px) scale(1.05)' : 'translateY(0) scale(1)',
          opacity: isAnimated ? 0.8 : 1
        }}
      >
        {/* Effet de brillance animé au survol */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `radial-gradient(circle, ${moduleColor}20 0%, transparent 60%)`,
            animation: 'shimmer 2s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
        )}
        
        {/* Bordure animée au survol */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            padding: '2px',
            background: `linear-gradient(135deg, ${moduleColor}60, ${moduleColor}20, transparent)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: 'borderGlow 2s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
        )}
        <button
          onClick={(e) => toggleFavorite(module.id, e)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            color: favorites.has(module.id) ? '#fbbf24' : '#94a3b8',
            zIndex: 10,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.background = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
          }}
          title={favorites.has(module.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Star size={16} fill={favorites.has(module.id) ? '#fbbf24' : 'none'} />
        </button>
        
        {/* Icône avec fond coloré premium - Responsive */}
        <div style={{
          width: 'clamp(64px, 13vw, 88px)',
          height: 'clamp(64px, 13vw, 88px)',
          borderRadius: 'clamp(16px, 3vw, 24px)',
          background: isHovered
            ? `linear-gradient(135deg, ${moduleColor}30 0%, ${moduleColor}15 50%, ${moduleColor}05 100%)`
            : `linear-gradient(135deg, ${moduleColor}20 0%, ${moduleColor}10 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: moduleColor,
          marginBottom: 'clamp(8px, 1.5vw, 12px)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          transform: isHovered ? 'rotate(5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: isHovered 
            ? `0 8px 24px ${moduleColor}30, inset 0 2px 8px ${moduleColor}20`
            : `0 4px 12px ${moduleColor}15, inset 0 1px 4px ${moduleColor}10`
        }}>
          {/* Effet de brillance animé */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `radial-gradient(circle, ${moduleColor}25 0%, transparent 70%)`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.4s',
            animation: isHovered ? 'pulse 2s ease-in-out infinite' : 'none'
          }} />
          {/* Particules animées */}
          {isHovered && (
            <>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '4px',
                    height: '4px',
                    background: moduleColor,
                    borderRadius: '50%',
                    opacity: 0.6,
                    animation: `float${i} 3s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                    top: `${20 + i * 30}%`,
                    left: `${20 + i * 30}%`
                  }}
                />
              ))}
            </>
          )}
          <div style={{ 
            position: 'relative', 
            zIndex: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
            transition: 'filter 0.4s'
          }}>
            {typeof module.icon === 'object' && React.isValidElement(module.icon) 
              ? React.cloneElement(module.icon as React.ReactElement, { 
                  size: typeof window !== 'undefined' ? Math.min(44, window.innerWidth / 14) : 44
                })
              : module.icon
            }
          </div>
        </div>
        
        {/* Label - Responsive avec effet premium */}
        <div style={{ 
          fontWeight: isHovered ? 700 : 600, 
          fontSize: 'clamp(13px, 2vw, 15px)', 
          color: themeColors.text,
          lineHeight: '1.3',
          marginTop: '4px',
          textAlign: 'center',
          wordBreak: 'break-word',
          hyphens: 'auto',
          transition: 'all 0.3s',
          textShadow: isHovered ? `0 2px 8px ${moduleColor}20` : 'none',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
        }}>
          {module.name}
        </div>
        
        {/* Badge "Nouveau" ou "Populaire" */}
        {recentModules.includes(module.id) && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: `linear-gradient(135deg, ${moduleColor}, ${moduleColor}dd)`,
            color: 'white',
            fontSize: '10px',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '12px',
            boxShadow: `0 2px 8px ${moduleColor}40`,
            animation: 'bounce 2s ease-in-out infinite',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={10} />
            Récent
          </div>
        )}
      </div>
    );
  }, [handleModuleClick, toggleFavorite, favorites, hoveredModule, moduleAnimations, isDark, themeColors, recentModules]);

  return (
    <div style={{ 
      background: themeColors.background,
      minHeight: '100vh',
      padding: '0',
      transition: 'background 0.5s ease'
    }}>
      {/* Header premium avec effets - Responsive */}
      <div style={{
        background: `linear-gradient(135deg, ${themeColors.gradient.from} 0%, ${themeColors.gradient.via || themeColors.gradient.to} 50%, ${themeColors.gradient.to} 100%)`,
        padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 48px)',
        marginBottom: 'clamp(24px, 5vw, 40px)',
        boxShadow: `0 8px 32px ${themeColors.shadow}, 0 4px 16px ${themeColors.shadow}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Effet de particules animées en arrière-plan */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)`,
          animation: 'shimmer 8s ease-in-out infinite',
          pointerEvents: 'none'
        }} />
        
        <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ 
                color: 'white', 
                margin: 0, 
                fontSize: 'clamp(28px, 6vw, 42px)', 
                fontWeight: 800, 
                letterSpacing: '-1px',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                La Plume Artisanale
              </h1>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.95)', 
                margin: '12px 0 0 0', 
                fontSize: 'clamp(15px, 3vw, 20px)', 
                fontWeight: 400,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}>
                Système ERP Complet - Accueil
              </p>
            </div>
            
            {/* Contrôles header */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => navigate('/settings')}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '10px',
                  cursor: 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Paramètres et thèmes"
              >
                <Palette size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        padding: '0 clamp(16px, 4vw, 40px) clamp(24px, 4vw, 40px)', 
        maxWidth: '1600px', 
        margin: '0 auto', 
        width: '100%' 
      }}>
        {/* Statistiques rapides - Style moderne et Responsive */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', 
          gap: 'clamp(12px, 2vw, 20px)',
          marginBottom: 'clamp(20px, 4vw, 32px)'
        }}>
          <div style={{
            background: 'white',
            padding: 'clamp(16px, 3vw, 24px)',
            borderRadius: 'clamp(12px, 2vw, 20px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(12px, 2vw, 20px)',
            cursor: 'pointer',
            transition: 'all 0.3s',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onClick={() => setSelectedCategory('all')}
          >
            <div style={{
              width: 'clamp(48px, 8vw, 56px)',
              height: 'clamp(48px, 8vw, 56px)',
              borderRadius: 'clamp(12px, 2vw, 16px)',
              background: 'linear-gradient(135deg, #6366f120 0%, #6366f110 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
              flexShrink: 0
            }}>
              <Package size={Math.min(28, typeof window !== 'undefined' ? window.innerWidth / 20 : 28)} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ 
                fontSize: 'clamp(20px, 4vw, 28px)', 
                fontWeight: 700, 
                color: themeColors.text, 
                lineHeight: 1.2 
              }}>
                {stats.totalModules}
              </div>
              <div style={{ 
                fontSize: 'clamp(12px, 2vw, 14px)', 
                color: themeColors.textSecondary, 
                marginTop: '4px' 
              }}>
                Modules disponibles
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: 'clamp(16px, 3vw, 24px)',
            borderRadius: 'clamp(12px, 2vw, 20px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(12px, 2vw, 20px)',
            cursor: 'pointer',
            transition: 'all 0.3s',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onClick={() => {
            setShowFavoritesOnly(false);
            setSelectedCategory('all');
            setSearchTerm('');
          }}
          >
            <div style={{
              width: 'clamp(48px, 8vw, 56px)',
              height: 'clamp(48px, 8vw, 56px)',
              borderRadius: 'clamp(12px, 2vw, 16px)',
              background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b10 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              flexShrink: 0
            }}>
              <Clock size={Math.min(28, typeof window !== 'undefined' ? window.innerWidth / 20 : 28)} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ 
                fontSize: 'clamp(20px, 4vw, 28px)', 
                fontWeight: 700, 
                color: themeColors.text, 
                lineHeight: 1.2 
              }}>
                {stats.recentModules}
              </div>
              <div style={{ 
                fontSize: 'clamp(12px, 2vw, 14px)', 
                color: themeColors.textSecondary, 
                marginTop: '4px' 
              }}>
                Modules récents
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: 'clamp(16px, 3vw, 24px)',
            borderRadius: 'clamp(12px, 2vw, 20px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(12px, 2vw, 20px)',
            cursor: 'pointer',
            transition: 'all 0.3s',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <div style={{
              width: 'clamp(48px, 8vw, 56px)',
              height: 'clamp(48px, 8vw, 56px)',
              borderRadius: 'clamp(12px, 2vw, 16px)',
              background: 'linear-gradient(135deg, #ec489920 0%, #ec489910 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ec4899',
              flexShrink: 0
            }}>
              <Star size={Math.min(28, typeof window !== 'undefined' ? window.innerWidth / 20 : 28)} fill={showFavoritesOnly ? '#ec4899' : 'none'} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ 
                fontSize: 'clamp(20px, 4vw, 28px)', 
                fontWeight: 700, 
                color: themeColors.text, 
                lineHeight: 1.2 
              }}>
                {stats.favoriteModules}
              </div>
              <div style={{ 
                fontSize: 'clamp(12px, 2vw, 14px)', 
                color: themeColors.textSecondary, 
                marginTop: '4px' 
              }}>
                Favoris {showFavoritesOnly && '(actif)'}
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche premium avec suggestions - Style moderne et Responsive */}
        <div style={{ 
          marginBottom: 'clamp(20px, 4vw, 32px)', 
          display: 'flex', 
          gap: 'clamp(12px, 2vw, 16px)', 
          flexWrap: 'wrap',
          position: 'relative'
        }}>
            <div style={{ 
              flex: '1 1 300px',
              minWidth: 'min(100%, 300px)',
              position: 'relative'
            }}>
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(12px, 2vw, 16px)', 
              alignItems: 'center',
              background: themeColors.surface,
              backdropFilter: 'blur(20px)',
              padding: 'clamp(16px, 3vw, 20px) clamp(16px, 3vw, 24px)',
              borderRadius: 'clamp(16px, 3vw, 24px)',
              boxShadow: searchTerm 
                ? `0 8px 24px ${themeColors.shadow}, 0 0 0 1px ${themeColors.primary}30`
                : `0 4px 16px ${themeColors.shadow}, 0 2px 4px ${themeColors.shadow}`,
              border: `2px solid ${searchTerm ? `${themeColors.primary}40` : themeColors.border}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <Search size={20} style={{ 
                color: searchTerm ? themeColors.primary : themeColors.textSecondary,
                transition: 'color 0.3s'
              }} />
              <input
                type="text"
                placeholder="Rechercher un module... (Ctrl+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  background: 'transparent',
                  minWidth: 0,
                  color: themeColors.text
                }}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    background: 'rgba(0, 0, 0, 0.05)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '8px',
                    color: 'var(--erp-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.color = 'var(--erp-text-muted)';
                  }}
                  title="Effacer (Escape)"
                >
                  <X size={18} />
                </button>
              )}
              {/* Raccourci clavier visuel */}
              {!searchTerm && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'var(--erp-text-muted)',
                  fontFamily: 'monospace'
                }}>
                  <Command size={12} />
                  <span>K</span>
                </div>
              )}
            </div>
            
            {/* Suggestions de recherche */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                background: themeColors.surface,
                backdropFilter: 'blur(20px)',
                borderRadius: 'clamp(12px, 2vw, 20px)',
                boxShadow: `0 8px 32px ${themeColors.shadow}`,
                border: `1px solid ${themeColors.border}`,
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'slideDown 0.3s ease-out'
              }}>
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      borderBottom: index < searchSuggestions.length - 1 ? `1px solid ${themeColors.border}` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${themeColors.primary}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Search size={16} style={{ color: themeColors.primary, opacity: 0.6 }} />
                      <span style={{ 
                        color: themeColors.text,
                        fontSize: '14px'
                      }}>
                        {suggestion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contrôles d'affichage - Style moderne */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'white',
            padding: '8px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <button
              onClick={() => setViewMode('categories')}
              className={`erp-btn ${viewMode === 'categories' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
              style={{ padding: '8px 12px' }}
              title="Vue par catégories"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`erp-btn ${viewMode === 'grid' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
              style={{ padding: '8px 12px' }}
              title="Vue grille"
            >
              <Grid3x3 size={18} />
            </button>
          </div>
        </div>

        {/* Sections spéciales : Favoris et Récents */}
        {!searchTerm && !showFavoritesOnly && viewMode === 'categories' && (
          <>
            {favoriteModulesWithDetails.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <Star size={20} style={{ color: '#fbbf24' }} fill="#fbbf24" />
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--erp-text-primary)', margin: 0 }}>
                    Mes Favoris ({favoriteModulesWithDetails.length})
                  </h2>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '24px'
                }}>
                  {favoriteModulesWithDetails.map(module => renderModule(module, true))}
                </div>
              </div>
            )}

            {recentModulesWithDetails.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b10 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f59e0b'
                  }}>
                    <Clock size={22} />
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    Récents ({recentModulesWithDetails.length})
                  </h2>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '24px'
                }}>
                  {recentModulesWithDetails.map(module => renderModule(module, true))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Vue icônes : grille de catégories en grandes icônes */}
        {!searchTerm && selectedCategory === 'all' && viewMode === 'categories' && !showFavoritesOnly ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))',
            gap: 'clamp(20px, 4vw, 28px)',
            marginBottom: '24px'
          }}>
            {categories.map(category => {
              const categoryModules = getCategoryModules(category.id);
              if (categoryModules.length === 0) return null;
              const isHoveredCat = hoveredModule === `cat-${category.id}`;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  onMouseEnter={() => setHoveredModule(`cat-${category.id}`)}
                  onMouseLeave={() => setHoveredModule(null)}
                  style={{
                    background: themeColors.surface,
                    border: `2px solid ${isHoveredCat ? `${category.color}50` : themeColors.border}`,
                    borderRadius: 'clamp(16px, 3vw, 24px)',
                    padding: 'clamp(20px, 4vw, 28px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isHoveredCat
                      ? `0 12px 32px ${themeColors.shadow}, 0 0 0 1px ${category.color}20`
                      : `0 4px 16px ${themeColors.shadow}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 'clamp(12px, 2vw, 16px)',
                    transform: isHoveredCat ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                    minHeight: 'clamp(160px, 28vw, 200px)',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{
                    width: 'clamp(72px, 14vw, 96px)',
                    height: 'clamp(72px, 14vw, 96px)',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${category.color}25 0%, ${category.color}12 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: category.color,
                    flexShrink: 0,
                    transition: 'transform 0.3s',
                    transform: isHoveredCat ? 'scale(1.1)' : 'scale(1)'
                  }}>
                    {typeof category.icon === 'object' && React.isValidElement(category.icon)
                      ? React.cloneElement(category.icon as React.ReactElement, { size: Math.min(44, typeof window !== 'undefined' ? window.innerWidth / 12 : 44) })
                      : category.icon
                    }
                  </div>
                  <span style={{
                    fontSize: 'clamp(15px, 2.5vw, 18px)',
                    fontWeight: 700,
                    color: themeColors.text
                  }}>
                    {category.name}
                  </span>
                  <span style={{
                    fontSize: 'clamp(11px, 1.8vw, 13px)',
                    color: themeColors.textSecondary
                  }}>
                    {category.description} • {categoryModules.length} module{categoryModules.length > 1 ? 's' : ''}
                  </span>
                  <ChevronDown size={18} style={{ color: themeColors.textSecondary, marginTop: '4px' }} />
                </button>
              );
            })}
          </div>
        ) : (
          /* Grille des modules (recherche ou catégorie sélectionnée) */
          <>
            {viewMode === 'categories' && selectedCategory !== 'all' && !searchTerm && (
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="erp-btn erp-btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                >
                  <ChevronUp size={18} style={{ transform: 'rotate(-90deg)' }} />
                  Retour aux icônes
                </button>
                <span style={{ color: themeColors.textSecondary, fontSize: '14px' }}>
                  {categories.find(c => c.id === selectedCategory)?.name} • {filteredModules.length} module{filteredModules.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
              gap: 'clamp(16px, 3vw, 24px)',
              marginBottom: '24px'
            }}>
              {filteredModules.map(module => renderModule(module))}
            </div>
          </>
        )}

        {filteredModules.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '64px',
            color: 'var(--erp-text-muted)',
            background: 'white',
            borderRadius: 'var(--erp-border-radius-lg)',
            boxShadow: 'var(--erp-shadow-md)'
          }}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', fontWeight: 600 }}>Aucun module trouvé</p>
            <p style={{ fontSize: '14px' }}>Essayez de modifier votre recherche ou votre filtre</p>
            <button
              onClick={clearSearch}
              className="erp-btn erp-btn-primary"
              style={{ marginTop: '16px' }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg);
            opacity: 0.6;
          }
        }
        
        @keyframes borderGlow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes float0 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(20px, -20px) scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes float1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-15px, -25px) scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(25px, -15px) scale(1.15);
            opacity: 1;
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Smooth scroll */
        * {
          scroll-behavior: smooth;
        }
        
        /* Selection personnalisée */
        ::selection {
          background: rgba(99, 102, 241, 0.3);
          color: inherit;
        }
      `}</style>
    </div>
  );
};

export default Home;
