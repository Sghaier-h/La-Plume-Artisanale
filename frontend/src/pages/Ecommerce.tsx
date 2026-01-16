import React, { useState, useEffect } from 'react';
import { ecommerceService } from '../services/api';
import { ShoppingBag, Star, TrendingUp, Package, Sparkles } from 'lucide-react';

const Ecommerce: React.FC = () => {
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [selectedBoutique, setSelectedBoutique] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'produits' | 'commandes' | 'recommandations'>('produits');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBoutique) {
      loadProduits();
      loadCommandes();
    }
  }, [selectedBoutique]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ecommerceService.getBoutiques();
      setBoutiques(res.data.data.boutiques || []);
      if (res.data.data.boutiques && res.data.data.boutiques.length > 0) {
        setSelectedBoutique(res.data.data.boutiques[0].id_boutique);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProduits = async () => {
    if (!selectedBoutique) return;
    try {
      const res = await ecommerceService.getProduitsBoutique({ id_boutique: selectedBoutique });
      setProduits(res.data.data.produits || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const loadCommandes = async () => {
    if (!selectedBoutique) return;
    try {
      const res = await ecommerceService.getCommandesEcommerce({ id_boutique: selectedBoutique });
      setCommandes(res.data.data.commandes || []);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'LIVREE': return 'bg-green-100 text-green-800';
      case 'EXPEDIEE': return 'bg-blue-100 text-blue-800';
      case 'EN_PREPARATION': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMEE': return 'bg-purple-100 text-purple-800';
      case 'EN_ATTENTE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-8 h-8" />
            E-commerce avec IA
          </h1>
        </div>

        {/* Sélection boutique */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Boutique
          </label>
          <select
            value={selectedBoutique || ''}
            onChange={(e) => setSelectedBoutique(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner une boutique</option>
            {boutiques.map((boutique) => (
              <option key={boutique.id_boutique} value={boutique.id_boutique}>
                {boutique.nom_boutique} {boutique.ia_activee && <Sparkles className="w-4 h-4 inline" />}
              </option>
            ))}
          </select>
        </div>

        {selectedBoutique && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => setActiveTab('produits')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'produits'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Produits ({produits.length})
              </button>
              <button
                onClick={() => setActiveTab('commandes')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'commandes'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Commandes ({commandes.length})
              </button>
              <button
                onClick={() => setActiveTab('recommandations')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'recommandations'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Recommandations IA
              </button>
            </div>

            {/* Contenu */}
            {activeTab === 'produits' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produits.map((produit: any) => (
                  <div key={produit.id_produit_boutique} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {produit.images && Array.isArray(produit.images) && produit.images.length > 0 && (
                      <img
                        src={produit.images[0]}
                        alt={produit.nom_produit}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{produit.nom_produit}</h3>
                        {produit.en_vedette && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{produit.reference_sku}</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {produit.prix_vente_ttc?.toLocaleString('fr-FR')} TND
                        </span>
                        {produit.prix_promotion && (
                          <span className="text-sm text-gray-500 line-through">
                            {produit.prix_promotion.toLocaleString('fr-FR')} TND
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Stock: {produit.stock_disponible || 0}
                      </div>
                      {produit.tags_ia && Array.isArray(produit.tags_ia) && produit.tags_ia.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {produit.tags_ia.slice(0, 3).map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'commandes' && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commandes.map((commande: any) => (
                      <tr key={commande.id_commande}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {commande.numero_commande}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {commande.email_client}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          {commande.total_ttc?.toLocaleString('fr-FR')} TND
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs ${getStatutColor(commande.statut)}`}>
                            {commande.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {commande.statut_paiement || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'recommandations' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold">Recommandations IA</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Sélectionnez un produit pour voir les recommandations générées par l'IA
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {produits.slice(0, 6).map((produit: any) => (
                    <div
                      key={produit.id_produit_boutique}
                      className="border rounded-lg p-4 hover:shadow-lg cursor-pointer"
                      onClick={async () => {
                        try {
                          const res = await ecommerceService.getRecommandationsIA(produit.id_produit_boutique);
                          // TODO: Afficher modal avec recommandations
                          console.log('Recommandations:', res.data.data);
                        } catch (error) {
                          console.error('Erreur recommandations:', error);
                        }
                      }}
                    >
                      <div className="font-semibold mb-2">{produit.nom_produit}</div>
                      <div className="text-sm text-gray-600">
                        Cliquez pour voir les recommandations IA
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Ecommerce;
