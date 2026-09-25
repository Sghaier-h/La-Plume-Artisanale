import React, { useEffect, useMemo, useState } from 'react';
import {
  FileSignature,
  Plus,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  FileText,
  Trash2,
  Pencil,
  X,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import StatutContratBadge from '../../components/rh/StatutContratBadge';
import {
  contratsService,
  ContratTravail,
  TypeContrat,
  StatutContrat,
} from '../../services/rhApi';

// ═══════════════════════════════════════════════════════════════════════
// MOCK DATA (fallback si API absente)
// ═══════════════════════════════════════════════════════════════════════

const isoAgo = (days: number) =>
  new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);
const isoIn = (days: number) =>
  new Date(Date.now() + days * 86400_000).toISOString().slice(0, 10);

const MOCK_CONTRATS: ContratTravail[] = [
  {
    id_contrat: 1,
    numero_contrat: 'CT-26-0001',
    id_employe: 1001,
    employe_prenom: 'Salima',
    employe_nom: 'Guelbi',
    fonction: 'Directrice générale',
    type_contrat: 'CDI',
    date_debut: '2018-01-15',
    salaire_base_dt: 2450,
    coefficient_convention: 'V-3',
    categorie_convention: 'Cadre supérieur',
    statut: 'actif',
  },
  {
    id_contrat: 2,
    numero_contrat: 'CT-26-0002',
    id_employe: 1002,
    employe_prenom: 'Hedi',
    employe_nom: 'Sghaier',
    fonction: 'Contremaître tissage',
    type_contrat: 'CDI',
    date_debut: '2019-03-01',
    salaire_base_dt: 1180,
    coefficient_convention: 'IV-1',
    categorie_convention: 'Maîtrise',
    statut: 'actif',
  },
  {
    id_contrat: 3,
    numero_contrat: 'CT-26-0003',
    id_employe: 1003,
    employe_prenom: 'Fatma',
    employe_nom: 'Trabelsi',
    fonction: 'Ouvrière tissage',
    type_contrat: 'CDI',
    date_debut: '2022-05-10',
    salaire_base_dt: 620,
    coefficient_convention: 'II-1',
    categorie_convention: 'Ouvrier qualifié',
    statut: 'actif',
  },
  {
    id_contrat: 4,
    numero_contrat: 'CT-26-0004',
    id_employe: 1004,
    employe_prenom: 'Karim',
    employe_nom: 'Bouazizi',
    fonction: 'Conducteur machine',
    type_contrat: 'CDD',
    date_debut: isoAgo(340),
    date_fin: isoIn(25),
    periode_essai_jours: 30,
    date_fin_essai: isoAgo(310),
    salaire_base_dt: 720,
    coefficient_convention: 'II-2',
    categorie_convention: 'Ouvrier qualifié',
    statut: 'actif',
  },
  {
    id_contrat: 5,
    numero_contrat: 'CT-26-0005',
    id_employe: 1005,
    employe_prenom: 'Nour',
    employe_nom: 'Ben Ali',
    fonction: 'Régleur mécanique',
    type_contrat: 'CDD',
    date_debut: isoAgo(50),
    date_fin: isoIn(315),
    periode_essai_jours: 45,
    date_fin_essai: isoIn(-5),
    salaire_base_dt: 890,
    coefficient_convention: 'III-1',
    categorie_convention: 'Ouvrier hautement qualifié',
    statut: 'en_essai',
  },
  {
    id_contrat: 6,
    numero_contrat: 'CT-25-0089',
    id_employe: 1006,
    employe_prenom: 'Amel',
    employe_nom: 'Ferchichi',
    fonction: 'Stagiaire qualité',
    type_contrat: 'STAGE',
    date_debut: isoAgo(120),
    date_fin: isoAgo(15),
    salaire_base_dt: 300,
    statut: 'expire',
  },
  {
    id_contrat: 7,
    numero_contrat: 'CT-25-0072',
    id_employe: 1007,
    employe_prenom: 'Sami',
    employe_nom: 'Khemiri',
    fonction: 'Ouvrier finition',
    type_contrat: 'CDI',
    date_debut: '2020-09-01',
    date_rupture: isoAgo(60),
    motif_rupture: 'Rupture conventionnelle',
    salaire_base_dt: 680,
    statut: 'rompu',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════

type FiltreStatut = 'tous' | StatutContrat;
type FiltreType = 'tous' | TypeContrat;

const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const ContratsTravail: React.FC = () => {
  const [contrats, setContrats] = useState<ContratTravail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('tous');
  const [filtreType, setFiltreType] = useState<FiltreType>('tous');
  const [editing, setEditing] = useState<ContratTravail | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAvenant, setShowAvenant] = useState<ContratTravail | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([contratsService.list()]);
      if (cancelled) return;
      setContrats(pickArray<ContratTravail>(res, 'contrats', MOCK_CONTRATS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Alertes fin essai / fin CDD à 30j
  const alertes = useMemo(() => {
    const nowTs = Date.now();
    const in30j = nowTs + 30 * 86400_000;
    const finCDD = contrats.filter((c) => {
      if (c.type_contrat !== 'CDD' || !c.date_fin) return false;
      const ts = new Date(c.date_fin).getTime();
      return ts >= nowTs && ts <= in30j;
    });
    const finEssai = contrats.filter((c) => {
      if (!c.date_fin_essai || c.statut === 'rompu' || c.statut === 'expire') return false;
      const ts = new Date(c.date_fin_essai).getTime();
      return ts >= nowTs - 3 * 86400_000 && ts <= in30j;
    });
    return { finCDD, finEssai };
  }, [contrats]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return contrats.filter((c) => {
      if (filtreStatut !== 'tous' && c.statut !== filtreStatut) return false;
      if (filtreType !== 'tous' && c.type_contrat !== filtreType) return false;
      if (!s) return true;
      const hay = `${c.numero_contrat} ${c.employe_nom || ''} ${c.employe_prenom || ''} ${c.fonction || ''}`.toLowerCase();
      return hay.includes(s);
    });
  }, [contrats, search, filtreStatut, filtreType]);

  const kpis = useMemo(() => {
    const total = contrats.length;
    const actifs = contrats.filter((c) => c.statut === 'actif' || c.statut === 'en_essai').length;
    const cdi = contrats.filter((c) => c.type_contrat === 'CDI' && (c.statut === 'actif' || c.statut === 'en_essai')).length;
    const cdd = contrats.filter((c) => c.type_contrat === 'CDD' && (c.statut === 'actif' || c.statut === 'en_essai')).length;
    return { total, actifs, cdi, cdd };
  }, [contrats]);

  const openNew = () => {
    setEditing({
      id_contrat: 0,
      numero_contrat: `CT-${String(new Date().getFullYear()).slice(2)}-${String(contrats.length + 1).padStart(4, '0')}`,
      id_employe: 0,
      type_contrat: 'CDI',
      date_debut: new Date().toISOString().slice(0, 10),
      salaire_base_dt: 458.24,
      statut: 'a_venir',
    });
    setShowForm(true);
  };

  const saveContrat = async () => {
    if (!editing) return;
    try {
      if (editing.id_contrat && editing.id_contrat > 0) {
        await contratsService.update(editing.id_contrat, editing).catch(() => {
          /* mock */
        });
        setContrats((prev) =>
          prev.map((c) => (c.id_contrat === editing.id_contrat ? editing : c)),
        );
      } else {
        const created = { ...editing, id_contrat: Math.max(0, ...contrats.map((c) => c.id_contrat)) + 1 };
        await contratsService.create(created).catch(() => {
          /* mock */
        });
        setContrats((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditing(null);
    } catch (e: any) {
      setError(e?.message || 'Erreur enregistrement contrat');
    }
  };

  const removeContrat = async (id: number) => {
    if (!window.confirm('Supprimer ce contrat ?')) return;
    await contratsService.remove(id).catch(() => {
      /* mock */
    });
    setContrats((prev) => prev.filter((c) => c.id_contrat !== id));
  };

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
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#2F1F12] flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              <FileSignature className="w-8 h-8 text-[#C8663D]" />
              Contrats de travail
            </h1>
            <p className="text-sm text-[#6B4E31] mt-1">
              Suivi CDI / CDD / stages, période d'essai, alertes fin de contrat &middot; §11bis.2
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#B85528] transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau contrat
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Contrats totaux" value={kpis.total} icon={<FileText className="w-5 h-5" />} color="indigo" />
          <KpiCard label="Actifs" value={kpis.actifs} icon={<FileSignature className="w-5 h-5" />} color="sage" />
          <KpiCard label="CDI" value={kpis.cdi} color="terracotta" />
          <KpiCard label="CDD & autres" value={kpis.cdd} color="warning" />
        </div>

        {/* Alertes */}
        {(alertes.finCDD.length > 0 || alertes.finEssai.length > 0) && (
          <div className="bg-[#FBF3E0] border border-[#C89B3C] rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-[#8A6412] mt-0.5" />
              <div className="font-semibold text-[#8A6412]">
                Alertes contrats — action requise sous 30 jours
              </div>
            </div>
            <ul className="ml-7 text-sm text-[#6B4E31] space-y-1">
              {alertes.finCDD.map((c) => (
                <li key={`cdd-${c.id_contrat}`}>
                  <b>Fin de CDD</b> — {c.employe_prenom} {c.employe_nom} ({c.numero_contrat}) au{' '}
                  <b>{c.date_fin}</b>
                </li>
              ))}
              {alertes.finEssai.map((c) => (
                <li key={`essai-${c.id_contrat}`}>
                  <b>Fin de période d'essai</b> — {c.employe_prenom} {c.employe_nom} au{' '}
                  <b>{c.date_fin_essai}</b>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8874]" />
              <input
                type="text"
                placeholder="Rechercher (n° contrat, nom, fonction)"
                className="pl-9 pr-3 py-2 w-full border border-[#DFD3B8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8663D]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value as FiltreStatut)}
              className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white"
            >
              <option value="tous">Tous statuts</option>
              <option value="actif">Actif</option>
              <option value="en_essai">En essai</option>
              <option value="a_venir">À venir</option>
              <option value="expire">Expiré</option>
              <option value="rompu">Rompu</option>
            </select>
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value as FiltreType)}
              className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white"
            >
              <option value="tous">Tous types</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="STAGE">Stage</option>
              <option value="APPRENTISSAGE">Apprentissage</option>
              <option value="INTERIM">Intérim</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5EFE5] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                  <th className="px-4 py-3">N° contrat</th>
                  <th className="px-4 py-3">Employé</th>
                  <th className="px-4 py-3">Fonction</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Début</th>
                  <th className="px-4 py-3">Fin</th>
                  <th className="px-4 py-3">Salaire (DT)</th>
                  <th className="px-4 py-3">Coeff.</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-[#9B8874]">
                      Aucun contrat trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id_contrat} className="border-t border-[#EDE3CE] hover:bg-[#FDF2ED]/30">
                      <td className="px-4 py-3 font-mono text-xs text-[#4A5D75]">{c.numero_contrat}</td>
                      <td className="px-4 py-3 font-medium">
                        {c.employe_prenom} {c.employe_nom}
                      </td>
                      <td className="px-4 py-3 text-[#6B4E31]">{c.fonction || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EDF0F5] text-[#3B4E68] border border-[#4A5D75]/30">
                          {c.type_contrat}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{c.date_debut}</td>
                      <td className="px-4 py-3 text-xs">{c.date_fin || '—'}</td>
                      <td className="px-4 py-3 font-mono text-right">
                        {c.salaire_base_dt?.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-3 text-xs">{c.coefficient_convention || '—'}</td>
                      <td className="px-4 py-3">
                        <StatutContratBadge statut={c.statut} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setShowAvenant(c)}
                            title="Renouveler / avenant"
                            className="p-1.5 rounded hover:bg-[#FBF3E0]"
                          >
                            <RefreshCw className="w-4 h-4 text-[#8A6412]" />
                          </button>
                          <button
                            onClick={() => window.open(contratsService.pdfUrl(c.id_contrat), '_blank')}
                            title="Télécharger PDF"
                            className="p-1.5 rounded hover:bg-[#EDF0F5]"
                          >
                            <Download className="w-4 h-4 text-[#3B4E68]" />
                          </button>
                          <button
                            onClick={() => {
                              setEditing(c);
                              setShowForm(true);
                            }}
                            title="Modifier"
                            className="p-1.5 rounded hover:bg-[#FDF2ED]"
                          >
                            <Pencil className="w-4 h-4 text-[#C8663D]" />
                          </button>
                          <button
                            onClick={() => removeContrat(c.id_contrat)}
                            title="Supprimer"
                            className="p-1.5 rounded hover:bg-[#FBEBE4]"
                          >
                            <Trash2 className="w-4 h-4 text-[#B84A2F]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal formulaire */}
      {showForm && editing && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b border-[#EDE3CE]">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                {editing.id_contrat ? 'Modifier contrat' : 'Nouveau contrat'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 text-sm">
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">N° contrat</span>
                <input
                  type="text"
                  value={editing.numero_contrat}
                  onChange={(e) => setEditing({ ...editing, numero_contrat: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Type</span>
                <select
                  value={editing.type_contrat}
                  onChange={(e) =>
                    setEditing({ ...editing, type_contrat: e.target.value as TypeContrat })
                  }
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="STAGE">Stage</option>
                  <option value="APPRENTISSAGE">Apprentissage</option>
                  <option value="INTERIM">Intérim</option>
                </select>
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Prénom</span>
                <input
                  type="text"
                  value={editing.employe_prenom || ''}
                  onChange={(e) => setEditing({ ...editing, employe_prenom: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Nom</span>
                <input
                  type="text"
                  value={editing.employe_nom || ''}
                  onChange={(e) => setEditing({ ...editing, employe_nom: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-2">
                <span className="text-xs text-[#6B4E31]">Fonction</span>
                <input
                  type="text"
                  value={editing.fonction || ''}
                  onChange={(e) => setEditing({ ...editing, fonction: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Date début</span>
                <input
                  type="date"
                  value={editing.date_debut}
                  onChange={(e) => setEditing({ ...editing, date_debut: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Date fin (CDD)</span>
                <input
                  type="date"
                  value={editing.date_fin || ''}
                  onChange={(e) => setEditing({ ...editing, date_fin: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Période essai (jours)</span>
                <input
                  type="number"
                  value={editing.periode_essai_jours || 0}
                  onChange={(e) => setEditing({ ...editing, periode_essai_jours: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Salaire base (DT)</span>
                <input
                  type="number"
                  step="0.001"
                  value={editing.salaire_base_dt}
                  onChange={(e) => setEditing({ ...editing, salaire_base_dt: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Coefficient convention</span>
                <input
                  type="text"
                  placeholder="ex. II-1"
                  value={editing.coefficient_convention || ''}
                  onChange={(e) => setEditing({ ...editing, coefficient_convention: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Statut</span>
                <select
                  value={editing.statut}
                  onChange={(e) => setEditing({ ...editing, statut: e.target.value as StatutContrat })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                >
                  <option value="a_venir">À venir</option>
                  <option value="en_essai">En essai</option>
                  <option value="actif">Actif</option>
                  <option value="expire">Expiré</option>
                  <option value="rompu">Rompu</option>
                </select>
              </label>
            </div>
            <div className="p-4 border-t border-[#EDE3CE] flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#DFD3B8] rounded-lg text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={saveContrat}
                className="px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#B85528] text-sm font-medium"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal avenant */}
      {showAvenant && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAvenant(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                Renouveler / Avenant
              </h3>
              <button onClick={() => setShowAvenant(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#6B4E31] mb-4">
              Contrat <b>{showAvenant.numero_contrat}</b> — {showAvenant.employe_prenom}{' '}
              {showAvenant.employe_nom}
            </p>
            <div className="space-y-2 text-sm">
              <button
                onClick={async () => {
                  await contratsService
                    .renouveler(showAvenant.id_contrat, {
                      date_fin: isoIn(365),
                    })
                    .catch(() => {});
                  setShowAvenant(null);
                }}
                className="w-full px-3 py-2 bg-[#EEF4F0] hover:bg-[#DDE9E0] rounded text-left"
              >
                Renouveler pour 12 mois
              </button>
              <button
                onClick={async () => {
                  await contratsService.genererAvenant(showAvenant.id_contrat).catch(() => {});
                  setShowAvenant(null);
                }}
                className="w-full px-3 py-2 bg-[#FDF2ED] hover:bg-[#FBE3D5] rounded text-left"
              >
                Générer avenant PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratsTravail;
