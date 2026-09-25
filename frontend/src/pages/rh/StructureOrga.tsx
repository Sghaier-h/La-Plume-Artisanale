import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Users,
  Briefcase,
  Network,
  UserCheck,
  Layers,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import {
  structureOrgaService,
  Service,
  Fonction,
  Equipe,
} from '../../services/rhApi';

type TabKey = 'services' | 'fonctions' | 'equipes';

const MOCK_SERVICES: Service[] = [
  { id_service: 1, code: 'DIR', libelle: 'Direction générale', responsable: 'Salima Guelbi', effectif: 3, parent_id: null },
  { id_service: 2, code: 'PROD', libelle: 'Production', responsable: 'Hedi Sghaier', effectif: 42, parent_id: 1 },
  { id_service: 3, code: 'PROD-TIS', libelle: 'Atelier Tissage', responsable: 'Karim Bouazizi', effectif: 18, parent_id: 2 },
  { id_service: 4, code: 'PROD-FIN', libelle: 'Atelier Finition', responsable: 'Amel Ferchichi', effectif: 12, parent_id: 2 },
  { id_service: 5, code: 'PROD-COUP', libelle: 'Atelier Coupe / Couture', responsable: 'Nour Ben Ali', effectif: 8, parent_id: 2 },
  { id_service: 6, code: 'COM', libelle: 'Commerce & Ventes', responsable: 'Fatma Trabelsi', effectif: 6, parent_id: 1 },
  { id_service: 7, code: 'COM-B2B', libelle: 'B2B Export', responsable: 'Sami Khemiri', effectif: 3, parent_id: 6 },
  { id_service: 8, code: 'COM-B2C', libelle: 'B2C & E-commerce', responsable: 'Ines Hamdi', effectif: 3, parent_id: 6 },
  { id_service: 9, code: 'ADM', libelle: 'Administration & RH', responsable: 'Wafa Bouazizi', effectif: 4, parent_id: 1 },
  { id_service: 10, code: 'ADM-COMPTA', libelle: 'Comptabilité', responsable: 'Wafa Bouazizi', effectif: 2, parent_id: 9 },
  { id_service: 11, code: 'ADM-RH', libelle: 'Ressources Humaines', responsable: 'Slim Bouzid', effectif: 2, parent_id: 9 },
];

// Grille salariale JORT N°49 — extrait convention textile Tunisie 2024
const MOCK_FONCTIONS: Fonction[] = [
  { id_fonction: 1, libelle: 'Ouvrier tissage', categorie: 'Ouvrier', coefficient_convention: 'I-1', salaire_min_dt: 458.24, salaire_max_dt: 520, smig_reference: true },
  { id_fonction: 2, libelle: 'Ouvrier finition', categorie: 'Ouvrier', coefficient_convention: 'I-2', salaire_min_dt: 458.24, salaire_max_dt: 540, smig_reference: true },
  { id_fonction: 3, libelle: 'Ouvrier qualifié tissage', categorie: 'Ouvrier qualifié', coefficient_convention: 'II-1', salaire_min_dt: 580, salaire_max_dt: 720, smig_reference: false },
  { id_fonction: 4, libelle: 'Ouvrier qualifié couture', categorie: 'Ouvrier qualifié', coefficient_convention: 'II-2', salaire_min_dt: 620, salaire_max_dt: 780, smig_reference: false },
  { id_fonction: 5, libelle: 'Conducteur machine', categorie: 'Ouvrier hautement qualifié', coefficient_convention: 'III-1', salaire_min_dt: 720, salaire_max_dt: 950, smig_reference: false },
  { id_fonction: 6, libelle: 'Régleur mécanique', categorie: 'Ouvrier hautement qualifié', coefficient_convention: 'III-2', salaire_min_dt: 820, salaire_max_dt: 1050, smig_reference: false },
  { id_fonction: 7, libelle: 'Contremaître tissage', categorie: 'Maîtrise', coefficient_convention: 'IV-1', salaire_min_dt: 1050, salaire_max_dt: 1350, smig_reference: false },
  { id_fonction: 8, libelle: 'Contrôleur qualité', categorie: 'Maîtrise', coefficient_convention: 'IV-2', salaire_min_dt: 950, salaire_max_dt: 1200, smig_reference: false },
  { id_fonction: 9, libelle: 'Chef atelier', categorie: 'Maîtrise supérieure', coefficient_convention: 'IV-3', salaire_min_dt: 1350, salaire_max_dt: 1650, smig_reference: false },
  { id_fonction: 10, libelle: 'Cadre commercial', categorie: 'Cadre', coefficient_convention: 'V-1', salaire_min_dt: 1650, salaire_max_dt: 2200, smig_reference: false },
  { id_fonction: 11, libelle: 'Cadre supérieur', categorie: 'Cadre supérieur', coefficient_convention: 'V-3', salaire_min_dt: 2200, salaire_max_dt: 3800, smig_reference: false },
];

