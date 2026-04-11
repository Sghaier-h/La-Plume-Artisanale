import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Calendar, Users, Cog, Bell, 
  Menu, X, AlertCircle, CheckCircle, Clock, TrendingUp,
  Scissors, Factory, ClipboardList, Truck, BarChart3, Upload,
  Box, Boxes, Package2, ShoppingBag, UserCheck, ChevronDown, ChevronRight,
  Activity, Zap, AlertTriangle, Download, Image, FileText, History,
  Eye, Plus, Camera, CalendarCheck, Database, RefreshCw, Save,
  Trash2, Edit, Search, Filter, ArrowRight, ArrowLeft, DollarSign,
  Settings, MapPin, Phone, Mail, Globe, Info
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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
  const [selectedOF, setSelectedOF] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [draggedOF, setDraggedOF] = useState(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [selectedOFForColors, setSelectedOFForColors] = useState(null);
  const [showCompositionModal, setShowCompositionModal] = useState(false);
  
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
    { id: 1, type: 'alert', message: 'Machine M2301 - Ensouple à 320m', time: '2min', priority: 'high' },
    { id: 2, type: 'alert', message: 'Machine M2305 - Ensouple à 350m', time: '15min', priority: 'high' },
    { id: 3, type: 'info', message: 'Ordissage M2308 terminé', time: '1h', priority: 'normal' },
    { id: 4, type: 'alert', message: 'Stock MP Blanc NM05 faible (381kg)', time: '2h', priority: 'medium' },
    { id: 5, type: 'success', message: 'OF244984 terminé - 70 pièces', time: '3h', priority: 'normal' }
  ]);
  
  // Données machines réelles avec plus de détails
  const [machinesReelles] = useState([
    { 
      machine: 'M2301', type: 'HTVS4/S', nbFils: 966, restant: 320, status: 'alert', 
      prod: 145, operateur: 'Majdi', operations: 18, dateOrdissage: '15/09/2025',
      vitesse: 250, duitesCm: 10.8, ofEnCours: 'OF244980', clientEnCours: 'CL00296',
      rendement: 87, tempsFonctionnement: 142, tempsArret: 23
    },
    { 
      machine: 'M2302', type: 'HTVS6/S', nbFils: 966, restant: 1750, status: 'ok', 
      prod: 152, operateur: 'Zied', operations: 30, dateOrdissage: '20/08/2025',
      vitesse: 260, duitesCm: 10.8, ofEnCours: 'OF244982', clientEnCours: 'CL00884',
      rendement: 92, tempsFonctionnement: 156, tempsArret: 18
    },
    { 
      machine: 'M2303', type: 'HTVS4/S', nbFils: 1450, restant: 2100, status: 'ok', 
      prod: 138, operateur: 'Majdi', operations: 8, dateOrdissage: '10/08/2025',
      vitesse: 240, duitesCm: 12.5, ofEnCours: 'OF244983', clientEnCours: 'CL00296',
      rendement: 85, tempsFonctionnement: 148, tempsArret: 26
    },
    { 
      machine: 'M2304', type: 'GTN6/SD', nbFils: 1820, restant: 920, status: 'ok', 
      prod: 160, operateur: 'Badie', operations: 12, dateOrdissage: '05/09/2025',
      vitesse: 275, duitesCm: 11.2, ofEnCours: 'OF244985', clientEnCours: 'CL01245',
      rendement: 90, tempsFonctionnement: 162, tempsArret: 12
    },
    { 
      machine: 'M2305', type: 'HTV8/S', nbFils: 2140, restant: 350, status: 'alert', 
      prod: 148, operateur: 'Dimatex', operations: 15, dateOrdissage: '25/09/2025',
      vitesse: 255, duitesCm: 10.5, ofEnCours: 'OF244987', clientEnCours: 'CL00884',
      rendement: 88, tempsFonctionnement: 151, tempsArret: 21
    },
    { 
      machine: 'M2306', type: 'HTV8/S', nbFils: 966, restant: 1200, status: 'ok', 
      prod: 155, operateur: 'Majdi', operations: 22, dateOrdissage: '15/08/2025',
      vitesse: 265, duitesCm: 10.8, ofEnCours: 'OF244988', clientEnCours: 'CL00296',
      rendement: 91, tempsFonctionnement: 158, tempsArret: 16
    },
    { 
      machine: 'M2307', type: 'HTV4/SD', nbFils: 1450, restant: 480, status: 'warning', 
      prod: 142, operateur: 'Zied', operations: 19, dateOrdissage: '18/09/2025',
      vitesse: 245, duitesCm: 12.0, ofEnCours: 'OF244990', clientEnCours: 'CL01245',
      rendement: 86, tempsFonctionnement: 145, tempsArret: 24
    },
    { 
      machine: 'M2308', type: 'GTN6/SD', nbFils: 1820, restant: 2500, status: 'ok', 
      prod: 168, operateur: 'Badie', operations: 44, dateOrdissage: '01/08/2025',
      vitesse: 280, duitesCm: 11.5, ofEnCours: 'OF244992', clientEnCours: 'CL00884',
      rendement: 93, tempsFonctionnement: 165, tempsArret: 10
    },
  ]);

  // Ordres de fabrication en cours
  const [ordresFabrication] = useState([
    {
      numOF: 'OF244980',
      numCommande: 'CM-FT0069',
      client: 'CL00296',
      nomClient: 'Société ABC',
      article: 'ND LILI 1020',
      refCommercial: 'NDL1020-B20-01',
      quantite: 70,
      quantiteFabriquee: 45,
      machine: 'M2301',
      statut: 'En cours',
      dateDebut: '15/10/2025',
      dateLivraison: '20/12/2025',
      progression: 64,
      couleur1: 'C20 - Rouge',
      couleur2: 'C01 - Blanc',
      urgence: false,
      mpConsommee: 15.4,
      mpPrevue: 24.5,
      position: 1
    },
    {
      numOF: 'OF244982',
      numCommande: 'CM-FT0070',
      client: 'CL00884',
      nomClient: 'Export International',
      article: 'IBIZA 2426',
      refCommercial: 'IB2426-T15-32-08',
      quantite: 120,
      quantiteFabriquee: 95,
      machine: 'M2302',
      statut: 'En cours',
      dateDebut: '14/10/2025',
      dateLivraison: '18/12/2025',
      progression: 79,
      couleur1: 'C15 - Bleu',
      couleur2: 'C32 - Vert',
      couleur3: 'C08 - Jaune',
      urgence: true,
      mpConsommee: 38.2,
      mpPrevue: 48.0,
      position: 1
    },
    {
      numOF: 'OF244983',
      numCommande: 'CM-FT0069',
      client: 'CL00296',
      nomClient: 'Société ABC',
      article: 'ARTHUR 1020',
      refCommercial: 'AR1020-B12-05',
      quantite: 85,
      quantiteFabriquee: 0,
      machine: 'M2303',
      statut: 'En attente',
      dateDebut: '18/10/2025',
      dateLivraison: '22/12/2025',
      progression: 0,
      couleur1: 'C12 - Bleu Marine',
      couleur2: 'C05 - Gris',
      urgence: false,
      mpConsommee: 0,
      mpPrevue: 29.75,
      position: 1
    },
  ]);

  // OF en attente d'attribution
  const [ofEnAttente] = useState([
    {
      numOF: 'OF244984',
      client: 'CL00296',
      nomClient: 'Société ABC',
      article: 'ND LILI 1020',
      quantite: 70,
      dateLivraison: '20/12/2025',
      urgence: false,
      couleurAttributed: false,
      mpNecessaire: { sel01: 16.8, sel02: 7.7 },
      tempsProduction: 12.1
    },
    {
      numOF: 'OF244985',
      client: 'CL00884',
      nomClient: 'Export International',
      article: 'IBIZA 2426',
      quantite: 50,
      dateLivraison: '18/12/2025',
      urgence: true,
      couleurAttributed: false,
      mpNecessaire: { sel01: 21.5, sel02: 10.0 },
      tempsProduction: 9.2
    },
    {
      numOF: 'OF244986',
      client: 'CL01245',
      nomClient: 'Retail Plus',
      article: 'ARTHUR 2426',
      quantite: 90,
      dateLivraison: '25/12/2025',
      urgence: false,
      couleurAttributed: false,
      mpNecessaire: { sel01: 27.0, sel02: 13.5 },
      tempsProduction: 14.8
    },
    {
      numOF: 'OF244987',
      client: 'CL00884',
      nomClient: 'Export International',
      article: 'UNI SURPIQUE 2426',
      quantite: 35,
      dateLivraison: '15/12/2025',
      urgence: true,
      couleurAttributed: false,
      mpNecessaire: { sel01: 29.75 },
      tempsProduction: 8.0
    },
    {
      numOF: 'OF244988',
      client: 'CL00296',
      nomClient: 'Société ABC',
      article: 'ND LILI 1626',
      quantite: 120,
      dateLivraison: '28/12/2025',
      urgence: false,
      couleurAttributed: false,
      mpNecessaire: { sel01: 33.6, sel02: 16.8 },
      tempsProduction: 20.6
    }
  ]);

  // Couleurs MP disponibles avec stock
  const [couleursMP] = useState([
    { code: 'C01', nom: 'BLANC', nm: 'NM05-01.00', stock: 381.5, couleurHex: '#FFFFFF', border: true },
    { code: 'C02', nom: 'ECRU', nm: 'NM05-02.00', stock: 1123.5, couleurHex: '#F5F5DC', border: false },
    { code: 'C05', nom: 'GRIS', nm: 'NM05-05.00', stock: 654.3, couleurHex: '#6B7280', border: false },
    { code: 'C08', nom: 'JAUNE', nm: 'NM05-08.00', stock: 423.8, couleurHex: '#FCD34D', border: false },
    { code: 'C12', nom: 'BLEU MARINE', nm: 'NM05-12.00', stock: 567.2, couleurHex: '#1E3A8A', border: false },
    { code: 'C15', nom: 'BLEU', nm: 'NM05-15.00', stock: 892.4, couleurHex: '#3B82F6', border: false },
    { code: 'C20', nom: 'ROUGE', nm: 'NM05-20.00', stock: 234.8, couleurHex: '#EF4444', border: false },
    { code: 'C32', nom: 'VERT', nm: 'NM05-32.00', stock: 745.6, couleurHex: '#10B981', border: false },
    { code: 'C45', nom: 'ORANGE', nm: 'NM05-45.00', stock: 0, couleurHex: '#F97316', border: false },
    { code: 'C50', nom: 'VIOLET', nm: 'NM05-50.00', stock: 456.2, couleurHex: '#8B5CF6', border: false }
  ]);

  const [consoData] = useState([
    { date: '11/10', theorique: 2150, reel: 2245, ecart: 95, rendement: 95.7 },
    { date: '12/10', theorique: 2180, reel: 2198, ecart: 18, rendement: 99.2 },
    { date: '13/10', theorique: 2200, reel: 2156, ecart: -44, rendement: 98.0 },
    { date: '14/10', theorique: 2160, reel: 2280, ecart: 120, rendement: 94.5 },
    { date: '15/10', theorique: 2190, reel: 2245, ecart: 55, rendement: 97.5 },
    { date: '16/10', theorique: 2170, reel: 2210, ecart: 40, rendement: 98.2 },
    { date: '17/10', theorique: 2200, reel: 2268, ecart: 68, rendement: 97.0 }
  ]);

  const [productionStats] = useState([
    { name: 'Actives', value: 14, color: '#10b981' },
    { name: 'En Alerte', value: 2, color: '#f59e0b' },
    { name: 'Arrêtées', value: 4, color: '#ef4444' }
  ]);

  const [stockMP] = useState([
    { couleur: 'BLANC', code: 'C01', nm: 'NM05-01.00', stock: 381.5, statut: 'Critique', entrepot: 'E1', lot: 'S2024', alerte: 500 },
    { couleur: 'ECRU', code: 'C02', nm: 'NM05-02.00', stock: 1123.5, statut: 'Bon', entrepot: 'E2', lot: 'S2023', alerte: 500 },
    { couleur: 'BLEU', code: 'C12', nm: 'NM05-12.00', stock: 567.2, statut: 'Moyen', entrepot: 'E1', lot: 'S2024', alerte: 500 },
    { couleur: 'VERT', code: 'C15', nm: 'NM05-15.00', stock: 892.4, statut: 'Bon', entrepot: 'E2', lot: 'S2023', alerte: 500 },
    { couleur: 'ROUGE', code: 'C20', nm: 'NM05-20.00', stock: 234.8, statut: 'Critique', entrepot: 'E1', lot: 'S2024', alerte: 500 }
  ]);

  const [modelesProd] = useState([
    { modele: 'UNI SURPIQUE', quantite: 2847, pourcentage: 28, ca: 142350 },
    { modele: 'ARTHUR', quantite: 1523, pourcentage: 15, ca: 91380 },
    { modele: 'IBIZA', quantite: 1345, pourcentage: 13, ca: 80700 },
    { modele: 'MARINIERE', quantite: 982, pourcentage: 10, ca: 58920 },
    { modele: 'BERBER', quantite: 876, pourcentage: 9, ca: 52560 },
    { modele: 'Autres', quantite: 2551, pourcentage: 25, ca: 153060 }
  ]);

  // Données clients principaux
  const [clients] = useState([
    { 
      code: 'CL00296', 
      nom: 'Société ABC', 
      type: 'Grossiste',
      commandes: 234,
      ca: 156780,
      delaiPaiement: 30,
      pays: 'Tunisie'
    },
    { 
      code: 'CL00884', 
      nom: 'Export International', 
      type: 'Export',
      commandes: 189,
      ca: 245600,
      delaiPaiement: 45,
      pays: 'France'
    },
    { 
      code: 'CL01245', 
      nom: 'Retail Plus', 
      type: 'Détaillant',
      commandes: 156,
      ca: 89450,
      delaiPaiement: 30,
      pays: 'Tunisie'
    }
  ]);

  // Données BOM (Bill of Materials)
  const [bomData] = useState([
    {
      codeParametrage: 'IB1020(FR)-B',
      modele: 'IBIZA',
      codeModele: 'IB',
      dimensions: '1020',
      produit: 'Fouta',
      typeTissage: 'Tissage Plat',
      codeTissage: 'PL',
      typeFinition: 'Frange',
      codeFinition: 'FR',
      nbCouleurs: '2 Couleurs',
      codeCouleurs: 'B',
      qualite: 'PREMIUM',
      largeurTissage: 100,
      longueurTissage: 240,
      duiteCm: 10.8,
      nombreDuiteTotal: 2592,
      selecteur01: 0.24, // kg
      selecteur02: 0.11,
      selecteur03: 0,
      selecteur04: 0,
      selecteur05: 0,
      selecteur06: 0,
      totalMatiere: 0.35,
      typeComposition: 'Unique',
      nbComposition: 1,
      prixRevient: 7.50,
      tempsProduction: 17.3 // heures pour 100 pièces
    },
    {
      codeParametrage: 'AR1020(OR)-B',
      modele: 'ARTHUR',
      codeModele: 'AR',
      dimensions: '1020',
      produit: 'Fouta',
      typeTissage: 'Tissage Plat',
      codeTissage: 'PL',
      typeFinition: 'Ourlet',
      codeFinition: 'OR',
      nbCouleurs: '2 Couleurs',
      codeCouleurs: 'B',
      qualite: 'STANDARD',
      largeurTissage: 100,
      longueurTissage: 235,
      duiteCm: 11.2,
      nombreDuiteTotal: 2632,
      selecteur01: 0.22,
      selecteur02: 0.10,
      selecteur03: 0,
      selecteur04: 0,
      selecteur05: 0,
      selecteur06: 0,
      totalMatiere: 0.32,
      typeComposition: 'Unique',
      nbComposition: 1,
      prixRevient: 6.80,
      tempsProduction: 16.5
    },
    {
      codeParametrage: 'NDL1020(FR)-B',
      modele: 'ND LILI',
      codeModele: 'NDL',
      dimensions: '1020',
      produit: 'Fouta',
      typeTissage: 'Tissage Plat',
      codeTissage: 'PL',
      typeFinition: 'Frange',
      codeFinition: 'FR',
      nbCouleurs: '2 Couleurs',
      codeCouleurs: 'B',
      qualite: 'PREMIUM',
      largeurTissage: 100,
      longueurTissage: 240,
      duiteCm: 10.8,
      nombreDuiteTotal: 2592,
      selecteur01: 0.24,
      selecteur02: 0.11,
      selecteur03: 0,
      selecteur04: 0,
      selecteur05: 0,
      selecteur06: 0,
      totalMatiere: 0.35,
      typeComposition: 'Unique',
      nbComposition: 1,
      prixRevient: 7.50,
      tempsProduction: 17.3
    },
    {
      codeParametrage: 'US2426(SU)-U',
      modele: 'UNI SURPIQUE',
      codeModele: 'US',
      dimensions: '2426',
      produit: 'Jeté',
      typeTissage: 'Tissage Jacquard',
      codeTissage: 'JQ',
      typeFinition: 'Surpiqué',
      codeFinition: 'SU',
      nbCouleurs: '1 Couleur',
      codeCouleurs: 'U',
      qualite: 'STANDARD',
      largeurTissage: 240,
      longueurTissage: 260,
      duiteCm: 12.5,
      nombreDuiteTotal: 3250,
      selecteur01: 0.85,
      selecteur02: 0,
      selecteur03: 0,
      selecteur04: 0,
      selecteur05: 0,
      selecteur06: 0,
      totalMatiere: 0.85,
      typeComposition: 'Unique',
      nbComposition: 1,
      prixRevient: 12.50,
      tempsProduction: 22.8
    }
  ]);

  // Données Équipes de fabrication
  const [equipesData] = useState([
    // Tisseurs
    { 
      id: 1, nom: 'Majdi Ben Ali', fonction: 'Tisseur', equipe: 1, 
      horaire: '05:00 - 13:00', parc: 'Parc A', 
      machines: ['M2301', 'M2303', 'M2306', 'M2309'],
      tauxHoraire: 4.50, experience: '8 ans', statut: 'Actif',
      rendementMoyen: 89, telephone: '+216 98 765 432'
    },
    { 
      id: 2, nom: 'Zied Trabelsi', fonction: 'Tisseur', equipe: 2, 
      horaire: '13:00 - 21:00', parc: 'Parc A',
      machines: ['M2302', 'M2307', 'M2311', 'M2403'],
      tauxHoraire: 4.50, experience: '6 ans', statut: 'Actif',
      rendementMoyen: 91, telephone: '+216 98 123 456'
    },
    { 
      id: 3, nom: 'Badie Gharbi', fonction: 'Tisseur', equipe: 3, 
      horaire: '21:00 - 05:00', parc: 'Parc B',
      machines: ['M2304', 'M2308', 'M2401'],
      tauxHoraire: 5.00, experience: '10 ans', statut: 'Actif',
      rendementMoyen: 93, telephone: '+216 97 234 567'
    },
    
    // Coupeurs
    { 
      id: 4, nom: 'Mohamed Sassi', fonction: 'Coupeur', equipe: 1, 
      horaire: '06:00 - 14:00', parc: 'Coupe',
      machines: [], tauxHoraire: 4.00, experience: '5 ans', statut: 'Actif',
      rendementMoyen: 85, telephone: '+216 98 345 678'
    },
    { 
      id: 5, nom: 'Ahmed Karoui', fonction: 'Coupeur', equipe: 2, 
      horaire: '14:00 - 22:00', parc: 'Coupe',
      machines: [], tauxHoraire: 4.00, experience: '4 ans', statut: 'Actif',
      rendementMoyen: 82, telephone: '+216 97 456 789'
    },
    
    // Mécaniciens
    { 
      id: 6, nom: 'Karim Ben Salem', fonction: 'Mécanicien', equipe: 1, 
      horaire: '07:00 - 15:00', parc: 'Tous',
      machines: ['M2301', 'M2302', 'M2303', 'M2304', 'M2305'],
      tauxHoraire: 6.50, experience: '12 ans', statut: 'Actif',
      rendementMoyen: 95, telephone: '+216 98 567 890'
    },
    { 
      id: 7, nom: 'Sofiane Jemli', fonction: 'Mécanicien', equipe: 2, 
      horaire: '15:00 - 23:00', parc: 'Tous',
      machines: ['M2306', 'M2307', 'M2308', 'M2309', 'M2311'],
      tauxHoraire: 6.50, experience: '9 ans', statut: 'Actif',
      rendementMoyen: 92, telephone: '+216 97 678 901'
    },
    
    // Magasiniers
    { 
      id: 8, nom: 'Nabil Hammami', fonction: 'Magasinier MP', equipe: 1, 
      horaire: '06:00 - 14:00', parc: 'Entrepôt E1',
      machines: [], tauxHoraire: 4.20, experience: '7 ans', statut: 'Actif',
      rendementMoyen: 88, telephone: '+216 98 789 012'
    },
    { 
      id: 9, nom: 'Hichem Tlili', fonction: 'Magasinier PF', equipe: 1, 
      horaire: '07:00 - 15:00', parc: 'Entrepôt E2',
      machines: [], tauxHoraire: 4.20, experience: '5 ans', statut: 'Actif',
      rendementMoyen: 86, telephone: '+216 97 890 123'
    },
    { 
      id: 10, nom: 'Fathi Bouaziz', fonction: 'Magasinier ST', equipe: 1, 
      horaire: '08:00 - 16:00', parc: 'Entrepôt E2',
      machines: [], tauxHoraire: 4.00, experience: '4 ans', statut: 'Actif',
      rendementMoyen: 84, telephone: '+216 98 901 234'
    }
  ]);

  // Données Équipements (Machines détaillées)
  const [equipementsData] = useState([
    {
      id: 1,
      machine: 'M2301',
      type: 'HTVS4/S',
      marque: 'Dornier',
      modele: 'HTV8/S',
      annee: 2018,
      laize: 190,
      nbFils: 966,
      vitesseMax: 280,
      vitesseNominale: 250,
      systeme: 'Rapière',
      etat: 'Bon',
      parc: 'Parc A',
      emplacement: 'Zone 1',
      dateAcquisition: '15/03/2018',
      valeurAchat: 85000,
      derniereRevision: '10/09/2025',
      prochaineRevision: '10/12/2025',
      compteurHeures: 14523,
      maintenances: 23,
      pannes: 5,
      tauxDisponibilite: 94.5,
      consommationElectrique: 12.5, // kW/h
      remarques: 'Machine en bon état, révision à jour'
    },
    {
      id: 2,
      machine: 'M2302',
      type: 'HTVS6/S',
      marque: 'Dornier',
      modele: 'HTV8/S',
      annee: 2019,
      laize: 190,
      nbFils: 966,
      vitesseMax: 290,
      vitesseNominale: 260,
      systeme: 'Rapière',
      etat: 'Excellent',
      parc: 'Parc A',
      emplacement: 'Zone 1',
      dateAcquisition: '20/06/2019',
      valeurAchat: 88000,
      derniereRevision: '15/09/2025',
      prochaineRevision: '15/12/2025',
      compteurHeures: 12340,
      maintenances: 18,
      pannes: 2,
      tauxDisponibilite: 96.8,
      consommationElectrique: 12.8,
      remarques: 'Excellent état, peu de pannes'
    },
    {
      id: 3,
      machine: 'M2303',
      type: 'HTVS4/S',
      marque: 'Dornier',
      modele: 'HTV4/S',
      annee: 2017,
      laize: 280,
      nbFils: 1450,
      vitesseMax: 260,
      vitesseNominale: 240,
      systeme: 'Rapière',
      etat: 'Moyen',
      parc: 'Parc A',
      emplacement: 'Zone 2',
      dateAcquisition: '10/01/2017',
      valeurAchat: 82000,
      derniereRevision: '05/08/2025',
      prochaineRevision: '05/11/2025',
      compteurHeures: 18765,
      maintenances: 34,
      pannes: 12,
      tauxDisponibilite: 89.3,
      consommationElectrique: 14.2,
      remarques: 'Usure normale, surveillance accrue'
    },
    {
      id: 4,
      machine: 'M2304',
      type: 'GTN6/SD',
      marque: 'Picanol',
      modele: 'GTN6',
      annee: 2020,
      laize: 340,
      nbFils: 1820,
      vitesseMax: 300,
      vitesseNominale: 275,
      systeme: 'Projectile',
      etat: 'Excellent',
      parc: 'Parc B',
      emplacement: 'Zone 3',
      dateAcquisition: '05/02/2020',
      valeurAchat: 95000,
      derniereRevision: '20/09/2025',
      prochaineRevision: '20/12/2025',
      compteurHeures: 10234,
      maintenances: 12,
      pannes: 1,
      tauxDisponibilite: 97.5,
      consommationElectrique: 15.5,
      remarques: 'Machine récente, excellente performance'
    },
    {
      id: 5,
      machine: 'M2305',
      type: 'HTV8/S',
      marque: 'Dornier',
      modele: 'HTV8/S',
      annee: 2016,
      laize: 380,
      nbFils: 2140,
      vitesseMax: 270,
      vitesseNominale: 255,
      systeme: 'Rapière',
      etat: 'Moyen',
      parc: 'Parc B',
      emplacement: 'Zone 3',
      dateAcquisition: '15/08/2016',
      valeurAchat: 90000,
      derniereRevision: '01/07/2025',
      prochaineRevision: '01/10/2025',
      compteurHeures: 21456,
      maintenances: 42,
      pannes: 18,
      tauxDisponibilite: 86.2,
      consommationElectrique: 16.8,
      remarques: 'Machine vieillissante, envisager remplacement'
    }
  ]);

  const [theme, setTheme] = useState({
    primaryColor: '#2563eb',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    dangerColor: '#ef4444',
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

  // Simulation notifications temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      const alertMachines = machinesReelles.filter(m => m.status === 'alert' || m.status === 'warning');
      if (alertMachines.length > 0 && Math.random() > 0.7) {
        const machine = alertMachines[Math.floor(Math.random() * alertMachines.length)];
        const newNotif = {
          id: Date.now(),
          type: 'alert',
          message: `Machine ${machine.machine} - Alerte ensouple à ${machine.restant}m`,
          time: 'maintenant',
          priority: 'high'
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
  const rendementMoyen = Math.floor(machinesReelles.reduce((acc, m) => acc + m.rendement, 0) / machinesReelles.length);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, badge: null },
    { id: 'planning', label: 'Planification', icon: Calendar, badge: '23' },
    { id: 'orders', label: 'Commandes', icon: Package, badge: realData.ordresFabrication.toString() },
    { id: 'products', label: 'Produits & Catalogue', icon: Box, badge: realData.articles.toString() },
    { 
      id: 'production', 
      label: 'Production', 
      icon: Factory, 
      badge: null,
      hasSubmenu: true,
      submenu: [
        { id: 'production-suivi', label: 'Suivi Production', icon: Activity },
        { id: 'production-of', label: 'Ordres de Fabrication', icon: ClipboardList },
        { id: 'production-ensouples', label: 'Suivi Ensouples', icon: Zap },
        { id: 'production-bom', label: 'BOM (Nomenclatures)', icon: FileText },
        { id: 'production-equipes', label: 'Équipes', icon: Users },
        { id: 'production-equipements', label: 'Équipements', icon: Settings }
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
    { id: 'clients', label: 'Clients', icon: Users, badge: clients.length.toString() },
    { id: 'subcontractors', label: 'Sous-Traitants', icon: UserCheck, badge: realData.soustraitants.toString() },
    { id: 'shipping', label: 'Expédition', icon: Truck, badge: null },
    { id: 'reports', label: 'Rapports', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Paramètres', icon: Cog, badge: null },
  ];

  // Filtrer les OF selon le terme de recherche
  const filteredOF = ordresFabrication.filter(of => {
    const matchSearch = searchTerm === '' || 
      of.numOF.toLowerCase().includes(searchTerm.toLowerCase()) ||
      of.nomClient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      of.article.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchFilter = filterStatus === 'all' || of.statut === filterStatus;
    
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-20 overflow-y-auto ${
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
            <div className="text-sm text-gray-600">
              <Clock className="w-4 h-4 inline mr-1" />
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => n.type === 'alert').length > 0 && (
                <span 
                  className="absolute top-1 right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse"
                  style={{ backgroundColor: theme.dangerColor }}
                >
                  {notifications.filter(n => n.type === 'alert').length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-4 top-16 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Tout effacer
                    </button>
                  </div>
                </div>
                <div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notif.type === 'alert' ? 'bg-red-50 border-l-4 border-l-red-500' : 
                          notif.type === 'success' ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notif.type === 'alert' ? (
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                          ) : notif.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          ) : (
                            <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
        
        {/* DASHBOARD PRINCIPAL */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800">📊 Tableau de Bord</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                  <Database className="w-5 h-5 text-green-700" />
                  <span className="text-sm font-medium text-green-800">Données réelles synchronisées</span>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="p-2 hover:bg-gray-200 rounded-lg"
                  title="Actualiser"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* KPIs Principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
                <Package className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Commandes</p>
                <p className="text-3xl font-bold mt-1">{realData.totalCommandes.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">Total</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
                <Factory className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">OF</p>
                <p className="text-3xl font-bold mt-1">{realData.ordresFabrication.toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">En cours</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
                <Activity className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Machines</p>
                <p className="text-3xl font-bold mt-1">{realData.machinesActives}/{realData.totalMachines}</p>
                <p className="text-xs opacity-75 mt-2">{tauxUtilisation}% actif</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Alertes</p>
                <p className="text-3xl font-bold mt-1">{machinesAlertes + machinesWarning}</p>
                <p className="text-xs opacity-75 mt-2">Machines</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-5 text-white">
                <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Rendement</p>
                <p className="text-3xl font-bold mt-1">{rendementMoyen}%</p>
                <p className="text-xs opacity-75 mt-2">Moyen</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-5 text-white">
                <UserCheck className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm opacity-90">Sous-Traitants</p>
                <p className="text-3xl font-bold mt-1">{realData.soustraitants}</p>
                <p className="text-xs opacity-75 mt-2">Actifs</p>
              </div>
            </div>

            {/* Graphiques Ligne 1 */}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5" style={{ color: theme.primaryColor }} />
                  État des Machines en Temps Réel
                </h2>
                <button 
                  onClick={() => setCurrentView('production-suivi')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Voir tout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {machinesReelles.slice(0, 8).map((machine, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedMachine(machine);
                      setShowDocumentModal(true);
                    }}
                    className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
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
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Rendement:</span>
                        <span className="font-semibold">{machine.rendement}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OF en cours */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" style={{ color: theme.primaryColor }} />
                  Ordres de Fabrication Prioritaires
                </h2>
                <button 
                  onClick={() => setCurrentView('production-of')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Voir tout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {ordresFabrication.slice(0, 3).map((of, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                      of.urgence ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => {
                      setSelectedOF(of);
                      setShowDocumentModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900">{of.numOF}</h3>
                          {of.urgence && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                              URGENT
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            of.statut === 'En cours' ? 'bg-blue-100 text-blue-800' :
                            of.statut === 'En attente' ? 'bg-gray-100 text-gray-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {of.statut}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{of.article} - {of.nomClient}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Machine: {of.machine}</span>
                          <span>Qté: {of.quantiteFabriquee}/{of.quantite}</span>
                          <span>Livraison: {of.dateLivraison}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                          {of.progression}%
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${of.progression}%`,
                              backgroundColor: theme.primaryColor
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE PLANIFICATION DRAG & DROP */}
        {currentView === 'planning' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">📅 Planification de Production</h1>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => alert('Vue calendrier en développement')}
                >
                  <Calendar className="w-5 h-5" />
                  Vue Calendrier
                </button>
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  onClick={() => alert('Fonction export en développement')}
                >
                  <Download className="w-5 h-5" />
                  Export Planning
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="p-2 hover:bg-gray-200 rounded-lg"
                  title="Actualiser"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Stats Planning */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
                <p className="text-sm opacity-90">OF en Attente</p>
                <p className="text-3xl font-bold mt-1">{ofEnAttente.length}</p>
                <p className="text-xs opacity-75 mt-1">À planifier</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 text-white">
                <p className="text-sm opacity-90">Machines Dispo</p>
                <p className="text-3xl font-bold mt-1">
                  {realData.totalMachines - realData.machinesActives}
                </p>
                <p className="text-xs opacity-75 mt-1">Disponibles</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 text-white">
                <p className="text-sm opacity-90">OF Urgents</p>
                <p className="text-3xl font-bold mt-1">
                  {ofEnAttente.filter(of => of.urgence).length}
                </p>
                <p className="text-xs opacity-75 mt-1">Prioritaires</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 text-white">
                <p className="text-sm opacity-90">Capacité</p>
                <p className="text-3xl font-bold mt-1">
                  {Math.floor(realData.totalMachines * 24 * 0.85)}h
                </p>
                <p className="text-xs opacity-75 mt-1">Par jour</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-4 text-white">
                <p className="text-sm opacity-90">Temps Total</p>
                <p className="text-3xl font-bold mt-1">
                  {ofEnAttente.reduce((acc, of) => acc + of.tempsProduction, 0).toFixed(0)}h
                </p>
                <p className="text-xs opacity-75 mt-1">À planifier</p>
              </div>
            </div>

            {/* Interface Drag & Drop */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Colonne OF EN ATTENTE */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    EN ATTENTE ({ofEnAttente.length})
                  </h2>
                </div>
                
                <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {ofEnAttente.map((of, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => {
                        setDraggedOF(of);
                        e.currentTarget.style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      className={`p-3 rounded-lg border-2 cursor-move transition-all hover:shadow-lg ${
                        of.urgence 
                          ? 'bg-red-50 border-red-300 hover:border-red-500' 
                          : 'bg-gray-50 border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{of.numOF}</span>
                            {of.urgence && (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{of.article}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-gray-700">{of.quantite}pc</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Client:</span>
                          <span className="font-semibold">{of.nomClient}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Livraison:</span>
                          <span className="font-semibold">{of.dateLivraison}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temps:</span>
                          <span className="font-semibold">{of.tempsProduction}h</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-300">
                        {of.couleurAttributed ? (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            ✓ Couleurs OK
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedOFForColors(of);
                              setShowColorModal(true);
                            }}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          >
                            Attribuer couleurs
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonne MACHINES */}
              <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Factory className="w-5 h-5" style={{ color: theme.primaryColor }} />
                  MACHINES DE PRODUCTION
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {machinesReelles.slice(0, 6).map((machine, idx) => (
                    <div
                      key={idx}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('ring-2', 'ring-blue-400');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('ring-2', 'ring-blue-400');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('ring-2', 'ring-blue-400');
                        
                        if (draggedOF) {
                          if (!draggedOF.couleurAttributed) {
                            alert(`⚠️ Vous devez d'abord attribuer les couleurs à ${draggedOF.numOF} avant de l'assigner à une machine.`);
                          } else {
                            alert(`✅ ${draggedOF.numOF} attribué à la machine ${machine.machine}!\n\nSynchronisation automatique:\n• Magasinier MP notifié\n• Tisseur ${machine.operateur} informé\n• Planning mis à jour`);
                          }
                          setDraggedOF(null);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        machine.status === 'alert' ? 'bg-red-50 border-red-300' :
                        machine.status === 'warning' ? 'bg-orange-50 border-orange-300' :
                        'bg-green-50 border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{machine.machine}</h3>
                          <p className="text-xs text-gray-600">{machine.type}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          machine.status === 'alert' ? 'bg-red-500 animate-pulse' :
                          machine.status === 'warning' ? 'bg-orange-500' :
                          'bg-green-500'
                        }`} />
                      </div>

                      {/* OF en cours */}
                      {machine.ofEnCours && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-600 mb-1">EN COURS:</div>
                          <div className="p-2 bg-blue-100 rounded border border-blue-300">
                            <div className="font-semibold text-sm text-blue-900">{machine.ofEnCours}</div>
                            <div className="text-xs text-blue-700 mt-1">
                              Opérateur: {machine.operateur}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Zone de dépôt */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[80px] flex items-center justify-center">
                        <div className="text-center text-gray-400 text-xs">
                          <Plus className="w-6 h-6 mx-auto mb-1" />
                          <p>Glisser un OF ici</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-300 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ensouple:</span>
                          <span className={`font-bold ${
                            machine.status === 'alert' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {machine.restant}m
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-600">Rendement:</span>
                          <span className="font-semibold">{machine.rendement}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Instructions de Planification
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Étape 1:</strong> Attribuer les couleurs MP à chaque OF (vérification stock automatique)</li>
                    <li>• <strong>Étape 2:</strong> Glisser-déposer l'OF vers une machine disponible</li>
                    <li>• <strong>Synchronisation:</strong> Toutes les équipes sont notifiées automatiquement</li>
                    <li>• <strong>OF Urgents:</strong> Affichés en rouge, à planifier en priorité</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Vue tableau complémentaire */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Planning Détaillé</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">OF</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qté</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temps</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Livraison</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Couleurs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ofEnAttente.map((of, idx) => (
                      <tr key={idx} className={of.urgence ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3 font-semibold text-gray-900">{of.numOF}</td>
                        <td className="px-4 py-3 text-gray-700">{of.article}</td>
                        <td className="px-4 py-3 text-gray-700">{of.nomClient}</td>
                        <td className="px-4 py-3 font-semibold">{of.quantite}</td>
                        <td className="px-4 py-3">{of.tempsProduction}h</td>
                        <td className="px-4 py-3">{of.dateLivraison}</td>
                        <td className="px-4 py-3">
                          {of.urgence ? (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                              URGENT
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {of.couleurAttributed ? (
                            <span className="text-green-600 font-semibold">✓ Attribuées</span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedOFForColors(of);
                                setShowColorModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Attribuer →
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODULE ORDRES DE FABRICATION */}
        {currentView === 'production-of' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">📋 Ordres de Fabrication</h1>
              <div className="flex items-center gap-2">
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  onClick={() => alert('Fonction export en développement')}
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
                <button 
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                  style={{ backgroundColor: theme.primaryColor }}
                  onClick={() => alert('Fonction création OF en développement')}
                >
                  <Plus className="w-5 h-5" />
                  Nouvel OF
                </button>
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher OF, client, article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="En attente">En attente</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Filtres avancés
                  </button>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total OF</p>
                    <p className="text-2xl font-bold text-gray-800">{ordresFabrication.length}</p>
                  </div>
                  <ClipboardList className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En cours</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {ordresFabrication.filter(of => of.statut === 'En cours').length}
                    </p>
                  </div>
                  <Activity className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Urgents</p>
                    <p className="text-2xl font-bold text-red-600">
                      {ordresFabrication.filter(of => of.urgence).length}
                    </p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-500 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Prog. Moyen</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.floor(ordresFabrication.reduce((acc, of) => acc + of.progression, 0) / ordresFabrication.length)}%
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* Liste des OF */}
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° OF
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Machine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progression
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Livraison
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOF.map((of, idx) => (
                      <tr 
                        key={idx}
                        className={`hover:bg-gray-50 transition-colors ${
                          of.urgence ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{of.numOF}</span>
                            {of.urgence && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{of.nomClient}</div>
                            <div className="text-sm text-gray-500">{of.client}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{of.article}</div>
                            <div className="text-sm text-gray-500">{of.refCommercial}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {of.machine}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{of.quantiteFabriquee}/{of.quantite}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${of.progression}%`,
                                  backgroundColor: of.progression >= 75 ? '#10b981' : 
                                                  of.progression >= 50 ? '#f59e0b' : '#ef4444'
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{of.progression}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            of.statut === 'En cours' ? 'bg-blue-100 text-blue-800' :
                            of.statut === 'En attente' ? 'bg-gray-100 text-gray-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {of.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {of.dateLivraison}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => {
                              setSelectedOF(of);
                              setShowDocumentModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Eye className="w-5 h-5 inline" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 mr-3">
                            <Edit className="w-5 h-5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Actualiser
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
                <p className="text-sm opacity-90">Rendement</p>
                <p className="text-3xl font-bold mt-1">{rendementMoyen}%</p>
                <p className="text-xs opacity-75 mt-1">Moyen global</p>
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

            {/* Vue Machines Détaillée */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Vue Détaillée des Machines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {machinesReelles.map((machine, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedMachine(machine);
                      setShowDocumentModal(true);
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                      machine.status === 'alert' ? 'bg-red-50 border-red-300' :
                      machine.status === 'warning' ? 'bg-orange-50 border-orange-300' :
                      'bg-green-50 border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{machine.machine}</h3>
                      <Eye className="w-5 h-5 text-gray-400" />
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
                        <span className="text-gray-600">OF en cours:</span>
                        <span className="font-semibold text-blue-600">{machine.ofEnCours}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Rendement:</span>
                          <span className="text-sm font-bold" style={{ color: theme.primaryColor }}>
                            {machine.rendement}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
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
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">📦 Stock Matière Première</h1>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Poids Total</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{realData.poidsMP.toLocaleString()} kg</p>
                <p className="text-xs text-gray-500 mt-1">Tous entrepôts</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Références</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stockMP.length}</p>
                <p className="text-xs text-gray-500 mt-1">Couleurs actives</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Stock Critique</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stockMP.filter(s => s.statut === 'Critique').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Alertes actives</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Valeur Stock</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">~2.5M TND</p>
                <p className="text-xs text-gray-500 mt-1">Estimation</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Stocks par Couleur</h2>
              <div className="space-y-3">
                {stockMP.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md cursor-pointer ${
                    item.statut === 'Critique' ? 'bg-red-50 border-2 border-red-300' :
                    item.statut === 'Moyen' ? 'bg-orange-50 border border-orange-200' :
                    'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg shadow-inner"
                          style={{ 
                            backgroundColor: item.couleur === 'BLANC' ? '#ffffff' :
                                           item.couleur === 'ECRU' ? '#f5f5dc' :
                                           item.couleur === 'BLEU' ? '#3b82f6' :
                                           item.couleur === 'VERT' ? '#10b981' :
                                           item.couleur === 'ROUGE' ? '#ef4444' : '#gray',
                            border: item.couleur === 'BLANC' ? '1px solid #e5e7eb' : 'none'
                          }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{item.couleur} ({item.code})</p>
                          <p className="text-sm text-gray-600">{item.nm} - Lot {item.lot}</p>
                          <p className="text-xs text-gray-500">Entrepôt: {item.entrepot}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        item.statut === 'Critique' ? 'text-red-600' :
                        item.statut === 'Moyen' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {item.stock} kg
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Seuil: {item.alerte} kg</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                        item.statut === 'Critique' ? 'bg-red-100 text-red-800' :
                        item.statut === 'Moyen' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphique répartition */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Répartition du Stock</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockMP.map(s => ({ name: s.couleur, value: s.stock }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}kg`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockMP.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.couleur === 'BLANC' ? '#94a3b8' :
                        entry.couleur === 'ECRU' ? '#d6d3d1' :
                        entry.couleur === 'BLEU' ? '#3b82f6' :
                        entry.couleur === 'VERT' ? '#10b981' :
                        entry.couleur === 'ROUGE' ? '#ef4444' : '#gray'
                      } />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* MODULE CLIENTS */}
        {currentView === 'clients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">👥 Gestion Clients</h1>
              <button 
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Plus className="w-5 h-5" />
                Nouveau Client
              </button>
            </div>

            {/* Stats clients */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{clients.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">CA Total</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {(clients.reduce((acc, c) => acc + c.ca, 0) / 1000).toFixed(0)}K TND
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Export</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {clients.filter(c => c.type === 'Export').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Commandes</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {clients.reduce((acc, c) => acc + c.commandes, 0)}
                </p>
              </div>
            </div>

            {/* Liste clients */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Liste des Clients</h2>
                <div className="space-y-4">
                  {clients.map((client, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            {client.nom.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{client.nom}</h3>
                            <p className="text-sm text-gray-600">{client.code}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {client.type}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {client.pays}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {(client.ca / 1000).toFixed(1)}K TND
                          </p>
                          <p className="text-sm text-gray-600">{client.commandes} commandes</p>
                          <p className="text-xs text-gray-500 mt-1">Délai: {client.delaiPaiement}j</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE BOM (NOMENCLATURES) */}
        {currentView === 'production-bom' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">📋 BOM - Bill of Materials (Nomenclatures)</h1>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => alert('Fonction en développement')}
                >
                  <Filter className="w-5 h-5" />
                  Filtres
                </button>
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  onClick={() => alert('Fonction en développement')}
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
                <button 
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                  style={{ backgroundColor: theme.primaryColor }}
                  onClick={() => alert('Fonction en développement')}
                >
                  <Plus className="w-5 h-5" />
                  Nouveau BOM
                </button>
              </div>
            </div>

            {/* Stats BOM */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total BOM</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{bomData.length}</p>
                <p className="text-xs text-gray-500 mt-1">Configurations actives</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Modèles</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {new Set(bomData.map(b => b.modele)).size}
                </p>
                <p className="text-xs text-gray-500 mt-1">Modèles différents</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Consommation Moy.</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {(bomData.reduce((acc, b) => acc + b.totalMatiere, 0) / bomData.length).toFixed(2)} kg
                </p>
                <p className="text-xs text-gray-500 mt-1">Par pièce</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Temps Production</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {(bomData.reduce((acc, b) => acc + b.tempsProduction, 0) / bomData.length).toFixed(1)}h
                </p>
                <p className="text-xs text-gray-500 mt-1">Pour 100 pièces</p>
              </div>
            </div>

            {/* Liste BOM */}
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code Paramétrage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tissage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matière</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Rev.</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bomData.map((bom, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-semibold text-blue-600">{bom.codeParametrage}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{bom.modele}</div>
                            <div className="text-sm text-gray-500">{bom.qualite}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{bom.dimensions}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                            {bom.typeTissage}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            {bom.typeFinition}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">{bom.totalMatiere} kg</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-green-600">{bom.prixRevient.toFixed(2)} TND</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Eye className="w-5 h-5 inline" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 mr-3">
                            <Edit className="w-5 h-5 inline" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <History className="w-5 h-5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Détails techniques d'un BOM */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Détails Technique - {bomData[0].codeParametrage}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Paramètres Tissage</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Largeur:</span>
                      <span className="font-semibold">{bomData[0].largeurTissage} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longueur:</span>
                      <span className="font-semibold">{bomData[0].longueurTissage} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duite/cm:</span>
                      <span className="font-semibold">{bomData[0].duiteCm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total duites:</span>
                      <span className="font-semibold">{bomData[0].nombreDuiteTotal}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Consommation Matière</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sélecteur 01:</span>
                      <span className="font-semibold">{bomData[0].selecteur01} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sélecteur 02:</span>
                      <span className="font-semibold">{bomData[0].selecteur02} kg</span>
                    </div>
                    <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                      <span className="text-gray-800 font-semibold">Total:</span>
                      <span className="font-bold text-green-700">{bomData[0].totalMatiere} kg</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Production</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold">{bomData[0].typeComposition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temps (100pc):</span>
                      <span className="font-semibold">{bomData[0].tempsProduction}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prix revient:</span>
                      <span className="font-semibold text-green-600">{bomData[0].prixRevient} TND</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE ÉQUIPES */}
        {currentView === 'production-equipes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">👥 Équipes de Fabrication</h1>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Filtres
                </button>
                <button 
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <Plus className="w-5 h-5" />
                  Nouveau Membre
                </button>
              </div>
            </div>

            {/* Stats équipes */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Personnel</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{equipesData.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Tisseurs</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {equipesData.filter(e => e.fonction === 'Tisseur').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Coupeurs</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {equipesData.filter(e => e.fonction === 'Coupeur').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Mécaniciens</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {equipesData.filter(e => e.fonction === 'Mécanicien').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Rendement Moy.</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {Math.floor(equipesData.reduce((acc, e) => acc + e.rendementMoyen, 0) / equipesData.length)}%
                </p>
              </div>
            </div>

            {/* Équipes par fonction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tisseurs */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Factory className="w-5 h-5 text-blue-600" />
                  Tisseurs ({equipesData.filter(e => e.fonction === 'Tisseur').length})
                </h2>
                <div className="space-y-3">
                  {equipesData.filter(e => e.fonction === 'Tisseur').map((membre, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-blue-600">{membre.nom.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{membre.nom}</h3>
                            <p className="text-xs text-gray-500">{membre.experience}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          membre.statut === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {membre.statut}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="text-gray-500">Équipe:</span>
                          <span className="font-semibold ml-1">{membre.equipe}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Horaire:</span>
                          <span className="font-semibold ml-1">{membre.horaire}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rendement:</span>
                          <span className="font-semibold ml-1 text-blue-600">{membre.rendementMoyen}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Taux:</span>
                          <span className="font-semibold ml-1">{membre.tauxHoraire} TND/h</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">Machines: {membre.machines.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupeurs */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-green-600" />
                  Coupeurs ({equipesData.filter(e => e.fonction === 'Coupeur').length})
                </h2>
                <div className="space-y-3">
                  {equipesData.filter(e => e.fonction === 'Coupeur').map((membre, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-green-600">{membre.nom.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{membre.nom}</h3>
                            <p className="text-xs text-gray-500">{membre.experience}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {membre.statut}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="text-gray-500">Équipe:</span>
                          <span className="font-semibold ml-1">{membre.equipe}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Horaire:</span>
                          <span className="font-semibold ml-1">{membre.horaire}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rendement:</span>
                          <span className="font-semibold ml-1 text-green-600">{membre.rendementMoyen}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Taux:</span>
                          <span className="font-semibold ml-1">{membre.tauxHoraire} TND/h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mécaniciens */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-600" />
                  Mécaniciens ({equipesData.filter(e => e.fonction === 'Mécanicien').length})
                </h2>
                <div className="space-y-3">
                  {equipesData.filter(e => e.fonction === 'Mécanicien').map((membre, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-orange-600">{membre.nom.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{membre.nom}</h3>
                            <p className="text-xs text-gray-500">{membre.experience}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                          {membre.statut}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="text-gray-500">Équipe:</span>
                          <span className="font-semibold ml-1">{membre.equipe}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Horaire:</span>
                          <span className="font-semibold ml-1">{membre.horaire}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rendement:</span>
                          <span className="font-semibold ml-1 text-orange-600">{membre.rendementMoyen}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Taux:</span>
                          <span className="font-semibold ml-1">{membre.tauxHoraire} TND/h</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">Zone: {membre.parc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Magasiniers */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Magasiniers ({equipesData.filter(e => e.fonction.includes('Magasinier')).length})
                </h2>
                <div className="space-y-3">
                  {equipesData.filter(e => e.fonction.includes('Magasinier')).map((membre, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-purple-600">{membre.nom.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{membre.nom}</h3>
                            <p className="text-xs text-gray-500">{membre.fonction}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {membre.statut}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="text-gray-500">Équipe:</span>
                          <span className="font-semibold ml-1">{membre.equipe}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Horaire:</span>
                          <span className="font-semibold ml-1">{membre.horaire}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Parc:</span>
                          <span className="font-semibold ml-1">{membre.parc}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Taux:</span>
                          <span className="font-semibold ml-1">{membre.tauxHoraire} TND/h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE ÉQUIPEMENTS */}
        {currentView === 'production-equipements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">🏭 Équipements & Machines</h1>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Filtres
                </button>
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
                <button 
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <Plus className="w-5 h-5" />
                  Nouvelle Machine
                </button>
              </div>
            </div>

            {/* Stats équipements */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Machines</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{equipementsData.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Valeur Totale</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {(equipementsData.reduce((acc, e) => acc + e.valeurAchat, 0) / 1000).toFixed(0)}K TND
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Disponibilité Moy.</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {(equipementsData.reduce((acc, e) => acc + e.tauxDisponibilite, 0) / equipementsData.length).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {equipementsData.reduce((acc, e) => acc + e.maintenances, 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Pannes Totales</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {equipementsData.reduce((acc, e) => acc + e.pannes, 0)}
                </p>
              </div>
            </div>

            {/* Liste des équipements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {equipementsData.map((equip, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className={`p-4 ${
                    equip.etat === 'Excellent' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    equip.etat === 'Bon' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    'bg-gradient-to-r from-orange-500 to-orange-600'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <h3 className="text-xl font-bold">{equip.machine}</h3>
                        <p className="text-sm opacity-90">{equip.type} - {equip.marque}</p>
                      </div>
                      <div className="text-right text-white">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          equip.etat === 'Excellent' ? 'bg-white bg-opacity-30' :
                          equip.etat === 'Bon' ? 'bg-white bg-opacity-30' :
                          'bg-white bg-opacity-30'
                        }`}>
                          {equip.etat}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Année</p>
                        <p className="font-semibold text-gray-900">{equip.annee}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Laize</p>
                        <p className="font-semibold text-gray-900">{equip.laize} cm</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Fils</p>
                        <p className="font-semibold text-gray-900">{equip.nbFils}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vitesse</p>
                        <p className="font-semibold text-gray-900">{equip.vitesseNominale} d/min</p>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Disponibilité</span>
                        <span className="font-bold text-lg" style={{ color: theme.primaryColor }}>
                          {equip.tauxDisponibilite}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${equip.tauxDisponibilite}%`,
                            backgroundColor: equip.tauxDisponibilite >= 95 ? '#10b981' :
                                           equip.tauxDisponibilite >= 90 ? '#3b82f6' : '#f59e0b'
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-blue-50 rounded p-2">
                        <p className="text-xs text-gray-600">Heures</p>
                        <p className="font-bold text-blue-600">{equip.compteurHeures.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50 rounded p-2">
                        <p className="text-xs text-gray-600">Maintenances</p>
                        <p className="font-bold text-green-600">{equip.maintenances}</p>
                      </div>
                      <div className="bg-red-50 rounded p-2">
                        <p className="text-xs text-gray-600">Pannes</p>
                        <p className="font-bold text-red-600">{equip.pannes}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dernière révision:</span>
                        <span className="font-semibold">{equip.derniereRevision}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prochaine révision:</span>
                        <span className="font-semibold text-orange-600">{equip.prochaineRevision}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valeur d'achat:</span>
                        <span className="font-semibold text-green-600">{equip.valeurAchat.toLocaleString()} TND</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button 
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        onClick={() => {
                          setSelectedMachine(equip);
                          setShowDocumentModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Détails
                      </button>
                      <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <History className="w-4 h-4 inline mr-1" />
                        Historique
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUTRES MODULES - En développement */}
        {currentView === 'clients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">👥 Gestion Clients</h1>
              <button 
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <Plus className="w-5 h-5" />
                Nouveau Client
              </button>
            </div>

            {/* Stats clients */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{clients.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">CA Total</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {(clients.reduce((acc, c) => acc + c.ca, 0) / 1000).toFixed(0)}K TND
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Export</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {clients.filter(c => c.type === 'Export').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Commandes</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {clients.reduce((acc, c) => acc + c.commandes, 0)}
                </p>
              </div>
            </div>

            {/* Liste clients */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Liste des Clients</h2>
                <div className="space-y-4">
                  {clients.map((client, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            {client.nom.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{client.nom}</h3>
                            <p className="text-sm text-gray-600">{client.code}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {client.type}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {client.pays}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {(client.ca / 1000).toFixed(1)}K TND
                          </p>
                          <p className="text-sm text-gray-600">{client.commandes} commandes</p>
                          <p className="text-xs text-gray-500 mt-1">Délai: {client.delaiPaiement}j</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUTRES MODULES - En développement */}
        {!['dashboard', 'production-suivi', 'production-of', 'stock-mp', 'clients', 'settings'].includes(currentView) && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {menuItems.find(item => item.id === currentView || item.submenu?.find(sub => sub.id === currentView))?.label || 
               menuItems.find(item => item.submenu?.find(sub => sub.id === currentView))?.submenu?.find(sub => sub.id === currentView)?.label || 
               'Module'}
            </h1>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-12">
                <Factory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">Module en développement</p>
                <p className="text-gray-500 text-sm">Ce module sera disponible prochainement avec toutes les fonctionnalités décrites dans vos spécifications.</p>
              </div>
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">💡 Données disponibles pour ce module:</p>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• {realData.totalCommandes.toLocaleString()} commandes</li>
                  <li>• {realData.articles} articles différents</li>
                  <li>• {realData.modeles} modèles de base</li>
                  <li>• {realData.soustraitants} sous-traitants</li>
                  <li>• Architecture complète définie dans les spécifications</li>
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
                <h2 className="text-lg font-semibold text-gray-800 mb-4">🏢 Informations Entreprise</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                    <input
                      type="text"
                      value={theme.companyName}
                      onChange={(e) => updateTheme('companyName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    <button 
                      onClick={() => setShowLogoUpload(true)}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      {companyLogo ? (
                        <img src={companyLogo} alt="Logo" className="h-12 mx-auto" />
                      ) : (
                        <div className="text-center py-4">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Cliquez pour uploader un logo</p>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">💾 Données & Sauvegarde</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                  <span>Exporter toutes les données</span>
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
                <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                  <span>Importer des données</span>
                  <Upload className="w-5 h-5 text-gray-600" />
                </button>
                <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                  <span>Sauvegarder la configuration</span>
                  <Save className="w-5 h-5 text-gray-600" />
                </button>
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
              <p className="text-xs text-gray-500 mt-2">PNG, JPG jusqu'à 5MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Machine */}
      {showDocumentModal && selectedMachine && !selectedOF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
              <h3 className="text-xl font-semibold text-white">
                Machine {selectedMachine.machine} - Détails Complets
              </h3>
              <button 
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedMachine(null);
                }}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations Générales */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Informations Générales
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Machine:</span>
                      <span className="font-semibold">{selectedMachine.machine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold">{selectedMachine.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre de fils:</span>
                      <span className="font-semibold">{selectedMachine.nbFils} fils</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vitesse:</span>
                      <span className="font-semibold">{selectedMachine.vitesse} duite/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duites/cm:</span>
                      <span className="font-semibold">{selectedMachine.duitesCm}</span>
                    </div>
                  </div>
                </div>

                {/* Production en Cours */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Factory className="w-5 h-5" />
                    Production en Cours
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">OF:</span>
                      <span className="font-semibold text-blue-600">{selectedMachine.ofEnCours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Client:</span>
                      <span className="font-semibold">{selectedMachine.clientEnCours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Opérateur:</span>
                      <span className="font-semibold">{selectedMachine.operateur}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Opérations:</span>
                      <span className="font-semibold">{selectedMachine.operations}</span>
                    </div>
                  </div>
                </div>

                {/* État Ensouple */}
                <div className={`rounded-lg p-4 ${
                  selectedMachine.status === 'alert' ? 'bg-red-50' :
                  selectedMachine.status === 'warning' ? 'bg-orange-50' :
                  'bg-green-50'
                }`}>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    État Ensouple
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Métrage restant:</span>
                      <span className={`font-bold text-xl ${
                        selectedMachine.status === 'alert' ? 'text-red-600' :
                        selectedMachine.status === 'warning' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {selectedMachine.restant} m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Autonomie:</span>
                      <span className="font-semibold">
                        {Math.floor(selectedMachine.restant / selectedMachine.prod)} jours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date ordissage:</span>
                      <span className="font-semibold">{selectedMachine.dateOrdissage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Production/jour:</span>
                      <span className="font-semibold">{selectedMachine.prod}m</span>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rendement:</span>
                      <span className="font-bold text-purple-600 text-xl">{selectedMachine.rendement}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temps fonct.:</span>
                      <span className="font-semibold">{selectedMachine.tempsFonctionnement}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temps arrêt:</span>
                      <span className="font-semibold">{selectedMachine.tempsArret}h</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-purple-600 h-3 rounded-full"
                          style={{ width: `${selectedMachine.rendement}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => alert('Fonction en développement')}
                >
                  Lancer Ordissage
                </button>
                <button 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => alert('Fonction en développement')}
                >
                  Historique
                </button>
                <button 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => alert('Fonction en développement')}
                >
                  Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails OF */}
      {showDocumentModal && selectedOF && !selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selectedOF.numOF} - Détails Complets
                </h3>
                <p className="text-sm text-purple-100 mt-1">{selectedOF.nomClient}</p>
              </div>
              <button 
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedOF(null);
                }}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Commande</p>
                  <p className="text-lg font-bold text-blue-600">{selectedOF.numCommande}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Machine</p>
                  <p className="text-lg font-bold text-purple-600">{selectedOF.machine}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Statut</p>
                  <p className="text-lg font-bold text-green-600">{selectedOF.statut}</p>
                </div>
              </div>

              {/* Progression */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Progression</h4>
                  <span className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
                    {selectedOF.progression}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="h-4 rounded-full transition-all"
                    style={{ 
                      width: `${selectedOF.progression}%`,
                      backgroundColor: theme.primaryColor
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>{selectedOF.quantiteFabriquee} pièces fabriquées</span>
                  <span>{selectedOF.quantite - selectedOF.quantiteFabriquee} restantes</span>
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Article</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modèle:</span>
                      <span className="font-semibold">{selectedOF.article}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Réf. commercial:</span>
                      <span className="font-semibold">{selectedOF.refCommercial}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantité:</span>
                      <span className="font-semibold">{selectedOF.quantite} pièces</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Planning</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Début:</span>
                      <span className="font-semibold">{selectedOF.dateDebut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Livraison:</span>
                      <span className="font-semibold">{selectedOF.dateLivraison}</span>
                    </div>
                    {selectedOF.urgence && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-800">URGENT</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Couleurs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>{selectedOF.couleur1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white border rounded"></div>
                      <span>{selectedOF.couleur2}</span>
                    </div>
                    {selectedOF.couleur3 && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>{selectedOF.couleur3}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Matière Première</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prévue:</span>
                      <span className="font-semibold">{selectedOF.mpPrevue} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consommée:</span>
                      <span className="font-semibold text-blue-600">{selectedOF.mpConsommee} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Restante:</span>
                      <span className="font-semibold">
                        {(selectedOF.mpPrevue - selectedOF.mpConsommee).toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => alert('Fonction en développement')}
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Modifier
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={() => alert('Fonction en développement')}
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Export PDF
                </button>
                <button 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => alert('Fonction en développement')}
                >
                  <History className="w-4 h-4 inline mr-2" />
                  Historique
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}