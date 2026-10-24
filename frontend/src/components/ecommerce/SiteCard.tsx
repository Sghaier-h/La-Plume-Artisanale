import React from 'react';
import {
  Globe,
  ShoppingBag,
  RefreshCw,
  ExternalLink,
  Pencil,
  Trash2,
  Power,
} from 'lucide-react';
import type { SiteEcommerce } from '../../services/ecommerceApi';

interface SiteCardProps {
  site: SiteEcommerce;
  onEdit?: (site: SiteEcommerce) => void;
  onDelete?: (site: SiteEcommerce) => void;
  onSync?: (site: SiteEcommerce) => void;
  onToggleSync?: (site: SiteEcommerce) => void;
}

const PLATFORM_STYLES: Record<string, { label: string; className: string }> = {
  shopify: { label: 'Shopify', className: 'bg-[#96BF48]/15 text-[#5A7A2C]' },
  woocommerce: { label: 'WooCommerce', className: 'bg-[#96588A]/15 text-[#6B3F63]' },
  custom_api: { label: 'Custom API', className: 'bg-[#3B4E68]/15 text-[#3B4E68]' },
  prestashop: { label: 'PrestaShop', className: 'bg-[#DF0067]/15 text-[#9F0049]' },
};

const CANAL_STYLES: Record<string, string> = {
  B2B: 'bg-[#3B4E68] text-white',
  B2C: 'bg-[#C8663D] text-white',
  MIXTE: 'bg-gradient-to-r from-[#C8663D] to-[#3B4E68] text-white',
};

const SANTE_STYLES: Record<string, { label: string; className: string }> = {
  ok: { label: 'Synchro OK', className: 'bg-emerald-50 text-emerald-700' },
  erreur_auth: { label: 'Erreur Auth', className: 'bg-red-50 text-red-700' },
  erreur_api: { label: 'Erreur API', className: 'bg-red-50 text-red-700' },
  desactive: { label: 'Désactivé', className: 'bg-gray-100 text-gray-600' },
};

const SiteCard: React.FC<SiteCardProps> = ({
  site,
  onEdit,
  onDelete,
  onSync,
  onToggleSync,
}) => {
  const platform = PLATFORM_STYLES[site.plateforme] || {
    label: site.plateforme,
    className: 'bg-gray-100 text-gray-700',
  };
  const canal = CANAL_STYLES[site.canal] || CANAL_STYLES.MIXTE;
  const sante = SANTE_STYLES[site.statut_sante] || SANTE_STYLES.desactive;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-[#C8663D]/40 hover:shadow-lg transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="bg-gradient-to-br from-[#C8663D]/20 to-[#3B4E68]/20 p-2.5 rounded-lg shrink-0">
              <Globe className="w-5 h-5 text-[#3B4E68]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-gray-900 truncate">{site.libelle}</div>
              <div className="text-xs text-gray-500 font-mono truncate">
                {site.code_site}
              </div>
            </div>
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-1 rounded ${canal} shrink-0`}
          >
            {site.canal}
          </span>
        </div>

        <a
          href={site.url_site}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[#3B4E68] hover:underline mb-3 truncate max-w-full"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{site.url_site}</span>
        </a>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${platform.className}`}
          >
            {platform.label}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${sante.className}`}
          >
            {sante.label}
          </span>
          <span className="text-xs text-gray-500 ml-auto">{site.devise_defaut}</span>
        </div>

        <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
          Dernière sync :{' '}
          <span className="font-medium text-gray-700">
            {site.derniere_sync_at
              ? new Date(site.derniere_sync_at).toLocaleString('fr-FR')
              : 'Jamais'}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 flex items-center gap-2 border-t border-gray-100">
        <button
          onClick={() => onSync?.(site)}
          className="flex items-center gap-1 text-xs font-medium text-[#4A6C5B] hover:text-[#3B4E68] px-2 py-1 rounded hover:bg-white transition-colors"
          title="Synchroniser catalogue"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync
        </button>
        <button
          onClick={() => onToggleSync?.(site)}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded hover:bg-white transition-colors ${
            site.sync_active ? 'text-emerald-700' : 'text-gray-500'
          }`}
          title={site.sync_active ? 'Désactiver sync' : 'Activer sync'}
        >
          <Power className="w-3.5 h-3.5" />
          {site.sync_active ? 'Actif' : 'Off'}
        </button>
        <div className="flex-1" />
        <button
          onClick={() => onEdit?.(site)}
          className="p-1.5 text-gray-500 hover:text-[#3B4E68] hover:bg-white rounded transition-colors"
          title="Modifier"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete?.(site)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default SiteCard;
