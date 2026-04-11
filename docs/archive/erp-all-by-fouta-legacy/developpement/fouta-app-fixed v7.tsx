import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, Calendar, Users, Cog, Bell, Menu, AlertCircle, CheckCircle, 
  Scissors, Factory, ClipboardList, Truck, BarChart3, Download, Box, 
  Package2, ShoppingBag, UserCheck, ChevronDown, ChevronRight, Activity, Zap, AlertTriangle, 
  Eye, Plus, Edit, Search, User, Phone, Mail, Database, Star, X
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stockMenuOpen, setStockMenuOpen] = useState(false);
  const [productionMenuOpen, setProductionMenuOpen] = useState(false);
  const [operatorsMenuOpen, setOperatorsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const theme = {
    primaryColor: '#2563eb',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    companyName: 'FOUTA Manufacturing'
  };

  const realData = {
    totalCommandes: 295,
    commandesUniques: 156,
    ordresFabrication: 295,
    totalMachines: 18,
    machinesActives: 14,
    soustraitants: 42,
    clients: 156,
    articles: 1255,
    poidsMP: 90298.11
  };

  const commandes = [
    { 
      numCommande: 'CM-FT0119', dateEnvoi: '2026-01-22', numClient: 'CL00884', nomClient: 'DECATHLON',
      nbArticles: 98, statut: 'En cours', priorite: 'Haute',
      articles: [
        { idOF: 'OF249780', refCommercial: 'IB1020-B29-01', modele: 'IBIZA', qte: 320, personnalisation: 'Non' },
        { idOF: 'OF249783', refCommercial: 'MA1020-B32-01', modele: 'MARA', qte: 320, personnalisation: 'Oui', detailsPerso: 'Broderie logo' }
      ]
    },
    { 
      numCommande: 'CM-FT0069', dateEnvoi: '2025-12-15', numClient: 'CL00296', nomClient: 'MAISON DU MONDE',
      nbArticles: 35, statut: 'En production', priorite: 'Urgente',
      articles: [
        { idOF: 'OF244984', refCommercial: 'NDL1020-B20-01', modele: 'ND LILI', qte: 70, personnalisation: 'Oui', detailsPerso: 'Étiquette perso' }
      ]
    }
  ];

  const ordresFabrication = [
    { id: 'OF249780', numCmd: 'CM-FT0119', article: 'IB1020-B29-01', modele: 'IBIZA', qte: 320, personnalisation: 'Non', statut: 'En cours', priorite: 'Haute', machine: 'M2302', avancement: 45 },
    { id: 'OF249783', numCmd: 'CM-FT0119', article: 'MA1020-B32-01', modele: 'MARA', qte: 320, personnalisation: 'Oui', detailsPerso: 'Broderie logo', statut: 'En cours', priorite: 'Haute', machine: 'M2301', avancement: 30 },
    { id: 'OF244984', numCmd: 'CM-FT0069', article: 'NDL1020-B20-01', modele: 'ND LILI', qte: 70, personnalisation: 'Oui', detailsPerso: 'Étiquette perso', statut: 'En production', priorite: 'Urgente', machine: 'M2301', avancement: 65 }
  ];

  const couleursMP = [
    { id: 'C01', code: 'C01', nom: 'BLANC', nm: 'NM05-01.00', lot: 'S2023', stock: 381.5, entrepot: 'E2' },
    { id: 'C02', code: 'C02', nom: 'ECRU', nm: 'NM05-02.00', lot: '58733', stock: 1113, entrepot: 'E2' },
    { id: 'C04', code: 'C04', nom: 'BEIGE', nm: 'NM05-04.00', lot: 'L2024', stock: 456.2, entrepot: 'E1' }
  ];

  const machinesReelles = [
    { machine: 'M2301', type: 'HTVS4/S', nbFils: 966, restant: 320, status: 'alert', prod: 145, operateur: 'Majdi' },
    { machine: 'M2302', type: 'HTVS6/S', nbFils: 966, restant: 1750, status: 'ok', prod: 152, operateur: 'Zied' },
    { machine: 'M2305', type: 'HTV8/S', nbFils: 2140, restant: 350, status: 'alert', prod: 148, operateur: 'Dimatex' }
  ];

  const clients = [
    { id: 'CL00884', nom: 'DECATHLON', contact: 'Marie Dubois', email: 'marie.d@decathlon.fr', tel: '+33 6 12 34 56 78', priorite: 'VIP' },
    { id: 'CL00296', nom: 'MAISON DU MONDE', contact: 'Jean Martin', email: 'j.martin@mdm.fr', tel: '+33 6 23 45 67 89', priorite: 'Important' }
  ];

  const soustraitants = [
    { id: 'ST001', nom: 'Abed Gannoun', service: 'Frange', tel: '93 491 729', adresse: 'BANNEN', tarifMoyen: 0.45, commandes: 156 },
    { id: 'ST002', nom: 'Ali Sassi', service: 'Frange', tel: '98 234 567', adresse: 'Tunis', tarifMoyen: 0.42, commandes: 143 }
  ];

  const articles = [
    { ref: 'IB1020-B29-01', modele: 'IBIZA', dimensions: '1020', finition: 'Frange', prixRevient: 7.50, prixVente: 9.75, stock: 45 },
    { ref: 'NDL1020-B20-01', modele: 'ND LILI', dimensions: '1020', finition: 'Frange', prixRevient: 8.20, prixVente: 10.50, stock: 67 }
  ];

  const notifications = [
    { id: 1, type: 'alert', message: 'Machine M2301 - Ensouple à 320m', time: '2min' },
    { id: 2, type: 'alert', message: 'Machine M2305 - Ensouple à 350m', time: '15min' }
  ];

  const consoData = [
    { date: '11/10', theorique: 2150, reel: 2245 },
    { date: '12/10', theorique: 2180, reel: 2198 },
    { date: '13/10', theorique: 2200, reel: 2156 }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'orders', label: 'Commandes', icon: Package },
    { id: 'planning', label: 'Planification', icon: Calendar },
    { id: 'products', label: 'Articles', icon: Box },
    { 
      id: 'production', label: 'Production', icon: Factory, hasSubmenu: true,
      submenu: [
        { id: 'production-suivi', label: 'Suivi Production', icon: Activity },
        { id: 'production-of', label: 'Ordres Fabrication', icon: ClipboardList },
        { id: 'production-ensouples', label: 'Suivi Ensouples', icon: Zap }
      ]
    },
    {
      id: 'operators', label: 'Postes Opérateurs', icon: Users, hasSubmenu: true,
      submenu: [
        { id: 'operator-tisseur', label: 'Tableau Tisseur', icon: Factory },
        { id: 'operator-coupeur', label: 'Tableau Coupeur', icon: Scissors },
        { id: 'operator-magasinier-mp', label: 'Magasinier MP', icon: ShoppingBag }
      ]
    },
    { 
      id: 'stock', label: 'Stocks', icon: ClipboardList, hasSubmenu: true,
      submenu: [
        { id: 'stock-pf', label: 'Produit Fini', icon: Package2 },
        { id: 'stock-mp', label: 'Matière Première', icon: ShoppingBag },
        { id: 'stock-fourniture', label: 'Fournitures', icon: Package }
      ]
    },
    { id: 'subcontractors', label: 'Sous-Traitants', icon: UserCheck },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'shipping', label: 'Expédition', icon: Truck },
    { id: 'reports', label: 'Rapports', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Cog }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-20 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center gap-2 mb-8">
            <Scissors className="w-8 h-8" style={{ color: theme.primaryColor }} />
            {sidebarOpen && <span className="font-bold text-gray-800 text-sm">{theme.companyName}</span>}
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.hasSubmenu) {
                      if (item.id === 'stock') setStockMenuOpen(!stockMenuOpen);
                      else if (item.id === 'production') setProductionMenuOpen(!productionMenuOpen);
                      else if (item.id === 'operators') setOperatorsMenuOpen(!operatorsMenuOpen);
                    } else setCurrentView(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    currentView === item.id ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={currentView === item.id ? { backgroundColor: theme.primaryColor } : {}}>
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span className="font-medium flex-1 text-left">{item.label}</span>}
                  {item.hasSubmenu && sidebarOpen && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {item.hasSubmenu && sidebarOpen && ((item.id === 'stock' && stockMenuOpen) || (item.id === 'production' && productionMenuOpen) || (item.id === 'operators' && operatorsMenuOpen)) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((sub) => (
                      <button key={sub.id} onClick={() => setCurrentView(sub.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                          currentView === sub.id ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        style={currentView === sub.id ? { backgroundColor: theme.secondaryColor } : {}}>
                        <sub.icon className="w-4 h-4" />
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <header className="bg-white shadow-sm border-b fixed top-0 right-0 left-0 z-10" style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    style={{ backgroundColor: theme.accentColor }}>2</span>
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                 style={{ backgroundColor: theme.primaryColor }}>AD</div>
          </div>
        </div>
      </header>

      <main className="transition-all duration-300 pt-16 p-6" style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}>
        
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">📊 Tableau de Bord - Interactif</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => setCurrentView('orders')}>
                <Package className="w-6 h-6 mb-2" />
                <p className="text-xs">Commandes</p>
                <p className="text-2xl font-bold">{realData.commandesUniques}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => setCurrentView('production-of')}>
                <Factory className="w-6 h-6 mb-2" />
                <p className="text-xs">OF Actifs</p>
                <p className="text-2xl font-bold">{realData.ordresFabrication}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => setCurrentView('production-ensouples')}>
                <Activity className="w-6 h-6 mb-2" />
                <p className="text-xs">Machines</p>
                <p className="text-2xl font-bold">{realData.machinesActives}/{realData.totalMachines}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => setCurrentView('stock-mp')}>
                <ShoppingBag className="w-6 h-6 mb-2" />
                <p className="text-xs">Stock MP</p>
                <p className="text-2xl font-bold">{realData.poidsMP.toFixed(0)} kg</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => setCurrentView('subcontractors')}>
                <UserCheck className="w-6 h-6 mb-2" />
                <p className="text-xs">Sous-traitants</p>
                <p className="text-2xl font-bold">{realData.soustraitants}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                   onClick={() => setCurrentView('clients')}>
                <Users className="w-6 h-6 mb-2" />
                <p className="text-xs">Clients</p>
                <p className="text-2xl font-bold">{realData.clients}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Production 7 derniers jours</h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={consoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="theorique" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="reel" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {currentView === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">📦 Commandes</h1>
              <button onClick={() => alert('Export en cours...')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download className="w-5 h-5" />Export
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">N° Commande</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Articles</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Personnalisés</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {commandes.map((cmd) => (
                    <tr key={cmd.numCommande} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold">{cmd.numCommande}</td>
                      <td className="px-4 py-3 text-sm">{cmd.nomClient}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">{cmd.nbArticles}</span></td>
                      <td className="px-4 py-3">
                        {cmd.articles.filter(a => a.personnalisation === 'Oui').length > 0 && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-yellow-700">{cmd.articles.filter(a => a.personnalisation === 'Oui').length}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{cmd.statut}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setModalType('view-commande'); setSelectedItem(cmd); setShowModal(true); }}
                                className="p-2 hover:bg-blue-100 rounded">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'production-of' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">📋 Ordres de Fabrication</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">OF</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Article</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Qté</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Perso</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Machine</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Avancement</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ordresFabrication.map((of) => (
                    <tr key={of.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold">{of.id}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{of.article}</td>
                      <td className="px-4 py-3 text-sm">{of.qte}</td>
                      <td className="px-4 py-3">{of.personnalisation === 'Oui' && <Star className="w-4 h-4 text-yellow-500" />}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{of.machine}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${of.avancement}%` }} />
                          </div>
                          <span className="text-xs">{of.avancement}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setModalType('view-of'); setSelectedItem(of); setShowModal(true); }} className="p-2 hover:bg-blue-100 rounded">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'stock-mp' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">🧵 Stock Matière Première</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Couleur</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Stock (kg)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {couleursMP.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold">{c.code}</td>
                      <td className="px-4 py-3 text-sm">{c.nom}</td>
                      <td className="px-4 py-3 text-sm font-bold">{c.stock}</td>
                      <td className="px-4 py-3">
                        {c.stock < 500 ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">⚠️ Stock bas</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'production-ensouples' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">⚡ Suivi des Ensouples</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {machinesReelles.map((m) => (
                <div key={m.machine} className={`bg-white rounded-lg shadow-lg p-4 border-l-4 cursor-pointer hover:shadow-xl ${
                  m.status === 'alert' ? 'border-red-500' : 'border-green-500'
                }`} onClick={() => { setModalType('view-machine'); setSelectedItem(m); setShowModal(true); }}>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-bold text-lg">{m.machine}</h3>
                    <span className={`w-3 h-3 rounded-full ${m.status === 'alert' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  </div>
                  <p className="text-sm text-gray-600">{m.type}</p>
                  <p className="text-lg font-bold text-orange-600 mt-2">{m.restant}m</p>
                  <p className="text-xs text-gray-500">Autonomie: {Math.floor(m.restant / m.prod)}j</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'clients' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">👥 Clients</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((c) => (
                <div key={c.id} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="font-bold text-lg">{c.nom}</h3>
                  <div className="space-y-2 mt-3 text-sm">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span>{c.contact}</span></div>
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span>{c.email}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span>{c.tel}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'subcontractors' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">🤝 Sous-Traitants</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Téléphone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Tarif</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Commandes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {soustraitants.map((st) => (
                    <tr key={st.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold">{st.nom}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{st.service}</span></td>
                      <td className="px-4 py-3 text-sm">{st.tel}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">{st.tarifMoyen} DT</td>
                      <td className="px-4 py-3 text-sm">{st.commandes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'products' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">📦 Catalogue Articles</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Référence</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Modèle</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Prix Revient</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Prix Vente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {articles.map((art) => (
                    <tr key={art.ref} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold">{art.ref}</td>
                      <td className="px-4 py-3 text-sm">{art.modele}</td>
                      <td className="px-4 py-3 text-sm">{art.prixRevient} DT</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">{art.prixVente} DT</td>
                      <td className="px-4 py-3 text-sm">{art.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {['planning', 'production-suivi', 'operator-tisseur', 'operator-coupeur', 'operator-magasinier-mp', 'stock-pf', 'stock-fourniture', 'shipping', 'reports', 'settings'].includes(currentView) && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🚧 Module en Construction</h2>
            <p className="text-gray-600">Ce module sera développé prochainement</p>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {modalType === 'view-commande' && '📦 Détails Commande'}
                {modalType === 'view-of' && '📋 Détails OF'}
                {modalType === 'view-machine' && '⚙️ Détails Machine'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {modalType === 'view-commande' && selectedItem && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-600">N° Commande</p><p className="text-lg font-bold">{selectedItem.numCommande}</p></div>
                    <div><p className="text-sm text-gray-600">Client</p><p className="text-lg font-bold">{selectedItem.nomClient}</p></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Articles ({selectedItem.articles.length})</p>
                    {selectedItem.articles.map((art) => (
                      <div key={art.idOF} className="p-3 bg-gray-50 rounded mb-2">
                        <p className="font-bold">{art.refCommercial}</p>
                        <p className="text-sm">Qté: {art.qte}</p>
                        {art.personnalisation === 'Oui' && <p className="text-xs text-yellow-700">⭐ {art.detailsPerso}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {modalType === 'view-of' && selectedItem && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-600">N° OF</p><p className="text-lg font-bold">{selectedItem.id}</p></div>
                    <div><p className="text-sm text-gray-600">Article</p><p className="text-lg font-bold">{selectedItem.article}</p></div>
                    <div><p className="text-sm text-gray-600">Quantité</p><p className="text-lg font-bold">{selectedItem.qte} pcs</p></div>
                    <div><p className="text-sm text-gray-600">Machine</p><p className="text-lg font-bold">{selectedItem.machine}</p></div>
                  </div>
                  <div><p className="text-sm text-gray-600 mb-2">Avancement</p>
                    <div className="bg-gray-200 rounded-full h-4">
                      <div className="bg-blue-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                           style={{ width: `${selectedItem.avancement}%` }}>{selectedItem.avancement}%</div>
                    </div>
                  </div>
                </div>
              )}
              {modalType === 'view-machine' && selectedItem && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-600">Machine</p><p className="text-lg font-bold">{selectedItem.machine}</p></div>
                    <div><p className="text-sm text-gray-600">Type</p><p className="text-lg font-bold">{selectedItem.type}</p></div>
                    <div><p className="text-sm text-gray-600">Mètres restants</p><p className="text-lg font-bold text-orange-600">{selectedItem.restant}m</p></div>
                    <div><p className="text-sm text-gray-600">Opérateur</p><p className="text-lg font-bold">{selectedItem.operateur}</p></div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-orange-900">⚠️ Alerte Stock</p>
                    <p className="text-sm text-orange-800 mt-1">Autonomie: {Math.floor(selectedItem.restant / selectedItem.prod)} jours</p>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}