const MOCK_EQUIPES: Equipe[] = [
  { id_equipe: 1, libelle: 'Équipe Tissage matin', atelier: 'Tissage', id_chef: 1002, chef_nom: 'Hedi Sghaier', effectif: 9 },
  { id_equipe: 2, libelle: 'Équipe Tissage après-midi', atelier: 'Tissage', id_chef: 1003, chef_nom: 'Karim Bouazizi', effectif: 9 },
  { id_equipe: 3, libelle: 'Équipe Finition A', atelier: 'Finition', id_chef: 1006, chef_nom: 'Amel Ferchichi', effectif: 6 },
  { id_equipe: 4, libelle: 'Équipe Finition B', atelier: 'Finition', id_chef: 1008, chef_nom: 'Ines Hamdi', effectif: 6 },
  { id_equipe: 5, libelle: 'Équipe Coupe', atelier: 'Coupe', id_chef: 1005, chef_nom: 'Nour Ben Ali', effectif: 4 },
  { id_equipe: 6, libelle: 'Équipe Couture', atelier: 'Coupe', id_chef: 1009, chef_nom: 'Wafa Bouazizi', effectif: 4 },
];

const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

// ═══════════════════════════════════════════════════════════════════════
// Composant récursif — arbre des services
// ═══════════════════════════════════════════════════════════════════════
const ServiceNode: React.FC<{ node: Service; children: Service[]; all: Service[]; level: number }> = ({
  node,
  children,
  all,
  level,
}) => {
  const childrenOf = (id: number) => all.filter((s) => s.parent_id === id);
  const colors = ['#C8663D', '#4A5D75', '#7A8C6A', '#C89B3C', '#B57B7B'];
  const c = colors[level % colors.length];

  return (
    <div style={{ marginLeft: level === 0 ? 0 : 32, position: 'relative' }}>
      <div
        className="rounded-lg p-4 mb-3 border-l-4 shadow-sm bg-white flex flex-col"
        style={{ borderLeftColor: c, borderColor: '#EDE3CE' }}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs font-mono text-[#9B8874]">{node.code}</div>
            <div className="text-base font-semibold" style={{ color: c, fontFamily: 'Fraunces, serif' }}>
              {node.libelle}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#9B8874]">Responsable</div>
            <div className="text-sm font-medium text-[#2F1F12]">{node.responsable || '—'}</div>
          </div>
          <div className="text-right ml-4">
            <div className="text-xs text-[#9B8874]">Effectif</div>
            <div className="text-lg font-bold" style={{ color: c }}>
              {node.effectif}
            </div>
          </div>
        </div>
      </div>
      {children.map((child) => (
        <ServiceNode key={child.id_service} node={child} children={childrenOf(child.id_service)} all={all} level={level + 1} />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════

const StructureOrga: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [fonctions, setFonctions] = useState<Fonction[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [sRes, fRes, eRes] = await Promise.allSettled([
        structureOrgaService.services(),
        structureOrgaService.fonctions(),
        structureOrgaService.equipes(),
      ]);
      if (cancelled) return;
      setServices(pickArray<Service>(sRes, 'services', MOCK_SERVICES));
      setFonctions(pickArray<Fonction>(fRes, 'fonctions', MOCK_FONCTIONS));
      setEquipes(pickArray<Equipe>(eRes, 'equipes', MOCK_EQUIPES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const racines = useMemo(() => services.filter((s) => !s.parent_id), [services]);
  const childrenOf = (id: number) => services.filter((s) => s.parent_id === id);

  const kpis = useMemo(
    () => ({
      totalServices: services.length,
      totalFonctions: fonctions.length,
      totalEquipes: equipes.length,
      effectifTotal: services.filter((s) => !childrenOf(s.id_service).length).reduce((sum, s) => sum + s.effectif, 0),
    }),
    [services, fonctions, equipes], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2F1F12] flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            <Network className="w-8 h-8 text-[#C8663D]" />
            Structure organisationnelle
          </h1>
          <p className="text-sm text-[#6B4E31] mt-1">
            Services · Fonctions · Équipes &middot; §11bis.3
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Services" value={kpis.totalServices} icon={<Building2 className="w-5 h-5" />} color="terracotta" />
          <KpiCard label="Fonctions" value={kpis.totalFonctions} icon={<Briefcase className="w-5 h-5" />} color="indigo" />
          <KpiCard label="Équipes" value={kpis.totalEquipes} icon={<Users className="w-5 h-5" />} color="sage" />
          <KpiCard label="Effectif total" value={kpis.effectifTotal} icon={<UserCheck className="w-5 h-5" />} color="warning" />
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-[#EDE3CE]">
          {(
            [
              { k: 'services', l: 'Services (org-chart)', i: <Building2 className="w-4 h-4" /> },
              { k: 'fonctions', l: 'Fonctions (grille salariale)', i: <Briefcase className="w-4 h-4" /> },
              { k: 'equipes', l: 'Équipes (ateliers)', i: <Layers className="w-4 h-4" /> },
            ] as { k: TabKey; l: string; i: React.ReactNode }[]
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-4 py-2.5 font-medium text-sm inline-flex items-center gap-2 border-b-2 transition-colors ${
                tab === t.k
                  ? 'border-[#C8663D] text-[#C8663D]'
                  : 'border-transparent text-[#6B4E31] hover:text-[#2F1F12]'
              }`}
            >
              {t.i}
              {t.l}
            </button>
          ))}
        </div>

        {tab === 'services' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-6">
            {racines.map((r) => (
              <ServiceNode key={r.id_service} node={r} children={childrenOf(r.id_service)} all={services} level={0} />
            ))}
          </div>
        )}

        {tab === 'fonctions' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] overflow-hidden">
            <div className="p-4 bg-[#F5EFE5] border-b border-[#EDE3CE]">
              <div className="text-sm font-semibold text-[#6B4E31]">
                Grille salariale — Convention Collective Nationale Textile & Habillement · JORT N°49 (2024)
              </div>
              <div className="text-xs text-[#9B8874] mt-1">
                SMIG 40h : 458,240 DT/mois &middot; SMIG 48h : 528,320 DT/mois
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FDF2ED] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                  <th className="px-4 py-3">Coefficient</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Libellé fonction</th>
                  <th className="px-4 py-3 text-right">Salaire min (DT)</th>
                  <th className="px-4 py-3 text-right">Salaire max (DT)</th>
                  <th className="px-4 py-3">Réf.</th>
                </tr>
              </thead>
              <tbody>
                {fonctions.map((f) => (
                  <tr key={f.id_fonction} className="border-t border-[#EDE3CE] hover:bg-[#FBF8F3] group">
                    <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">{f.coefficient_convention}</td>
                    <td className="px-4 py-3 text-[#6B4E31]">{f.categorie}</td>
                    <td className="px-4 py-3 font-medium">{f.libelle}</td>
                    <td className="px-4 py-3 font-mono text-right">
                      {f.salaire_min_dt.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                    </td>
                    <td className="px-4 py-3 font-mono text-right">
                      {f.salaire_max_dt.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                    </td>
                    <td className="px-4 py-3">
                      {f.smig_reference && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FBF3E0] text-[#8A6412] border border-[#C89B3C]">
                          SMIG
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'equipes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipes.map((e) => (
              <div key={e.id_equipe} className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-[#9B8874] uppercase tracking-wide">
                      Atelier · {e.atelier || 'Général'}
                    </div>
                    <div className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, serif', color: '#C8663D' }}>
                      {e.libelle}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#9B8874]">Effectif</div>
                    <div className="text-2xl font-bold text-[#4A5D75]">{e.effectif}</div>
                  </div>
                </div>
                <div className="bg-[#EEF4F0] rounded p-3 text-sm">
                  <div className="text-xs text-[#4A6C5B] mb-1">Chef d'équipe</div>
                  <div className="font-medium text-[#2F1F12]">{e.chef_nom || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StructureOrga;
