import React, { useState } from 'react';
import {
  Camera, Package, AlertTriangle, Printer, Clock, ArrowRight, Scissors, Tag, Zap,
  PackageCheck, Bell, XCircle, CheckCircle, AlertCircle, Activity, Users, Wrench,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';

const ChefAtelierDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('operations');
  const [showScanModal, setShowScanModal] = useState(false);
  const [showDeuxiemeModal, setShowDeuxiemeModal] = useState(false);
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [expandedCommandes, setExpandedCommandes] = useState<Record<string, boolean>>({});

  const operations = [
    { id: 'frange', label: 'Frange', icon: Scissors },
    { id: 'pliage', label: 'Pliage', icon: Package },
    { id: 'etiquetage', label: 'Étiquetage', icon: Tag },
    { id: 'couture', label: 'Couture', icon: Activity },
    { id: 'repassage', label: 'Repassage', icon: Zap },
    { id: 'emballage', label: 'Emballage', icon: PackageCheck },
  ];

  const [commandesEnCours] = useState<any[]>([
    {
      id: 'CMD001',
      numCommande: 'CM-FT0108',
      client: 'CL00296',
      dateEnvoi: '2025-10-25',
      joursRestants: 6,
      articles: [
        {
          idArticle: 'ART001',
          refCommercial: 'EPMA0919-B15-02',
          modele: 'MARINIERE',
          dimension: '0919',
          qteCommandee: 50,
          suivis: [
            {
              numSuivi: 'OF246533-1',
              qteLot: 25,
              operations: {
                frange: { statut: 'termine', qteSortie: 25, qteRetour: 25, qteEnCours: 0 },
                pliage: { statut: 'en_cours', qteSortie: 25, qteRetour: 15, qteEnCours: 10 },
                etiquetage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 },
                emballage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 },
              },
              qteDeuxieme: 0,
              qteRebut: 0,
              sousTraitant: 'AliSassi',
            },
            {
              numSuivi: 'OF246533-2',
              qteLot: 25,
              operations: {
                frange: { statut: 'termine', qteSortie: 25, qteRetour: 25, qteEnCours: 0 },
                pliage: { statut: 'en_cours', qteSortie: 25, qteRetour: 15, qteEnCours: 10 },
                etiquetage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 },
                emballage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 },
              },
              qteDeuxieme: 0,
              qteRebut: 0,
              sousTraitant: 'AliSassi',
            },
          ],
        },
        {
          idArticle: 'ART002',
          refCommercial: 'UNS1020-09',
          modele: 'UNI SURPIQUE',
          dimension: '1020',
          qteCommandee: 30,
          suivis: [
            {
              numSuivi: 'OF246534-1',
              qteLot: 30,
              operations: {
                pliage: { statut: 'termine', qteSortie: 30, qteRetour: 30, qteEnCours: 0 },
                etiquetage: { statut: 'en_cours', qteSortie: 30, qteRetour: 20, qteEnCours: 10 },
                emballage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 },
              },
              qteDeuxieme: 0,
              qteRebut: 0,
              sousTraitant: null,
            },
          ],
        },
      ],
      alertes: [
        { type: 'magasinier', message: 'Demande de finalisation pour colisage', urgent: true },
      ],
    },
    {
      id: 'CMD002',
      numCommande: 'Stock',
      client: 'All by Fouta',
      dateEnvoi: '2025-10-22',
      joursRestants: 3,
      articles: [
        {
          idArticle: 'ART003',
          refCommercial: 'FAF1020-B04-02',
          modele: 'FIL A FIL',
          dimension: '1020',
          qteCommandee: 100,
          suivis: [
            {
              numSuivi: 'CA250469-1',
              qteLot: 50,
              operations: {
                pliage: { statut: 'termine', qteSortie: 50, qteRetour: 50, qteEnCours: 0 },
                etiquetage: { statut: 'termine', qteSortie: 50, qteRetour: 50, qteEnCours: 0 },
                emballage: { statut: 'en_cours', qteSortie: 50, qteRetour: 30, qteEnCours: 20 },
              },
              qteDeuxieme: 2,
              qteRebut: 0,
              sousTraitant: null,
            },
            {
              numSuivi: 'CA250469-2',
              qteLot: 50,
              operations: {
                pliage: { statut: 'termine', qteSortie: 50, qteRetour: 50, qteEnCours: 0 },
                etiquetage: { statut: 'en_cours', qteSortie: 50, qteRetour: 40, qteEnCours: 10 },
                emballage: { statut: 'en_attente', qteSortie: 0, qteRetour: 0, qteEnCours: 0 },
              },
              qteDeuxieme: 0,
              qteRebut: 0,
              sousTraitant: null,
            },
          ],
        },
      ],
      alertes: [
        { type: 'date_proche', message: "Date d'envoi dans 3 jours", urgent: true },
      ],
    },
  ]);

  const [alertes] = useState([
    {
      id: 'A001',
      type: 'magasinier',
      commande: 'CM-FT0108',
      message: 'Demande finalisation pliage pour colisage (20 pièces)',
      urgent: true,
      date: new Date().toISOString(),
    },
    {
      id: 'A002',
      type: 'date_envoi',
      commande: 'Stock FAF1020',
      message: "Date d'envoi dans 3 jours - Reste 18 pièces à emballer",
      urgent: true,
      date: new Date().toISOString(),
    },
  ]);

  const [analyseDeuxieme] = useState([
    {
      sousTraitant: 'AliSassi',
      operation: 'Frange',
      totalTraite: 150,
      qteDeuxieme: 8,
      tauxDeuxieme: 5.3,
      typesDefauts: [
        { type: 'Tache', quantite: 3 },
        { type: 'Couture irrégulière', quantite: 3 },
        { type: 'Fil cassé', quantite: 2 },
      ],
    },
  ]);

  const [demandesMaintenance] = useState([
    {
      id: 'M001',
      date: '2025-10-19',
      statut: 'en_cours',
      priorite: 'urgente',
      equipement: 'Machine de pliage #3',
      probleme: 'Arrêt complet - Ne démarre plus',
      description: "La machine s'est arrêtée brutalement pendant l'opération",
    },
    {
      id: 'M002',
      date: '2025-10-18',
      statut: 'termine',
      priorite: 'normale',
      equipement: 'Table de couture #1',
      probleme: 'Vibrations anormales',
      description: "Vibrations importantes lors de l'utilisation",
    },
  ]);

  const getStatsOperation = (operationId: string) => {
    let total = 0;
    let enCours = 0;
    let termine = 0;
    let enAttente = 0;

    commandesEnCours.forEach((cmd: any) => {
      cmd.articles.forEach((article: any) => {
        article.suivis.forEach((suivi: any) => {
          if (suivi.operations[operationId]) {
            const op = suivi.operations[operationId];
            if (op.statut === 'en_cours') enCours += op.qteEnCours;
            if (op.statut === 'termine') termine += op.qteRetour;
            if (op.statut === 'en_attente') enAttente += suivi.qteLot;
            total += suivi.qteLot;
          }
        });
      });
    });

    return { total, enCours, termine, enAttente };
  };

  const statutBadge = (statut: string) => {
    const map: Record<string, { bg: string; c: string }> = {
      termine: { bg: 'var(--color-success-bg)', c: 'var(--color-success)' },
      en_cours: { bg: 'var(--color-info-bg)', c: 'var(--color-info)' },
      en_attente: { bg: 'var(--bg-hover)', c: 'var(--fg-secondary)' },
    };
    const b = map[statut] || map.en_attente;
    return (
      <span style={{ ...badgeBase, background: b.bg, color: b.c }}>
        {statut.toUpperCase().replace('_', ' ')}
      </span>
    );
  };

  const prioriteBadge = (p: string) => {
    if (p === 'urgente') return <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>URGENTE</span>;
    if (p === 'haute') return <span style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>HAUTE</span>;
    return <span style={{ ...badgeBase, background: 'var(--bg-hover)', color: 'var(--fg-secondary)' }}>NORMALE</span>;
  };

  // ─────────── Modals ───────────
  const MaintenanceModal = () => {
    const [equipement, setEquipement] = useState('');
    const [probleme, setProbleme] = useState('');
    const [description, setDescription] = useState('');
    const [priorite, setPriorite] = useState('normale');
    if (!showMaintenanceModal) return null;
    return (
      <div style={modalOverlay}>
        <div style={modalBox}>
          <h3 style={modalTitle}><Wrench size={20} style={{ color: 'var(--accent-terracotta)' }} /> Demande de Maintenance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            <div>
              <label style={labelStyle}>Équipement / Machine</label>
              <select value={equipement} onChange={(e) => setEquipement(e.target.value)} style={inputStyle}>
                <option value="">Sélectionner...</option>
                <option value="Machine pliage #1">Machine pliage #1</option>
                <option value="Machine pliage #2">Machine pliage #2</option>
                <option value="Machine pliage #3">Machine pliage #3</option>
                <option value="Table couture #1">Table couture #1</option>
                <option value="Table couture #2">Table couture #2</option>
                <option value="Machine emballage">Machine emballage</option>
                <option value="Autre">Autre équipement</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Type de Problème</label>
              <select value={probleme} onChange={(e) => setProbleme(e.target.value)} style={inputStyle}>
                <option value="">Sélectionner...</option>
                <option value="Panne complète">Panne complète</option>
                <option value="Dysfonctionnement">Dysfonctionnement</option>
                <option value="Bruit anormal">Bruit anormal</option>
                <option value="Vibrations">Vibrations</option>
                <option value="Surchauffe">Surchauffe</option>
                <option value="Problème électrique">Problème électrique</option>
                <option value="Usure">Usure de pièce</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priorité</label>
              <select value={priorite} onChange={(e) => setPriorite(e.target.value)} style={inputStyle}>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente (arrêt production)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Description détaillée</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le problème en détail..." style={{ ...inputStyle, minHeight: 80 }} rows={3} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
              <button
                onClick={() => {
                  alert(`Demande de maintenance envoyée au mécanicien:\n${equipement} - ${probleme}`);
                  setShowMaintenanceModal(false);
                }}
                style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}
              >
                <Wrench size={14} /> Envoyer au Mécanicien
              </button>
              <button onClick={() => setShowMaintenanceModal(false)} style={btnGhost}>Annuler</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ScanModal = () => {
    if (!showScanModal) return null;
    return (
      <div style={modalOverlay}>
        <div style={modalBox}>
          <h3 style={modalTitle}>Scanner Numéro de Suivi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            <div>
              <label style={labelStyle}>Numéro de Suivi</label>
              <input
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Scannez ou saisissez le code"
                style={inputStyle}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
              <button onClick={() => setShowScanModal(false)} style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}>Valider</button>
              <button onClick={() => setShowScanModal(false)} style={{ ...btnGhost, flex: 1, justifyContent: 'center' }}>Annuler</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DeuxiemeChoixModal = () => {
    const [qteDeuxieme, setQteDeuxieme] = useState(0);
    const [typeDefaut, setTypeDefaut] = useState('');
    const [decision, setDecision] = useState('');
    if (!showDeuxiemeModal) return null;
    return (
      <div style={modalOverlay}>
        <div style={modalBox}>
          <h3 style={modalTitle}>Déclaration Deuxième Choix</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            <div>
              <label style={labelStyle}>Numéro de Suivi</label>
              <input type="text" value={scannedCode} readOnly style={{ ...inputStyle, background: 'var(--bg-hover)' }} />
            </div>
            <div>
              <label style={labelStyle}>Quantité Deuxième</label>
              <input type="number" value={qteDeuxieme} onChange={(e) => setQteDeuxieme(parseInt(e.target.value) || 0)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Type de Défaut</label>
              <select value={typeDefaut} onChange={(e) => setTypeDefaut(e.target.value)} style={inputStyle}>
                <option value="">Sélectionner...</option>
                <option value="Tache">Tache</option>
                <option value="Couture irrégulière">Couture irrégulière</option>
                <option value="Fil cassé">Fil cassé</option>
                <option value="Dimension incorrecte">Dimension incorrecte</option>
                <option value="Couleur non conforme">Couleur non conforme</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Décision</label>
              <select value={decision} onChange={(e) => setDecision(e.target.value)} style={inputStyle}>
                <option value="">Sélectionner...</option>
                <option value="approuve">Approuvé (récupérable)</option>
                <option value="non_approuve">Non approuvé (rebut)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
              <button
                onClick={() => {
                  alert(`Deuxième choix enregistré: ${qteDeuxieme} pièces - Type: ${typeDefaut} - Décision: ${decision}`);
                  setShowDeuxiemeModal(false);
                }}
                style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}
              >
                Enregistrer et Imprimer Étiquette
              </button>
              <button onClick={() => setShowDeuxiemeModal(false)} style={btnGhost}>Annuler</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ComplementUrgentModal = () => {
    const [qteComplement, setQteComplement] = useState(0);
    const [motif, setMotif] = useState('');
    if (!showComplementModal) return null;
    return (
      <div style={modalOverlay}>
        <div style={modalBox}>
          <h3 style={{ ...modalTitle, color: 'var(--color-danger)' }}>Demande de Complément Urgent</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 'var(--s-3)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)', margin: 0 }}>
                Cette demande sera envoyée à tous les postes de fabrication
              </p>
            </div>
            <div>
              <label style={labelStyle}>Quantité à compléter</label>
              <input type="number" value={qteComplement} onChange={(e) => setQteComplement(parseInt(e.target.value) || 0)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Motif</label>
              <select value={motif} onChange={(e) => setMotif(e.target.value)} style={inputStyle}>
                <option value="">Sélectionner...</option>
                <option value="deuxieme_choix">Deuxième choix non récupérable</option>
                <option value="rebut">Rebut important</option>
                <option value="perte">Perte lors du traitement</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
              <button
                onClick={() => {
                  alert(`Demande de complément envoyée: ${qteComplement} pièces`);
                  setShowComplementModal(false);
                }}
                style={{ ...btnPrimary, flex: 1, justifyContent: 'center', background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              >
                <AlertTriangle size={14} /> Envoyer Demande Urgente
              </button>
              <button onClick={() => setShowComplementModal(false)} style={btnGhost}>Annuler</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─────────── Views ───────────
  const totalDeuxieme = commandesEnCours.reduce(
    (sum: number, cmd: any) =>
      sum + cmd.articles.reduce((s: number, art: any) => s + art.suivis.reduce((ss: number, suivi: any) => ss + suivi.qteDeuxieme, 0), 0),
    0,
  );
  const totalEnCours = operations.reduce((sum, op) => sum + getStatsOperation(op.id).enCours, 0);

  const tabs = [
    { id: 'operations', label: 'Opérations' },
    { id: 'commandes', label: 'Commandes' },
    { id: 'alertes', label: 'Alertes' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'analyse', label: 'Analyse 2ème' },
  ];

  const renderOperationsView = () => (
    <>
      <div className="lp-grid-3">
        {operations.map((op) => {
          const stats = getStatsOperation(op.id);
          const OpIcon = op.icon;
          const selected = selectedOperation === op.id;
          return (
            <button
              key={op.id}
              onClick={() => setSelectedOperation(selected ? null : op.id)}
              style={{
                textAlign: 'left',
                background: 'var(--bg-elevated)',
                border: `1px solid ${selected ? 'var(--accent-rose)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--s-4)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <OpIcon size={16} style={{ color: 'var(--accent-rose)' }} />
                <span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{op.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                <span style={{ color: 'var(--fg-muted)' }}>En cours</span>
                <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>{stats.enCours}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                <span style={{ color: 'var(--fg-muted)' }}>Terminé</span>
                <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{stats.termine}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                <span style={{ color: 'var(--fg-muted)' }}>En attente</span>
                <span style={{ fontWeight: 600, color: 'var(--fg-secondary)' }}>{stats.enAttente}</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedOperation && (
        <SectionCard title={`Commandes — ${operations.find((o) => o.id === selectedOperation)?.label}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {commandesEnCours.map((cmd: any) =>
              cmd.articles.map((article: any) =>
                article.suivis
                  .filter((s: any) => s.operations[selectedOperation!])
                  .map((suivi: any) => {
                    const op = suivi.operations[selectedOperation!];
                    return (
                      <div key={suivi.numSuivi} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-3)' }}>
                          <div>
                            <h4 style={{ margin: 0, color: 'var(--fg-primary)' }}>{suivi.numSuivi}</h4>
                            <p style={{ margin: '2px 0', fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>
                              {article.modele} {article.dimension} — {cmd.client}
                            </p>
                            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Commande: {cmd.numCommande}</p>
                          </div>
                          {statutBadge(op.statut)}
                        </div>
                        <div className="lp-grid-3" style={{ marginBottom: 'var(--s-3)' }}>
                          {(['qteLot', 'qteSortie', 'qteRetour', 'qteEnCours'] as const).map((k) => {
                            const label = k === 'qteLot' ? 'Lot' : k === 'qteSortie' ? 'Sortie' : k === 'qteRetour' ? 'Retour' : 'En cours';
                            const value = k === 'qteLot' ? suivi.qteLot : op[k];
                            return (
                              <div key={k} style={statTile}>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{label}</div>
                                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--fg-primary)' }}>{value}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
                          {op.statut === 'en_attente' && (
                            <button style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}>
                              <ArrowRight size={14} /> Commencer
                            </button>
                          )}
                          {op.statut === 'en_cours' && op.qteEnCours > 0 && (
                            <button style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}>
                              <Package size={14} /> Préparer ({op.qteEnCours})
                            </button>
                          )}
                          {op.qteRetour > 0 && (
                            <button style={{ ...btnGhost, flex: 1, justifyContent: 'center' }}>
                              <CheckCircle size={14} /> Transférer
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setScannedCode(suivi.numSuivi);
                              setShowDeuxiemeModal(true);
                            }}
                            style={{ ...btnGhost, color: 'var(--color-danger)' }}
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  }),
              ),
            )}
          </div>
        </SectionCard>
      )}
    </>
  );

  const renderCommandesView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      {commandesEnCours.map((cmd: any) => {
        const totalArticles = cmd.articles.length;
        const isExpanded = expandedCommandes[cmd.id];
        return (
          <div key={cmd.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-3)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 4 }}>
                  <h3 style={{ margin: 0, color: 'var(--fg-primary)' }}>Commande {cmd.numCommande}</h3>
                  <span style={{ ...badgeBase, background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                    {totalArticles} article{totalArticles > 1 ? 's' : ''}
                  </span>
                  {cmd.joursRestants <= 5 && (
                    <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> {cmd.joursRestants} jours
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--s-4)', fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>
                  <span>Client: <strong style={{ color: 'var(--fg-primary)' }}>{cmd.client}</strong></span>
                  <span>Envoi: <strong style={{ color: 'var(--fg-primary)' }}>{new Date(cmd.dateEnvoi).toLocaleDateString('fr-FR')}</strong></span>
                </div>
              </div>
              <button
                onClick={() => setExpandedCommandes({ ...expandedCommandes, [cmd.id]: !isExpanded })}
                style={btnPrimary}
              >
                {isExpanded ? 'Réduire' : 'Détails'}
              </button>
            </div>

            {cmd.alertes?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', marginBottom: 'var(--s-3)' }}>
                {cmd.alertes.map((alerte: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: 'var(--s-3)',
                      background: alerte.urgent ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <Bell size={16} style={{ color: alerte.urgent ? 'var(--color-danger)' : 'var(--color-warning)' }} />
                    <span style={{ fontSize: 'var(--text-sm)', color: alerte.urgent ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                      {alerte.message}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
              {cmd.articles.map((article: any) => {
                const totalPremierChoix = article.suivis.reduce((sum: number, s: any) => sum + (s.qteLot - s.qteDeuxieme - s.qteRebut), 0);
                const totalD = article.suivis.reduce((sum: number, s: any) => sum + s.qteDeuxieme, 0);
                const totalRebut = article.suivis.reduce((sum: number, s: any) => sum + s.qteRebut, 0);
                const progression = (totalPremierChoix / article.qteCommandee) * 100;

                return (
                  <div key={article.idArticle} style={{ borderLeft: '3px solid var(--accent-rose)', paddingLeft: 'var(--s-3)' }}>
                    <div style={{ marginBottom: 'var(--s-2)' }}>
                      <h4 style={{ margin: 0, color: 'var(--fg-primary)' }}>{article.modele} {article.dimension}</h4>
                      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>Réf: {article.refCommercial}</p>
                    </div>
                    <div className="lp-grid-3" style={{ marginBottom: 'var(--s-3)' }}>
                      <div style={statTile}><div style={statLabel}>Commandée</div><div style={statValue}>{article.qteCommandee}</div></div>
                      <div style={statTile}><div style={statLabel}>Premier Choix</div><div style={{ ...statValue, color: 'var(--color-success)' }}>{totalPremierChoix}</div></div>
                      <div style={statTile}><div style={statLabel}>Deuxième</div><div style={{ ...statValue, color: 'var(--color-warning)' }}>{totalD}</div></div>
                      <div style={statTile}><div style={statLabel}>Rebut</div><div style={{ ...statValue, color: 'var(--color-danger)' }}>{totalRebut}</div></div>
                    </div>
                    <div style={{ marginBottom: 'var(--s-3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                        <span style={{ color: 'var(--fg-secondary)' }}>Progression</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>{progression.toFixed(1)}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'var(--border-subtle)', borderRadius: 999 }}>
                        <div style={{ width: `${Math.min(progression, 100)}%`, height: '100%', background: 'var(--accent-rose)', borderRadius: 999 }} />
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                        {article.suivis.map((suivi: any) => (
                          <div key={suivi.numSuivi} style={{ ...cardStyle, background: 'var(--bg-hover)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-2)' }}>
                              <h5 style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fg-primary)' }}>
                                <Tag size={14} /> {suivi.numSuivi}
                              </h5>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <span style={{ ...badgeBase, background: 'var(--bg-elevated)', color: 'var(--fg-secondary)' }}>Lot: {suivi.qteLot}</span>
                                {suivi.sousTraitant && (
                                  <span style={{ ...badgeBase, background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>S/T: {suivi.sousTraitant}</span>
                                )}
                              </div>
                            </div>
                            <div className="lp-grid-3">
                              {Object.entries(suivi.operations).map(([opId, opData]: [string, any]) => {
                                const opDef = operations.find((o) => o.id === opId);
                                const OpIcon = opDef?.icon || Package;
                                return (
                                  <div key={opId} style={{ padding: 'var(--s-2)', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                                      <OpIcon size={12} style={{ color: 'var(--accent-rose)' }} />
                                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-primary)' }}>{opDef?.label}</span>
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                                      S: <strong>{opData.qteSortie}</strong> / R: <strong style={{ color: 'var(--color-success)' }}>{opData.qteRetour}</strong> / EC: <strong style={{ color: 'var(--color-warning)' }}>{opData.qteEnCours}</strong>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-2)' }}>
                              <button
                                onClick={() => setScannedCode(suivi.numSuivi)}
                                style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }}
                              >
                                <Camera size={12} /> Scanner
                              </button>
                              <button
                                onClick={() => {
                                  setScannedCode(suivi.numSuivi);
                                  setShowDeuxiemeModal(true);
                                }}
                                style={{ ...btnGhost, color: 'var(--color-danger)' }}
                              >
                                2ème
                              </button>
                              {totalPremierChoix < article.qteCommandee && (
                                <button onClick={() => setShowComplementModal(true)} style={{ ...btnGhost, color: 'var(--color-warning)' }}>
                                  <AlertTriangle size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMaintenanceView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--fg-primary)' }}>Demandes de Maintenance</h3>
        <button onClick={() => setShowMaintenanceModal(true)} style={btnPrimary}>
          <Wrench size={14} /> Nouvelle Demande
        </button>
      </div>
      {demandesMaintenance.map((demande) => (
        <div key={demande.id} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-2)' }}>
            <Wrench size={16} style={{ color: demande.priorite === 'urgente' ? 'var(--color-danger)' : demande.priorite === 'haute' ? 'var(--color-warning)' : 'var(--fg-secondary)' }} />
            {statutBadge(demande.statut)}
            {prioriteBadge(demande.priorite)}
          </div>
          <h4 style={{ margin: '0 0 4px 0', color: 'var(--fg-primary)' }}>{demande.equipement}</h4>
          <p style={{ margin: '0 0 4px 0', fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>{demande.probleme}</p>
          <p style={{ margin: '0 0 var(--s-2) 0', fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--fg-muted)' }}>{demande.description}</p>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
            Demande créée le {new Date(demande.date).toLocaleDateString('fr-FR')}
          </p>
        </div>
      ))}
    </div>
  );

  const renderAlertesView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--fg-primary)' }}>Alertes Actives</h3>
        <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
          {alertes.filter((a) => a.urgent).length} urgentes
        </span>
      </div>
      {alertes.map((alerte) => (
        <div key={alerte.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-3)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-2)' }}>
                {alerte.urgent ? (
                  <AlertCircle size={16} style={{ color: 'var(--color-danger)' }} />
                ) : (
                  <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
                )}
                <span style={{ ...badgeBase, background: alerte.type === 'date_envoi' ? 'var(--color-danger-bg)' : 'var(--color-info-bg)', color: alerte.type === 'date_envoi' ? 'var(--color-danger)' : 'var(--color-info)' }}>
                  {alerte.type.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', color: 'var(--fg-primary)' }}>{alerte.commande}</h4>
              <p style={{ margin: '0 0 4px 0', fontSize: 'var(--text-sm)', color: alerte.urgent ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                {alerte.message}
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                {new Date(alerte.date).toLocaleString('fr-FR')}
              </p>
            </div>
            <button style={btnPrimary}>Traiter</button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalyseView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
      {analyseDeuxieme.map((analyse, idx) => {
        const tauxColor = analyse.tauxDeuxieme > 7 ? 'var(--color-danger)' : analyse.tauxDeuxieme > 5 ? 'var(--color-warning)' : 'var(--color-success)';
        return (
          <div key={idx} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-3)' }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--fg-primary)' }}>{analyse.sousTraitant}</h4>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>Opération: {analyse.operation}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: tauxColor }}>{analyse.tauxDeuxieme.toFixed(1)}%</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Taux 2ème choix</div>
              </div>
            </div>
            <div className="lp-grid-3" style={{ marginBottom: 'var(--s-3)' }}>
              <div style={statTile}><div style={statLabel}>Total traité</div><div style={statValue}>{analyse.totalTraite}</div></div>
              <div style={statTile}><div style={statLabel}>Deuxième choix</div><div style={{ ...statValue, color: 'var(--color-warning)' }}>{analyse.qteDeuxieme}</div></div>
              <div style={statTile}><div style={statLabel}>Premier choix</div><div style={{ ...statValue, color: 'var(--color-success)' }}>{analyse.totalTraite - analyse.qteDeuxieme}</div></div>
            </div>
            <div>
              <h5 style={{ margin: '0 0 var(--s-2) 0', color: 'var(--fg-secondary)', fontSize: 'var(--text-sm)' }}>Répartition des défauts</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                {analyse.typesDefauts.map((defaut, idx2) => (
                  <div key={idx2} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--s-2) var(--s-3)', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>{defaut.type}</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>
                      <strong style={{ color: 'var(--fg-primary)' }}>{defaut.quantite}</strong> pcs
                      <span style={{ marginLeft: 8, color: 'var(--fg-muted)' }}>({((defaut.quantite / analyse.qteDeuxieme) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <DashboardShell
        eyebrow="Poste — Chef d'atelier"
        title="Tableau de bord — Chef d'atelier"
        subtitle="Coordination des postes atelier, allocation des machines et incidents."
        headerRight={
          <>
            <button onClick={() => window.location.reload()} style={btnGhost} title="Actualiser">
              <Activity size={14} /> Actualiser
            </button>
            <ThemeToggle />
          </>
        }
      >
        <div className="lp-metric-grid">
          <KpiCard label="Commandes actives" value={commandesEnCours.length} icon={<Package size={18} />} tone="rose" />
          <KpiCard label="Alertes urgentes" value={alertes.filter((a) => a.urgent).length} icon={<AlertCircle size={18} />} tone="terracotta" />
          <KpiCard label="Deuxième choix" value={totalDeuxieme} icon={<XCircle size={18} />} tone="gold" />
          <KpiCard label="Opérations en cours" value={totalEnCours} icon={<Activity size={18} />} tone="sage" />
        </div>

        <SectionCard title="Actions rapides" icon={<Users size={16} />}>
          <div className="lp-grid-3">
            <button onClick={() => setShowScanModal(true)} style={quickBtn}>
              <Camera size={18} /> Scanner Lot
            </button>
            <button onClick={() => setShowDeuxiemeModal(true)} style={{ ...quickBtn, borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              <XCircle size={18} /> Déclarer 2ème
            </button>
            <button onClick={() => setShowComplementModal(true)} style={{ ...quickBtn, borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}>
              <AlertTriangle size={18} /> Complément
            </button>
            <button onClick={() => setShowMaintenanceModal(true)} style={quickBtn}>
              <Wrench size={18} /> Maintenance
            </button>
            <button style={quickBtn}>
              <Printer size={18} /> Imprimer
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Suivi atelier"
          subtitle="Opérations, commandes, alertes et maintenance"
          actions={
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={activeTab === t.id ? btnPrimary : btnGhost}
                >
                  {t.label}
                </button>
              ))}
            </div>
          }
        >
          {activeTab === 'operations' && renderOperationsView()}
          {activeTab === 'commandes' && renderCommandesView()}
          {activeTab === 'alertes' && renderAlertesView()}
          {activeTab === 'maintenance' && renderMaintenanceView()}
          {activeTab === 'analyse' && renderAnalyseView()}
        </SectionCard>
      </DashboardShell>

      <ScanModal />
      <DeuxiemeChoixModal />
      <ComplementUrgentModal />
      <MaintenanceModal />
    </>
  );
};

const badgeBase: React.CSSProperties = { padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)' };
const cardStyle: React.CSSProperties = { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--s-4)' };
const statTile: React.CSSProperties = { background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 'var(--s-2) var(--s-3)', textAlign: 'center' };
const statLabel: React.CSSProperties = { fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' };
const statValue: React.CSSProperties = { fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--fg-primary)' };
const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 'var(--s-4)' };
const modalBox: React.CSSProperties = { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--s-5)', maxWidth: 480, width: '100%' };
const modalTitle: React.CSSProperties = { margin: '0 0 var(--s-4) 0', color: 'var(--fg-primary)', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-lg)' };
const quickBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 'var(--s-3) var(--s-4)', background: 'var(--bg-elevated)', color: 'var(--fg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' };

const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent-rose)', color: '#fff', border: '1px solid var(--accent-rose)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-hover)', color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };

export default ChefAtelierDashboard;
