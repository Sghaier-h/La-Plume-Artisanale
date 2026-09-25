/**
 * NavigationEnhanced — menu principal ERP La Plume Artisanale
 *
 * Structure conforme au contrat §15 (docs/domain.md).
 * Design artisanal — tokens `--accent-terracotta`, fond crème `#FBF8F3`,
 * wash terracotta `rgba(200, 102, 61, 0.08)` sur hover, item actif plein terracotta.
 *
 * Chaque sous-item pointe soit vers une route existante dans App.tsx,
 * soit porte le badge `_todo` (route à créer plus tard).
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../store/AppContext';
import {
  Home, Users, UserCircle, UserPlus, Contact, HeartHandshake,
  Package, Package2, Layers, FolderTree, FileSearch, Globe,
  Warehouse, Boxes, ArrowRightLeft, BookmarkCheck, Barcode, ClipboardList, AlertTriangle,
  Factory, Cog, Wrench, HardHat, ClipboardCheck, Truck, Calendar, Activity,
  CheckCircle, DollarSign, Layers3, Scissors, Ruler,
  ShoppingBag, FileText, Receipt, Send, RotateCcw, ArrowLeft, Boxes as Palette, PackageCheck, CreditCard, Bell,
  Building2, ShoppingCart, PackagePlus, FileCheck, FileClock, Coins, Wallet, GitCompare,
  BookOpen, BookText, Landmark, PiggyBank, Repeat, Building, Percent, BarChart3, Archive,
  Briefcase, ClipboardSignature, Users2, Award, ScrollText, Wallet as PayWallet, CalendarCheck, GraduationCap,
  Megaphone, Target, Share2, LineChart,
  Globe2, ShoppingBasket, RefreshCw, TrendingUp, Undo2, Gift,
  BrainCircuit, Bot, AlertCircle, FileBarChart2, Settings as SettingsCog, Coins as CoinIcon,
  MessageSquare, LayoutDashboard, Store,
  UserCog, Mail, MessageCircle,
  Settings, MapPin, Percent as VatIcon,
  ChevronDown, ChevronRight, ChevronLeft, LogOut
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import CompanySwitcher from './CompanySwitcher';

// ── Types ─────────────────────────────────────────────────────────────

type LucideIconLike = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIconLike;
  permission?: string;
  badge?: number | string;
  children?: MenuItem[];
}

interface MenuCategory {
  id: string;
  label: string;
  icon: LucideIconLike;
  permission?: string;
  items: MenuItem[];
  /** Masquer cette catégorie pour l'admin (l'admin gère le système,
   * il n'a pas besoin des vues opérationnelles métier). */
  hideForAdmin?: boolean;
}

interface NavigationEnhancedProps {
  onNavigate?: () => void;
}

// ── Constantes design (tokens artisanaux) ─────────────────────────────

const TERRACOTTA_WASH = 'rgba(200, 102, 61, 0.08)';
const CREAM_FG = '#FBF8F3';

// ── Composant ─────────────────────────────────────────────────────────

