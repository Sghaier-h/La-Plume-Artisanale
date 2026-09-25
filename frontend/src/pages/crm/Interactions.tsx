import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  CalendarDays,
  FileText,
  Search,
  Filter,
  PlusCircle,
  Clock,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════
type TypeInteraction = 'appel' | 'email' | 'reunion' | 'note';

interface Interaction {
  id_interaction: number;
  date: string; // ISO datetime
  type: TypeInteraction;
  contact_nom: string;
  compte_nom: string;
  commercial_nom: string;
  resume: string;
  suivi_date: string | null;
  suivi_effectue: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// Mock
// ═══════════════════════════════════════════════════════════════════
const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400_000).toISOString();

const MOCK_INTERACTIONS: Interaction[] = [
  { id_interaction: 1, date: hoursAgo(2), type: 'appel', contact_nom: 'Sonia Ben Hamida', compte_nom: 'Hotel Marina Djerba', commercial_nom: 'Amine Ouali', resume: 'Confirmation de la commande de 400 draps housse + relance devis peignoirs', suivi_date: daysAgo(-3), suivi_effectue: false },
  { id_interaction: 2, date: hoursAgo(5), type: 'email', contact_nom: 'Nadia Trabelsi', compte_nom: 'Boutique Artisan Tunis', commercial_nom: 'Amine Ouali', resume: 'Envoi mockups packaging Ramadan + tarif remise volume', suivi_date: daysAgo(-2), suivi_effectue: false },
  { id_interaction: 3, date: hoursAgo(9), type: 'reunion', contact_nom: 'Karim Ferchichi', compte_nom: 'Groupe Cotton Plus SA', commercial_nom: 'Rania Slimi', resume: 'Rencontre showroom La Marsa — présentation nouvelle gamme fouta 100% coton égyptien', suivi_date: daysAgo(-7), suivi_effectue: false },
  { id_interaction: 4, date: daysAgo(1), type: 'appel', contact_nom: 'Mehdi Karray', compte_nom: 'Résidence Hammamet Beach', commercial_nom: 'Amine Ouali', resume: 'Discussion sur le retard de livraison — engagement livraison samedi', suivi_date: daysAgo(-1), suivi_effectue: true },
  { id_interaction: 5, date: daysAgo(2), type: 'note', contact_nom: 'Amine Sfar', compte_nom: 'Boutique El Menzah SARL', commercial_nom: 'Rania Slimi', resume: 'Note interne: relancer sur la facture VE-2026-0128 (retard 21j)', suivi_date: daysAgo(2), suivi_effectue: false },
  { id_interaction: 6, date: daysAgo(4), type: 'email', contact_nom: 'Fatma Ayadi', compte_nom: 'Hotel Corail Mahdia', commercial_nom: 'Amine Ouali', resume: 'Envoi catalogue jetés de canapé — demande échantillons 3 coloris', suivi_date: daysAgo(-5), suivi_effectue: false },
  { id_interaction: 7, date: daysAgo(6), type: 'reunion', contact_nom: 'Leila Zouari', compte_nom: 'Souk Central Sfax', commercial_nom: 'Rania Slimi', resume: 'Visite comptoir — négociation prix marché quartier Souk El Djemaa', suivi_date: null, suivi_effectue: true },
  { id_interaction: 8, date: daysAgo(11), type: 'appel', contact_nom: 'Youssef Mansour', compte_nom: 'Medina Shop Kairouan', commercial_nom: 'Amine Ouali', resume: 'Point mensuel — client insatisfait qualité coloris terracotta lot mars', suivi_date: daysAgo(4), suivi_effectue: false },
  { id_interaction: 9, date: daysAgo(15), type: 'email', contact_nom: 'Sonia Ben Hamida', compte_nom: 'Hotel Marina Djerba', commercial_nom: 'Amine Ouali', resume: 'Réponse RFQ hôtel + envoi grille tarifaire saison été', suivi_date: daysAgo(10), suivi_effectue: true },
  { id_interaction: 10, date: daysAgo(22), type: 'note', contact_nom: 'Karim Ferchichi', compte_nom: 'Groupe Cotton Plus SA', commercial_nom: 'Rania Slimi', resume: 'Signature contrat cadre 2026 confirmée — 8 000 pièces/an', suivi_date: null, suivi_effectue: true },
];

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════
const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d as T[];
  if (d && Array.isArray(d.interactions)) return d.interactions as T[];
  if (d && Array.isArray(d.activities)) return d.activities as T[];
  return fallback;
};

const fmtDateTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const TYPE_META: Record<TypeInteraction, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  appel: { label: 'Appel', icon: <Phone className="w-3.5 h-3.5" />, color: '#3B4E68', bg: '#EDF0F5' },
  email: { label: 'Email', icon: <Mail className="w-3.5 h-3.5" />, color: '#C8663D', bg: 'color-mix(in srgb, var(--accent-terracotta) 15%, var(--bg-elevated))' },
  reunion: { label: 'Réunion', icon: <CalendarDays className="w-3.5 h-3.5" />, color: '#4A6C5B', bg: '#EEF4F0' },
  note: { label: 'Note', icon: <FileText className="w-3.5 h-3.5" />, color: '#7A6E63', bg: 'var(--bg-canvas)' },
};

