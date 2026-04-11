import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, Calendar, Users, Cog, Bell, Menu, AlertCircle, CheckCircle, 
  Clock, TrendingUp, Scissors, Factory, ClipboardList, Truck, BarChart3, Download, Box, Boxes, 
  Package2, ShoppingBag, UserCheck, ChevronDown, ChevronRight, Activity, Zap, AlertTriangle, 
  Eye, Plus, ArrowRight, Edit, Trash2, Search, Filter, User, Phone, Mail, Database, Save, 
  XCircle, Camera, FileText, History, DollarSign, Palette, Star
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function FoutaManagementApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stockMenuOpen, setStockMenuOpen] = useState(false);
  const [productionMenuOpen, setProductionMenuOpen] = useState(false);
  const [operatorsMenuOpen, setOperatorsMenuOpen] = useState(false);

  const [theme] = useState({
    primaryColor: '#2563eb',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    companyName: 'FOUTA Manufacturing'
  });

  // DONNÉES RÉELLES
  const [realData] = useState({
    totalCommandes: 295,
    commandesUniques: 156,
    ordresFabrication: 295,
    totalMachines: 18,
    machinesActives: 14,
    soustraitants: 42,
    clients: 156,
    articles: 1255,
    poidsMP: 90298.11
  });

  // COMMANDES - Structure correcte: 1 Commande → N Articles
  const [commandes] = useState([
    { 
      numCommande: 'CM-FT0119',
      dateEnvoi: '2026-01-22',
      numClient: 'CL00884',
      nomClient: 'DECATHLON',
      nbArticles: 98,
      statut: 'En cours',
      priorite: 'Haute',
      articles: [
        { idOF: 'OF249780', refCommercial: 'IB1020-B29-01', modele: 'IBIZA', qte: 320, personnalisation: 'Non', detailsPerso: '' },
        { idOF: 'OF249781', refCommercial: 'IB1020-B20-01', modele: 'IBIZA', qte: 320, personnalisation: 'Non', detailsPerso: '' },
        { idOF: 'OF249782', refCommercial: 'IB1020-B24-01', modele: 'IBIZA', qte: 320, personnalisation: 'Non', detailsPerso: '' },
        { idOF: 'OF249783', refCommercial: 'MA1020-B32-01', modele: 'MARA', qte: 320, personnalisation: 'Oui', detailsPerso: 'Broderie logo client' },
        { idOF: 'OF249784', refCommercial: 'DL1020-B30-LuAr', modele: 'DOLCE', qte: 320, personnalisation: 'Non', detailsPerso: '' }
      ]
    },
    { 
      numCommande: 'CM-FT0069',
      dateEnvoi: '2025-12-15',
      numClient: 'CL00296',
      nomClient: 'MAISON DU MONDE',
      nbArticles: 35,
      statut: 'En production',
      priorite: 'Urgente',
      articles: [
        { idOF: 'OF244984', refCommercial: 'NDL1020-B20-01', modele: 'ND LILI', qte: 70, personnalisation: 'Oui', detailsPerso: 'Étiquette personnalisée' },
        { idOF: 'OF244985', refCommercial: 'AR2426-B15-01', modele: 'ARTHUR', qte: 120, personnalisation: 'Non', detailsPerso: '' }
      ]
    },
    { 
      numCommande: 'CM-FT0108',
      dateEnvoi: '2025-11-28',
      numClient: 'CL00296',
      nomClient: 'MAISON DU MONDE',
      nbArticles: 12,
      statut: 'Terminée',
      priorite: 'Normale',
      articles: [
        { idOF: 'OF246533', refCommercial: 'EPMA0919-B15-02', modele: 'MARINIERE', qte: 70, personnalisation: 'Non', detailsPerso: '' },
        { idOF: 'OF246535', refCommercial: 'EPMA0919-B03-02', modele: 'MARINIERE', qte: 46, personnalisation: 'Non', detailsPerso: '' }
      ]
    },
    { 
      numCommande: 'CM-FT0125',
      dateEnvoi: '2025-12-20',
      numClient: 'CL00162',
      nomClient: 'CARREFOUR',
      nbArticles: 28,
      statut: 'En cours',
      priorite: 'Haute',
      articles: [
        { idOF: 'OF250123', refCommercial: 'UNS1020-09', modele: 'UNI SURPIQUE', qte: 500, personnalisation: 'Oui', detailsPerso: 'Couleur spéciale sur demande' },
        { idOF: 'OF250124', refCommercial: 'SO1020-Q29-11-14', modele: 'SORRENTO', qte: 250, personnalisation: 'Non', detailsPerso: '' }
      ]
    }
  ]);

  // ORDRES DE FABRICATION (1 OF = 1 Article d'une Commande)
  const [ordresFabrication] = useState([
    { id: 'OF249780', numCmd: 'CM-FT0119', client: 'CL00884', article: 'IB1020-B29-01', modele: 'IBIZA', qte: 320, personnalisation: 'Non', statut: 'En cours', priorite: 'Haute', machine: 'M2302', avancement: 45 },
    { id: 'OF249781', numCmd: 'CM-FT0119', client: 'CL00884', article: 'IB1020-B20-01', modele: 'IBIZA', qte: 320, personnalisation: 'Non', statut: 'Planifié', priorite: 'Haute', machine: 'M2307', avancement: 0 },
    { id: 'OF249782', numCmd: 'CM-FT0119', client: 'CL00884', article: 'IB1020-B24-01', modele: 'IBIZA', qte: 320, personnalisation: 'Non', statut: 'En attente', priorite: 'Haute', machine: null, avancement: 0 },
    { id: 'OF249783', numCmd: 'CM-FT0119', client: 'CL00884', article: 'MA1020-B32-01', modele: 'MARA', qte: 320, personnalisation: 'Oui', detailsPerso: 'Broderie logo', statut: 'En cours', priorite: 'Haute', machine: 'M2301', avancement: 30 },
    { id: 'OF244984', numCmd: 'CM-FT0069', client: 'CL00296', article: 'NDL1020-B20-01', modele: 'ND LILI', qte: 70, personnalisation: 'Oui', detailsPerso: 'Étiquette perso', statut: 'En production', priorite: 'Urgente', machine: 'M2301', avancement: 65 },
    { id: 'OF250123', numCmd: 'CM-FT0125', client: 'CL00162', article: 'UNS1020-09', modele: 'UNI SURPIQUE', qte: 500, personnalisation: 'Oui', detailsPerso: 'Couleur spéciale', statut: 'En cours', priorite: 'Haute', machine: 'M2304', avancement: 25 }
  ]);

  const [couleursMP] = useState([
    { id: 'C01_S2023', code: 'C01', nom: 'BLANC', nm: 'NM05-01.00', lot: 'S2023', stock: 381.5, entrepot: 'E2' },
    { id: 'C02_58733', code: 'C02', nom: 'ECRU', nm: 'NM05-02.00', lot: '58733', stock: 1113, entrepot: 'E2' },
    { id: 'C04_L2024', code: 'C04', nom: 'BEIGE', nm: 'NM05-04.00', lot: 'L2024', stock: 456.2, entrepot: 'E1' },
    { id: 'C12_B2023', code: 'C12', nom: 'BLEU CIEL', nm: 'NM05-12.00', lot: 'B2023', stock: 567.2, entrepot: 'E1' },
    { id: 'C15_M2024', code: 'C15', nom: 'BLEU MARINE', nm: 'NM05-15.00', lot: 'M2024', stock: 892.4, entrepot: 'E2' },
    { id: 'C20_R2023', code: 'C20', nom: 'ROUGE', nm: 'NM05-20.00', lot: 'R2023', stock: 245.8, entrepot: 'E1' },
    { id: 'C24_O2024', code: 'C24', nom: 'ORANGE', nm: 'NM05-24.00', lot: 'O2024', stock: 334.6, entrepot: 'E2' }
  ]);

  const [machinesReelles] = useState([
    { machine: 'M2301', type: 'HTVS4/S', nbFils: 966, restant: 320, status: 'alert', prod: 145, operateur: 'Majdi', operations: 18 },
    { machine: 'M2302', type: 'HTVS6/S', nbFils: 966, restant: 1750, status: 'ok', prod: 152, operateur: 'Zied', operations: 30 },
    { machine: 'M2303', type: 'HTVS4/S', nbFils: 1450, restant: 2100, status: 'ok', prod: 138, operateur: 'Majdi', operations: 8 },
    { machine: 'M2304', type: 'GTN6/SD', nbFils: 1820, restant: 920, status: 'ok', prod: 160, operateur: 'Badie', operations: 12 },
    { machine: 'M2305', type: 'HTV8/S', nbFils: 2140, restant: 350, status: 'alert', prod: 148, operateur: 'Dimatex', operations: 15 }
  ]);

  const [notifications] = useState([
    { id: 1, type: 'alert', message: 'Machine M2301 - Ensouple à 320m', time: '2min' },
    { id: 2, type: 'alert', message: 'Machine M2305 - Ensouple à 350m', time: '15min' },
    { id: 3, type: 'info', message: 'OF246533 - Coupe terminée (46pc)', time: '1h' },
    { id: 4, type: 'urgent', message: 'Stock MP C01 faible (381kg)', time: '2h' }
  ]);

  const [consoData] = useState([
    { date: '11/10', theorique: 2150, reel: 2245 },
    { date: '12/10', theorique: 2180, reel: 2198 },
    { date: '13/10', theorique: 2200, reel: 2156 },
    { date: '14/10', theorique: 2160, reel: 2280 },
    { date: '15/10', theorique: 2190, reel: 2245 },
    { date: '16/10', theorique: 2170, reel: 2210 },
    { date: '17/10', theorique: 2200, reel: 2268 }
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'orders', label: 'Commandes', icon: Package, badge: realData.commandesUniques.toString() },
    { id: 'planning', label: 'Planification', icon: Calendar },
    { id: 'products', label: 'Articles', icon: Box, badge: realData.articles.toString() },
    { 
      id: 'production', 
      label: 'Production', 
      icon: Factory,
      hasSubmenu: true,
      submenu: [
        { id: 'production-suivi', label: 'Suivi Production', icon: Activity },
        { id: 'production-of', label: 'Ordres Fabrication', icon: ClipboardList },
        { id: 'production-ensouples', label: 'Suivi Ensouples', icon: Zap }
      ]
    },
    {
      id: 'operators',
      label: 'Postes Opérateurs',
      icon: Users,
      hasSubmenu: true,
      submenu: [
        { id: 'operator-tisseur', label: 'Tableau Tisseur', icon: Factory },
        { id: 'operator-coupeur', label: 'Tableau Coupeur', icon: Scissors },
        { id: 'operator-magasinier-mp', label: 'Magasinier MP', icon: ShoppingBag }
      ]
    },
    { 
      id: 'stock', 
      label: 'Stocks', 
      icon: ClipboardList,
      hasSubmenu: true,
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
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-20 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center gap-2 mb-8">
            <Scissors className="w-8 h-8" style={{ color: theme.primaryColor }} />
            {sidebarOpen && <span className="font-bold text-gray-800 text-sm">{theme.companyName}</span>}
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = currentView === item.id || 
                (item.id === 'stock' && currentView.startsWith('stock-')) ||
                (item.id === 'production' && currentView.startsWith('production-')) ||
                (item.id === 'operators' && currentView.startsWith('operator-'));
              
              const isMenuOpen = (item.id === 'stock' && stockMenuOpen) || 
                                 (item.id === 'production' && productionMenuOpen) ||
                                 (item.id === 'operators' && operatorsMenuOpen);
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (item.hasSubmenu) {
                        if (item.id === 'stock') setStockMenuOpen(!stockMenuOpen);
                        else if (item.id === 'production') setProductionMenuOpen(!productionMenuOpen);
                        else if (item.id === 'operators') setOperatorsMenuOpen(!operatorsMenuOpen);
                      } else {
                        setCurrentView(item.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                      isActive ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={isActive ? { backgroundColor: theme.primaryColor } : {}}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="font-medium flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs rounded-full text-white flex-shrink-0"
                                style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : theme.accentColor }}>
                            {item.badge}
                          </span>
                        )}
                        {item.hasSubmenu && (
                          <span className="flex-shrink-0">
                            {isMenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                  
                  {item.hasSubmenu && sidebarOpen && isMenuOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.id}
                          onClick={() => setCurrentView(subitem.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                            currentView === subitem.id ? 'text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          style={currentView === subitem.id ? { backgroundColor: theme.secondaryColor } : {}}
                        >
                          <subitem.icon className="w-4 h-4" />
                          <span>{subitem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Header */}
      <header className="bg-white shadow-sm border-b fixed top-0 right-0 left-0 z-10" style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6" style={{ color: theme.primaryColor }} />
              <span className="text-xl font-bold text-gray-800">{theme.companyName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                      style={{ backgroundColor: theme.accentColor }}>
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-4 top-16 w-96 bg-white rounded-lg shadow-2xl border z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b sticky top-0 bg-white">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-4 border-b hover:bg-gray-50 ${
                    notif.type === 'alert' ? 'bg-orange-50' : notif.type === 'urgent' ? 'bg-red-50' : ''
                  }`}>
                    <div className="flex items-start gap-3">
                      {notif.type === 'alert' || notif.type === 'urgent' ? (
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                   style={{ backgroundColor: theme.primaryColor }}>AD</div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="transition-all duration-300 pt-16 p-6" style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}>
        
        {/* DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800">📊 Tableau de Bord</h1>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                <Database className="w-5 h-5 text-green-700" />
                <span className="text-sm font-medium text-green-800">Données réelles synchronisées</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
                <Package className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-xs opacity-90">Commandes</p>
                <p className="text-2xl font-bold mt-1">{realData.commandesUniques}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
                <ClipboardList className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-xs opacity-90">Articles</p>
                <p className="text-2xl font-bold mt-1">{realData.totalCommandes}</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-4 text-white">
                <Factory className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-xs opacity-90">OF Actifs</p>
                <p className="text-2xl font-bold mt-1">{realData.ordresFabrication}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
                <Activity className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-xs opacity-90">Machines</p>
                <p className="text-2xl font-bold mt-1">{realData.machinesActives}/{realData.totalMachines}</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-4 text-white">
                <UserCheck className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-xs opacity-90">Sous-traitants</p>
                <p className="text-2xl font-bold mt-1">{realData.soustraitants}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white">
                <Users className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-xs opacity-90">Clients</p>
                <p className="text-2xl font-bold mt-1">{realData.clients}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Production 7 derniers jours</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={consoData}>
                    <defs>
                      <linearGradient id="colorTheo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="theorique" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTheo)" name="Théorique" />
                    <Area type="monotone" dataKey="reel" stroke="#10b981" fillOpacity={1} fill="url(#colorReel)" name="Réel" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Commandes Urgentes</h2>
                <div className="space-y-3">
                  {ordresFabrication.filter(of => of.priorite === 'Urgente').slice(0, 3).map((of) => (
                    <div key={of.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div>
                        <p className="font-bold text-gray-900">{of.id}</p>
                        <p className="text-sm text-gray-600">{of.modele} • {of.qte}pc</p>
                        <p className="text-xs text-gray-500">Commande: {of.numCmd}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                        URGENTE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Machines en Alerte</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {machinesReelles.filter(m => m.status === 'alert' || m.status === 'warning').map((m) => (
                  <div key={m.machine} className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{m.machine}</h3>
                      <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                    </div>
                    <p className="text-sm text-gray-600">{m.type}</p>
                    <p className="text-lg font-bold text-orange-600 mt-2">{m.restant}m</p>
                    <p className="text-xs text-gray-500">Autonomie: {Math.floor(m.restant / m.prod)}j</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE COMMANDES */}
        {currentView === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">📦 Gestion des Commandes</h1>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-blue-900 font-semibold">💡 Structure des Commandes</p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>1 Commande</strong> (ex: CM-FT0119) contient <strong>N Articles</strong> (ex: IB1020-B29-01, MA1020-B32-01)
                <br/>
                Chaque article peut être <strong>personnalisé ou non</strong>
                <br/>
                Chaque article génère <strong>1 Ordre de Fabrication (OF)</strong> quand la production commence
              </p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">N° Commande</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date Envoi</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Articles</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Personnalisés</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Priorité</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {commandes.map((cmd) => {
                      const nbPerso = cmd.articles.filter(a => a.personnalisation === 'Oui').length;
                      return (
                        <tr key={cmd.numCommande} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">{cmd.numCommande}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <p className="font-medium">{cmd.nomClient}</p>
                            <p className="text-xs text-gray-500">{cmd.numClient}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{cmd.dateEnvoi}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                              {cmd.nbArticles} articles
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {nbPerso > 0 ? (
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-semibold text-yellow-700">{nbPerso}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              cmd.statut === 'Terminée' ? 'bg-gray-200 text-gray-800' :
                              cmd.statut === 'En production' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {cmd.statut}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              cmd.priorite === 'Urgente' ? 'bg-red-100 text-red-800' :
                              cmd.priorite === 'Haute' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {cmd.priorite}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Détails d'une commande exemple */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                📋 Détails Commande {commandes[0].numCommande}
              </h2>
              <div className="space-y-3">
                {commandes[0].articles.slice(0, 5).map((art) => (
                  <div key={art.idOF} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{art.refCommercial}</p>
                        {art.personnalisation === 'Oui' && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{art.modele} • Qté: {art.qte}</p>
                      {art.personnalisation === 'Oui' && (
                        <p className="text-xs text-yellow-700 mt-1">
                          ⭐ Personnalisé: {art.detailsPerso}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        OF: {art.idOF}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTION - OF */}
        {currentView === 'production-of' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">📋 Ordres de Fabrication</h1>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">OF</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Commande</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Article</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Modèle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Qté</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Perso</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Machine</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Avancement</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ordresFabrication.map((of) => (
                      <tr key={of.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{of.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{of.numCmd}</td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-medium">{of.article}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{of.modele}</td>
                        <td className="px-4 py-3 text-sm font-medium">{of.qte}</td>
                        <td className="px-4 py-3">
                          {of.personnalisation === 'Oui' ? (
                            <div className="flex flex-col">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs text-yellow-700 mt-1">{of.detailsPerso}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {of.machine ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {of.machine}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${of.avancement}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{of.avancement}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            of.statut === 'En cours' || of.statut === 'En production' ? 'bg-green-100 text-green-800' :
                            of.statut === 'Planifié' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {of.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stock MP */}
        {currentView === 'stock-mp' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">🧵 Stock Matière Première</h1>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nouvelle couleur
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Poids Total MP</p>
                <p className="text-2xl font-bold text-gray-900">{realData.poidsMP.toFixed(2)} kg</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Couleurs Actives</p>
                <p className="text-2xl font-bold text-blue-600">{couleursMP.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Stock Minimum</p>
                <p className="text-2xl font-bold text-orange-600">{couleursMP.filter(c => c.stock < 500).length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Entrepôts</p>
                <p className="text-2xl font-bold text-purple-600">2</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Couleur</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">NM</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Lot</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Stock (kg)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Entrepôt</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {couleursMP.map((couleur) => (
                    <tr key={couleur.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{couleur.code}</td>
                      <td className="px-4 py-3 text-sm font-medium">{couleur.nom}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{couleur.nm}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{couleur.lot}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{couleur.stock}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {couleur.entrepot}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {couleur.stock < 500 ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Stock bas
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ensouples */}
        {currentView === 'production-ensouples' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">⚡ Suivi des Ensouples</h1>
              <div className="flex gap-2">
                <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                  ✓ {machinesReelles.filter(m => m.status === 'ok').length} OK
                </span>
                <span className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
                  ⚠ {machinesReelles.filter(m => m.status === 'alert' || m.status === 'warning').length} Alerte
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {machinesReelles.map((machine) => (
                <div key={machine.machine} 
                     className={`bg-white rounded-lg shadow-lg p-4 border-l-4 ${
                       machine.status === 'alert' ? 'border-red-500' :
                       machine.status === 'warning' ? 'border-orange-500' :
                       'border-green-500'
                     }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{machine.machine}</h3>
                      <p className="text-sm text-gray-600">{machine.type}</p>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${
                      machine.status === 'alert' ? 'bg-red-500 animate-pulse' :
                      machine.status === 'warning' ? 'bg-orange-500 animate-pulse' :
                      'bg-green-500'
                    }`} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Restant:</span>
                      <span className={`text-sm font-bold ${
                        machine.restant <= 500 ? 'text-red-600' : 'text-gray-900'
                      }`}>{machine.restant}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Production:</span>
                      <span className="text-sm font-medium text-gray-900">{machine.prod}m/j</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Autonomie:</span>
                      <span className="text-sm font-medium text-blue-600">{Math.floor(machine.restant / machine.prod)}j</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Opérateur:</span>
                      <span className="text-sm font-medium text-gray-900">{machine.operateur}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{machine.nbFils} fils</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {machine.operations} ops
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}