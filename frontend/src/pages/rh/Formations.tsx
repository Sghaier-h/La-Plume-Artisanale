import React, { useEffect, useMemo, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Calendar as CalendarIcon,
  List as ListIcon,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import { formationsService, Formation, ObligationTFP } from '../../services/rhApi';

const MOCK_FORMATIONS: Formation[] = [
  {
    id_formation: 1,
    intitule: 'Sécurité machines textile',
    organisme_nom: 'CETTEX Monastir',
    organisme_type: 'externe',
    cout_dt: 1200,
    nb_participants: 8,
    date_debut: new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10),
    date_fin: new Date(Date.now() - 28 * 86400_000).toISOString().slice(0, 10),
    obligation_tfp: 'obligatoire',
    duree_heures: 16,
    certifiante: true,
    domaine: 'Sécurité',
    statut: 'terminee',
  },
  {
    id_formation: 2,
    intitule: 'Nouveau métier à tisser Picanol OMNIplus',
    organisme_nom: 'Formateur interne — Hedi Sghaier',
    organisme_type: 'interne',
    cout_dt: 0,
    nb_participants: 4,
    date_debut: new Date(Date.now() + 5 * 86400_000).toISOString().slice(0, 10),
    date_fin: new Date(Date.now() + 12 * 86400_000).toISOString().slice(0, 10),
    obligation_tfp: 'volontaire',
    duree_heures: 40,
    certifiante: false,
    domaine: 'Technique',
    statut: 'planifiee',
  },
  {
    id_formation: 3,
    intitule: 'Contrôle qualité tissage — méthode 4 points',
    organisme_nom: 'AFT Formation',
    organisme_type: 'externe',
    cout_dt: 850,
    nb_participants: 3,
    date_debut: new Date(Date.now() + 20 * 86400_000).toISOString().slice(0, 10),
    date_fin: new Date(Date.now() + 22 * 86400_000).toISOString().slice(0, 10),
    obligation_tfp: 'obligatoire',
    duree_heures: 16,
    certifiante: true,
    domaine: 'Qualité',
    statut: 'planifiee',
  },
  {
    id_formation: 4,
    intitule: 'Management d\'équipe',
    organisme_nom: 'IACE Tunis',
    organisme_type: 'externe',
    cout_dt: 1800,
    nb_participants: 5,
    date_debut: new Date(Date.now() - 5 * 86400_000).toISOString().slice(0, 10),
    date_fin: new Date(Date.now() + 2 * 86400_000).toISOString().slice(0, 10),
    obligation_tfp: 'volontaire',
    duree_heures: 24,
    certifiante: true,
    domaine: 'Management',
    statut: 'en_cours',
  },
  {
    id_formation: 5,
    intitule: 'Anglais commercial B2B',
    organisme_nom: 'British Council',
    organisme_type: 'externe',
    cout_dt: 2400,
    nb_participants: 4,
    date_debut: new Date(Date.now() + 60 * 86400_000).toISOString().slice(0, 10),
    date_fin: new Date(Date.now() + 120 * 86400_000).toISOString().slice(0, 10),
    obligation_tfp: 'volontaire',
    duree_heures: 60,
    certifiante: false,
    domaine: 'Langues',
    statut: 'planifiee',
  },
];

const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

// Budget TFP annuel : 2% masse salariale (obligation légale Tunisie)
const BUDGET_TFP_ANNUEL = 38450 * 12 * 0.02; // ≈ 9228 DT

