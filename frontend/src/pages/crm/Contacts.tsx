import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Mail,
  Phone,
  Building2,
  Filter,
  UserCheck,
  Star,
  Clock,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════
interface ContactB2B {
  id_contact: number;
  nom: string;
  prenom: string;
  poste: string;
  email: string;
  telephone: string;
  compte_nom: string;
  id_compte: number | null;
  dernier_echange: string; // ISO date
  role_decision: 'decideur' | 'influenceur' | 'utilisateur' | 'gatekeeper';
  actif: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// Mock
// ═══════════════════════════════════════════════════════════════════
const MOCK_CONTACTS: ContactB2B[] = [
  { id_contact: 1, nom: 'Ben Hamida', prenom: 'Sonia', poste: 'Directrice Achats', email: 'sonia.benhamida@marina-djerba.tn', telephone: '+216 24 118 442', compte_nom: 'Hotel Marina Djerba', id_compte: 12, dernier_echange: new Date(Date.now() - 3 * 86400000).toISOString(), role_decision: 'decideur', actif: true },
  { id_contact: 2, nom: 'Karray', prenom: 'Mehdi', poste: 'Chef de projet linge', email: 'm.karray@residence-hammamet.tn', telephone: '+216 71 224 890', compte_nom: 'Résidence Hammamet Beach', id_compte: 8, dernier_echange: new Date(Date.now() - 12 * 86400000).toISOString(), role_decision: 'influenceur', actif: true },
  { id_contact: 3, nom: 'Sfar', prenom: 'Amine', poste: 'Gérant', email: 'amine.sfar@boutique-menzah.tn', telephone: '+216 98 445 220', compte_nom: 'Boutique El Menzah SARL', id_compte: 5, dernier_echange: new Date(Date.now() - 45 * 86400000).toISOString(), role_decision: 'decideur', actif: true },
  { id_contact: 4, nom: 'Trabelsi', prenom: 'Nadia', poste: 'Responsable e-commerce', email: 'nadia@boutique-artisan.com', telephone: '+216 27 990 118', compte_nom: 'Boutique Artisan Tunis', id_compte: 15, dernier_echange: new Date(Date.now() - 1 * 86400000).toISOString(), role_decision: 'decideur', actif: true },
  { id_contact: 5, nom: 'Ferchichi', prenom: 'Karim', poste: 'Directeur Général', email: 'k.ferchichi@groupe-cotton-plus.tn', telephone: '+216 71 448 220', compte_nom: 'Groupe Cotton Plus SA', id_compte: 20, dernier_echange: new Date(Date.now() - 8 * 86400000).toISOString(), role_decision: 'decideur', actif: true },
  { id_contact: 6, nom: 'Zouari', prenom: 'Leila', poste: 'Assistante commerciale', email: 'l.zouari@souk-sfax.tn', telephone: '+216 74 220 118', compte_nom: 'Souk Central Sfax', id_compte: 9, dernier_echange: new Date(Date.now() - 20 * 86400000).toISOString(), role_decision: 'gatekeeper', actif: true },
  { id_contact: 7, nom: 'Mansour', prenom: 'Youssef', poste: 'Responsable magasin', email: 'y.mansour@medina-shop.tn', telephone: '+216 22 448 990', compte_nom: 'Medina Shop Kairouan', id_compte: 18, dernier_echange: new Date(Date.now() - 55 * 86400000).toISOString(), role_decision: 'utilisateur', actif: false },
  { id_contact: 8, nom: 'Ayadi', prenom: 'Fatma', poste: 'Directrice marketing', email: 'f.ayadi@hotel-corail.tn', telephone: '+216 79 118 442', compte_nom: 'Hotel Corail Mahdia', id_compte: 22, dernier_echange: new Date(Date.now() - 5 * 86400000).toISOString(), role_decision: 'influenceur', actif: true },
];

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════
const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d as T[];
  if (d && Array.isArray(d.contacts)) return d.contacts as T[];
  return fallback;
};

const fmtDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    const days = Math.round((Date.now() - d.getTime()) / 86400000);
    if (days === 0) return "aujourd'hui";
    if (days === 1) return 'hier';
    if (days < 30) return `il y a ${days} j`;
    return d.toLocaleDateString('fr-FR');
  } catch {
    return '-';
  }
};

// ═══════════════════════════════════════════════════════════════════
// KpiCard local (bordure gauche colorée)
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
        <div
          className="rounded-lg p-2 shrink-0"
          style={{ background: `${COLORS[color]}18`, color: COLORS[color] }}
        >
          {icon}
        </div>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════
