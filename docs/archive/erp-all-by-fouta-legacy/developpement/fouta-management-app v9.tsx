import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Calendar, Users, Cog, Bell, 
  Menu, X, AlertCircle, CheckCircle, Clock, TrendingUp,
  Scissors, Factory, ClipboardList, Truck, BarChart3, Upload,
  Box, Boxes, Package2, ShoppingBag, UserCheck, ChevronDown, ChevronRight,
  Activity, Zap, AlertTriangle, Download, Image, FileText, History,
  Eye, Plus, Camera, CalendarCheck, Database
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function FoutaManagementApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [stockMenuOpen, setStockMenuOpen] = useState(false);
  const [productionMenuOpen, setProductionMenuOpen] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  
  // Données réelles extraites des fichiers Excel
  const [realData] = useState({
    totalCommandes: 11333,
    ordresFabrication: 5624,
    totalMachines: 18,
    machinesActives: 14,
    soustraitants: 42,
    poidsMP: 90298.11,
    operationsTissage: 230,
    articles: 1255,
    modeles: 135
  });

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', message: 'Machine M2301 - Ensouple à 320m', time: '2min' },
    { id: 2, type: 'alert', message: 'Machine M2305 - Ensouple à 350m', time: '15min' },
    { id: 3, type: 'info', message: 'Ordissage M2308 terminé', time: '1h' },
    { id: 4, type: 'alert', message: 'Stock MP Blanc NM05 faible (381kg)', time: '2h' }
  ]);
  
  // Données machines réelles
  const [machinesReelles] = useState([
    { machine: 'M2301', type: 'HTVS4/S', nbFils: 966, restant: 320, status: 'alert', prod: 145, operateur: 'Majdi', operations: 18 },
    { machine: 'M2302', type: 'HTVS6/S', nbFils: 966, restant: 1750, status: 'ok', prod: 152, operateur: 'Zied', operations: 30 },
    { machine: 'M2303', type: 'HTVS4/S', nbFils: 1450, restant: 2100, status: 'ok', prod: 138, operateur: 'Majdi', operations: 8 },
    { machine: 'M2304', type: 'GTN6/SD', nbFils: 1820, restant: 920, status: 'ok', prod: 160, operateur: 'Badie', operations: 12 },
    { machine: 'M2305', type: 'HTV8/S', nbFils: 2140, restant: 350, status: 'alert', prod: 148, operateur: 'Dimatex', operations: 15 },
    { machine: 'M2306', type: 'HTV8/S', nbFils: 966, restant: 1200, status: 'ok', prod: 155, operateur: 'Majdi', operations: 22 },
    { machine: 'M2307', type: 'HTV4/SD', nbFils: 1450, restant: 480, status: 'warning', prod: 142, operateur: 'Zied', operations: 19 },
    { machine: 'M2308', type: 'GTN6/SD', nbFils: 1820, restant: 2500, status: 'ok', prod: 168, operateur: 'Badie', operations: 44 },
    { machine: 'M2309', type: 'GTN6/SD', nbFils: 966, restant: 1800, status: 'ok', prod: 150, operateur: 'Majdi', operations: 4 },
    { machine: 'M2311', type: 'GTN6/SD', nbFils: 1450, restant: 420, status: 'warning', prod: 145, operateur: 'Zied', operations: 26 },
    { machine: 'M04', type: 'HTV8/J', nbFils: 2140, restant: 3200, status: 'ok', prod: 175, operateur: 'Dimatex', operations: 32 },
    { machine: 'M2401', type: 'HTV8/J', nbFils: 1820, restant: 850, status: 'ok', prod: 162, operateur: 'Badie', operations: 0 },
    { machine: 'M2402', type: 'HTV8/J', nbFils: 966, restant: 1400, status: 'ok', prod: 158, operateur: 'Majdi', operations: 14 },
    { machine: 'M2403', type: 'HTV8/J', nbFils: 1450, restant: 980, status: 'ok', prod: 153, operateur: 'Zied', operations: 11 }
  ]);

  const [consoData] = useState([
    { date: '11/10', theorique: 2150, reel: 2245, ecart: 95 },
    { date: '12/10', theorique: 2180, reel: 2198, ecart: 18 },
    { date: '13/10', theorique: 2200, reel: 2156, ecart: -44 },
    { date: '14/10', theorique: 2160, reel: 2280, ecart: 120 },
    { date: '15/10', theorique: 2190, reel: 2245, ecart: 55 },
    { date: '16/10', theorique: 2170, reel: 2210, ecart: 40 },
    { date: '17/10', theorique: 2200, reel: 2268, ecart: 68 }
  ]);

  const [productionStats] = useState([
    { name: 'Actives', value: 14, color: '#10b981' },
    { name: 'En Alerte', value: 2, color: '#f59e0b' },
    { name: 'Arrêtées', value: 4, color: '#ef4444' }
  ]);

  const [stockMP] = useState([
    { couleur: 'BLANC', code: 'C01', nm: 'NM05-01.00', stock: 381.5, statut: 'Critique' },
    { couleur: 'ECRU', code: 'C02', nm: 'NM05-02.00', stock: 1123.5, statut: 'Bon' },
    { couleur: 'BLEU', code: 'C12', nm: 'NM05-12.00', stock: 567.2, statut: 'Moyen' },
    { couleur: 'VERT', code: 'C15', nm: 'NM05-15.00', stock: 892.4, statut: 'Bon' }
  ]);

  const [modelesProd] = useState([
    { modele: 'UNI SURPIQUE', quantite: 2847, pourcentage: 28 },
    { modele: 'ARTHUR', quantite: 1523, pourcentage: 15 },
    { modele: 'IBIZA', quantite: 1345, pourcentage: 13 },
    { modele: 'MARINIERE', quantite: 982, pourcentage: 10 },
    { modele: 'BERBER', quantite: 876, pourcentage: 9 },
    { modele: 'Autres', quantite: 2551, pourcentage: 25 }
  ]);

  const [theme, setTheme] = useState({
    primaryColor: '#2563eb',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    darkMode: false,
    companyName: 'FOUTA Manufacturing',
    borderRadius: 'medium',
    fontSize: 'medium',
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result);
        setShowLogoUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateTheme = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  // Simulation notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const alertMachines = machinesReelles.filter(m => m.status === 'alert' || m.status === 'warning');
      if (alertMachines.length > 0 && Math.random() > 0.7) {
        const machine = alertMachines[Math.floor(Math.random() * alertMachines.length)];
        const newNotif = {
          id: Date.now(),
          type: 'alert',
          message: `Machine ${machine.machine} - Alerte ensouple à ${machine.restant}m`,
          time: 'maintenant'
        };
        setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [machinesReelles]);

  const exportToExcel = () => {
    const header = ['Machine', 'Type', 'Nb Fils', 'Métrage Restant', 'Status', 'Opérateur', 'Opérations', 'Date'];
    const rows = machinesReelles.map(m => [
      m.machine, m.type, m.nbFils, m.restant, m.status, m.operateur, m.operations, '17/10/2025'
    ]);
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_production_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const machinesAlertes = machinesReelles.filter(m => m.status === 'alert').length;
  const machinesWarning = machinesReelles.filter(m => m.status === 'warning').length;
  const productionMoyenne = Math.floor(machinesReelles.reduce((acc, m) => acc + m.prod, 0) / machinesReelles.length);
  const tauxUtilisation = ((realData.machinesActives / realData.totalMachines) * 100).toFixed(1);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, badge: null },
    { id: 'planning', label: 'Planification', icon: Calendar, badge: '23' },
    { id: 'orders', label: 'Commandes', icon: Package, badge: realData.ordresFabrication.toString() },
    { id: 'products', label: 'Produits', icon: Box, badge: null },
    { 
      id: 'production', 
      label: 'Production', 
      icon: Factory, 
      badge: null,
      hasSubmenu: true,
      submenu: [
        { id: 'production-suivi', label: 'Suivi Production', icon: Activity },
        { id: 'production-of', label: 'Ordres de Fabrication', icon: ClipboardList },
        { id: 'production-ensouples', label: 'Suivi Ensouples', icon: Zap }
      ]
    },
    { 
      id: 'stock', 
      label: 'Stock', 
      icon: ClipboardList, 
      badge: null,
      hasSubmenu: true,
      submenu: [
        { id: 'stock-pf', label: 'Produit Fini', icon: Package2 },
        { id: 'stock-sf', label: 'Semi-Fini', icon: Boxes },
        { id: 'stock-mp', label: 'Matière Première', icon: ShoppingBag },
        { id: 'stock-fourniture', label: 'Fourniture', icon: Package }
      ]
    },
    { id: 'subcontractors', label: 'Sous-Traitants', icon: UserCheck, badge: realData.soustraitants.toString() },
    { id: 'shipping', label: 'Expédition', icon: Truck, badge: null },
    { id: 'reports', label: 'Rapports', icon: BarChart3, badge: null },
    { id: 'users', label: 'Utilisateurs', icon: Users, badge: null },
    { id: 'settings', label: 'Paramètres', icon: Cog, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-20 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className="h-8 w-auto" />
            ) : (
              <Scissors className="w-8 h-8" style={{ color: theme.primaryColor }} />
            )}
            {sidebarOpen && (
              <span className="font-bold text-gray-800">{theme.companyName}</span>
            )}
          </div>

          <nav className="mt-8 space-y-1">
            {menuItems.map((item) => {
              const isActive = currentView === item.id || 
                (item.id === 'stock' && currentView.startsWith('stock-')) ||
                (item.id === 'production' && currentView.startsWith('production-'));
              
              const isStockOpen = item.id === 'stock' && stockMenuOpen;
              const isProdOpen = item.id === 'production' && productionMenuOpen;
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (item.hasSubmenu) {
                        if (item.id === 'stock') {
                          setStockMenuOpen(!stockMenuOpen);
                        } else if (item.id === 'production') {
                          setProductionMenuOpen(!productionMenuOpen);
                        }
                      } else {
                        setCurrentView(item.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={isActive ? { backgroundColor: theme.primaryColor } : {}}
                  >
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    {item.badge && sidebarOpen && (
                      <span 
                        className="ml-auto px-2 py-1 text-xs rounded-full text-white"
                        style={{ 
                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : theme.accentColor
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.hasSubmenu && sidebarOpen && (
                      <span className="ml-auto">
                        {(isStockOpen || isProdOpen) 
                          ? <ChevronDown className="w-4 h-4" /> 
                          : <ChevronRight className="w-4 h-4" />}
                      </span>
                    )}
                  </button>
                  
                  {item.hasSubmenu && sidebarOpen && (
                    <div>
                      {isStockOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((subitem) => (
                            <button
                              key={subitem.id}
                              onClick={() => setCurrentView(subitem.id)}
                              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                                currentView === subitem.id
                                  ? 'text-white shadow' 
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              style={currentView === subitem.id ? { backgroundColor: theme.secondaryColor } : {}}
                            >
                              <subitem.icon className="w-4 h-4" />
                              <span>{subitem.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {isProdOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((subitem) => (
                            <button
                              key={subitem.id}
                              onClick={() => setCurrentView(subitem.id)}
                              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                                currentView === subitem.id
                                  ? 'text-white shadow' 
                                  : 'text-gray-600 hover:bg-gray-100'
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
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 z-10" style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setShowLogoUpload(true)}
              title="Cliquer pour changer le logo"
            >
              {companyLogo ? (
                <img src={companyLogo} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <Scissors className="w-6 h-6" style={{ color: theme.primaryColor }} />
                  <span className="text-xl font-bold text-gray-800">{theme.companyName}</span>
                </div>
              )}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span 
                  className="absolute top-1 right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-4 top-16 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        notif.type === 'alert' ? 'bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {notif.type === 'alert' ? (
                          <AlertTriangle className="w-5 h-5 text-orange-600 mt-1" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                   style={{ backgroundColor: theme.primaryColor }}>
                AD
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="transition-all duration-300 pt-16 p-6" style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}>
        
        {/* DASHBOARD PRINCIPAL - Données Réelles */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800">📊 Tableau de Bord</h1>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                <Database className="w-5 h-5 text-green-700" />
                <span className="text-sm font-medium text-green-800">Données réelles synchronisées</span>
              </div>
            </div>

            {/* KPIs Principaux */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
                <Package className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Commandes Totales</p>
                <p className="text-3xl font-bold mt-1">{realData.totalCommandes.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">Toute période</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
                <Factory className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Ordres de Fabrication</p>
                <p className="text-3xl font-bold mt-1">{realData.ordresFabrication.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">En cours</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
                <Activity className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Machines Actives</p>
                <p className="text-3xl font-bold mt-1">{realData.machinesActives}/{realData.totalMachines}</p>
                <p className="text-xs opacity-75 mt-2">Taux: {tauxUtilisation}%</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Alertes</p>
                <p className="text-3xl font-bold mt-1">{machinesAlertes + machinesWarning}</p>
                <p className="text-xs opacity-75 mt-2">Machines en alerte</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-5 text-white">
                <UserCheck className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Sous-Traitants</p>
                <p className="text-3xl font-bold mt-1">{realData.soustraitants}</p>
                <p className="text-xs opacity-75 mt-2">Partenaires actifs</p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: theme.primaryColor }} />
                  Production Journalière (7 derniers jours)
                </h2>
                <ResponsiveContainer width="100%" height={280}>
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
                    <Area type="monotone" dataKey="theorique" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTheo)" name="Théorique (m)" />
                    <Area type="monotone" dataKey="reel" stroke="#10b981" fillOpacity={1} fill="url(#colorReel)" name="Réel (m)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: theme.secondaryColor }} />
                  Top Modèles Produits
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={modelesProd}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="modele" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantite" fill="#10b981" name="Quantité" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* État des Machines */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" style={{ color: theme.primaryColor }} />
                État des Machines en Temps Réel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {machinesReelles.slice(0, 8).map((machine, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      machine.status === 'alert' ? 'bg-red-50 border-red-500' :
                      machine.status === 'warning' ? 'bg-orange-50 border-orange-500' :
                      'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{machine.machine}</h3>
                      <span className={`w-3 h-3 rounded-full ${
                        machine.status === 'alert' ? 'bg-red-500 animate-pulse' :
                        machine.status === 'warning' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`} />
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{machine.type}</p>
                    <p className="text-sm text-gray-700">Restant: <span className="font-bold">{machine.restant}m</span></p>
                    <p className="text-xs text-gray-500 mt-1">Op: {machine.operateur}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE SUIVI PRODUCTION */}
        {currentView === 'production-suivi' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">📊 Suivi de Production en Temps Réel</h1>
              <div className="flex gap-2">
                <button 
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export Excel
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
                <p className="text-sm opacity-90">Machines Actives</p>
                <p className="text-3xl font-bold mt-1">{realData.machinesActives}</p>
                <p className="text-xs opacity-75 mt-1">sur {realData.totalMachines} machines</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Alertes Critiques</p>
                    <p className="text-3xl font-bold mt-1">{machinesAlertes}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 opacity-75" />
                </div>
                <p className="text-xs opacity-75 mt-1">≤ 500 mètres</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 text-white">
                <p className="text-sm opacity-90">Production Moy.</p>
                <p className="text-3xl font-bold mt-1">{productionMoyenne} m</p>
                <p className="text-xs opacity-75 mt-1">par machine/jour</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 text-white">
                <p className="text-sm opacity-90">Taux Utilisation</p>
                <p className="text-3xl font-bold mt-1">{tauxUtilisation}%</p>
                <p className="text-xs opacity-75 mt-1">{realData.machinesActives}/{realData.totalMachines} machines</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-4 text-white">
                <p className="text-sm opacity-90">Opérations</p>
                <p className="text-3xl font-bold mt-1">{realData.operationsTissage}</p>
                <p className="text-xs opacity-75 mt-1">ce mois</p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Production Théorique vs Réelle</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={consoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="theorique" stroke="#3b82f6" strokeWidth={2} name="Théorique" />
                    <Line type="monotone" dataKey="reel" stroke="#10b981" strokeWidth={2} name="Réel" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">État des Machines</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productionStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productionStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Vue Machines */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Vue Détaillée des Machines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machinesReelles.map((machine, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      machine.status === 'alert' ? 'bg-red-50 border-red-300' :
                      machine.status === 'warning' ? 'bg-orange-50 border-orange-300' :
                      'bg-green-50 border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{machine.machine}</h3>
                      <button
                        onClick={() => {
                          setSelectedMachine(machine.machine);
                          setShowDocumentModal(true);
                        }}
                        className="p-2 hover:bg-white rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-semibold">{machine.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fils:</span>
                        <span className="font-semibold">{machine.nbFils}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Restant:</span>
                        <span className={`font-bold ${
                          machine.status === 'alert' ? 'text-red-600' :
                          machine.status === 'warning' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {machine.restant} m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Opérateur:</span>
                        <span className="font-semibold">{machine.operateur}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Opérations:</span>
                        <span className="font-semibold">{machine.operations}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Autonomie:</span>
                          <span className="text-sm font-bold">
                            {Math.floor(machine.restant / machine.prod)} jours
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE STOCK MP */}
        {currentView === 'stock-mp' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">📦 Stock Matière Première</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Poids Total</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{realData.poidsMP.toLocaleString()} kg</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Références</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stockMP.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Stock Critique</p>
                <p className="text-2xl font-bold text-red-600 mt-1">1</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Mouvements</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">557</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Stocks par Couleur</h2>
              <div className="space-y-3">
                {stockMP.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-lg ${
                    item.statut === 'Critique' ? 'bg-red-50 border-2 border-red-300' :
                    item.statut === 'Moyen' ? 'bg-orange-50 border border-orange-200' :
                    'bg-green-50 border border-green-200'
                  }`}>
                    <div>
                      <p className="font-semibold text-gray-900">{item.couleur} ({item.code})</p>
                      <p className="text-sm text-gray-600">{item.nm}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        item.statut === 'Critique' ? 'text-red-600' :
                        item.statut === 'Moyen' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {item.stock} kg
                      </p>
                      <p className="text-xs text-gray-500">{item.statut}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AUTRES MODULES */}
        {!['dashboard', 'production-suivi', 'stock-mp', 'settings'].includes(currentView) && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {menuItems.find(item => item.id === currentView)?.label || 'Module'}
            </h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Module en développement avec données réelles...</p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">💡 Données disponibles:</p>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• {realData.totalCommandes.toLocaleString()} commandes</li>
                  <li>• {realData.articles} articles différents</li>
                  <li>• {realData.modeles} modèles de base</li>
                  <li>• {realData.soustraitants} sous-traitants</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PARAMÈTRES */}
        {currentView === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">⚙️ Paramètres & Personnalisation</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">🎨 Couleurs du Thème</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur Principale</label>
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => updateTheme('primaryColor', e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur Secondaire</label>
                    <input
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur d'Accent</label>
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => updateTheme('accentColor', e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">🏢 Nom Entreprise</h2>
                <input
                  type="text"
                  value={theme.companyName}
                  onChange={(e) => updateTheme('companyName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Nom de votre entreprise"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Upload Logo */}
      {showLogoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Changer le logo</h3>
              <button 
                onClick={() => setShowLogoUpload(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <Upload className="w-4 h-4" />
                Parcourir fichiers
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Machine */}
      {showDocumentModal && selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Machine {selectedMachine} - Détails
              </h3>
              <button 
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedMachine(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-4">
                <p className="text-gray-700">Informations détaillées sur la machine {selectedMachine}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}