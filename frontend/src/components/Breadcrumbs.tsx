/**
 * Breadcrumbs - Fil d'Ariane auto-dérivé depuis useLocation()
 * Utilise les design tokens (design-system.css).
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useBreadcrumbContext } from './BreadcrumbContext';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  customItems?: BreadcrumbItem[];
}

// Mapping global des routes vers des libellés lisibles
const ROUTE_LABELS: Record<string, string> = {
  '/dashboard-admin': 'Tableau de bord administrateur',
  '/dashboard-chef-production': 'Chef de production',
  '/dashboard-tisseur': 'Tisseur',
  '/dashboard-magasinier-mp': 'Magasinier MP',
  '/dashboard-post-coupe': 'Post-coupe',
  '/dashboard-controle-central': 'Contrôle central',
  '/dashboard-magasinier-soustraitants': 'Magasinier sous-traitants',
  '/chef-atelier-dashboard': 'Chef d’atelier',
  '/sale-orders': 'Commandes de vente',
  '/products': 'Produits',
  '/stock-pickings': 'Livraisons / Réceptions',
  '/productions': 'Ordres de production',
  '/account-moves': 'Écritures comptables',
  '/purchase-orders': "Commandes d'achat",
  '/crm': 'CRM',
  '/crm/leads': 'Leads',
  '/crm/contacts': 'Contacts',
  '/crm/interactions': 'Interactions',
  '/opportunities': 'Opportunités',
  '/pipeline-vente': 'Pipeline commercial',
  '/parametres/crm': 'Paramètres CRM',
  '/commandes': 'Commandes',
  '/clients': 'Clients',
  '/clients/nouveau': 'Nouveau client',
  '/fournisseurs': 'Fournisseurs',
  '/soustraitants': 'Sous-traitants',
  '/of': 'Ordres de fabrication',
  '/machines': 'Machines',
  '/maintenance': 'Maintenance',
  '/stock': 'Stock',
  '/parametrage': 'Paramétrage',
  '/modeles': 'Modèles',
  '/articles': 'Articles',
  '/articles-catalogue': 'Catalogue articles',
  '/factures': 'Factures',
  '/bl': 'Bons de livraison',
  '/hr': 'Personnel',
  '/ecommerce': 'E-commerce',
  '/ia': 'Intelligence artificielle',
  '/notifications': 'Notifications',
  '/settings': 'Paramètres',
};

function humanize(seg: string): string {
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, customItems }) => {
  const location = useLocation();
  const { dynamicLabel } = useBreadcrumbContext();

  const generate = (): BreadcrumbItem[] => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return [];
    const out: BreadcrumbItem[] = [{ label: 'Accueil', path: '/' }];
    let acc = '';
    parts.forEach((p, i) => {
      acc += `/${p}`;
      const isLast = i === parts.length - 1;
      const isNumeric = /^\d+$/.test(p);
      let label = ROUTE_LABELS[acc] || humanize(p);
      if (isLast && dynamicLabel) label = dynamicLabel;
      else if (isNumeric && isLast) label = `#${p}`;
      out.push({ label, path: isLast ? undefined : acc });
    });
    return out;
  };

  const list = customItems || items || generate();
  if (list.length <= 1) return null;

  return (
    <nav
      aria-label="Fil d’Ariane"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--s-2)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        color: 'var(--fg-muted)',
        minWidth: 0,
      }}
    >
      {list.map((item, index) => {
        const isLast = index === list.length - 1;
        const content = (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--s-1)',
              color: isLast ? 'var(--fg-primary)' : 'var(--fg-secondary)',
              fontWeight: isLast ? 600 : 400,
              maxWidth: 240,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {index === 0 && <Home size={14} />}
            {item.label}
          </span>
        );
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.path && !isLast ? (
              <Link
                to={item.path}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'color var(--duration) var(--ease)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget.firstChild as HTMLElement).style.color =
                    'var(--accent-terracotta)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget.firstChild as HTMLElement).style.color =
                    'var(--fg-secondary)';
                }}
              >
                {content}
              </Link>
            ) : (
              content
            )}
            {!isLast && (
              <span aria-hidden style={{ color: 'var(--fg-muted)' }}>
                &rsaquo;
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
