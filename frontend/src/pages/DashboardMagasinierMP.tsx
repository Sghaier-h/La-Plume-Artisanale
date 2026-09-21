import React, { useState } from 'react';
import {
  Package, TrendingDown, AlertTriangle, CheckCircle, Clock, Search, Printer,
  ArrowRightLeft, Box, Download, Plus, ChevronDown, ChevronRight, Activity,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import WhatsAppWidget from '../components/WhatsAppWidget';

interface Selecteur {
  sel: string;
  codeFab: string;
  codeCom: string;
  couleur: string;
  besoins: number | string;
  preparer: string;
  qrMP: string;
}

interface Preparation {
  numSousOF: string;
  client: string;
  numCommande: string;
  modele: string;
  ref: string;
  qte: number;
  machine: string;
  dateDebut: string;
  ordrePlanification: number;
  selecteurs: Selecteur[];
  etat: string;
  priorite: string;
  surplusDemande: boolean;
  ofOrigine?: string;
  dateAlimentee?: string;
}

interface Transfert {
  id: string;
  origine: string;
  destination: string;
  items: Array<{ qr: string; codeCom: string; couleur: string; quantite: number }>;
  etat: string;
  date: string;
}

interface RetourMatiere {
  numSousOF: string;
  modele: string;
  selecteurs: Array<{ sel: string; codeCom: string; couleur: string; preparer: number; consomme: number; retour: number }>;
  etat: string;
  aRetourner: boolean;
}

type Tab = 'machines' | 'preparation' | 'stock' | 'transferts' | 'retours';

const DashboardMagasinierMP: React.FC = () => {
  const [tab, setTab] = useState<Tab>('machines');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEtiquetteModal, setShowEtiquetteModal] = useState(false);
  const [selectedPreparation, setSelectedPreparation] = useState<any>(null);
  const [expandedOF, setExpandedOF] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  // Données de préparation par OF
  const [preparationsEnCours, setPreparationsEnCours] = useState<Preparation[]>([
    {
      numSousOF: 'OF249850', client: 'CL00884', numCommande: 'CM-FT0119', modele: 'ARTHUR',
      ref: 'AR1020-B02-04', qte: 320, machine: 'M2303', dateDebut: '2025-10-20 08:00', ordrePlanification: 1,
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE', besoins: 76.8, preparer: '', qrMP: '' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC', besoins: 35.2, preparer: '', qrMP: '' },
      ],
      etat: 'A préparer', priorite: 'Urgent', surplusDemande: false,
    },
    {
      numSousOF: 'OF249851', client: 'CL00837', numCommande: 'CM-FT0121', modele: 'IBIZA',
      ref: 'IB1020-B29-01', qte: 250, machine: 'M2301', dateDebut: '2025-10-19 08:00', ordrePlanification: 2,
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE', besoins: 60.0, preparer: '60.0', qrMP: 'C29_ROUGE_NM05-01.00_S2023' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC', besoins: 27.5, preparer: '27.5', qrMP: 'C01_BLANC_NM05-01.00_S2024' },
      ],
      etat: 'Machine alimentée', priorite: 'Normal', dateAlimentee: '2025-10-18 08:30', surplusDemande: false,
    },
    {
      numSousOF: 'OF249852', client: 'CL00901', numCommande: 'CM-FT0123', modele: 'UNI',
      ref: 'UNS1020-02', qte: 180, machine: 'M2305', dateDebut: '2025-10-21 08:00', ordrePlanification: 3,
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C02', couleur: 'ECRU', besoins: 43.2, preparer: '43.2', qrMP: 'C02_ECRU_NM05-01.00_S2023' },
      ],
      etat: 'Préparé', priorite: 'Normal', surplusDemande: false,
    },
    {
      numSousOF: 'OF249853', client: 'CL00765', numCommande: 'CM-FT0125', modele: 'ND LILI',
      ref: 'NDL1020-B12-01', qte: 400, machine: 'M2302', dateDebut: '2025-10-22 08:00', ordrePlanification: 4,
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C12', couleur: 'BLEU', besoins: 96.0, preparer: '', qrMP: '' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC', besoins: 44.0, preparer: '', qrMP: '' },
      ],
      etat: 'A préparer', priorite: 'Normal', surplusDemande: false,
    },
    {
      numSousOF: 'OF249780.1', client: 'CL00884', numCommande: 'CM-FT0119', modele: 'ARTHUR',
      ref: 'AR1020-B02-04', qte: 50, machine: 'M2303', dateDebut: '2025-10-19 08:00', ordrePlanification: 0,
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE', besoins: 12.0, preparer: '', qrMP: '' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC', besoins: 5.5, preparer: '', qrMP: '' },
      ],
      etat: 'A préparer', priorite: 'SURPLUS URGENT', surplusDemande: true, ofOrigine: 'OF249780',
    },
  ]);

  const [stockMP] = useState<any[]>([
    { qr: 'C01_BLANC_NM05-01.00_S2023', codeFab: 'NM05-01.00', lot: 'S2023', codeCom: 'C01', couleur: 'BLANC', poidsUsine: 85, poidsE1: 145, poidsE2: 0, entrepot: 'Usine' },
    { qr: 'C02_ECRU_NM05-01.00_S2023', codeFab: 'NM05-01.00', lot: 'S2023', codeCom: 'C02', couleur: 'ECRU', poidsUsine: 120, poidsE1: 0, poidsE2: 80, entrepot: 'Usine' },
    { qr: 'C04_BEIGE_NM05-01.00_S2024', codeFab: 'NM05-01.00', lot: 'S2024', codeCom: 'C04', couleur: 'BEIGE', poidsUsine: 95, poidsE1: 0, poidsE2: 0, entrepot: 'Usine' },
    { qr: 'C09_GRIS_NM05-01.00_S2023', codeFab: 'NM05-01.00', lot: 'S2023', codeCom: 'C09', couleur: 'GRIS', poidsUsine: 15, poidsE1: 85, poidsE2: 0, entrepot: 'Usine', alerte: true },
    { qr: 'C12_BLEU_NM10-02.00_S2024', codeFab: 'NM10-02.00', lot: 'S2024', codeCom: 'C12', couleur: 'BLEU', poidsUsine: 0, poidsE1: 120, poidsE2: 0, entrepot: 'E1', rupture: true },
    { qr: 'C29_ROUGE_NM05-01.00_S2023', codeFab: 'NM05-01.00', lot: 'S2023', codeCom: 'C29', couleur: 'ROUGE', poidsUsine: 68, poidsE1: 0, poidsE2: 95, entrepot: 'Usine' },
    { qr: 'C01_BLANC_NM05-01.00_S2024', codeFab: 'NM05-01.00', lot: 'S2024', codeCom: 'C01', couleur: 'BLANC', poidsUsine: 0, poidsE1: 145, poidsE2: 0, entrepot: 'E1' },
    { qr: 'C10_NOIR_NM05-01.00_S2023', codeFab: 'NM05-01.00', lot: 'S2023', codeCom: 'C10', couleur: 'NOIR', poidsUsine: 230, poidsE1: 0, poidsE2: 0, entrepot: 'Usine' },
  ]);

  const [transfertsEnAttente] = useState<Transfert[]>([
    {
      id: 'TR2025001', origine: 'E1', destination: 'Usine',
      items: [
        { qr: 'C01_BLANC_NM05-01.00_S2024', codeCom: 'C01', couleur: 'BLANC', quantite: 50 },
        { qr: 'C09_GRIS_NM05-01.00_S2023', codeCom: 'C09', couleur: 'GRIS', quantite: 30 },
      ],
      etat: 'En attente validation', date: '2025-10-18 10:00',
    },
  ]);

  const [retoursMatieres] = useState<RetourMatiere[]>([
    {
      numSousOF: 'OF249780', modele: 'IBIZA',
      selecteurs: [
        { sel: 'S01', codeCom: 'C29', couleur: 'ROUGE', preparer: 76.8, consomme: 74.2, retour: 2.6 },
        { sel: 'S02', codeCom: 'C01', couleur: 'BLANC', preparer: 35.2, consomme: 34.8, retour: 0.4 },
      ],
      etat: 'Fabrication terminée', aRetourner: true,
    },
  ]);

  const handleUpdateQuantite = (numSousOF: string, selecteur: string, quantite: string, qrMP: string) => {
    setPreparationsEnCours(prev => prev.map(prep => {
      if (prep.numSousOF === numSousOF) {
        const updatedSelecteurs = prep.selecteurs.map(sel => {
          if (sel.sel === selecteur) return { ...sel, preparer: quantite, qrMP };
          return sel;
        });
        const tousPreparees = updatedSelecteurs.every(s =>
          parseFloat(s.preparer || '0') >= parseFloat(s.besoins.toString())
        );
        return { ...prep, selecteurs: updatedSelecteurs, etat: tousPreparees ? 'Préparé' : 'En cours préparation' };
      }
      return prep;
    }));
  };

  const handleAlimenterMachine = (numSousOF: string) => {
    setPreparationsEnCours(prev => prev.map(prep => {
      if (prep.numSousOF === numSousOF) {
        return { ...prep, etat: 'Machine alimentée', dateAlimentee: new Date().toISOString() };
      }
      return prep;
    }));
    setExpandedOF(null);
  };

  const getPreparationsByMachine = () => {
    const machines: Record<string, { machine: string; preparations: Preparation[] }> = {};
    preparationsEnCours.forEach(prep => {
      if (!machines[prep.machine]) machines[prep.machine] = { machine: prep.machine, preparations: [] };
      machines[prep.machine].preparations.push(prep);
    });
    Object.values(machines).forEach(m => {
      m.preparations.sort((a, b) => {
        if (a.surplusDemande && !b.surplusDemande) return -1;
        if (!a.surplusDemande && b.surplusDemande) return 1;
        return a.ordrePlanification - b.ordrePlanification;
      });
    });
    return Object.values(machines);
  };

  const handleImprimerEtiquette = (preparation: any, selecteur: any) => {
    setSelectedPreparation({ ...preparation, selecteur });
    setShowEtiquetteModal(true);
  };

  const toggleOF = (numSousOF: string) => setExpandedOF(expandedOF === numSousOF ? null : numSousOF);

  // ----------------------- Reusable UI helpers -----------------------
  const statutBadge = (etat: string) => {
    const map: Record<string, { bg: string; c: string }> = {
      'A préparer':          { bg: 'var(--color-warning-bg)', c: 'var(--color-warning)' },
      'En cours préparation':{ bg: 'var(--color-info-bg)',    c: 'var(--color-info)' },
      'Préparé':             { bg: 'var(--color-success-bg)', c: 'var(--color-success)' },
      'Machine alimentée':   { bg: 'var(--color-success-bg)', c: 'var(--color-success)' },
    };
    const b = map[etat] || { bg: 'var(--bg-hover)', c: 'var(--fg-secondary)' };
    return <span style={{ ...badgeBase, background: b.bg, color: b.c }}>{etat}</span>;
  };

  const stockBadge = (mp: any) => {
    if (mp.rupture) return <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>Rupture</span>;
    if (mp.alerte)  return <span style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>Stock bas</span>;
    return <span style={{ ...badgeBase, background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>OK</span>;
  };

  const tabBtn = (id: Tab, label: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      style={tab === id ? btnPrimary : btnGhost}
    >
      {label}
    </button>
  );

  // ----------------------- Section renderers -----------------------
  const renderMachines = () => {
    const machinesData = getPreparationsByMachine();
    const filteredMachines = selectedMachine ? machinesData.filter(m => m.machine === selectedMachine) : machinesData;

    return (
      <SectionCard
        title="Vue par machine"
        subtitle="Organisation des préparations selon le planning"
        icon={<Box size={16} />}
      >
        <div className="lp-grid-2" style={{ gridTemplateColumns: '260px 1fr' }}>
          {/* Sidebar machines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <button
              onClick={() => setSelectedMachine(null)}
              style={!selectedMachine ? { ...listItemActive } : { ...listItem }}
            >
              <span>Toutes les machines</span>
              <span style={chipStyle}>{machinesData.length}</span>
            </button>
            {machinesData.map(md => {
              const surplusCount = md.preparations.filter(p => p.surplusDemande).length;
              const alimenteeCount = md.preparations.filter(p => p.etat === 'Machine alimentée').length;
              const isActive = selectedMachine === md.machine;
              return (
                <button
                  key={md.machine}
                  onClick={() => setSelectedMachine(md.machine)}
                  style={isActive ? listItemActive : listItem}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <strong style={{ color: 'var(--fg-primary)' }}>{md.machine}</strong>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {surplusCount > 0 && (
                        <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>{surplusCount} urgent</span>
                      )}
                      {alimenteeCount > 0 && (
                        <span style={{ ...badgeBase, background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>{alimenteeCount} alim.</span>
                      )}
                    </div>
                  </div>
                  <span style={chipStyle}>{md.preparations.length} OF</span>
                </button>
              );
            })}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {filteredMachines.map(md => (
              <div key={md.machine}>
                {!selectedMachine && (
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)', margin: '0 0 var(--s-2) 0' }}>
                    <Box size={14} style={{ color: 'var(--accent-brown)' }} /> Machine {md.machine}
                  </h4>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                  {md.preparations.map((prep, idx) => {
                    const isExpanded = expandedOF === prep.numSousOF;
                    const toutPrepare = prep.selecteurs.every(s => parseFloat(s.preparer || '0') >= parseFloat(s.besoins.toString()));
                    const alimentee = prep.etat === 'Machine alimentée';
                    return (
                      <div key={prep.numSousOF} style={{
                        background: 'var(--bg-elevated)',
                        border: `1px solid ${prep.surplusDemande ? 'var(--color-danger)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                      }}>
                        <div
                          onClick={() => !alimentee && toggleOF(prep.numSousOF)}
                          style={{ padding: 'var(--s-3) var(--s-4)', cursor: alimentee ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            {!alimentee && (isExpanded ? <ChevronDown size={16} style={{ color: 'var(--fg-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--fg-muted)' }} />)}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <strong style={{ color: 'var(--fg-primary)' }}>{prep.numSousOF}</strong>
                                {prep.surplusDemande && (
                                  <span style={{ ...badgeBase, background: 'var(--color-danger)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    <AlertTriangle size={10} /> SURPLUS
                                  </span>
                                )}
                                {idx === 0 && !alimentee && !prep.surplusDemande && (
                                  <span style={{ ...badgeBase, background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>Prochain</span>
                                )}
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginTop: 2 }}>
                                {prep.modele} · {prep.qte} pcs · Client {prep.client}
                              </div>
                            </div>
                          </div>
                          {statutBadge(prep.etat)}
                        </div>

                        {isExpanded && !alimentee && (
                          <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-hover)', padding: 'var(--s-3) var(--s-4)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--s-2)', fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginBottom: 'var(--s-3)' }}>
                              <div><span style={{ color: 'var(--fg-muted)' }}>Commande :</span> {prep.numCommande}</div>
                              <div><span style={{ color: 'var(--fg-muted)' }}>Réf :</span> {prep.ref}</div>
                              <div><span style={{ color: 'var(--fg-muted)' }}>Démarrage :</span> {new Date(prep.dateDebut).toLocaleDateString('fr-FR')}</div>
                              <div><span style={{ color: 'var(--fg-muted)' }}>Machine :</span> {prep.machine}</div>
                            </div>

                            {prep.surplusDemande && (
                              <div style={{ padding: 'var(--s-2) var(--s-3)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', marginBottom: 'var(--s-3)' }}>
                                Demande de surplus tisseur — OF origine : <strong>{prep.ofOrigine}</strong>
                              </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                              {prep.selecteurs.map(sel => {
                                const qtePrep = parseFloat(sel.preparer || '0');
                                const qteBes = parseFloat(sel.besoins.toString());
                                const isComplete = qtePrep >= qteBes;
                                return (
                                  <div key={sel.sel} style={{
                                    padding: 'var(--s-3)',
                                    background: 'var(--bg-elevated)',
                                    border: `1px solid ${isComplete ? 'var(--color-success)' : 'var(--border-subtle)'}`,
                                    borderRadius: 'var(--radius-sm)',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-2)' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <strong style={{ color: 'var(--fg-primary)' }}>Sél. {sel.sel}</strong>
                                        <span style={{ ...badgeBase, background: 'var(--bg-hover)', color: 'var(--fg-secondary)' }}>{sel.codeCom} · {sel.couleur}</span>
                                        {isComplete && <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />}
                                      </div>
                                      <strong style={{ color: 'var(--accent-brown)' }}>{sel.besoins} kg</strong>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-2)' }}>
                                      <div>
                                        <label style={labelStyle}>QR Code MP</label>
                                        <select
                                          value={sel.qrMP}
                                          onChange={(e) => handleUpdateQuantite(prep.numSousOF, sel.sel, sel.preparer, e.target.value)}
                                          style={inputStyle}
                                        >
                                          <option value="">Sélectionner...</option>
                                          {stockMP.filter(mp => mp.codeFab === sel.codeFab && mp.codeCom === sel.codeCom && mp.poidsUsine > 0).map(mp => (
                                            <option key={mp.qr} value={mp.qr}>{mp.couleur} ({mp.poidsUsine}kg)</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label style={labelStyle}>Qté préparée (kg)</label>
                                        <input
                                          type="number"
                                          step="0.1"
                                          value={sel.preparer}
                                          onChange={(e) => handleUpdateQuantite(prep.numSousOF, sel.sel, e.target.value, sel.qrMP)}
                                          placeholder="0.0"
                                          style={inputStyle}
                                        />
                                      </div>
                                    </div>
                                    {sel.qrMP && isComplete && (
                                      <button onClick={() => handleImprimerEtiquette(prep, sel)} style={{ ...btnGhost, marginTop: 'var(--s-2)', width: '100%', justifyContent: 'center' }}>
                                        <Printer size={12} /> Imprimer étiquette
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {toutPrepare && (
                              <button onClick={() => handleAlimenterMachine(prep.numSousOF)} style={{ ...btnPrimary, marginTop: 'var(--s-3)', width: '100%', justifyContent: 'center' }}>
                                <CheckCircle size={14} /> Alimenter machine {prep.machine}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    );
  };

  const renderPreparation = () => {
    const sorted = [...preparationsEnCours].sort((a, b) => {
      if (a.surplusDemande && !b.surplusDemande) return -1;
      if (!a.surplusDemande && b.surplusDemande) return 1;
      return a.ordrePlanification - b.ordrePlanification;
    });
    const rows = sorted.filter(p =>
      p.numSousOF.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.machine.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <SectionCard
        title="Liste des OF"
        subtitle="Ordre de planification"
        icon={<Package size={16} />}
        actions={
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 28, width: 200 }}
            />
          </div>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                {['Ordre', 'Num Sous OF', 'Machine', 'Client / Commande', 'Modèle', 'Qté', 'Démarrage', 'État', 'Priorité'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(prep => (
                <tr key={prep.numSousOF} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={tdStyle}>
                    {prep.surplusDemande
                      ? <span style={{ ...badgeBase, background: 'var(--color-danger)', color: '#fff' }}>URGENT</span>
                      : <span style={{ color: 'var(--fg-secondary)' }}>#{prep.ordrePlanification}</span>}
                  </td>
                  <td style={tdStyle}>
                    <strong style={{ color: 'var(--accent-brown)' }}>{prep.numSousOF}</strong>
                    {prep.surplusDemande && <div style={{ fontSize: 11, color: 'var(--color-danger)' }}>Surplus — {prep.ofOrigine}</div>}
                  </td>
                  <td style={tdStyle}>{prep.machine}</td>
                  <td style={tdStyle}>
                    <div>{prep.client}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{prep.numCommande}</div>
                  </td>
                  <td style={tdStyle}>
                    <div>{prep.modele}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{prep.ref}</div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{prep.qte}</td>
                  <td style={{ ...tdStyle, fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                    {new Date(prep.dateDebut).toLocaleDateString('fr-FR')}
                    <br />
                    {new Date(prep.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={tdStyle}>{statutBadge(prep.etat)}</td>
                  <td style={tdStyle}>
                    {prep.surplusDemande
                      ? <span style={{ ...badgeBase, background: 'var(--color-danger)', color: '#fff' }}>SURPLUS</span>
                      : prep.priorite === 'Urgent'
                        ? <span style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>Urgent</span>
                        : <span style={{ ...badgeBase, background: 'var(--bg-hover)', color: 'var(--fg-secondary)' }}>Normal</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    );
  };

  const renderStock = () => (
    <SectionCard
      title="Stock matières premières"
      subtitle="Répartition par entrepôt"
      icon={<Box size={16} />}
      actions={
        <button style={btnPrimary}>
          <ArrowRightLeft size={12} /> Demander transfert
        </button>
      }
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)' }}>
              {['QR Code MP', 'Code Com', 'Couleur', 'Code Fab', 'Lot', 'Usine', 'E1', 'E2', 'État'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stockMP.map(mp => (
              <tr key={mp.qr} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{mp.qr}</td>
                <td style={tdStyle}>{mp.codeCom}</td>
                <td style={tdStyle}>{mp.couleur}</td>
                <td style={{ ...tdStyle, color: 'var(--fg-secondary)' }}>{mp.codeFab}</td>
                <td style={{ ...tdStyle, color: 'var(--fg-secondary)' }}>{mp.lot}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: mp.poidsUsine === 0 ? 'var(--color-danger)' : mp.poidsUsine < 50 ? 'var(--color-warning)' : 'var(--fg-primary)' }}>
                  {mp.poidsUsine} kg
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--fg-secondary)' }}>{mp.poidsE1} kg</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--fg-secondary)' }}>{mp.poidsE2} kg</td>
                <td style={tdStyle}>{stockBadge(mp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );

  const renderTransferts = () => (
    <SectionCard
      title="Transferts inter-entrepôts"
      subtitle="Flux en attente"
      icon={<ArrowRightLeft size={16} />}
      actions={<button style={btnPrimary}><Plus size={12} /> Nouveau transfert</button>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
        {transfertsEnAttente.map(t => (
          <div key={t.id} style={{ padding: 'var(--s-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-3)' }}>
              <div>
                <strong style={{ color: 'var(--fg-primary)' }}>{t.id}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ ...badgeBase, background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>{t.origine}</span>
                  <ArrowRightLeft size={12} style={{ color: 'var(--fg-muted)' }} />
                  <span style={{ ...badgeBase, background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>{t.destination}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>{t.etat}</span>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>{new Date(t.date).toLocaleString('fr-FR')}</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--s-3)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginBottom: 'var(--s-2)' }}>Articles à transférer</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                {t.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--s-2) var(--s-3)', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <div style={{ color: 'var(--fg-primary)' }}>{item.codeCom} — {item.couleur}</div>
                      <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--fg-muted)' }}>{item.qr}</div>
                    </div>
                    <strong style={{ color: 'var(--accent-brown)' }}>{item.quantite} kg</strong>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--s-3)' }}>
              <button style={btnPrimary}><Download size={12} /> Générer PDF</button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderRetours = () => (
    <SectionCard
      title="Retours & consommations"
      subtitle="OF terminés — matière à restituer"
      icon={<TrendingDown size={16} />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
        {retoursMatieres.map(r => (
          <div key={r.numSousOF} style={{ padding: 'var(--s-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-3)' }}>
              <div>
                <strong style={{ color: 'var(--fg-primary)' }}>{r.numSousOF}</strong>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>{r.modele}</div>
              </div>
              <span style={{ ...badgeBase, background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>{r.etat}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              {r.selecteurs.map(sel => (
                <div key={sel.sel} style={{ padding: 'var(--s-3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ marginBottom: 'var(--s-2)' }}>
                    <strong style={{ color: 'var(--fg-primary)' }}>Sélecteur {sel.sel}</strong>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{sel.codeCom} — {sel.couleur}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-2)' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Préparé</div>
                      <div style={{ color: 'var(--fg-primary)' }}>{sel.preparer} kg</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Consommé</div>
                      <div style={{ color: 'var(--color-info)' }}>{sel.consomme} kg</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>À retourner</div>
                      <div style={{ color: 'var(--color-warning)' }}>{sel.retour} kg</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {r.aRetourner && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--s-3)' }}>
                <button style={btnPrimary}><TrendingDown size={12} /> Scanner retour MP</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );

  // ----------------------- KPIs -----------------------
  const surplusUrgents = preparationsEnCours.filter(p => p.surplusDemande).length;
  const aPreparer = preparationsEnCours.filter(p => p.etat === 'A préparer').length;
  const alimentees = preparationsEnCours.filter(p => p.etat === 'Machine alimentée').length;
  const enPreparation = preparationsEnCours.filter(p => p.etat === 'En cours préparation').length;
  const ruptures = stockMP.filter(mp => mp.rupture).length;
  const alertes = stockMP.filter(mp => mp.alerte).length;
  const transfertsCount = transfertsEnAttente.length;

  return (
    <DashboardLayout title="Tableau de bord — Magasinier matières premières" activeSection="dashboard" onSectionChange={() => {}}>
      <DashboardShell
        eyebrow="Poste — Magasinier MP"
        title="Tableau de bord — Magasinier matières premières"
        subtitle="Gestion des stocks, préparations et sorties matières premières."
        headerRight={
          <>
            <button onClick={() => window.location.reload()} style={btnGhost} title="Actualiser">
              <Activity size={14} /> Actualiser
            </button>
            <ThemeToggle />
          </>
        }
      >
        {/* PRIMARY KPIs */}
        <div className="lp-metric-grid">
          <KpiCard label="OF à préparer" value={aPreparer} hint={`sur ${preparationsEnCours.length} au total`} icon={<Clock size={18} />} tone="brown" />
          <KpiCard label="Surplus urgents" value={surplusUrgents} hint="À traiter en priorité" icon={<AlertTriangle size={18} />} tone="terracotta" />
          <KpiCard label="Machines alimentées" value={alimentees} hint="Prêtes en production" icon={<CheckCircle size={18} />} tone="sage" />
          <KpiCard label="En préparation" value={enPreparation} hint="Sélecteurs en cours" icon={<Package size={18} />} tone="indigo" />
        </div>

        {/* SECONDARY KPIs */}
        <div className="lp-metric-grid">
          <KpiCard label="Références stock" value={stockMP.length} icon={<Box size={16} />} tone="brown" />
          <KpiCard label="Alertes stock" value={alertes} hint="Seuil minimum atteint" icon={<AlertTriangle size={16} />} tone="gold" />
          <KpiCard label="Ruptures" value={ruptures} hint="Stock usine = 0" icon={<AlertTriangle size={16} />} tone="rose" />
          <KpiCard label="Transferts en attente" value={transfertsCount} icon={<ArrowRightLeft size={16} />} tone="indigo" />
        </div>

        {/* TAB SWITCHER */}
        <SectionCard
          title="Modules Magasin"
          subtitle="Sélectionnez une vue"
          icon={<Package size={16} />}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)' }}>
            {tabBtn('machines', 'Vue machines')}
            {tabBtn('preparation', 'Préparation OF')}
            {tabBtn('stock', 'Stock MP')}
            {tabBtn('transferts', 'Transferts')}
            {tabBtn('retours', 'Retours')}
          </div>
        </SectionCard>

        {tab === 'machines' && renderMachines()}
        {tab === 'preparation' && renderPreparation()}
        {tab === 'stock' && renderStock()}
        {tab === 'transferts' && renderTransferts()}
        {tab === 'retours' && renderRetours()}
      </DashboardShell>

      {/* Modal Étiquette */}
      {showEtiquetteModal && selectedPreparation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', maxWidth: 440, width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: 'var(--s-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: 'var(--fg-primary)' }}>Aperçu étiquette de préparation</strong>
            </div>
            <div style={{ padding: 'var(--s-4)' }}>
              <div style={{ padding: 'var(--s-4)', border: '2px dashed var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg-primary)' }}>{selectedPreparation.selecteur.sel}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-primary)', marginTop: 4 }}>
                  {selectedPreparation.selecteur.codeCom} — {selectedPreparation.selecteur.couleur}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginTop: 8, lineHeight: 1.6 }}>
                  <div>QR MP : {selectedPreparation.selecteur.qrMP}</div>
                  <div>Code Fab : {selectedPreparation.selecteur.codeFab}</div>
                  <div>Num Sous OF : {selectedPreparation.numSousOF}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-brown)', marginTop: 10 }}>
                  Préparé : {selectedPreparation.selecteur.preparer} kg
                </div>
                <div style={{ marginTop: 12, padding: 'var(--s-3)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 10, color: 'var(--fg-muted)' }}>QR CODE</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--fg-primary)' }}>████████</div>
                </div>
              </div>
            </div>
            <div style={{ padding: 'var(--s-4)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-hover)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-2)' }}>
              <button onClick={() => setShowEtiquetteModal(false)} style={btnGhost}>Fermer</button>
              <button style={btnPrimary}><Printer size={12} /> Imprimer</button>
            </div>
          </div>
        </div>
      )}

      <WhatsAppWidget dashboardName="Magasinier MP" position="bottom-right" />
    </DashboardLayout>
  );
};

// ----------------------- Style tokens -----------------------
const badgeBase: React.CSSProperties = { padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-block' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-3) var(--s-4)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' };
const tdStyle: React.CSSProperties = { padding: 'var(--s-3) var(--s-4)', color: 'var(--fg-primary)' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '6px 10px', background: 'var(--bg-elevated)', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)' };
const chipStyle: React.CSSProperties = { padding: '2px 8px', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: 11, color: 'var(--fg-secondary)' };

const listItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: 'var(--s-3) var(--s-4)', background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
  color: 'var(--fg-primary)', fontSize: 'var(--text-sm)', cursor: 'pointer', textAlign: 'left',
};
const listItemActive: React.CSSProperties = {
  ...listItem,
  background: 'var(--bg-hover)',
  borderColor: 'var(--accent-brown)',
  color: 'var(--fg-primary)',
  fontWeight: 600,
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  background: 'var(--accent-brown)', color: '#fff', border: '1px solid var(--accent-brown)',
  borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  background: 'var(--bg-hover)', color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
};

export default DashboardMagasinierMP;