// ═══════════════════════════════════════════════════════════════════
// KpiCard local
// ═══════════════════════════════════════════════════════════════════
interface KpiProps {
  label: string;
  value: string | number;
  hint?: string;
  color: 'terracotta' | 'sage' | 'indigo' | 'gold';
  icon?: React.ReactNode;
}
const COLORS: Record<KpiProps['color'], string> = {
  terracotta: '#C8663D',
  sage: '#4A6C5B',
  indigo: '#3B4E68',
  gold: '#D6A756',
};
const KpiCard: React.FC<KpiProps> = ({ label, value, hint, color, icon }) => (
  <div
    className="rounded-xl p-5 shadow-sm bg-white"
    style={{ borderLeft: `4px solid ${COLORS[color]}` }}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div
          className="text-[11px] uppercase tracking-widest font-medium mb-2"
          style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
        >
          {label}
        </div>
        <div
          className="text-3xl italic font-medium"
          style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: COLORS[color] }}
        >
          {value}
        </div>
        {hint && <div className="text-xs mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>{hint}</div>}
      </div>
      {icon && (
        <div className="rounded-lg p-2 shrink-0" style={{ background: `${COLORS[color]}18`, color: COLORS[color] }}>
          {icon}
        </div>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════
const Interactions: React.FC = () => {
  const [rows, setRows] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TypeInteraction>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([api.get('/crm/interactions')]);
      if (cancelled) return;
      setRows(pickArray<Interaction>(results[0], MOCK_INTERACTIONS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0);
    const startWeek = new Date();
    startWeek.setDate(startWeek.getDate() - 7);
    const startMonth = new Date();
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);
    const aujourdhui = rows.filter((r) => new Date(r.date) >= startDay).length;
    const semaine = rows.filter((r) => new Date(r.date) >= startWeek).length;
    const mois = rows.filter((r) => new Date(r.date) >= startMonth).length;
    const enRetard = rows.filter(
      (r) => r.suivi_date && !r.suivi_effectue && new Date(r.suivi_date).getTime() < Date.now()
    ).length;
    return { aujourdhui, semaine, mois, enRetard };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.contact_nom.toLowerCase().includes(q) ||
        r.compte_nom.toLowerCase().includes(q) ||
        r.commercial_nom.toLowerCase().includes(q) ||
        r.resume.toLowerCase().includes(q)
      );
    });
  }, [rows, search, filterType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div
              className="text-[11px] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
            >
              CRM · JOURNAL
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1
                  className="text-3xl italic font-medium flex items-center gap-3"
                  style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                >
                  <MessageSquare className="w-7 h-7" style={{ color: '#C8663D' }} />
                  Interactions
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                  Journal chronologique &middot; appels, emails, réunions, notes internes
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white"
                style={{ background: '#C8663D', borderRadius: '9999px' }}
              >
                <PlusCircle className="w-4 h-4" />
                Nouvelle interaction
              </button>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Aujourd'hui" value={kpis.aujourdhui} hint="Contacts du jour" color="terracotta" icon={<CalendarCheck className="w-5 h-5" />} />
            <KpiCard label="Cette semaine" value={kpis.semaine} hint="7 derniers jours" color="sage" icon={<CalendarDays className="w-5 h-5" />} />
            <KpiCard label="Ce mois" value={kpis.mois} hint="Depuis le 1er" color="indigo" icon={<Clock className="w-5 h-5" />} />
            <KpiCard label="En retard suivi" value={kpis.enRetard} hint="Actions à traiter" color="gold" icon={<AlertCircle className="w-5 h-5" />} />
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Contact, compte, résumé, commercial…"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-[#C8663D]"
                style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
              />
            </div>
            <Filter className="w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5 bg-white"
              style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
            >
              <option value="all">Tous types</option>
              <option value="appel">Appel</option>
              <option value="email">Email</option>
              <option value="reunion">Réunion</option>
              <option value="note">Note</option>
            </select>
            <div className="text-sm ml-auto" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
              {filtered.length} / {rows.length}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead style={{ background: 'var(--bg-canvas)' }}>
                <tr>
                  {['Date', 'Type', 'Contact', 'Compte', 'Commercial', 'Résumé'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left italic font-medium text-xs uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}>
                {filtered.map((r) => {
                  const meta = TYPE_META[r.type];
                  return (
                    <tr key={r.id_interaction} className="hover:bg-[#FDF2ED]/50 transition-colors group">
                      <td
                        className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{
                          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                          color: 'var(--fg-muted, #7A6E63)',
                        }}
                      >
                        {fmtDateTime(r.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        {r.contact_nom}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        {r.compte_nom}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                        {r.commercial_nom}
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <div className="line-clamp-2" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                          {r.resume}
                        </div>
                        {r.suivi_date && !r.suivi_effectue && new Date(r.suivi_date).getTime() < Date.now() && (
                          <div className="text-[11px] mt-0.5 inline-flex items-center gap-1" style={{ color: '#D6A756' }}>
                            <AlertCircle className="w-3 h-3" /> suivi en retard
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                      Aucune interaction pour ces critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interactions;
