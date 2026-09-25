import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Plus, Edit, Trash2, Search, Download, Eye, X, CheckCircle, ShoppingCart, TrendingUp, Clock, Award } from 'lucide-react';
import { devisService, commandesService, clientsService, articlesService } from '../services/api';
import ArticlePicker from '../components/ArticlePicker';
import KpiCard from '../components/ecommerce/KpiCard';

interface LigneDevis {
  id_article?: number;
  designation?: string;
  quantite: number;
  prix_unitaire_ht: number;
  remise?: number;
  taux_tva?: number;
}

const Devis: React.FC = () => {
  const [devis, setDevis] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDevis, setEditingDevis] = useState<any>(null);
  const [selectedDevis, setSelectedDevis] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: '', client_id: '' });
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    id_client: '',
    date_devis: new Date().toISOString().split('T')[0],
    date_validite: '',
    statut: 'BROUILLON',
    taux_tva: 20,
    remise_globale: 0,
    reference_client: '',
    conditions_paiement: '',
    conditions_livraison: '',
    notes: '',
    lignes: [] as LigneDevis[]
  });

  useEffect(() => {
    loadData();
  }, [filters, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.statut) params.statut = filters.statut.toUpperCase();
      if (filters.client_id) params.client_id = filters.client_id;
      if (search) params.search = search;

      const [devisRes, clientsRes, articlesRes] = await Promise.all([
        devisService.getDevis(params).catch(() => ({ data: { data: [], success: false } })),
        clientsService.getClients().catch(() => ({ data: { data: [] } })),
        articlesService.getArticles().catch(() => ({ data: { data: [] } }))
      ]);
      
      if (devisRes.data?.success) {
        const devisRaw = devisRes.data.data; setDevis(Array.isArray(devisRaw) ? devisRaw : (devisRaw?.data || devisRaw?.devis || []));
      } else {
        setDevis([]);
      }
      
      const clientsRaw = clientsRes.data?.data; setClients(Array.isArray(clientsRaw) ? clientsRaw : (clientsRaw?.data || clientsRaw?.clients || []));
      setArticles((() => {
        const _r = articlesRes.data?.data;
        if (Array.isArray(_r)) return _r;
        if (_r && Array.isArray(_r.data)) return _r.data;
        if (_r && typeof _r === 'object') {
          for (const k of Object.keys(_r)) if (Array.isArray((_r as any)[k])) return (_r as any)[k];
        }
        return [];
      })());
    } catch (error) {
      console.error('Erreur chargement devis:', error);
      setDevis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lignes.length === 0) {
      alert('Ajoutez au moins une ligne de devis');
      return;
    }
    if (!formData.id_client) {
      alert('Sélectionnez un client');
      return;
    }
    try {
      // Préparer les données pour l'API
      const lignesFormatees = formData.lignes.map(ligne => {
        const article = articles.find(a => a.id_article === ligne.id_article);
        return {
          id_article: ligne.id_article || null,
          designation: ligne.designation || article?.libelle || article?.designation || '',
          quantite: ligne.quantite,
          prix_unitaire_ht: ligne.prix_unitaire_ht,
          remise: ligne.remise || 0,
          taux_tva: ligne.taux_tva || formData.taux_tva || 20
        };
      });

      const dataToSend = {
        id_client: parseInt(formData.id_client),
        date_devis: formData.date_devis,
        date_validite: formData.date_validite || null,
        statut: formData.statut,
        taux_tva: formData.taux_tva,
        remise_globale: formData.remise_globale,
        reference_client: formData.reference_client || null,
        conditions_paiement: formData.conditions_paiement || null,
        conditions_livraison: formData.conditions_livraison || null,
        notes: formData.notes || null,
        lignes: lignesFormatees
      };

      if (editingDevis) {
        await devisService.updateDevis(editingDevis.id_devis, dataToSend);
      } else {
        await devisService.createDevis(dataToSend);
      }

      setShowForm(false);
      setEditingDevis(null);
      setFormData({
        id_client: '',
        date_devis: new Date().toISOString().split('T')[0],
        date_validite: '',
        statut: 'BROUILLON',
        taux_tva: 20,
        remise_globale: 0,
        reference_client: '',
        conditions_paiement: '',
        conditions_livraison: '',
        notes: '',
        lignes: []
      });
      loadData();
    } catch (error: any) {
      console.error('Erreur sauvegarde devis:', error);
      alert(error.response?.data?.error?.message || 'Erreur lors de la sauvegarde du devis');
    }
  };

  const addLigne = () => {
    setFormData({
      ...formData,
      lignes: [...formData.lignes, { id_article: undefined, quantite: 1, prix_unitaire_ht: 0, remise: 0, taux_tva: formData.taux_tva || 20 }]
    });
  };

  const removeLigne = (index: number) => {
    setFormData({
      ...formData,
      lignes: formData.lignes.filter((_, i) => i !== index)
    });
  };

  const updateLigne = (index: number, field: string, value: any) => {
    const newLignes = [...formData.lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    setFormData({ ...formData, lignes: newLignes });
  };

  const calculerTotal = () => {
    let totalHt = 0;
    formData.lignes.forEach(ligne => {
      const prix = (ligne.prix_unitaire_ht || 0) * (ligne.quantite || 0);
      const remise = prix * (ligne.remise || 0) / 100;
      const ht = prix - remise;
      totalHt += ht;
    });
    const remiseGlobale = totalHt * (formData.remise_globale || 0) / 100;
    const htFinal = totalHt - remiseGlobale;
    const tva = htFinal * (formData.taux_tva || 20) / 100;
    return htFinal + tva;
  };

  const getStatutColor = (statut: string) => {
    const statutLower = statut?.toLowerCase() || '';
    const colors: { [key: string]: string } = {
      'brouillon': 'bg-gray-100 text-gray-800',
      'envoye': 'bg-[#EDF0F5] text-[#3B4E68]',
      'envoyé': 'bg-[#EDF0F5] text-[#3B4E68]',
      'accepte': 'bg-[#EFF3E7] text-[#3F5E29]',
      'accepté': 'bg-[#EFF3E7] text-[#3F5E29]',
      'refuse': 'bg-[#FBEBE4] text-[#8A2E1D]',
      'refusé': 'bg-[#FBEBE4] text-[#8A2E1D]',
      'expire': 'bg-[#FBF3DE] text-[#8A6412]',
      'expiré': 'bg-[#FBF3DE] text-[#8A6412]',
      'transforme': 'bg-[#F2E7D6] text-[#7A5C1F]',
      'transformé': 'bg-[#F2E7D6] text-[#7A5C1F]'
    };
    return colors[statutLower] || 'bg-gray-100 text-gray-800';
  };

  const filteredDevis = devis.filter(d => {
    if (search && !d.numero_devis?.toLowerCase().includes(search.toLowerCase()) && 
        !d.client_nom?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filters.statut && d.statut !== filters.statut.toUpperCase()) {
      return false;
    }
    if (filters.client_id && d.id_client?.toString() !== filters.client_id) {
      return false;
    }
    return true;
  });

  const kpis = useMemo(() => {
    const total = devis.length;
    const brouillon = devis.filter(d => String(d.statut || '').toUpperCase() === 'BROUILLON').length;
    const acceptes = devis.filter(d => String(d.statut || '').toUpperCase() === 'ACCEPTE').length;
    const caPotentiel = devis
      .filter(d => ['ENVOYE', 'ACCEPTE'].includes(String(d.statut || '').toUpperCase()))
      .reduce((s, d) => s + Number(d.montant_ttc || 0), 0);
    return { total, brouillon, acceptes, caPotentiel };
  }, [devis]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent-terracotta)' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-app)' }}>
      <div className="max-w-7xl mx-auto">
        <div style={{ marginBottom: 'var(--s-6)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--s-2)' }}>
            VENTES · PROPOSITIONS
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 'var(--text-3xl)', color: 'var(--fg-primary)', marginBottom: 'var(--s-2)' }}>
                Devis
              </h1>
              <p style={{ color: 'var(--fg-secondary)', fontSize: 'var(--text-md)' }}>
                Propositions commerciales — création, envoi et transformation en commandes.
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingDevis(null);
                setFormData({
                  id_client: '',
                  date_devis: new Date().toISOString().split('T')[0],
                  date_validite: '',
                  statut: 'BROUILLON',
                  taux_tva: 20,
                  remise_globale: 0,
                  reference_client: '',
                  conditions_paiement: '',
                  conditions_livraison: '',
                  notes: '',
                  lignes: []
                });
              }}
              className="inline-flex items-center gap-2 transition-shadow"
              style={{
                background: 'var(--accent-terracotta)',
                color: 'var(--fg-inverse)',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-md)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
              }}
            >
              <Plus className="w-4 h-4" />
              Nouveau devis
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Total devis" value={kpis.total} icon={<FileText className="w-5 h-5" />} color="terracotta" />
          <KpiCard label="En brouillon" value={kpis.brouillon} icon={<Clock className="w-5 h-5" />} color={kpis.brouillon > 0 ? 'warning' : 'neutral'} />
          <KpiCard label="Acceptés" value={kpis.acceptes} icon={<Award className="w-5 h-5" />} color="sage" />
          <KpiCard label="CA potentiel" value={kpis.caPotentiel.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="TND" icon={<TrendingUp className="w-5 h-5" />} color="indigo" />
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
              />
            </div>
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
            >
              <option value="">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="ENVOYE">Envoyé</option>
              <option value="ACCEPTE">Accepté</option>
              <option value="REFUSE">Refusé</option>
              <option value="EXPIRE">Expiré</option>
              <option value="TRANSFORME">Transformé en commande</option>
            </select>
            <select
              value={filters.client_id}
              onChange={(e) => setFilters({ ...filters, client_id: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
            >
              <option value="">Tous les clients</option>
              {clients.map(c => (
                <option key={c.id_client} value={c.id_client}>{c.raison_sociale || c.nom}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingDevis ? 'Modifier le Devis' : 'Nouveau Devis'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <select
                    value={formData.id_client}
                    onChange={(e) => setFormData({ ...formData, id_client: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => (
                      <option key={c.id_client} value={c.id_client}>{c.raison_sociale || c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Devis *</label>
                  <input
                    type="date"
                    value={formData.date_devis}
                    onChange={(e) => setFormData({ ...formData, date_devis: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Validité</label>
                  <input
                    type="date"
                    value={formData.date_validite}
                    onChange={(e) => setFormData({ ...formData, date_validite: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                  >
                    <option value="BROUILLON">Brouillon</option>
                    <option value="ENVOYE">Envoyé</option>
                    <option value="ACCEPTE">Accepté</option>
                    <option value="REFUSE">Refusé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux TVA (%)</label>
                  <input
                    type="number"
                    value={formData.taux_tva}
                    onChange={(e) => setFormData({ ...formData, taux_tva: parseFloat(e.target.value) || 20 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remise Globale (%)</label>
                  <input
                    type="number"
                    value={formData.remise_globale}
                    onChange={(e) => setFormData({ ...formData, remise_globale: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence Client</label>
                  <input
                    type="text"
                    value={formData.reference_client}
                    onChange={(e) => setFormData({ ...formData, reference_client: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                    placeholder="Réf. commande client"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de Paiement</label>
                  <input
                    type="text"
                    value={formData.conditions_paiement}
                    onChange={(e) => setFormData({ ...formData, conditions_paiement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                    placeholder="Ex: 30 jours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de Livraison</label>
                  <input
                    type="text"
                    value={formData.conditions_livraison}
                    onChange={(e) => setFormData({ ...formData, conditions_livraison: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                    placeholder="Ex: Livraison sous 15 jours"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8663D]/40"
                    rows={3}
                    placeholder="Notes additionnelles..."
                  />
                </div>
              </div>

              {/* Lignes de devis */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Lignes de Devis</label>
                  <button
                    type="button"
                    onClick={addLigne}
                    className="text-sm font-medium hover:underline"
                    style={{ color: 'var(--accent-terracotta)' }}
                  >
                    + Ajouter une ligne
                  </button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Article</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qté</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Prix U.</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Remise %</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">TVA %</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lignes.map((ligne, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => setPickerIndex(index)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-left bg-white hover:bg-gray-50"
                            >
                              {ligne.designation || (ligne.id_article ? `Article #${ligne.id_article}` : 'Sélectionner un article...')}
                            </button>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={ligne.quantite}
                              onChange={(e) => updateLigne(index, 'quantite', parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0.01"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={ligne.prix_unitaire_ht || 0}
                              onChange={(e) => updateLigne(index, 'prix_unitaire_ht', parseFloat(e.target.value))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={ligne.remise || 0}
                              onChange={(e) => updateLigne(index, 'remise', parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={ligne.taux_tva || formData.taux_tva || 20}
                              onChange={(e) => updateLigne(index, 'taux_tva', parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {((ligne.prix_unitaire_ht || 0) * (ligne.quantite || 0) * (1 - (ligne.remise || 0) / 100) * (1 + (ligne.taux_tva || formData.taux_tva || 20) / 100)).toFixed(2)} TND
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => removeLigne(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      Total TTC: {calculerTotal().toFixed(2)} TND
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg hover:opacity-90 transition-colors"
                  style={{ background: 'var(--accent-terracotta)', color: 'var(--fg-inverse)', fontWeight: 600 }}
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDevis(null);
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des devis */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant HT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDevis.map((devis) => {
                const openDevisView = async () => {
                  try {
                    const result = await devisService.getDevisById(devis.id_devis);
                    if (result.data?.success) setSelectedDevis(result.data?.data);
                    else alert('Erreur lors du chargement du devis');
                  } catch (error: any) {
                    console.error('Erreur chargement devis:', error);
                    alert(error.response?.data?.error?.message || 'Erreur lors du chargement du devis');
                  }
                };
                const transformerRow = async (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (!window.confirm(`Transformer le devis ${devis.numero_devis} en commande ?`)) return;
                  try {
                    const result = await devisService.transformerEnCommande(devis.id_devis);
                    if (result.data?.success) {
                      alert('Devis transformé en commande avec succès');
                      loadData();
                    } else {
                      alert(result.data?.error?.message || 'Erreur lors de la transformation');
                    }
                  } catch (err: any) {
                    console.error('Erreur transformation devis:', err);
                    alert(err.response?.data?.error?.message || 'Erreur lors de la transformation');
                  }
                };
                const dejaTransforme = devis.statut && ['transforme', 'transformé', 'TRANSFORME'].includes(devis.statut);
                return (
                <tr key={devis.id_devis} onClick={openDevisView} className="hover:bg-gray-50 cursor-pointer group">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{devis.numero_devis}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{devis.client_nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{devis.date_devis}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{Number(devis.montant_ht || 0).toFixed(2)} TND</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(devis.statut)}`}>
                      {devis.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button
                        onClick={openDevisView}
                        className="hover:opacity-70 transition"
                        style={{ color: 'var(--accent-indigo)' }}
                        title="Consulter"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!dejaTransforme && (
                        <button
                          onClick={transformerRow}
                          className="text-green-600 hover:text-green-700"
                          title="Transformer en commande"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          try { await devisService.downloadPDF(devis.id_devis, devis.numero_devis); }
                          catch { alert('Erreur lors du téléchargement du PDF'); }
                        }}
                        className="text-[#C8663D] hover:text-[#a94f2b]"
                        title="Télécharger PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            const result = await devisService.getDevisById(devis.id_devis);
                            if (result.data?.success) {
                              const devisData = result.data.data;
                              setFormData({
                                id_client: devisData.id_client?.toString() || '',
                                date_devis: devisData.date_devis || new Date().toISOString().split('T')[0],
                                date_validite: devisData.date_validite || '',
                                statut: devisData.statut || 'BROUILLON',
                                taux_tva: devisData.taux_tva || 20,
                                remise_globale: devisData.remise_globale || 0,
                                reference_client: devisData.reference_client || '',
                                conditions_paiement: devisData.conditions_paiement || '',
                                conditions_livraison: devisData.conditions_livraison || '',
                                notes: devisData.notes || '',
                                lignes: (devisData.lignes || []).map((l: any) => ({
                                  id_article: l.id_article,
                                  designation: l.designation,
                                  quantite: l.quantite,
                                  prix_unitaire_ht: l.prix_unitaire_ht,
                                  remise: l.remise || 0,
                                  taux_tva: l.taux_tva || 20
                                }))
                              });
                              setEditingDevis(devis);
                              setShowForm(true);
                            } else {
                              alert('Erreur lors du chargement du devis');
                            }
                          } catch (error: any) {
                            console.error('Erreur chargement devis:', error);
                            alert(error.response?.data?.error?.message || 'Erreur lors du chargement du devis');
                          }
                        }}
                        className="text-gray-600 hover:text-gray-700"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm(`Êtes-vous sûr de vouloir supprimer le devis ${devis.numero_devis} ?`)) {
                            try {
                              await devisService.deleteDevis(devis.id_devis);
                              loadData();
                              alert('Devis supprimé avec succès');
                            } catch (error: any) {
                              console.error('Erreur suppression devis:', error);
                              alert(error.response?.data?.error?.message || 'Erreur lors de la suppression du devis');
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>

        {/* Modal de consultation */}
        {selectedDevis && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(20,12,6,0.45)', backdropFilter: 'blur(6px)' }}>
            <div className="rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-xl)' }}>
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Devis {selectedDevis.numero_devis}
                </h2>
                <button
                  onClick={() => setSelectedDevis(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Client</label>
                    <p className="text-gray-900">{selectedDevis.client_nom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Devis</label>
                    <p className="text-gray-900">{selectedDevis.date_devis}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Validité</label>
                    <p className="text-gray-900">{selectedDevis.date_validite || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Statut</label>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(selectedDevis.statut)}`}>
                      {selectedDevis.statut}
                    </span>
                  </div>
                  {selectedDevis.reference_client && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Référence Client</label>
                      <p className="text-gray-900">{selectedDevis.reference_client}</p>
                    </div>
                  )}
                </div>

                {/* Lignes du devis */}
                {selectedDevis.lignes && selectedDevis.lignes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lignes du Devis</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Désignation</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qté</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Prix U. HT</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Remise %</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">TVA %</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total TTC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedDevis.lignes.map((ligne: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{ligne.designation}</td>
                              <td className="px-4 py-2">{ligne.quantite}</td>
                              <td className="px-4 py-2">{Number(ligne.prix_unitaire_ht || 0).toFixed(2)} TND</td>
                              <td className="px-4 py-2">{ligne.remise || 0}%</td>
                              <td className="px-4 py-2">{ligne.taux_tva || 20}%</td>
                              <td className="px-4 py-2 font-semibold">
                                {Number(ligne.montant_ttc || 0).toFixed(2)} TND
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Totaux */}
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Montant HT:</span>
                        <span className="font-semibold">{Number(selectedDevis.montant_ht || 0).toFixed(2)} TND</span>
                      </div>
                      {selectedDevis.remise_globale > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Remise globale ({selectedDevis.remise_globale}%):</span>
                          <span>-{Number(selectedDevis.montant_remise || 0).toFixed(2)} TND</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">TVA ({selectedDevis.taux_tva || 20}%):</span>
                        <span className="font-semibold">{Number(selectedDevis.montant_tva || 0).toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total TTC:</span>
                        <span>{Number(selectedDevis.montant_ttc || 0).toFixed(2)} TND</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conditions et notes */}
                {(selectedDevis.conditions_paiement || selectedDevis.conditions_livraison || selectedDevis.notes) && (
                  <div className="border-t pt-4 space-y-3">
                    {selectedDevis.conditions_paiement && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Conditions de Paiement</label>
                        <p className="text-gray-900">{selectedDevis.conditions_paiement}</p>
                      </div>
                    )}
                    {selectedDevis.conditions_livraison && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Conditions de Livraison</label>
                        <p className="text-gray-900">{selectedDevis.conditions_livraison}</p>
                      </div>
                    )}
                    {selectedDevis.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Notes</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedDevis.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2 justify-end">
                  <button
                    onClick={async () => {
                      try {
                        const result = await devisService.getDevisById(selectedDevis.id_devis);
                        if (result.data?.success) {
                          const devisData = result.data.data;
                          setFormData({
                            id_client: devisData.id_client?.toString() || '',
                            date_devis: devisData.date_devis || new Date().toISOString().split('T')[0],
                            date_validite: devisData.date_validite || '',
                            statut: devisData.statut || 'BROUILLON',
                            taux_tva: devisData.taux_tva || 20,
                            remise_globale: devisData.remise_globale || 0,
                            reference_client: devisData.reference_client || '',
                            conditions_paiement: devisData.conditions_paiement || '',
                            conditions_livraison: devisData.conditions_livraison || '',
                            notes: devisData.notes || '',
                            lignes: (devisData.lignes || []).map((l: any) => ({
                              id_article: l.id_article,
                              designation: l.designation,
                              quantite: l.quantite,
                              prix_unitaire_ht: l.prix_unitaire_ht,
                              remise: l.remise || 0,
                              taux_tva: l.taux_tva || 20
                            }))
                          });
                          setEditingDevis(selectedDevis);
                          setSelectedDevis(null);
                          setShowForm(true);
                        }
                      } catch (error: any) {
                        console.error('Erreur chargement devis:', error);
                        alert(error.response?.data?.error?.message || 'Erreur lors du chargement du devis');
                      }
                    }}
                    className="px-4 py-2 rounded-lg hover:opacity-90 transition"
                    style={{ background: 'var(--accent-terracotta)', color: 'var(--fg-inverse)', fontWeight: 600 }}
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Modifier
                  </button>
                  {selectedDevis.statut === 'ACCEPTE' && !selectedDevis.id_commande && (
                    <button
                      onClick={async () => {
                        if (window.confirm('Transformer ce devis en commande ?')) {
                          try {
                            const result = await devisService.transformerEnCommande(selectedDevis.id_devis);
                            const commandeId = result.data?.data?.id_commande || result.data?.id_commande;
                            const message = commandeId 
                              ? `Devis transformé en commande avec succès !\nID Commande: ${commandeId}`
                              : 'Devis transformé en commande avec succès !';
                            alert(message);
                            setSelectedDevis(null);
                            loadData();
                            // Optionnel : rediriger vers la commande créée
                            // if (commandeId) navigate(`/commandes?highlight=${commandeId}`);
                          } catch (error: any) {
                            console.error('Erreur transformation:', error);
                            alert(error.response?.data?.error?.message || 'Erreur lors de la transformation');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Transformer en Commande
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedDevis(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ArticlePicker
        isOpen={pickerIndex !== null}
        onClose={() => setPickerIndex(null)}
        onSelect={(article) => {
          if (pickerIndex === null) return;
          const newLignes = [...formData.lignes];
          newLignes[pickerIndex] = {
            ...newLignes[pickerIndex],
            id_article: article.id_article,
            designation: article.designation,
            prix_unitaire_ht: article.prix_vente,
            quantite: article.quantite,
          };
          setFormData({ ...formData, lignes: newLignes });
          setPickerIndex(null);
        }}
      />
    </div>
  );
};

export default Devis;