const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<ContactB2B[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | ContactB2B['role_decision']>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([api.get('/crm/contacts')]);
      if (cancelled) return;
      setContacts(pickArray<ContactB2B>(results[0], MOCK_CONTACTS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const total = contacts.length;
    const actifs = contacts.filter((c) => c.actif).length;
    const decideurs = contacts.filter((c) => c.role_decision === 'decideur').length;
    const sans30j = contacts.filter((c) => {
      const days = (Date.now() - new Date(c.dernier_echange).getTime()) / 86400000;
      return days > 30;
    }).length;
    return { total, actifs, decideurs, sans30j };
  }, [contacts]);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (filterRole !== 'all' && c.role_decision !== filterRole) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.nom.toLowerCase().includes(q) ||
        c.prenom.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.compte_nom.toLowerCase().includes(q) ||
        c.poste.toLowerCase().includes(q)
      );
    });
  }, [contacts, search, filterRole]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}
      >
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
              style={{
                fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                color: 'var(--fg-muted, #7A6E63)',
              }}
            >
              CRM · CONTACTS B2B
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1
                  className="text-3xl italic font-medium flex items-center gap-3"
                  style={{
                    fontFamily: 'var(--font-serif, Fraunces, serif)',
                    color: 'var(--fg-primary, #2F2A26)',
                  }}
                >
                  <Users className="w-7 h-7" style={{ color: '#C8663D' }} />
                  Contacts
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                  Interlocuteurs B2B rattachés aux comptes clients &middot; historique des échanges
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white"
                style={{ background: '#C8663D', borderRadius: '9999px' }}
              >
                <PlusCircle className="w-4 h-4" />
                Nouveau contact
              </button>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Total contacts" value={kpis.total} hint="Base B2B" color="terracotta" icon={<Users className="w-5 h-5" />} />
            <KpiCard label="Actifs" value={kpis.actifs} hint={`${Math.round((kpis.actifs / Math.max(kpis.total, 1)) * 100)}% du total`} color="sage" icon={<UserCheck className="w-5 h-5" />} />
            <KpiCard label="Décideurs" value={kpis.decideurs} hint="Signataires potentiels" color="indigo" icon={<Star className="w-5 h-5" />} />
            <KpiCard label="Sans échange 30j" value={kpis.sans30j} hint="À relancer" color="gold" icon={<Clock className="w-5 h-5" />} />
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, email, compte, poste…"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-[#C8663D]"
                style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
              />
            </div>
            <Filter className="w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5 bg-white"
              style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
            >
              <option value="all">Tous rôles</option>
              <option value="decideur">Décideur</option>
              <option value="influenceur">Influenceur</option>
              <option value="utilisateur">Utilisateur</option>
              <option value="gatekeeper">Gatekeeper</option>
            </select>
            <div className="text-sm ml-auto" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
              {filtered.length} / {contacts.length}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead style={{ background: 'var(--bg-canvas)' }}>
                <tr>
                  {['Nom', 'Poste', 'Email', 'Téléphone', 'Compte lié', 'Dernier échange'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left italic font-medium text-xs uppercase tracking-wide"
                      style={{
                        fontFamily: 'var(--font-serif, Fraunces, serif)',
                        color: 'var(--fg-primary, #2F2A26)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}>
                {filtered.map((c) => (
                  <tr key={c.id_contact} className="hover:bg-[#FDF2ED]/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        {c.prenom} {c.nom}
                      </div>
                      {c.role_decision === 'decideur' && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide mt-0.5 px-2 py-0.5 rounded-full"
                          style={{ background: 'color-mix(in srgb, var(--accent-terracotta) 15%, var(--bg-elevated))', color: '#C8663D' }}
                        >
                          <Star className="w-3 h-3" /> décideur
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                      {c.poste}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 hover:underline" style={{ color: '#3B4E68' }}>
                        <Mail className="w-3.5 h-3.5" />
                        <span
                          className="text-xs"
                          style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                        >
                          {c.email}
                        </span>
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`tel:${c.telephone}`} className="inline-flex items-center gap-1.5 hover:underline" style={{ color: '#4A6C5B' }}>
                        <Phone className="w-3.5 h-3.5" />
                        <span
                          className="text-xs"
                          style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                        >
                          {c.telephone}
                        </span>
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
                        {c.compte_nom}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{
                        color: 'var(--fg-muted, #7A6E63)',
                        fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                      }}
                    >
                      {fmtDate(c.dernier_echange)}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                      Aucun contact pour ces critères.
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

export default Contacts;
