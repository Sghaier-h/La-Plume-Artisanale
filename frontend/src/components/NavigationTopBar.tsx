/**
 * NavigationTopBar — barre horizontale principale ERP La Plume Artisanale
 *
 * Remplace la sidebar §15 (NavigationEnhanced) par une barre de navigation
 * horizontale style Odoo/LinkedIn : chaque catégorie = un bouton dans la
 * barre, clic ouvre un dropdown vertical sous le bouton avec ses sous-items.
 *
 * Structure §15 identique à NavigationEnhanced (mêmes 15 catégories, mêmes
 * items, mêmes permissions, mêmes badges `_todo`, même parcours récursif
 * des children). Seul le rendu change : sidebar → top bar.
 *
 * Design tokens artisanaux : `--accent-terracotta`, wash terracotta sur
 * hover, item actif plein terracotta texte crème.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../store/AppContext';
import {
  Home, Users, UserCircle, UserPlus, Contact, HeartHandshake,
  Package, Package2, Layers, FolderTree, FileSearch,
  Warehouse, Boxes, ArrowRightLeft, BookmarkCheck, Barcode, ClipboardList, AlertTriangle,
  Factory, Cog, Wrench, HardHat, Truck, Calendar, Activity,
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
  Settings, MapPin,
  ChevronDown,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────

type LucideIconLike = React.ComponentType<any>;

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
  hideForAdmin?: boolean;
}

// ── Constantes design (tokens artisanaux) ─────────────────────────────

const TERRACOTTA_WASH = 'rgba(200, 102, 61, 0.08)';
const CREAM_FG = '#FBF8F3';

// ── Composant ─────────────────────────────────────────────────────────

const NavigationTopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = useApp();

  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isAdmin =
    user?.role === 'ADMIN' ||
    user?.role === 'admin' ||
    user?.role?.toUpperCase() === 'ADMIN';

  // ── Mesure dynamique de la hauteur du menu (multi-ligne wrap possible)
  //     Expose la valeur via CSS var --nav-height sur documentElement pour
  //     que UserBar et ContentWrapper s'alignent parfaitement.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateHeight = () => {
      const h = el.offsetHeight;
      document.documentElement.style.setProperty('--nav-height', `${h}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // ── Fermeture du dropdown au clic ailleurs ─────────────────────────
  useEffect(() => {
    if (!openCategoryId) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenCategoryId(null);
        setExpandedItems(new Set());
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenCategoryId(null);
        setExpandedItems(new Set());
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openCategoryId]);

  // Fermer le dropdown au changement de route
  useEffect(() => {
    setOpenCategoryId(null);
    setExpandedItems(new Set());
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    if (path.startsWith('_todo')) return;
    navigate(path);
    setOpenCategoryId(null);
    setExpandedItems(new Set());
  };

  const toggleCategory = (categoryId: string) => {
    if (openCategoryId === categoryId) {
      setOpenCategoryId(null);
      setExpandedItems(new Set());
    } else {
      setOpenCategoryId(categoryId);
      setExpandedItems(new Set());
    }
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
  const parsePermission = (perm: string): [string, string] => {
    const parts = perm.split('.');
    if (parts.length >= 2) {
      const action = parts[parts.length - 1];
      const mod = parts.slice(0, -1).join('.');
      return [mod, action];
    }
    return [parts[0], 'read'];
  };

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
          // tolère
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

  // ── Structure du menu §15 (identique à NavigationEnhanced) ─────────

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
        { path: '/fabrication/gammes', label: 'Gammes', icon: ScrollText },
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
        { path: '/fabrication/of-stock-ca', label: 'OF Stock catalogue (CA)', icon: FileText },
        { path: '/fabrication/ourdissage', label: 'Ourdissage', icon: Ruler },
        { path: '/fabrication/preparation-mp', label: 'Préparation MP', icon: Scissors },
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

    // 12. Messagerie inter-postes → intégrée dans la UserBar (bouton Messages)
    // avec canaux WhatsApp / Telegram / email / SMS

    // 13. Dashboards → intégrés dans la UserBar (bouton Dashboards)
    //     Accès rapide aux 16 dashboards §14 depuis la barre système.

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

  // ── Filtre permissions ─────────────────────────────────────────────

  const menuCategories: MenuCategory[] = rawCategories
    .map((category) => ({ ...category, items: filterByPermissions(category.items) }))
    .filter((category) => {
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

  // ── Rendu d'un item (récursif pour children) ───────────────────────

  const renderItem = (item: MenuItem, depth: number = 0): React.ReactNode => {
    const ItemIcon = item.icon;
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isItemExpanded = expandedItems.has(item.path);
    const activeChild = hasActiveChild(item);
    const isTodo = item.badge === '_todo';

    return (
      <div key={item.path}>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggleItem(item.path)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              paddingLeft: 12 + depth * 12,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--font-sans, Inter, sans-serif)',
              fontSize: 13,
              fontWeight: 500,
              background:
                isActive || activeChild ? 'var(--accent-terracotta)' : 'transparent',
              color:
                isActive || activeChild ? CREAM_FG : 'var(--fg-secondary, #6B4E31)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!(isActive || activeChild))
                e.currentTarget.style.background = TERRACOTTA_WASH;
            }}
            onMouseLeave={(e) => {
              if (!(isActive || activeChild))
                e.currentTarget.style.background = 'transparent';
            }}
          >
            <ItemIcon size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            <ChevronDown
              size={14}
              style={{
                flexShrink: 0,
                transform: isItemExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
              }}
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleNavigation(item.path)}
            disabled={isTodo}
            title={isTodo ? 'Écran à créer — routes non câblées' : item.label}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              paddingLeft: 12 + depth * 12,
              borderRadius: 6,
              border: 'none',
              cursor: isTodo ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--font-sans, Inter, sans-serif)',
              fontSize: 13,
              fontWeight: 500,
              background: isActive ? 'var(--accent-terracotta)' : 'transparent',
              color: isActive
                ? CREAM_FG
                : isTodo
                ? 'var(--fg-muted, #9B8874)'
                : 'var(--fg-secondary, #6B4E31)',
              opacity: isTodo ? 0.7 : 1,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isActive && !isTodo)
                e.currentTarget.style.background = TERRACOTTA_WASH;
            }}
            onMouseLeave={(e) => {
              if (!isActive && !isTodo)
                e.currentTarget.style.background = 'transparent';
            }}
          >
            <ItemIcon size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            {item.badge === '_todo' && (
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: 999,
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-mono, monospace)',
                  background: 'var(--color-warning-bg, #FBF3DE)',
                  color: 'var(--color-warning, #D4A038)',
                  flexShrink: 0,
                }}
              >
                todo
              </span>
            )}
            {item.badge && item.badge !== '_todo' && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  background: isActive
                    ? 'rgba(251, 248, 243, 0.3)'
                    : 'var(--accent-terracotta)',
                  color: CREAM_FG,
                  flexShrink: 0,
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        )}

        {/* Enfants (2ᵉ niveau) */}
        {hasChildren && isItemExpanded && (
          <div
            style={{
              marginTop: 2,
              marginLeft: 16,
              paddingLeft: 8,
              borderLeft: '2px solid var(--border-subtle, #EDE3CE)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {item.children!.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // ── Rendu barre horizontale ─────────────────────────────────────────

  return (
    <nav
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 110,
        minHeight: 48,                // au moins une ligne, s'étend si wrap
        background: 'var(--bg-app, #FBF8F3)',   // crème (pas blanc)
        borderBottom: '1px solid var(--border-subtle, #EDE3CE)',
        boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.06))',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',              // retour ligne si écran trop étroit
        gap: 4,
        padding: '6px 20px',
        fontFamily: 'var(--font-sans, Inter, sans-serif)',
        // overflow: 'visible' par défaut → dropdown absolute s'affiche correctement
      }}
    >
      {/* Bouton Accueil */}
      <button
        type="button"
        onClick={() => handleNavigation('/')}
        title="Accueil"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 8,
          border: 'none',
          background: 'transparent',
          color: 'var(--fg-primary, #2F1F12)',
          fontFamily: 'var(--font-sans, Inter, sans-serif)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.15s',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = TERRACOTTA_WASH;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Home size={16} style={{ color: 'var(--accent-terracotta)' }} />
        <span>Accueil</span>
      </button>

      {/* Séparateur discret */}
      <div
        style={{
          width: 1,
          height: 20,
          background: 'var(--border-subtle, #EDE3CE)',
          margin: '0 4px',
          flexShrink: 0,
        }}
      />

      {/* Boutons catégories */}
      {menuCategories.map((category) => {
        const CategoryIcon = category.icon;
        const isOpen = openCategoryId === category.id;
        const hasActiveItem = category.items.some(
          (item) => location.pathname === item.path || hasActiveChild(item)
        );
        const hasSubItems = category.items.length > 0;

        return (
          <div
            key={category.id}
            style={{
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              aria-expanded={isOpen}
              aria-haspopup="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: hasActiveItem
                  ? 'var(--accent-terracotta)'
                  : isOpen
                  ? TERRACOTTA_WASH
                  : 'transparent',
                color: hasActiveItem ? CREAM_FG : 'var(--fg-primary, #2F1F12)',
                fontFamily: 'var(--font-sans, Inter, sans-serif)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!hasActiveItem && !isOpen)
                  e.currentTarget.style.background = TERRACOTTA_WASH;
              }}
              onMouseLeave={(e) => {
                if (!hasActiveItem && !isOpen)
                  e.currentTarget.style.background = 'transparent';
              }}
            >
              <CategoryIcon size={16} style={{ flexShrink: 0 }} />
              <span>{category.label}</span>
              {hasSubItems && (
                <ChevronDown
                  size={12}
                  style={{
                    flexShrink: 0,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s',
                  }}
                />
              )}
            </button>

            {/* Dropdown sous-menu */}
            {isOpen && hasSubItems && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  top: '100%',        // sous le bouton catégorie (variable selon ligne)
                  left: 0,
                  minWidth: 240,
                  maxWidth: 360,
                  maxHeight: 'calc(100vh - 96px)',
                  overflowY: 'auto',
                  background: 'var(--bg-elevated, #FFFFFF)',
                  border: '1px solid var(--border-subtle, #EDE3CE)',
                  borderRadius: 'var(--radius-md, 8px)',
                  boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.12))',
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  zIndex: 120,
                }}
              >
                {category.items.map((item) => renderItem(item, 0))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default NavigationTopBar;