const Formations: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Formation | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([formationsService.list()]);
      if (cancelled) return;
      setFormations(pickArray<Formation>(res, 'formations', MOCK_FORMATIONS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return formations.filter((f) => {
      if (!s) return true;
      return `${f.intitule} ${f.organisme_nom} ${f.domaine || ''}`.toLowerCase().includes(s);
    });
  }, [formations, search]);

  const kpis = useMemo(() => {
    const annee = new Date().getFullYear();
    const anneeF = formations.filter((f) => f.date_debut.startsWith(String(annee)));
    const totalCout = anneeF.reduce((s, f) => s + Number(f.cout_dt || 0), 0);
    const totalParticipants = anneeF.reduce((s, f) => s + f.nb_participants, 0);
    const enCours = formations.filter((f) => f.statut === 'en_cours').length;
    const planifiees = formations.filter((f) => f.statut === 'planifiee').length;
    return { totalCout, totalParticipants, enCours, planifiees, budgetRestant: BUDGET_TFP_ANNUEL - totalCout };
  }, [formations]);

  const openNew = () => {
    setEditing({
      id_formation: 0,
      intitule: '',
      organisme_nom: '',
      organisme_type: 'externe',
      cout_dt: 0,
      nb_participants: 1,
      date_debut: new Date().toISOString().slice(0, 10),
      date_fin: new Date(Date.now() + 86400_000).toISOString().slice(0, 10),
      obligation_tfp: 'volontaire',
      duree_heures: 8,
      certifiante: false,
      statut: 'planifiee',
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!editing) return;
    if (editing.id_formation) {
      await formationsService.update(editing.id_formation, editing).catch(() => {});
      setFormations((prev) => prev.map((f) => (f.id_formation === editing.id_formation ? editing : f)));
    } else {
      const created = { ...editing, id_formation: Math.max(0, ...formations.map((f) => f.id_formation)) + 1 };
      await formationsService.create(created).catch(() => {});
      setFormations((prev) => [created, ...prev]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer cette formation ?')) return;
    await formationsService.remove(id).catch(() => {});
    setFormations((prev) => prev.filter((f) => f.id_formation !== id));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const pctBudget = Math.min(100, (kpis.totalCout / BUDGET_TFP_ANNUEL) * 100);

  return (
    <div className="min-h-screen bg-[#FBF8F3] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#2F1F12] flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              <GraduationCap className="w-8 h-8 text-[#C8663D]" />
              Formations
            </h1>
            <p className="text-sm text-[#6B4E31] mt-1">
              Plan formation, obligation TFP 2%, calendrier &middot; §11bis.10
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#B85528] font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle formation
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Coût annuel (DT)"
            value={kpis.totalCout.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            color="terracotta"
          />
          <KpiCard label="Participants (année)" value={kpis.totalParticipants} color="indigo" />
          <KpiCard label="En cours" value={kpis.enCours} icon={<Clock className="w-5 h-5" />} color="warning" />
          <KpiCard label="Planifiées" value={kpis.planifiees} icon={<CalendarIcon className="w-5 h-5" />} color="sage" />
        </div>

        {/* Budget TFP */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-sm font-semibold text-[#2F1F12]">Budget TFP annuel (2% masse salariale)</div>
              <div className="text-xs text-[#9B8874]">
                Utilisé : {kpis.totalCout.toLocaleString('fr-FR')} DT / {BUDGET_TFP_ANNUEL.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} DT
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#9B8874]">Reste disponible</div>
              <div className="text-lg font-bold text-[#4A6C5B]">
                {kpis.budgetRestant.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} DT
              </div>
            </div>
          </div>
          <div className="h-3 bg-[#F5EFE5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pctBudget}%`,
                background: pctBudget > 90 ? '#B84A2F' : pctBudget > 60 ? '#C89B3C' : '#7A8C6A',
              }}
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1 bg-[#F5EFE5] rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded text-sm font-medium inline-flex items-center gap-1 ${
                  view === 'list' ? 'bg-white shadow text-[#C8663D]' : 'text-[#6B4E31]'
                }`}
              >
                <ListIcon className="w-4 h-4" /> Liste
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 rounded text-sm font-medium inline-flex items-center gap-1 ${
                  view === 'calendar' ? 'bg-white shadow text-[#C8663D]' : 'text-[#6B4E31]'
                }`}
              >
                <CalendarIcon className="w-4 h-4" /> Calendrier
              </button>
            </div>
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8874]" />
              <input
                type="text"
                placeholder="Rechercher (intitulé, organisme...)"
                className="pl-9 pr-3 py-2 w-full border border-[#DFD3B8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8663D]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {view === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F5EFE5] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                    <th className="px-4 py-3">Intitulé</th>
                    <th className="px-4 py-3">Organisme</th>
                    <th className="px-4 py-3">Domaine</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3 text-right">Heures</th>
                    <th className="px-4 py-3 text-right">Coût (DT)</th>
                    <th className="px-4 py-3 text-right">Part.</th>
                    <th className="px-4 py-3">TFP</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-[#9B8874]">
                        Aucune formation
                      </td>
                    </tr>
                  ) : (
                    filtered.map((f) => (
                      <tr key={f.id_formation} className="border-t border-[#EDE3CE] hover:bg-[#FBF8F3]">
                        <td className="px-4 py-3">
                          <div className="font-medium">{f.intitule}</div>
                          {f.certifiante && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#4A6C5B] mt-1">
                              <CheckCircle2 className="w-3 h-3" /> Certifiante
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="text-[#6B4E31]">{f.organisme_nom}</div>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold mt-1 ${
                              f.organisme_type === 'interne'
                                ? 'bg-[#EEF4F0] text-[#4A6C5B]'
                                : 'bg-[#EDF0F5] text-[#3B4E68]'
                            }`}
                          >
                            {f.organisme_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#6B4E31]">{f.domaine || '—'}</td>
                        <td className="px-4 py-3 text-xs">
                          <div>{f.date_debut}</div>
                          <div className="text-[#9B8874]">→ {f.date_fin}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{f.duree_heures}h</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">
                          {f.cout_dt.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{f.nb_participants}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              f.obligation_tfp === 'obligatoire'
                                ? 'bg-[#FDF2ED] text-[#C8663D] border-[#C8663D]'
                                : 'bg-[#F5EFE5] text-[#6B4E31] border-[#DFD3B8]'
                            }`}
                          >
                            {f.obligation_tfp}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              f.statut === 'terminee'
                                ? 'bg-[#EEF4F0] text-[#4A6C5B] border-[#7A8C6A]'
                                : f.statut === 'en_cours'
                                ? 'bg-[#FBF3E0] text-[#8A6412] border-[#C89B3C]'
                                : f.statut === 'planifiee'
                                ? 'bg-[#EDF0F5] text-[#3B4E68] border-[#4A5D75]'
                                : 'bg-[#FBEBE4] text-[#B84A2F] border-[#B84A2F]'
                            }`}
                          >
                            {f.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditing(f);
                                setShowForm(true);
                              }}
                              className="p-1.5 rounded hover:bg-[#FDF2ED]"
                            >
                              <Pencil className="w-4 h-4 text-[#C8663D]" />
                            </button>
                            <button
                              onClick={() => remove(f.id_formation)}
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
        )}

        {view === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-6">
            <div className="text-sm font-semibold text-[#6B4E31] mb-4">
              Calendrier des formations à venir (30 prochains jours)
            </div>
            <div className="space-y-2">
              {filtered
                .filter((f) => {
                  const debut = new Date(f.date_debut).getTime();
                  return debut >= Date.now() - 30 * 86400_000 && debut <= Date.now() + 90 * 86400_000;
                })
                .sort((a, b) => (a.date_debut > b.date_debut ? 1 : -1))
                .map((f) => (
                  <div
                    key={f.id_formation}
                    className="flex items-center gap-4 p-3 rounded-lg border border-[#EDE3CE] hover:bg-[#FDF2ED]/30"
                  >
                    <div className="w-16 text-center">
                      <div className="text-xs text-[#9B8874]">{new Date(f.date_debut).toLocaleString('fr-FR', { month: 'short' })}</div>
                      <div className="text-xl font-bold text-[#C8663D]">
                        {new Date(f.date_debut).getDate()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{f.intitule}</div>
                      <div className="text-xs text-[#6B4E31]">
                        {f.organisme_nom} · {f.duree_heures}h · {f.nb_participants} part.
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#9B8874]">Coût</div>
                      <div className="font-mono font-semibold">{f.cout_dt} DT</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal formulaire */}
      {showForm && editing && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-[#EDE3CE]">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                {editing.id_formation ? 'Modifier' : 'Nouvelle'} formation
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 text-sm">
              <label className="col-span-2">
                <span className="text-xs text-[#6B4E31]">Intitulé</span>
                <input
                  type="text"
                  value={editing.intitule}
                  onChange={(e) => setEditing({ ...editing, intitule: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Organisme</span>
                <input
                  type="text"
                  value={editing.organisme_nom}
                  onChange={(e) => setEditing({ ...editing, organisme_nom: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Type organisme</span>
                <select
                  value={editing.organisme_type}
                  onChange={(e) =>
                    setEditing({ ...editing, organisme_type: e.target.value as 'interne' | 'externe' })
                  }
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                >
                  <option value="interne">Interne</option>
                  <option value="externe">Externe</option>
                </select>
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Domaine</span>
                <input
                  type="text"
                  value={editing.domaine || ''}
                  onChange={(e) => setEditing({ ...editing, domaine: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Obligation TFP</span>
                <select
                  value={editing.obligation_tfp}
                  onChange={(e) =>
                    setEditing({ ...editing, obligation_tfp: e.target.value as ObligationTFP })
                  }
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                >
                  <option value="obligatoire">Obligatoire</option>
                  <option value="volontaire">Volontaire</option>
                </select>
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Date début</span>
                <input
                  type="date"
                  value={editing.date_debut}
                  onChange={(e) => setEditing({ ...editing, date_debut: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Date fin</span>
                <input
                  type="date"
                  value={editing.date_fin}
                  onChange={(e) => setEditing({ ...editing, date_fin: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Durée (heures)</span>
                <input
                  type="number"
                  value={editing.duree_heures}
                  onChange={(e) => setEditing({ ...editing, duree_heures: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Coût (DT)</span>
                <input
                  type="number"
                  step="0.001"
                  value={editing.cout_dt}
                  onChange={(e) => setEditing({ ...editing, cout_dt: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Nb participants</span>
                <input
                  type="number"
                  value={editing.nb_participants}
                  onChange={(e) => setEditing({ ...editing, nb_participants: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="col-span-2 inline-flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={editing.certifiante}
                  onChange={(e) => setEditing({ ...editing, certifiante: e.target.checked })}
                />
                <span className="text-sm">Formation certifiante</span>
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
                onClick={save}
                className="px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#B85528] text-sm font-medium"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formations;
