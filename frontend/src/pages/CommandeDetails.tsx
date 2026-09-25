import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText, Package, Calendar, Clock, User, DollarSign, Truck, ShoppingCart, CheckCircle, X, AlertCircle, Cog, Factory, Boxes, Info, ArrowRight, PlayCircle, PauseCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { commandesService, clientsService, articlesService } from '../services/api';

// ── Types traçabilité ────────────────────────────────────────────────
interface OFLine {
  id_of: number;
  numero_of: string;
  statut: string;
  priorite?: string;
  quantite_a_produire: number;
  quantite_produite: number;
  avancement_pct: number;
  date_debut_prevue?: string;
  date_fin_prevue?: string;
  date_debut_reelle?: string;
  date_fin_reelle?: string;
  cout_estime?: number | null;
  cout_reel?: number | null;
  en_retard: boolean;
  jours_restants: number | null;
  machine: { id_machine: number; numero_machine: string; marque?: string } | null;
  operateur: { id_operateur: number; nom?: string; prenom?: string } | null;
}
interface ArticleCommandeLine {
  id_article_commande: number;
  id_article: number;
  code_article?: string;
  designation?: string;
  description_article?: string;
  ref_commerciale?: string;
  dimensions?: string;
  type_finition?: string;
  quantite_commandee: number;
  quantite_prise_stock: number;
  quantite_fabriquee: number;
  quantite_a_fabriquer: number;
  prix_unitaire_ht: number;
  remise: number;
  montant_ht: number;
  statut_ligne: string;
  statut_ligne_libelle: string;
  ofs: OFLine[];
}

const STATUT_COLORS: Record<string, string> = {
  a_traiter: 'var(--fg-muted)',
  stock_seul: 'var(--accent-indigo)',
  reservee_stock: 'var(--accent-indigo)',
  mixte: 'var(--accent-indigo)',
  en_fabrication: 'var(--accent-terracotta)',
  en_production: 'var(--accent-terracotta)',
  attente_reappro: 'var(--color-warning)',
  terminee: 'var(--color-success)',
  livree: 'var(--accent-sage)',
};

const OF_STATUT_LABEL: Record<string, string> = {
  planifie: 'Planifié',
  attribue: 'Attribué',
  en_cours: 'En cours',
  en_pause: 'En pause',
  suspendu: 'Suspendu',
  termine: 'Terminé',
  annule: 'Annulé',
};

// ── Types wizard stock/OF ─────────────────────────────────────────────
interface StockOption {
  code: 'stock_only' | 'mix' | 'fabrication_only' | 'attendre_reappro';
  libelle: string;
  faisable: boolean;
  recommandee?: boolean;
  note?: string;
}
interface MpRequise {
  id_mp: number; code_mp: string; designation: string;
  quantite_pour_qte: number; unite: string;
  stock_actuel: number; suffisant: boolean;
}
interface OfEstimation {
  temps_production_jours: number | null;
  cout_estime: number | null;
  machine_suggeree_id: number | null;
  machine_suggeree_numero: string | null;
  mp_requises: MpRequise[];
}
interface ArticleAnalyse {
  id_article_commande: number;
  id_article: number;
  code_article: string;
  designation: string;
  quantite_commandee: number;
  stock_disponible: number;
  stock_reserve: number;
  stock_utilisable: number;
  quantite_a_prendre_stock_max: number;
  quantite_a_fabriquer_min: number;
  options: StockOption[];
  of_estimation: OfEstimation;
  warnings: string[];
}
interface AnalyseData {
  commande: { id_commande: number; numero_commande: string; raison_sociale?: string; statut: string };
  articles: ArticleAnalyse[];
}
type ActionCode = StockOption['code'];
interface Decision {
  id_article_commande: number;
  action: ActionCode;
  quantite_prise_stock: number;
  quantite_a_fabriquer: number;
  id_machine?: number | null;
  priorite: string;
}

interface LigneCommande {
  id_article_commande?: number;
  id_article?: number;
  ref_commerciale?: string;
  description_article?: string;
  dimensions?: string;
  type_finition?: string;
  quantite_commandee: number;
  quantite_produite?: number;
  quantite_livree?: number;
  prix_unitaire: number;
  prix_total_ht?: number;
  remise?: number;
  personnalisation?: boolean;
  details_personnalisation?: string;
  date_livraison_prevue?: string;
  statut?: string;
  article?: any;
}

interface Commande {
  id_commande: number;
  numero_commande: string;
  id_client: number;
  client_nom?: string;
  client_raison_sociale?: string;
  ref_client?: string;
  num_commande_client?: string;
  date_commande: string;
  date_livraison_prevue?: string;
  date_envoie?: string;
  statut: string;
  priorite?: string;
  montant_total?: number;
  devise?: string;
  conditions_paiement?: string;
  adresse_livraison?: string;
  observations?: string;
  lignes?: LigneCommande[];
}

const CommandeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Wizard state ─────────────────────────────────────────────────
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [analyseLoading, setAnalyseLoading] = useState(false);
  const [analyse, setAnalyse] = useState<AnalyseData | null>(null);
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [submitting, setSubmitting] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [resultOfs, setResultOfs] = useState<any[] | null>(null);

  const openWizard = async () => {
    if (!commande) return;
    setWizardOpen(true);
    setWizardStep(1);
    setAnalyseLoading(true);
    setWizardError(null);
    try {
      const r = await commandesService.analyseStock(commande.id_commande);
      const data: AnalyseData = r.data?.data || r.data;
      setAnalyse(data);
      const init: Record<number, Decision> = {};
      data.articles.forEach(a => {
        const defaultOpt =
          a.options.find(o => o.recommandee && o.faisable)?.code ||
          a.options.find(o => o.faisable)?.code || 'fabrication_only';
        const qStock = defaultOpt === 'stock_only'
          ? Math.min(a.quantite_commandee, a.stock_utilisable)
          : defaultOpt === 'mix' ? a.quantite_a_prendre_stock_max
          : 0;
        init[a.id_article_commande] = {
          id_article_commande: a.id_article_commande,
          action: defaultOpt,
          quantite_prise_stock: qStock,
          quantite_a_fabriquer: Math.max(0, a.quantite_commandee - qStock),
          id_machine: a.of_estimation.machine_suggeree_id,
          priorite: 'normale',
        };
      });
      setDecisions(init);
    } catch (e: any) {
      setWizardError(e?.message || 'Erreur analyse stock');
    } finally {
      setAnalyseLoading(false);
    }
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setResultOfs(null);
  };

  const updateDecision = (idAC: number, patch: Partial<Decision>) => {
    setDecisions(prev => {
      const cur = prev[idAC];
      if (!cur) return prev;
      const art = analyse?.articles.find(a => a.id_article_commande === idAC);
      const next = { ...cur, ...patch };
      // Réajuster quantités selon action
      if (patch.action && art) {
        if (patch.action === 'stock_only') {
          next.quantite_prise_stock = Math.min(art.quantite_commandee, art.stock_utilisable);
          next.quantite_a_fabriquer = 0;
        } else if (patch.action === 'fabrication_only') {
          next.quantite_prise_stock = 0;
          next.quantite_a_fabriquer = art.quantite_commandee;
        } else if (patch.action === 'mix') {
          next.quantite_prise_stock = art.quantite_a_prendre_stock_max;
          next.quantite_a_fabriquer = Math.max(0, art.quantite_commandee - art.quantite_a_prendre_stock_max);
        } else if (patch.action === 'attendre_reappro') {
          next.quantite_prise_stock = 0;
          next.quantite_a_fabriquer = 0;
        }
      }
      // Slider stock => recalcul fab
      if (patch.quantite_prise_stock !== undefined && art) {
        next.quantite_a_fabriquer = Math.max(0, art.quantite_commandee - next.quantite_prise_stock);
      }
      return { ...prev, [idAC]: next };
    });
  };

  const confirmerChoix = async () => {
    if (!commande || !analyse) return;
    setSubmitting(true);
    setWizardError(null);
    try {
      const payload = Object.values(decisions);
      const r = await commandesService.executerChoix(commande.id_commande, payload);
      const data = r.data?.data || r.data;
      setResultOfs(data.ofs_crees || []);
      // refresh commande
      await loadCommande();
    } catch (e: any) {
      setWizardError(e?.response?.data?.message || e?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  // Totaux récap
  const recap = React.useMemo(() => {
    if (!analyse) return null;
    let totalStock = 0, totalFab = 0, ofsCount = 0, cout = 0, tempsMax = 0;
    analyse.articles.forEach(a => {
      const d = decisions[a.id_article_commande];
      if (!d) return;
      totalStock += Number(d.quantite_prise_stock || 0);
      totalFab += Number(d.quantite_a_fabriquer || 0);
      if (d.quantite_a_fabriquer > 0 && d.action !== 'attendre_reappro') {
        ofsCount++;
        const ratio = d.quantite_a_fabriquer / (a.quantite_a_fabriquer_min || a.quantite_commandee || 1);
        cout += (a.of_estimation.cout_estime || 0) * (isFinite(ratio) ? ratio : 1);
        tempsMax = Math.max(tempsMax, a.of_estimation.temps_production_jours || 0);
      }
    });
    return { totalStock, totalFab, ofsCount, cout, tempsMax };
  }, [analyse, decisions]);
  const [showOFModal, setShowOFModal] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [ofOverrides, setOfOverrides] = useState<Record<number, any>>({});
  const [ofLoading, setOfLoading] = useState(false);
  const [ofSubmitting, setOfSubmitting] = useState(false);

  const openGenerateOFs = async () => {
    if (!commande) return;
    setShowOFModal(true);
    setOfLoading(true);
    try {
      const r = await commandesService.previewOFs(commande.id_commande);
      setPreviewData(r.data?.data || r.data);
      setOfOverrides({});
    } catch (e: any) {
      alert('Erreur chargement preview OF: ' + (e?.response?.data?.message || e.message));
      setShowOFModal(false);
    } finally {
      setOfLoading(false);
    }
  };

  const updateOverride = (idAC: number, field: string, value: any) => {
    setOfOverrides(prev => ({ ...prev, [idAC]: { ...(prev[idAC] || { id_article_commande: idAC }), [field]: value } }));
  };

  const submitGenerateOFs = async () => {
    if (!commande) return;
    setOfSubmitting(true);
    try {
      const overrides = Object.values(ofOverrides);
      const r = await commandesService.generateOFs(commande.id_commande, { overrides });
      const payload = r.data?.data || r.data;
      alert(`${payload.count} OF créés avec succès`);
      setShowOFModal(false);
      await loadCommande();
    } catch (e: any) {
      alert('Erreur génération OF: ' + (e?.response?.data?.message || e.message));
    } finally {
      setOfSubmitting(false);
    }
  };

  // ── Traçabilité OF par ligne ─────────────────────────────────────────
  const [tracabilite, setTracabilite] = useState<{ articles_commande: ArticleCommandeLine[] } | null>(null);

  const loadTracabilite = async () => {
    if (!id) return;
    try {
      const r = await commandesService.getWithOFs(parseInt(id));
      const data = r.data?.data?.commande || r.data?.commande || r.data;
      setTracabilite(data ? { articles_commande: data.articles_commande || [] } : null);
    } catch (err) {
      console.warn('with-ofs load failed', err);
    }
  };

  useEffect(() => {
    loadCommande();
    loadTracabilite();
  }, [id]);

  // Socket.IO — refresh on production/OF events
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const socketUrl = (process.env.REACT_APP_SOCKET_URL as string) ||
      (window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:5000');
    let s: Socket | null = null;
    try {
      s = io(socketUrl, { auth: { token }, transports: ['websocket', 'polling'] });
      const refresh = () => loadTracabilite();
      s.on('of:created', refresh);
      s.on('of:updated', refresh);
      s.on('production:updated', refresh);
      s.on('commande:executee', refresh);
    } catch { /* silent */ }
    return () => { try { s?.close(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCommande = async () => {
    if (!id) {
      setError('ID de la commande manquant.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await commandesService.getCommande(parseInt(id));
      const data = response.data.data || response.data;
      setCommande(data);
    } catch (err: any) {
      console.error('Erreur chargement commande:', err);
      setError(`Impossible de charger la commande. Erreur: ${err.message || 'Inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!commande?.id_commande || !window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }
    try {
      // Note: deleteCommande n'est peut-être pas disponible
      alert('La suppression directe des commandes n\'est pas disponible. Utilisez la fonction Annuler dans la liste.');
      navigate('/commandes');
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'validee':
        return 'bg-green-100 text-green-800';
      case 'en_production':
        return 'bg-[#F5EFE5] text-[#4A5D75]';
      case 'livree':
        return 'bg-gray-100 text-gray-800';
      case 'annulee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPrioriteColor = (priorite?: string) => {
    switch (priorite) {
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'haute':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Erreur</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={loadCommande}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Réessayer
                </button>
                <Link
                  to="/commandes"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Retour à la liste
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Commande non trouvée.</p>
              <Link to="/commandes" className="text-[#C8663D] hover:text-[#a55231] mt-4 inline-block">
                Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalHT = commande.lignes?.reduce((sum, ligne) => {
    const prixUnitaire = ligne.prix_unitaire || 0;
    const quantite = ligne.quantite_commandee || 0;
    const remise = ligne.remise || 0;
    return sum + (prixUnitaire * quantite * (1 - remise / 100));
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="/commandes"
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Commande {commande.numero_commande}</h1>
                <p className="text-gray-600 mt-1">
                  Créée le {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {commande.statut === 'validee' && (
                <button
                  onClick={openWizard}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  title="Vérifier le stock et décider article par article"
                >
                  <Factory className="w-4 h-4" />
                  Analyser stock & fabriquer
                </button>
              )}
              <Link
                to={`/commandes?edit=${commande.id_commande}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#a55231]"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Informations commande */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Informations Commande
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Numéro:</span>
                  <p className="font-semibold">{commande.numero_commande}</p>
                </div>
                {commande.num_commande_client && (
                  <div>
                    <span className="text-sm text-gray-600">Num Commande Client:</span>
                    <p className="font-semibold">{commande.num_commande_client}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Statut:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatutColor(commande.statut)}`}>
                    {commande.statut}
                  </span>
                </div>
                {commande.priorite && (
                  <div>
                    <span className="text-sm text-gray-600">Priorité:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${getPrioriteColor(commande.priorite)}`}>
                      {commande.priorite}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Date Commande:</span>
                  <p className="font-semibold">{new Date(commande.date_commande).toLocaleDateString('fr-FR')}</p>
                </div>
                {commande.date_livraison_prevue && (
                  <div>
                    <span className="text-sm text-gray-600">Date Livraison Prévue:</span>
                    <p className="font-semibold">{new Date(commande.date_livraison_prevue).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {commande.date_envoie && (
                  <div>
                    <span className="text-sm text-gray-600">Date d'Envoie:</span>
                    <p className="font-semibold">{new Date(commande.date_envoie).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations client */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Client
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Nom:</span>
                  <p className="font-semibold">{commande.client_nom || commande.client_raison_sociale || 'N/A'}</p>
                </div>
                {commande.ref_client && (
                  <div>
                    <span className="text-sm text-gray-600">Référence Client:</span>
                    <p className="font-semibold">{commande.ref_client}</p>
                  </div>
                )}
                <Link
                  to={`/clients/${commande.id_client}`}
                  className="text-[#C8663D] hover:text-[#a55231] text-sm"
                >
                  Voir les détails du client →
                </Link>
              </div>
            </div>

            {/* Totaux */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Totaux
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Total HT:</span>
                  <p className="font-semibold text-lg">{totalHT.toFixed(2)} {commande.devise || 'TND'}</p>
                </div>
                {commande.montant_total && (
                  <div>
                    <span className="text-sm text-gray-600">Montant Total:</span>
                    <p className="font-semibold text-lg">{Number(commande.montant_total || 0).toFixed(2)} {commande.devise || 'TND'}</p>
                  </div>
                )}
                {commande.conditions_paiement && (
                  <div>
                    <span className="text-sm text-gray-600">Conditions Paiement:</span>
                    <p className="font-semibold">{commande.conditions_paiement}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Traçabilité OF par ligne — vue enrichie */}
          {tracabilite && tracabilite.articles_commande.length > 0 && (
            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: 'var(--s-5, 20px)',
              marginBottom: 'var(--s-5, 20px)',
              boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
              border: '1px solid var(--border-subtle)',
            }}>
              <h2 style={{
                display: 'flex', alignItems: 'center', gap: 'var(--s-2, 8px)',
                fontSize: 'var(--text-lg, 1.125rem)', fontWeight: 600,
                color: 'var(--fg-default)', margin: 0, marginBottom: 'var(--s-4, 16px)',
              }}>
                <Factory size={20} />
                Statut de fabrication par ligne ({tracabilite.articles_commande.length})
              </h2>
              {tracabilite.articles_commande.map(line => {
                const statutColor = STATUT_COLORS[line.statut_ligne] || 'var(--fg-muted)';
                return (
                  <div key={line.id_article_commande} style={{
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `4px solid ${statutColor}`,
                    borderRadius: 'var(--radius-md, 8px)',
                    padding: 'var(--s-4, 16px)',
                    marginBottom: 'var(--s-3, 12px)',
                    background: 'var(--bg-canvas, #fff)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s-3, 12px)' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 'var(--text-md, 1rem)', fontWeight: 600, color: 'var(--fg-default)' }}>
                          {line.designation || line.description_article || `Article #${line.id_article}`}
                        </h3>
                        {line.code_article && (
                          <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                            {line.code_article}
                          </div>
                        )}
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: 'var(--radius-pill, 999px)',
                        background: statutColor, color: 'var(--fg-on-accent, #fff)',
                        fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        {line.statut_ligne_libelle}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex', gap: 'var(--s-4, 16px)', flexWrap: 'wrap',
                      marginTop: 'var(--s-3, 12px)', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--fg-muted)',
                    }}>
                      <span>Commandé: <strong style={{ color: 'var(--fg-default)' }}>{line.quantite_commandee}</strong></span>
                      <span>Stock: <strong style={{ color: 'var(--fg-default)' }}>{line.quantite_prise_stock}</strong></span>
                      <span>À fabriquer: <strong style={{ color: 'var(--fg-default)' }}>{line.quantite_a_fabriquer}</strong></span>
                      <span>Montant HT: <strong style={{ color: 'var(--fg-default)' }}>{Number(line.montant_ht || 0).toFixed(2)} {commande.devise || 'TND'}</strong></span>
                    </div>

                    {line.ofs.length === 0 && line.statut_ligne === 'a_traiter' && (
                      <div style={{
                        marginTop: 'var(--s-3, 12px)', padding: 'var(--s-2, 8px) var(--s-3, 12px)',
                        background: 'var(--bg-warning-subtle, #fef3c7)', color: 'var(--color-warning, #b45309)',
                        borderRadius: 'var(--radius-sm, 4px)', fontSize: 'var(--text-sm, 0.875rem)',
                        display: 'flex', alignItems: 'center', gap: 'var(--s-2, 8px)',
                      }}>
                        <AlertCircle size={14} />
                        Aucun OF créé. Cliquez "Analyser stock &amp; fabriquer" en haut.
                      </div>
                    )}

                    {line.ofs.map(of => {
                      const progressColor = of.en_retard ? 'var(--color-danger, #dc2626)' : 'var(--accent-terracotta, #d97757)';
                      return (
                        <div
                          key={of.id_of}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/of/${of.id_of}`)}
                          onKeyDown={e => { if (e.key === 'Enter') navigate(`/of/${of.id_of}`); }}
                          style={{
                            cursor: 'pointer',
                            padding: 'var(--s-3, 12px)',
                            background: 'var(--bg-elevated, #fafafa)',
                            borderRadius: 'var(--radius-sm, 6px)',
                            marginTop: 'var(--s-3, 12px)',
                            border: of.en_retard ? '1px solid var(--color-danger, #dc2626)' : '1px solid var(--border-subtle)',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1))'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontFamily: 'monospace', color: 'var(--fg-default)' }}>{of.numero_of}</strong>
                            <span style={{
                              padding: '2px 8px', borderRadius: 'var(--radius-pill, 999px)',
                              background: 'var(--bg-subtle, #f3f4f6)', color: 'var(--fg-default)',
                              fontSize: 'var(--text-xs, 0.75rem)', fontWeight: 500,
                            }}>
                              {OF_STATUT_LABEL[of.statut] || of.statut}
                            </span>
                          </div>

                          <div style={{ marginTop: 'var(--s-2, 8px)' }}>
                            <div style={{
                              width: '100%', height: 8, background: 'var(--bg-subtle, #e5e7eb)',
                              borderRadius: 'var(--radius-pill, 999px)', overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${Math.min(100, of.avancement_pct)}%`, height: '100%',
                                background: progressColor, transition: 'width 0.4s ease',
                              }} />
                            </div>
                            <div style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)', marginTop: 4 }}>
                              {of.quantite_produite} / {of.quantite_a_produire} produits ({of.avancement_pct}%)
                            </div>
                          </div>

                          <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: 'var(--s-2, 8px)', marginTop: 'var(--s-3, 12px)',
                            fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--fg-muted)',
                          }}>
                            <div><Factory size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {of.machine?.numero_machine || '—'}</div>
                            <div><User size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {of.operateur ? `${of.operateur.prenom || ''} ${of.operateur.nom || ''}`.trim() || '—' : '—'}</div>
                            <div><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Fin: {of.date_fin_prevue ? new Date(of.date_fin_prevue).toLocaleDateString('fr-FR') : '—'}</div>
                            <div style={{ color: of.en_retard ? 'var(--color-danger, #dc2626)' : 'var(--fg-muted)' }}>
                              {of.en_retard
                                ? <><AlertCircle size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> En retard</>
                                : (of.jours_restants != null ? `${of.jours_restants}j restants` : '—')}
                            </div>
                          </div>

                          <div style={{
                            marginTop: 'var(--s-3, 12px)', display: 'flex', justifyContent: 'flex-end',
                            alignItems: 'center', gap: 4, fontSize: 'var(--text-xs, 0.75rem)',
                            color: 'var(--accent-terracotta, #d97757)', fontWeight: 500,
                          }}>
                            Voir le détail <ArrowRight size={14} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Lignes de commande */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Lignes de Commande ({commande.lignes?.length || 0})
            </h2>
            {commande.lignes && commande.lignes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réf. Commerciale</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finition</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Unitaire</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remise</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total HT</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personnalisation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commande.lignes.map((ligne, index) => {
                      const prixUnitaire = ligne.prix_unitaire || 0;
                      const quantite = ligne.quantite_commandee || 0;
                      const remise = ligne.remise || 0;
                      const totalLigne = prixUnitaire * quantite * (1 - remise / 100);
                      
                      return (
                        <tr key={ligne.id_article_commande || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            {ligne.ref_commerciale ? (
                              <Link
                                to={`/articles?ref=${ligne.ref_commerciale}`}
                                className="text-[#C8663D] hover:text-[#a55231] font-medium"
                              >
                                {ligne.ref_commerciale}
                              </Link>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {ligne.description_article || ligne.article?.description_article || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {ligne.dimensions || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {ligne.type_finition || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div>
                              <span className="font-medium">{quantite}</span>
                              {ligne.quantite_produite !== undefined && ligne.quantite_produite > 0 && (
                                <span className="text-gray-500 ml-2">
                                  (Produite: {ligne.quantite_produite})
                                </span>
                              )}
                              {ligne.quantite_livree !== undefined && ligne.quantite_livree > 0 && (
                                <span className="text-gray-500 ml-2">
                                  (Livrée: {ligne.quantite_livree})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {prixUnitaire.toFixed(2)} {commande.devise || 'TND'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {remise > 0 ? `${remise}%` : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                            {totalLigne.toFixed(2)} {commande.devise || 'TND'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {ligne.personnalisation ? (
                              <div>
                                <span className="px-2 py-1 text-xs rounded bg-[#F5EFE5] text-[#4A5D75]">Oui</span>
                                {ligne.details_personnalisation && (
                                  <div className="mt-1 text-xs text-gray-600 max-w-xs truncate" title={ligne.details_personnalisation}>
                                    {ligne.details_personnalisation}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">Non</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded ${getStatutColor(ligne.statut || 'en_attente')}`}>
                              {ligne.statut || 'en_attente'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-right font-semibold">
                        Total HT:
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-lg">
                        {totalHT.toFixed(2)} {commande.devise || 'TND'}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">Aucune ligne de commande.</p>
            )}
          </div>

          {/* Observations */}
          {commande.observations && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Observations
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{commande.observations}</p>
            </div>
          )}

          {/* Adresse de livraison */}
          {commande.adresse_livraison && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Adresse de Livraison
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{commande.adresse_livraison}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Génération OF */}
      {showOFModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Cog className="w-5 h-5" /> Générer les Ordres de Fabrication
              </h3>
              <button onClick={() => setShowOFModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {ofLoading && <p className="text-gray-500">Chargement du preview...</p>}
              {!ofLoading && previewData && (
                <>
                  {previewData.warnings_globaux?.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="font-semibold text-yellow-800 mb-1">Avertissements:</p>
                      <ul className="list-disc ml-5 text-sm text-yellow-700">
                        {previewData.warnings_globaux.map((w: string, i: number) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                  <p className="mb-3 text-sm text-gray-600">
                    <strong>{previewData.total_ofs}</strong> OF à générer pour la commande{' '}
                    <strong>{previewData.commande?.numero_commande}</strong>
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Article</th>
                          <th className="px-3 py-2 text-left">Qté</th>
                          <th className="px-3 py-2 text-left">Début</th>
                          <th className="px-3 py-2 text-left">Fin</th>
                          <th className="px-3 py-2 text-left">Machine</th>
                          <th className="px-3 py-2 text-left">Coût est.</th>
                          <th className="px-3 py-2 text-left">MP / Alertes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {previewData.ofs_a_generer?.map((of: any) => {
                          const ov = ofOverrides[of.id_article_commande] || {};
                          return (
                            <tr key={of.id_article_commande}>
                              <td className="px-3 py-2">
                                <div className="font-medium">{of.article_designation || of.code_article || `#${of.id_article}`}</div>
                                <div className="text-xs text-gray-500">{of.code_article}</div>
                              </td>
                              <td className="px-3 py-2">{of.quantite_a_produire} {of.unite}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="date"
                                  className="border rounded px-2 py-1 text-sm"
                                  value={ov.date_debut_prevue ?? of.date_debut_prevue}
                                  onChange={e => updateOverride(of.id_article_commande, 'date_debut_prevue', e.target.value)}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="date"
                                  className="border rounded px-2 py-1 text-sm"
                                  value={ov.date_fin_prevue ?? of.date_fin_prevue}
                                  onChange={e => updateOverride(of.id_article_commande, 'date_fin_prevue', e.target.value)}
                                />
                              </td>
                              <td className="px-3 py-2">
                                {of.machine_suggeree
                                  ? `${of.machine_suggeree.numero_machine || `M-${of.machine_suggeree.id_machine}`} (${of.machine_suggeree.marque || ''})`
                                  : <span className="text-red-600 text-xs">Aucune</span>}
                              </td>
                              <td className="px-3 py-2">{Number(of.cout_estime).toFixed(2)}</td>
                              <td className="px-3 py-2">
                                <div className="text-xs">
                                  {of.mp_requises?.length > 0 && (
                                    <span className="text-gray-600">{of.mp_requises.length} MP</span>
                                  )}
                                  {of.warnings?.map((w: string, i: number) => (
                                    <div key={i} className="text-orange-600">{w}</div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowOFModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={submitGenerateOFs}
                disabled={ofSubmitting || ofLoading || !previewData?.total_ofs}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {ofSubmitting ? 'Génération...' : `Valider et générer ${previewData?.total_ofs || 0} OF`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ WIZARD Stock/Fabrication ═══════════════ */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col"
            style={{ background: 'var(--color-surface, #fff)' }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border, #e5e5e5)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--color-primary-100, #dcf5e5)', color: 'var(--color-primary-700, #1a7a3e)' }}
                >
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Traitement de la commande</h2>
                  <p className="text-sm text-gray-500">
                    Étape {wizardStep} / 2 — {wizardStep === 1 ? 'Analyse & choix par article' : 'Récapitulatif & validation'}
                  </p>
                </div>
              </div>
              <button onClick={closeWizard} className="p-2 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {wizardError && (
                <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> {wizardError}
                </div>
              )}
              {resultOfs && (
                <div className="mb-4 p-4 rounded border border-green-200 bg-green-50">
                  <div className="flex items-center gap-2 font-semibold text-green-800 mb-2">
                    <CheckCircle className="w-5 h-5" /> Traitement effectué avec succès
                  </div>
                  <div className="text-sm text-green-700">
                    {resultOfs.length} OF créés.
                    {resultOfs.length > 0 && (
                      <ul className="mt-2 list-disc pl-5">
                        {resultOfs.map((o: any) => (
                          <li key={o.id_of}>{o.numero_of} — {o.quantite_a_produire} unités</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {analyseLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">Analyse du stock en cours…</span>
                </div>
              )}

              {!analyseLoading && analyse && wizardStep === 1 && (
                <div className="space-y-4">
                  {analyse.articles.map(a => {
                    const d = decisions[a.id_article_commande];
                    if (!d) return null;
                    const stockPct = a.quantite_commandee > 0 ? (d.quantite_prise_stock / a.quantite_commandee) * 100 : 0;
                    const fabPct = a.quantite_commandee > 0 ? (d.quantite_a_fabriquer / a.quantite_commandee) * 100 : 0;
                    return (
                      <div
                        key={a.id_article_commande}
                        className="rounded-lg border p-4"
                        style={{ borderColor: 'var(--color-border, #e5e5e5)' }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {a.code_article} — {a.designation}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Quantité commandée : <span className="font-medium">{a.quantite_commandee}</span> ·
                              Stock dispo : <span className="font-medium">{a.stock_disponible}</span> ·
                              Réservé : <span className="font-medium">{a.stock_reserve}</span> ·
                              <span className="font-medium text-green-700"> Utilisable : {a.stock_utilisable}</span>
                            </div>
                          </div>
                        </div>

                        {/* Barre visuelle */}
                        <div className="mb-3">
                          <div className="w-full h-6 rounded overflow-hidden bg-gray-100 flex">
                            <div
                              style={{ width: `${stockPct}%`, background: 'var(--color-sage, #7ba97a)' }}
                              title={`Stock : ${d.quantite_prise_stock}`}
                              className="text-xs text-white text-center flex items-center justify-center"
                            >{d.quantite_prise_stock > 0 && d.quantite_prise_stock}</div>
                            <div
                              style={{ width: `${fabPct}%`, background: 'var(--color-terracotta, #c66a4a)' }}
                              title={`À fabriquer : ${d.quantite_a_fabriquer}`}
                              className="text-xs text-white text-center flex items-center justify-center"
                            >{d.quantite_a_fabriquer > 0 && d.quantite_a_fabriquer}</div>
                          </div>
                          <div className="flex text-xs text-gray-500 mt-1">
                            <span>Stock</span><span className="mx-2">·</span><span>À fabriquer</span>
                          </div>
                        </div>

                        {/* Options radio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          {a.options.map(opt => (
                            <label
                              key={opt.code}
                              className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition ${
                                d.action === opt.code ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                              } ${!opt.faisable ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                              <input
                                type="radio"
                                name={`opt-${a.id_article_commande}`}
                                disabled={!opt.faisable}
                                checked={d.action === opt.code}
                                onChange={() => updateDecision(a.id_article_commande, { action: opt.code })}
                                className="mt-1"
                              />
                              <div className="text-sm">
                                <div className="font-medium">
                                  {opt.libelle}
                                  {opt.recommandee && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Recommandé</span>
                                  )}
                                </div>
                                {opt.note && <div className="text-xs text-gray-500 mt-0.5">{opt.note}</div>}
                              </div>
                            </label>
                          ))}
                        </div>

                        {/* Slider ajustement */}
                        {(d.action === 'mix' || d.action === 'stock_only') && a.stock_utilisable > 0 && (
                          <div className="mb-3">
                            <label className="text-xs text-gray-600 mb-1 block">
                              Ajuster la quantité prise du stock : <span className="font-medium">{d.quantite_prise_stock}</span> / max {Math.min(a.quantite_commandee, a.stock_utilisable)}
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={Math.min(a.quantite_commandee, a.stock_utilisable)}
                              value={d.quantite_prise_stock}
                              onChange={e => updateDecision(a.id_article_commande, {
                                quantite_prise_stock: Number(e.target.value)
                              })}
                              className="w-full"
                            />
                          </div>
                        )}

                        {/* Panneau OF (mix / fabrication_only) */}
                        {(d.action === 'mix' || d.action === 'fabrication_only') && d.quantite_a_fabriquer > 0 && (
                          <div className="p-3 rounded bg-gray-50 border border-gray-200 text-sm space-y-1">
                            <div className="flex items-center gap-2 font-medium text-gray-700">
                              <Factory className="w-4 h-4" /> Ordre de fabrication estimé
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div><span className="text-gray-500">Machine : </span>{a.of_estimation.machine_suggeree_numero || '—'}</div>
                              <div><span className="text-gray-500">Temps : </span>{a.of_estimation.temps_production_jours ?? '—'} j</div>
                              <div><span className="text-gray-500">Coût : </span>{Number(a.of_estimation.cout_estime || 0).toFixed(2) ?? '—'} TND</div>
                              <div><span className="text-gray-500">Priorité : </span>
                                <select
                                  value={d.priorite}
                                  onChange={e => updateDecision(a.id_article_commande, { priorite: e.target.value })}
                                  className="border rounded px-1 py-0.5"
                                >
                                  <option value="normale">Normale</option>
                                  <option value="haute">Haute</option>
                                  <option value="urgente">Urgente</option>
                                </select>
                              </div>
                            </div>
                            {a.of_estimation.mp_requises.length > 0 && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-xs text-gray-600">MP requises ({a.of_estimation.mp_requises.length})</summary>
                                <ul className="mt-1 text-xs pl-4">
                                  {a.of_estimation.mp_requises.map(m => (
                                    <li key={m.id_mp} className={m.suffisant ? 'text-gray-600' : 'text-red-600'}>
                                      {m.code_mp} — {m.designation} : besoin {m.quantite_pour_qte} {m.unite}, stock {m.stock_actuel} {m.suffisant ? '' : ' ⚠'}
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            )}
                          </div>
                        )}

                        {a.warnings.length > 0 && (
                          <div className="mt-2 flex items-start gap-2 text-xs text-orange-700">
                            <Info className="w-4 h-4 mt-0.5" />
                            <div>{a.warnings.join(' · ')}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!analyseLoading && analyse && wizardStep === 2 && recap && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="p-4 rounded border bg-white"><div className="text-xs text-gray-500">Articles</div><div className="text-2xl font-bold">{analyse.articles.length}</div></div>
                    <div className="p-4 rounded border bg-white"><div className="text-xs text-gray-500">Stock à prendre</div><div className="text-2xl font-bold text-green-700">{recap.totalStock}</div></div>
                    <div className="p-4 rounded border bg-white"><div className="text-xs text-gray-500">À fabriquer</div><div className="text-2xl font-bold text-orange-700">{recap.totalFab}</div></div>
                    <div className="p-4 rounded border bg-white"><div className="text-xs text-gray-500">OF à créer</div><div className="text-2xl font-bold">{recap.ofsCount}</div></div>
                    <div className="p-4 rounded border bg-white"><div className="text-xs text-gray-500">Temps max</div><div className="text-2xl font-bold">{recap.tempsMax.toFixed(1)} j</div></div>
                  </div>
                  <div className="p-4 rounded border bg-white">
                    <div className="text-xs text-gray-500">Coût de fabrication estimé</div>
                    <div className="text-3xl font-bold">{Number(recap.cout || 0).toFixed(2)} TND</div>
                  </div>
                  <div className="rounded border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Article</th>
                          <th className="text-left p-2">Action</th>
                          <th className="text-right p-2">Stock</th>
                          <th className="text-right p-2">Fab</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyse.articles.map(a => {
                          const d = decisions[a.id_article_commande];
                          if (!d) return null;
                          return (
                            <tr key={a.id_article_commande} className="border-t">
                              <td className="p-2">{a.code_article}</td>
                              <td className="p-2">{d.action}</td>
                              <td className="p-2 text-right">{d.quantite_prise_stock}</td>
                              <td className="p-2 text-right">{d.quantite_a_fabriquer}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-between" style={{ borderColor: 'var(--color-border, #e5e5e5)' }}>
              <button
                onClick={closeWizard}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >Fermer</button>
              <div className="flex gap-2">
                {wizardStep === 2 && !resultOfs && (
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 rounded border hover:bg-gray-50"
                  >← Retour</button>
                )}
                {wizardStep === 1 && !resultOfs && (
                  <button
                    onClick={() => setWizardStep(2)}
                    disabled={!analyse || analyseLoading}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >Continuer →</button>
                )}
                {wizardStep === 2 && !resultOfs && (
                  <button
                    onClick={confirmerChoix}
                    disabled={submitting}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >{submitting ? 'Création…' : 'Confirmer et créer les OF'}</button>
                )}
                {resultOfs && (
                  <button
                    onClick={closeWizard}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  >Terminer</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandeDetails;