const NavigationEnhanced: React.FC<NavigationEnhancedProps> = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { state, toggleSidebar, hasPermission } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = React.useMemo(() => {
    const nom = (user as any)?.nom || '';
    const prenom = (user as any)?.prenom || '';
    if (prenom || nom) {
      return `${(prenom?.[0] || '').toUpperCase()}${(nom?.[0] || '').toUpperCase()}`.trim() || 'U';
    }
    const email = (user as any)?.email || '';
    return email.slice(0, 2).toUpperCase() || 'U';
  }, [user]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isAdmin =
    user?.role === 'ADMIN' ||
    user?.role === 'admin' ||
    user?.role?.toUpperCase() === 'ADMIN';

  const handleNavigation = (path: string) => {
    // Les items marqués `_todo` ne naviguent pas — l'écran n'existe pas encore
    if (path.startsWith('_todo')) return;
    navigate(path);
    if (onNavigate) onNavigate();
  };

  const toggleCategory = (categoryId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) next.delete(categoryId);
    else next.add(categoryId);
    setExpandedCategories(next);
  };

  const toggleItem = (itemPath: string) => {
    const next = new Set(expandedItems);
    if (next.has(itemPath)) next.delete(itemPath);
    else next.add(itemPath);
    setExpandedItems(next);
  };

  const hasActiveChild = (item: MenuItem): boolean => {
    if (!item.children) return false;
    return item.children.some(
      (child) => location.pathname === child.path || hasActiveChild(child)
    );
  };

  // Parse `module.sub.action` en (module='module.sub', action='action').
  // Sinon `module.action` en (module='module', action='action'). Sinon (module, 'read').
  const parsePermission = (perm: string): [string, string] => {
    const parts = perm.split('.');
    if (parts.length >= 2) {
      const action = parts[parts.length - 1];
      const mod = parts.slice(0, -1).join('.');
      return [mod, action];
    }
    return [parts[0], 'read'];
  };

  // Filtre récursif par permissions (admin voit tout)
  const filterByPermissions = (items: MenuItem[]): MenuItem[] => {
    return items.filter((item) => {
      if (isAdmin) {
        if (item.children && item.children.length > 0) {
          (item as any).children = filterByPermissions(item.children);
        }
        return true;
      }
      if (item.permission && hasPermission) {
        try {
          const [mod, action] = parsePermission(item.permission);
          if (!hasPermission(mod, action)) return false;
        } catch {
          // en cas d'erreur, on autorise pour éviter d'effacer le menu en dev
        }
      }
      if (item.children && item.children.length > 0) {
        const filtered = filterByPermissions(item.children);
        if (filtered.length > 0) {
          (item as any).children = filtered;
          return true;
        }
        return false;
      }
      return true;
    });
  };

  // ── Structure du menu §15 ─────────────────────────────────────────────

  const rawCategories: MenuCategory[] = [
    // 1. CRM & Clients
    {
      id: 'crm',
      label: 'CRM & Clients',
      icon: Users,
      permission: 'crm.read',
      items: [
        { path: '/clients', label: 'Comptes', icon: Users, permission: 'res.partner.read' },
        { path: '/crm/leads', label: 'Leads', icon: UserPlus, permission: 'crm.lead.read' },
        { path: '/opportunities', label: 'Opportunités', icon: Target, permission: 'crm.opportunity.read' },
        { path: '/pipeline-vente', label: 'Pipeline commercial', icon: TrendingUp, permission: 'crm.read' },
        { path: '/crm/contacts', label: 'Contacts', icon: Contact },
        { path: '/crm/interactions', label: 'Interactions', icon: HeartHandshake },
      ],
    },

    // 2. Produits
    {
      id: 'produits',
      label: 'Produits',
      icon: Package2,
      permission: 'product.read',
      items: [
        { path: '/modeles', label: 'Modèles', icon: Layers, permission: 'product.template.read' },
        { path: '/articles', label: 'Articles (variantes)', icon: Package, permission: 'product.product.read' },
        { path: '/catalogue-articles', label: 'Catalogues', icon: FolderTree, permission: 'product.category.read' },
        { path: '/catalogue-produit', label: 'Catalogue produit', icon: FolderTree, permission: 'product.category.read' },
        { path: '/services', label: 'Services', icon: Briefcase, permission: 'product.service.read' },
        { path: '/matieres-premieres', label: 'Matières premières', icon: Boxes, permission: 'product.product.read' },
        { path: '/produits/seo-web', label: 'SEO produits web', icon: FileSearch },
      ],
    },

    // 3. Stock
    {
      id: 'stock',
      label: 'Stock',
      icon: Warehouse,
      permission: 'stock.read',
      items: [
        { path: '/entrepot', label: 'Entrepôts', icon: Warehouse, permission: 'stock.location.read' },
        {
          path: '/produit-fini',
          label: 'Vue par catégorie',
          icon: Boxes,
          permission: 'stock.quant.read',
          children: [
            { path: '/produit-fini', label: 'Produits finis (PF)', icon: Package, permission: 'stock.quant.read' },
            { path: '/semi-fini', label: 'Semi-finis (SF)', icon: Package2, permission: 'stock.quant.read' },
            { path: '/matiere-premiere-stock', label: 'Matières premières (MP)', icon: Boxes, permission: 'stock.quant.read' },
            { path: '/fourniture', label: 'Fournitures & emballage', icon: PackageCheck, permission: 'stock.quant.read' },
          ],
        },
        { path: '/mouvement', label: 'Mouvements (Réceptions / Sorties / Transferts)', icon: ArrowRightLeft, permission: 'stock.move.read' },
        { path: '_todo/stock/reservations', label: 'Réservations', icon: BookmarkCheck, badge: '_todo' },
        { path: '/tracabilite-lots', label: 'Lots & traçabilité', icon: Barcode, permission: 'stock.lot.read' },
        { path: '/inventaire', label: 'Inventaires', icon: ClipboardList, permission: 'stock.inventory.read' },
        { path: '/stock/alertes', label: 'Alertes stock', icon: AlertTriangle },
      ],
    },

    // 4. Fabrication
    {
      id: 'fabrication',
      label: 'Fabrication',
      icon: Factory,
      permission: 'mrp.read',
      items: [
        { path: '/bom', label: 'BOM (nomenclatures)', icon: Layers3, permission: 'mrp.bom.read' },
        { path: '_todo/fabrication/gammes', label: 'Gammes', icon: ScrollText, badge: '_todo' },
        { path: '/fabrication/postes', label: 'Postes de travail', icon: HardHat },
        {
          path: '/machines',
          label: 'Machines + Maintenance',
          icon: Cog,
          permission: 'maintenance.read',
          children: [
            { path: '/machines', label: 'Machines', icon: Cog, permission: 'maintenance.machine.read' },
            { path: '/maintenance', label: 'Maintenance', icon: Wrench, permission: 'maintenance.read' },
          ],
        },
        { path: '/of', label: 'Ordres de fabrication (OF)', icon: FileText, permission: 'mrp.production.read' },
        { path: '_todo/fabrication/of-stock-ca', label: 'OF Stock catalogue (CA)', icon: FileText, badge: '_todo' },
        { path: '_todo/fabrication/ourdissage', label: 'Ourdissage', icon: Ruler, badge: '_todo' },
        { path: '_todo/fabrication/preparation-mp', label: 'Préparation MP', icon: Scissors, badge: '_todo' },
        { path: '/planification-gantt', label: 'Planning atelier (Gantt)', icon: Calendar, permission: 'mrp.production.read' },
        { path: '/suivi-fabrication', label: 'Suivi temps réel', icon: Activity, permission: 'mrp.production.read' },
        { path: '/qualite-avance', label: 'Contrôle qualité', icon: CheckCircle, permission: 'quality.read' },
        { path: '/soustraitants', label: 'Sous-traitance', icon: Truck, permission: 'mrp.read' },
        { path: '/couts', label: 'Analyse des coûts', icon: DollarSign, permission: 'mrp.cost.read' },
      ],
    },

    // 5. Ventes
    {
      id: 'ventes',
      label: 'Ventes',
      icon: ShoppingBag,
      permission: 'sale.read',
      items: [
        { path: '/devis', label: 'Devis', icon: FileText, permission: 'sale.quotation.read' },
        { path: '/commandes', label: 'Commandes', icon: ShoppingBag, permission: 'sale.order.read' },
        { path: '/bon-livraison', label: 'Bons de livraison', icon: Truck, permission: 'stock.picking.read' },
        { path: '/ventes/colisage', label: 'Liste de colisage', icon: PackageCheck, permission: 'stock.picking.read' },
        { path: '/ventes/palettes', label: 'Palettes', icon: Palette, permission: 'stock.picking.read' },
        { path: '/ventes/transporteurs', label: 'Suivi transporteurs', icon: Send, permission: 'stock.picking.read' },
        { path: '/facture', label: 'Factures', icon: Receipt, permission: 'account.move.read' },
        { path: '/ventes/paiements-echeances', label: 'Paiements & Échéances', icon: CreditCard, permission: 'account.payment.read' },
        { path: '/ventes/relances-factures', label: 'Relances', icon: Bell, permission: 'account.move.read' },
        { path: '/avoir', label: 'Avoirs', icon: ArrowLeft, permission: 'account.move.read' },
        { path: '/bon-retour', label: 'Bons de retour', icon: RotateCcw, permission: 'stock.picking.read' },
      ],
    },

    // 6. Achats & Fournisseurs
    {
      id: 'achats',
      label: 'Achats & Fournisseurs',
      icon: ShoppingCart,
      permission: 'purchase.read',
      items: [
        { path: '/fournisseurs', label: 'Fournisseurs', icon: Building2, permission: 'res.partner.read' },
        { path: '/achats/demandes', label: "Demandes d'achat", icon: FileText, permission: 'purchase.request.read' },
        { path: '/achats/bc', label: 'Bons de commande', icon: ShoppingCart, permission: 'purchase.order.read' },
        { path: '/achats/receptions', label: 'Réceptions fournisseur', icon: PackagePlus, permission: 'stock.picking.read' },
        { path: '/achats/factures-ff', label: 'Factures fournisseur', icon: FileCheck, permission: 'account.move.read' },
        { path: '/achats/contrats-services', label: 'Contrats de services', icon: FileClock, permission: 'purchase.contract.read' },
        { path: '/achats/depenses-especes', label: 'Dépenses espèces courantes', icon: Coins, permission: 'account.move.read' },
        { path: '/achats/paiements-ff', label: 'Paiements fournisseurs', icon: Wallet, permission: 'account.payment.read' },
        { path: '/achats/rapprochement', label: 'Rapprochement BC ↔ BL ↔ FF', icon: GitCompare, permission: 'purchase.order.read' },
      ],
    },

    // 7. Comptabilité
    {
      id: 'comptabilite',
      label: 'Comptabilité',
      icon: BookOpen,
      permission: 'account.read',
      items: [
        { path: '/comptabilite/plan-comptes', label: 'Plan de comptes', icon: BookText, permission: 'account.account.read' },
        { path: '/comptabilite/journal', label: 'Journal & écritures', icon: BookOpen, permission: 'account.move.read' },
        { path: '/comptabilite/rapprochement', label: 'Rapprochement bancaire', icon: Landmark, permission: 'account.bank.read' },
        { path: '/comptabilite/caisse', label: 'Fond de caisse', icon: PiggyBank, permission: 'account.cash.read' },
        { path: '_todo/comptabilite/abonnements', label: 'Abonnements récurrents', icon: Repeat, badge: '_todo' },
        { path: '/comptabilite/immobilisations', label: 'Immobilisations & amortissements', icon: Building, permission: 'account.asset.read' },
        { path: '/comptabilite/tva', label: 'TVA (déclarations)', icon: Percent, permission: 'account.tax.read' },
        { path: '/comptabilite/rapports', label: 'Rapports', icon: BarChart3, permission: 'account.report.read' },
        { path: '/comptabilite/cloture', label: "Clôture d'exercice", icon: Archive, permission: 'account.period.write' },
      ],
    },

    // 8. Ressources Humaines
    {
      id: 'rh',
      label: 'Ressources Humaines',
      icon: Briefcase,
      permission: 'hr.read',
      items: [
        { path: '/equipe', label: 'Employés', icon: UserCircle, permission: 'hr.employee.read' },
        { path: '/rh/contrats', label: 'Contrats de travail', icon: ClipboardSignature, permission: 'hr.contract.read' },
        { path: '/rh/structure', label: 'Services / Fonctions / Équipes', icon: Users2, permission: 'hr.employee.read' },
        { path: '/rh-recrutement', label: 'Recrutement', icon: UserPlus, permission: 'hr.applicant.read' },
        { path: '/rh/pointage-timemoto', label: 'Pointage (TimeMoto)', icon: CalendarCheck, permission: 'hr.attendance.read' },
        { path: '_todo/rh/conges', label: 'Congés & absences', icon: Calendar, badge: '_todo' },
        {
          path: '/rh/sanctions-primes',
          label: 'Sanctions & primes',
          icon: Award,
          permission: 'hr.payslip.read',
          children: [
            { path: '/rh/sanctions-primes', label: 'Sanctions & primes intégrées bulletin', icon: Award, permission: 'hr.payslip.read' },
            { path: '/primes-rendement', label: 'Primes de rendement (hors bulletin)', icon: Award, permission: 'hr.payslip.read' },
          ],
        },
        { path: '/rh/bulletins', label: 'Bulletins de paie', icon: PayWallet, permission: 'hr.payslip.read' },
        { path: '/rh/paie-tunisie', label: 'Paie Tunisie (CNSS, IRPP)', icon: ScrollText, permission: 'hr.payslip.read' },
        { path: '/rh/formations', label: 'Formations', icon: GraduationCap, permission: 'hr.training.read' },
      ],
    },

    // 9. Marketing
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      permission: 'marketing.read',
      items: [
        { path: '/communication', label: 'Campagnes email / WhatsApp / Telegram', icon: Send, permission: 'marketing.campaign.read' },
        { path: '/marketing/segments', label: 'Segments clients', icon: Target },
        { path: '/publicite', label: 'Comptes externes (Meta, Google Ads…)', icon: Share2, permission: 'marketing.account.read' },
        { path: '/marketing/stats', label: 'Stats & performance', icon: LineChart },
      ],
    },

    // 10. E-commerce
    {
      id: 'ecommerce',
      label: 'E-commerce',
      icon: Store,
      permission: 'website.read',
      items: [
        { path: '/ecommerce', label: 'Sites web synchronisés', icon: Globe2, permission: 'website.read' },
        { path: '/ecommerce-b2b', label: 'E-commerce B2B / B2C', icon: ShoppingBasket, permission: 'website.read' },
        { path: '_todo/ecommerce/commandes-web', label: 'Commandes web importées', icon: ShoppingCart, badge: '_todo' },
        { path: '/ecommerce/stock-sync', label: 'Stock synchronisé vers sites', icon: RefreshCw },
        { path: '/ecommerce/stats', label: 'Statistiques ventes web', icon: TrendingUp },
        { path: '/ecommerce/panier-abandonne', label: 'Panier abandonné', icon: Undo2 },
        { path: '/ecommerce/fidelite', label: 'Programme fidélité web', icon: Gift },
        { path: '/configurateur', label: 'Configurateur personnalisation', icon: Cog, permission: 'website.read' },
      ],
    },

    // 11. Intelligence Artificielle
    {
      id: 'ia',
      label: 'Intelligence Artificielle',
      icon: BrainCircuit,
      permission: 'ai.read',
      items: [
        { path: '/ia/agents-actifs', label: 'Agents actifs', icon: Bot },
        { path: '/ia/constats', label: 'Constats à traiter', icon: AlertCircle },
        { path: '/ia/rapports', label: 'Rapports générés', icon: FileBarChart2 },
        { path: '/ia/configuration', label: 'Configuration agents', icon: SettingsCog },
        { path: '/ia/couts-llm', label: 'Coûts & consommation LLM', icon: CoinIcon },
      ],
    },

    // 12. Messagerie inter-postes
    {
      id: 'messagerie',
      label: 'Messagerie inter-postes',
      icon: MessageSquare,
      permission: 'mail.read',
      items: [
        { path: '/messages-operateurs', label: 'Messages opérateurs', icon: MessageSquare, permission: 'mail.read' },
      ],
    },

    // 13. Dashboards — visibles pour tous (admin inclus pour supervision)
    {
      id: 'dashboards',
      label: 'Dashboards',
      icon: LayoutDashboard,
      permission: 'dashboard.read',
      items: [
        { path: '/dashboard-admin', label: 'Admin', icon: LayoutDashboard, permission: 'dashboard.read' },
        { path: '/dashboard-commercial', label: 'Commercial', icon: TrendingUp, permission: 'dashboard.commercial' },
        { path: '/tablette/magasinier', label: 'Magasinier Préparation', icon: Package, permission: 'dashboard.magasinier' },
        { path: '/dashboard-magasinier-mp', label: 'Magasinier MP', icon: Boxes, permission: 'dashboard.magasinier-mp' },
        { path: '/magasin-pf', label: 'Magasinier Stock (PF)', icon: Package2, permission: 'dashboard.magasin-pf' },
        { path: '/dashboard-magasinier-soustraitants', label: 'Magasinier Sous-Traitants', icon: Truck, permission: 'dashboard.magasinier-soustraitants' },
        { path: '/dashboard-chef-production', label: 'Chef Production', icon: Factory, permission: 'dashboard.chef-production' },
        { path: '/chef-atelier-dashboard', label: "Chef d'Atelier", icon: HardHat, permission: 'dashboard.chef-atelier' },
        {
          path: '/dashboard-tisseur',
          label: 'Tisseur / Coupeur / Ourdisseur',
          icon: Activity,
          permission: 'dashboard.tisseur',
          children: [
            { path: '/dashboard-tisseur', label: 'Tisseur', icon: Activity, permission: 'dashboard.tisseur' },
            { path: '/dashboard-post-coupe', label: 'Post-Coupe', icon: Scissors, permission: 'dashboard.coupe' },
            { path: '/tablette/tisseur', label: 'Tablette tisseur', icon: Activity, permission: 'dashboard.tisseur' },
            { path: '/tablette/coupeur', label: 'Tablette coupeur', icon: Scissors, permission: 'dashboard.coupe' },
          ],
        },
        { path: '/dashboard-controle-central', label: 'Contrôle Qualité', icon: CheckCircle, permission: 'dashboard.controle-central' },
        { path: '/mecanicien', label: 'Mécanicien / Maintenance', icon: Wrench, permission: 'dashboard.mecanicien' },
        { path: '/dashboard-comptable', label: 'Comptable', icon: BookOpen },
        { path: '_todo/dashboards/rh-manager', label: 'RH Manager', icon: Briefcase, badge: '_todo' },
        { path: '_todo/dashboards/ia', label: 'IA (agents & rapports)', icon: BrainCircuit, badge: '_todo' },
        { path: '/planning', label: 'Planification & Suivis', icon: Calendar, permission: 'mrp.production.read' },
      ],
    },

    // 14. Mon compte
    {
      id: 'mon-compte',
      label: 'Mon compte',
      icon: UserCog,
      items: [
        { path: '/mon-compte/profil', label: 'Profil', icon: UserCircle },
        { path: '/mon-compte/email', label: 'Paramètre Email (SMTP perso)', icon: Mail },
        { path: '/mon-compte/whatsapp', label: 'Paramètre WhatsApp', icon: MessageCircle },
      ],
    },

    // 15. Paramètres
    {
      id: 'parametres',
      label: 'Paramètres',
      icon: Settings,
      permission: 'base.config.write',
      items: [
        { path: '/multisociete', label: 'Paramètre Société', icon: Building2, permission: 'base.config.write' },
        { path: '/parametres/crm', label: 'Paramètre CRM', icon: Users },
        { path: '/parametres-produit-service', label: 'Paramètre Produits', icon: Package, permission: 'base.config.write' },
        { path: '/parametres-catalogue', label: 'Paramètres Catalogue', icon: FolderTree, permission: 'base.config.write' },
        { path: '/gestion-attributs', label: 'Attributs produits', icon: Layers, permission: 'base.config.write' },
        { path: '/parametres/vente', label: 'Paramètre Vente', icon: ShoppingBag },
        { path: '/parametres/achats', label: 'Paramètre Achats & Fournisseurs', icon: ShoppingCart },
        { path: '/parametres/comptabilite', label: 'Paramètre Comptabilité', icon: BookOpen },
        { path: '/parametres/stock', label: 'Paramètre Stock', icon: Warehouse },
        { path: '/parametres/fabrication', label: 'Paramètre Fabrication', icon: Factory },
        { path: '/parametres/transporteurs', label: 'Paramètre Transporteurs', icon: Truck },
        { path: '/parametres/commissions', label: 'Paramètre Commissions', icon: Percent },
        { path: '/communication', label: 'Paramètre Communication', icon: MessageSquare, permission: 'base.config.write' },
        { path: '_todo/parametres/marketing', label: 'Paramètre Marketing', icon: Megaphone, badge: '_todo' },
        { path: '/parametres/pays-tva', label: 'Paramètre Pays & TVA', icon: MapPin },
        { path: '/parametres/permissions', label: 'Utilisateurs & rôles', icon: UserCog, permission: 'base.config.write' },
        { path: '/parametrage', label: 'Paramétrage général', icon: Settings, permission: 'base.config.write' },
      ],
    },
  ];

  // ── Application du filtre permissions + retrait des catégories vides ──

  const menuCategories: MenuCategory[] = rawCategories
    .map((category) => ({ ...category, items: filterByPermissions(category.items) }))
    .filter((category) => {
      // Masquer les catégories opérationnelles pour l'admin (gère le système)
      if (isAdmin && category.hideForAdmin) return false;
      if (isAdmin) return category.items.length > 0;
      if (category.permission && hasPermission) {
        try {
          const [mod, action] = parsePermission(category.permission);
          if (!hasPermission(mod, action)) return false;
        } catch {
          // tolère
        }
      }
      return category.items.length > 0;
    });

  // Auto-expand catégorie contenant la route active
  useEffect(() => {
    menuCategories.forEach((category) => {
      const hasActive = category.items.some(
        (item) => location.pathname === item.path || hasActiveChild(item)
      );
      if (hasActive && !expandedCategories.has(category.id)) {
        setExpandedCategories((prev) => new Set([...prev, category.id]));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ── Rendu ─────────────────────────────────────────────────────────────

  return (
    <nav
      className={`w-72 fixed left-0 flex flex-col z-40 transition-transform duration-300 shadow-xl border-r ${
        state.ui.sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
      }`}
      style={{
        top: 48,               // laisse la place à UserBar (48px sticky top)
        height: 'calc(100vh - 48px)',
        backgroundColor: 'var(--bg-app, #FBF8F3)',
        borderColor: 'var(--border-default, #DFD3B8)',
      }}
    >
      <div className="px-3 pt-3 pb-0 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Header marque */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between h-14 min-h-[56px] px-3 rounded-xl shadow-md"
            style={{ backgroundColor: 'var(--accent-terracotta, #C8663D)' }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm"
                style={{ backgroundColor: 'rgba(251, 248, 243, 0.2)', color: CREAM_FG }}
              >
                LP
              </div>
              <div className="min-w-0">
                <h1
                  className="font-semibold text-base truncate"
                  style={{ color: CREAM_FG, fontFamily: '"Fraunces", serif', fontStyle: 'italic' }}
                >
                  La Plume
                </h1>
                <p className="text-xs font-medium truncate" style={{ color: 'rgba(251, 248, 243, 0.85)' }}>
                  Artisanale · ERP
                </p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg transition-all duration-200 flex-shrink-0"
              style={{ color: CREAM_FG }}
              aria-label="Replier le menu"
              title="Replier le menu"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(251, 248, 243, 0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3">
            <GlobalSearch />
          </div>
        </div>

        {/* Accueil (racine) */}
        <button
          onClick={() => handleNavigation('/dashboard-admin')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 transition-all duration-200"
          style={{ color: 'var(--fg-primary, #2F1F12)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TERRACOTTA_WASH)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Accueil"
        >
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: 'var(--bg-canvas, #F5EFE5)' }}
          >
            <Home className="w-5 h-5" style={{ color: 'var(--accent-terracotta, #C8663D)' }} />
          </div>
          <span className="font-semibold text-sm">Accueil</span>
        </button>

        {/* Liste catégories */}
        <div className="flex-1 min-h-0 space-y-1 overflow-y-auto custom-scrollbar pr-1">
          {menuCategories.map((category) => {
            const CategoryIcon = category.icon;
            const isExpanded = expandedCategories.has(category.id);
            const hasActiveItem = category.items.some(
              (item) => location.pathname === item.path || hasActiveChild(item)
            );

            return (
              <div key={category.id} className="mb-1">
                {/* Bouton catégorie */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: hasActiveItem ? 'var(--accent-terracotta, #C8663D)' : 'transparent',
                    color: hasActiveItem ? CREAM_FG : 'var(--fg-primary, #2F1F12)',
                  }}
                  onMouseEnter={(e) => {
                    if (!hasActiveItem) e.currentTarget.style.backgroundColor = TERRACOTTA_WASH;
                  }}
                  onMouseLeave={(e) => {
                    if (!hasActiveItem) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="p-1.5 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: hasActiveItem
                          ? 'rgba(251, 248, 243, 0.2)'
                          : 'var(--bg-canvas, #F5EFE5)',
                      }}
                    >
                      <CategoryIcon
                        className="w-5 h-5"
                        style={{
                          color: hasActiveItem ? CREAM_FG : 'var(--accent-terracotta, #C8663D)',
                        }}
                      />
                    </div>
                    <span className="font-semibold text-sm truncate">{category.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Sous-items */}
                {isExpanded && (
                  <div
                    className="mt-1 ml-2 pl-3 space-y-0.5 border-l-2"
                    style={{ borderColor: 'var(--border-strong, #C4B394)' }}
                  >
                    {category.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = location.pathname === item.path;
                      const hasChildren = item.children && item.children.length > 0;
                      const isItemExpanded = expandedItems.has(item.path);
                      const activeChild = hasActiveChild(item);
                      const isTodo = item.badge === '_todo';

                      return (
                        <div key={item.path}>
                          <div className="flex items-center">
                            {hasChildren ? (
                              <button
                                onClick={() => toggleItem(item.path)}
                                className="group flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm text-left"
                                style={{
                                  backgroundColor:
                                    isActive || activeChild
                                      ? 'var(--accent-terracotta, #C8663D)'
                                      : 'transparent',
                                  color:
                                    isActive || activeChild
                                      ? CREAM_FG
                                      : 'var(--fg-secondary, #6B4E31)',
                                }}
                                onMouseEnter={(e) => {
                                  if (!(isActive || activeChild))
                                    e.currentTarget.style.backgroundColor = TERRACOTTA_WASH;
                                }}
                                onMouseLeave={(e) => {
                                  if (!(isActive || activeChild))
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <ItemIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 truncate">{item.label}</span>
                                <ChevronDown
                                  className={`w-3 h-3 transition-transform duration-200 ${
                                    isItemExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleNavigation(item.path)}
                                disabled={isTodo}
                                className="group flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm text-left"
                                style={{
                                  backgroundColor: isActive
                                    ? 'var(--accent-terracotta, #C8663D)'
                                    : 'transparent',
                                  color: isActive
                                    ? CREAM_FG
                                    : isTodo
                                    ? 'var(--fg-muted, #9B8874)'
                                    : 'var(--fg-secondary, #6B4E31)',
                                  cursor: isTodo ? 'not-allowed' : 'pointer',
                                  opacity: isTodo ? 0.7 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive && !isTodo)
                                    e.currentTarget.style.backgroundColor = TERRACOTTA_WASH;
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive && !isTodo)
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                title={isTodo ? 'Écran à créer — routes non câblées' : item.label}
                              >
                                <ItemIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.badge === '_todo' && (
                                  <span
                                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                                    style={{
                                      backgroundColor: 'var(--color-warning-bg, #FBF3DE)',
                                      color: 'var(--color-warning, #D4A038)',
                                    }}
                                  >
                                    todo
                                  </span>
                                )}
                                {item.badge && item.badge !== '_todo' && (
                                  <span
                                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                                    style={{
                                      backgroundColor: isActive
                                        ? 'rgba(251, 248, 243, 0.3)'
                                        : 'var(--accent-terracotta, #C8663D)',
                                      color: CREAM_FG,
                                    }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Enfants (2ᵉ niveau) */}
                          {hasChildren && isItemExpanded && (
                            <div
                              className="ml-6 mt-0.5 space-y-0.5 pl-3 border-l-2"
                              style={{ borderColor: 'var(--border-subtle, #EDE3CE)' }}
                            >
                              {item.children!.map((child) => {
                                const ChildIcon = child.icon;
                                const isChildActive = location.pathname === child.path;
                                const isChildTodo = child.badge === '_todo';
                                return (
                                  <button
                                    key={child.path}
                                    onClick={() => handleNavigation(child.path)}
                                    disabled={isChildTodo}
                                    className="group flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs text-left w-full"
                                    style={{
                                      backgroundColor: isChildActive
                                        ? 'var(--accent-terracotta, #C8663D)'
                                        : 'transparent',
                                      color: isChildActive
                                        ? CREAM_FG
                                        : isChildTodo
                                        ? 'var(--fg-muted, #9B8874)'
                                        : 'var(--fg-secondary, #6B4E31)',
                                      cursor: isChildTodo ? 'not-allowed' : 'pointer',
                                      opacity: isChildTodo ? 0.7 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isChildActive && !isChildTodo)
                                        e.currentTarget.style.backgroundColor = TERRACOTTA_WASH;
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isChildActive && !isChildTodo)
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <ChildIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="flex-1 truncate">{child.label}</span>
                                    {isChildTodo && (
                                      <span
                                        className="px-1 py-0.5 rounded text-[9px] font-bold uppercase"
                                        style={{
                                          backgroundColor: 'var(--color-warning-bg, #FBF3DE)',
                                          color: 'var(--color-warning, #D4A038)',
                                        }}
                                      >
                                        todo
                                      </span>
                                    )}
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

        {/* Footer société + profil + déconnexion */}
        <div
          className="mt-auto flex-shrink-0 border-t"
          style={{ borderColor: 'var(--border-default, #DFD3B8)' }}
        >
          <div className="px-2 py-2">
            <CompanySwitcher />
          </div>

          {/* Bloc profil utilisateur + déconnexion */}
          <div
            className="border-t px-3 py-3"
            style={{ borderColor: 'var(--border-subtle, #EDE3CE)' }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar gradient terracotta → gold */}
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-terracotta), var(--accent-gold))',
                  color: CREAM_FG,
                  fontFamily: 'var(--font-serif, Fraunces, serif)',
                  fontSize: 14,
                  fontWeight: 600,
                  fontStyle: 'italic',
                }}
                aria-hidden="true"
              >
                {userInitials}
              </div>

              {/* Nom + rôle */}
              <div className="flex-1 min-w-0">
                <div
                  className="truncate"
                  style={{
                    fontFamily: 'var(--font-sans, Inter, sans-serif)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--fg-primary, #2F1F12)',
                    lineHeight: 1.2,
                  }}
                >
                  {(user as any)?.prenom
                    ? `${(user as any).prenom} ${(user as any).nom || ''}`.trim()
                    : (user as any)?.email || 'Utilisateur'}
                </div>
                <div
                  className="truncate"
                  style={{
                    fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                    fontSize: 10,
                    color: 'var(--fg-muted, #9B8874)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: 2,
                  }}
                >
                  {(user as any)?.role || 'USER'}
                </div>
              </div>
            </div>

            {/* Bouton déconnexion */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 transition-colors"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-default, #DFD3B8)',
                borderRadius: 8,
                color: 'var(--fg-secondary, #6B4E31)',
                fontFamily: 'var(--font-sans, Inter, sans-serif)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-danger-bg, #FBEBE4)';
                e.currentTarget.style.color = 'var(--color-danger, #B84A2F)';
                e.currentTarget.style.borderColor = 'var(--color-danger, #B84A2F)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--fg-secondary, #6B4E31)';
                e.currentTarget.style.borderColor = 'var(--border-default, #DFD3B8)';
              }}
              aria-label="Se déconnecter"
            >
              <LogOut size={14} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationEnhanced;
