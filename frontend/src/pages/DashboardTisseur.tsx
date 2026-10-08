import React, { useState } from 'react';
import {
  Package, AlertTriangle, CheckCircle, Clock, Printer, Play, ChevronDown, ChevronRight,
  Wrench, Activity, Zap, Boxes, FileWarning, Box, FileText, RefreshCw,
} from 'lucide-react';
import WhatsAppWidget from '../components/WhatsAppWidget';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';

const DashboardTisseur = () => {
  const [activeSection, setActiveSection] = useState<'machines' | 'incidents' | 'rendement'>('machines');
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [expandedOF, setExpandedOF] = useState<string | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showEtiquetteModal, setShowEtiquetteModal] = useState(false);
  const [showFinPosteModal, setShowFinPosteModal] = useState(false);
  const [showDebutPosteModal, setShowDebutPosteModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showRefuserComplementModal, setShowRefuserComplementModal] = useState(false);
  const [selectedOF, setSelectedOF] = useState<any>(null);
  const [incidentType, setIncidentType] = useState('');
  const [selecteurMP, setSelecteurMP] = useState('');
  const [compteurMachine, setCompteurMachine] = useState('');
  const [quantiteRestante, setQuantiteRestante] = useState('');
  const [causeRefus, setCauseRefus] = useState('');

  const tisseurNom = 'Ahmed Ben Ali';

  // Données des OF organisées par machine
  const [mesOF, setMesOF] = useState([
    {
      numSousOF: 'OF249850', client: 'CL00884', numCommande: 'CM-FT0119', modele: 'ARTHUR', ref: 'AR1020-B02-04',
      qtePieces: 320, machine: 'M2303', uniteMesure: 'pièces', typeCompteur: 'pieces',
      compteurInitial: 320, compteurActuel: null, dateDebut: '2025-10-20 08:00', ordrePlanification: 1,
      etat: 'Machine alimentée', statut: 'En attente de départ',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC' },
      ],
      vitesseDuites: 450, tempsPrevu: '12h30', tempsReel: null,
      tempsArretsMecanique: 0, tempsArretsMP: 0, tempsPlanification: 0,
      piecesProduites: 0, deuxiemeChoix: 0, dechets: 0, rendementTemps: null, rendementProduction: null,
      dateHeureDebut: null, priorite: 'Urgent', complementTissage: false, quantiteComplement: 0,
      noteSpeciale: 'Attention: Contrôler la tension du fil rouge (C29) toutes les 2 heures',
      instructionSpeciale: null, noteTisseur: 'Première utilisation du fil C29 lot S2024, vérifier la qualité',
    },
    {
      numSousOF: 'OF249851', client: 'CL00837', numCommande: 'CM-FT0121', modele: 'IBIZA', ref: 'IB1020-B29-01',
      qtePieces: 250, machine: 'M2303', uniteMesure: 'pièces', typeCompteur: 'pieces',
      compteurInitial: 250, compteurActuel: null, dateDebut: '2025-10-21 08:00', ordrePlanification: 2,
      etat: 'En attente', statut: 'Prochain',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C29', couleur: 'ROUGE' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC' },
      ],
      vitesseDuites: 450, tempsPrevu: '10h00', tempsReel: null,
      tempsArretsMecanique: 0, tempsArretsMP: 0, tempsPlanification: 0,
      piecesProduites: 0, deuxiemeChoix: 0, dechets: 0, rendementTemps: null, rendementProduction: null,
      dateHeureDebut: null, priorite: 'Normal', complementTissage: false, quantiteComplement: 0,
      noteSpeciale: null, instructionSpeciale: null, noteTisseur: null,
    },
    {
      numSousOF: 'OF249780', client: 'CL00884', numCommande: 'CM-FT0118', modele: 'ND LILI', ref: 'NDL1020-B12-01',
      qtePieces: 150, machine: 'M2303', uniteMesure: 'pièces', typeCompteur: 'pieces',
      compteurInitial: 150, compteurActuel: 40, dateDebut: '2025-10-18 08:00', ordrePlanification: 3,
      etat: 'En cours', statut: 'Fabrication en cours',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM10-02.00', codeCom: 'C12', couleur: 'BLEU' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC' },
      ],
      vitesseDuites: 420, tempsPrevu: '8h00', tempsReel: '6h30',
      tempsArretsMecanique: 45, tempsArretsMP: 15, tempsPlanification: 0,
      piecesProduites: 110, deuxiemeChoix: 8, dechets: 2, rendementTemps: 85, rendementProduction: 93.33,
      dateHeureDebut: '2025-10-18 08:15', priorite: 'Normal', complementTissage: false, quantiteComplement: 0,
      noteSpeciale: null, instructionSpeciale: null, noteTisseur: 'Petit problème de tension résolu à 10h30',
    },
    {
      numSousOF: 'OF249852', client: 'CL00901', numCommande: 'CM-FT0123', modele: 'UNI', ref: 'UNS1020-02',
      qtePieces: 1800, machine: 'M2301', uniteMesure: 'mètres', typeCompteur: 'metres',
      compteurInitial: 1800, compteurActuel: 600, dateDebut: '2025-10-19 08:00', ordrePlanification: 1,
      etat: 'En cours', statut: 'Fabrication en cours',
      selecteurs: [{ sel: 'S01', codeFab: 'NM05-01.00', codeCom: 'C02', couleur: 'ECRU' }],
      vitesseDuites: 500, tempsPrevu: '6h00', tempsReel: '5h15',
      tempsArretsMecanique: 20, tempsArretsMP: 0, tempsPlanification: 0,
      piecesProduites: 1200, deuxiemeChoix: 45, dechets: 15, rendementTemps: 90, rendementProduction: 96.67,
      dateHeureDebut: '2025-10-19 08:00', priorite: 'Normal', complementTissage: false, quantiteComplement: 0,
      noteSpeciale: null, instructionSpeciale: 'Vitesse à réduire à 450 duites/min après 1500m produits',
      noteTisseur: 'RAS - Production fluide',
    },
    {
      numSousOF: 'OF249780.1', client: 'CL00884', numCommande: 'CM-FT0118', modele: 'ND LILI', ref: 'NDL1020-B12-01',
      qtePieces: 20, machine: 'M2303', uniteMesure: 'pièces', typeCompteur: 'pieces',
      compteurInitial: 20, compteurActuel: null, dateDebut: '2025-10-19 08:00', ordrePlanification: 0,
      etat: 'Machine alimentée', statut: 'COMPLÉMENT URGENT',
      selecteurs: [
        { sel: 'S01', codeFab: 'NM10-02.00', codeCom: 'C12', couleur: 'BLEU' },
        { sel: 'S02', codeFab: 'NM05-01.00', codeCom: 'C01', couleur: 'BLANC' },
      ],
      vitesseDuites: 420, tempsPrevu: '2h00', tempsReel: null,
      tempsArretsMecanique: 0, tempsArretsMP: 0, tempsPlanification: 0,
      piecesProduites: 0, deuxiemeChoix: 0, dechets: 0, rendementTemps: null, rendementProduction: null,
      dateHeureDebut: null, priorite: 'COMPLEMENT', complementTissage: true, quantiteComplement: 20,
      ofOrigine: 'OF249780',
      noteSpeciale: 'URGENT: Complément pour commande client prioritaire', instructionSpeciale: null, noteTisseur: null,
    },
  ]);

  const [incidents] = useState([
    { id: 'INC001', numSousOF: 'OF249780', machine: 'M2303', type: 'Problème mécanique',
      date: '2025-10-18 10:30', statut: 'Résolu', description: 'Tension chaîne anormale', duree: 45 },
  ]);

  const typesIncident = [
    { value: 'mp_manque', label: '🧶 Manque Matière Première', icon: Boxes, needsColor: true },
    { value: 'mp_alimentation', label: '🔄 Demande Alimentation MP', icon: Boxes, needsColor: true },
    { value: 'mecanique', label: '⚙️ Incident Mécanique', icon: Wrench, needsColor: false },
    { value: 'electrique', label: '⚡ Incident Électrique', icon: Zap, needsColor: false },
    { value: 'programme', label: '💻 Problème de Programmation', icon: FileWarning, needsColor: false },
    { value: 'carton', label: '📦 Carton Manquant/Non Existant', icon: Package, needsColor: false },
  ];

  const getOFByMachine = () => {
    const machines: { [key: string]: { machine: string; ofs: any[] } } = {};
    mesOF.forEach((of: any) => {
      if (!machines[of.machine]) machines[of.machine] = { machine: of.machine, ofs: [] };
      machines[of.machine].ofs.push(of);
    });
    Object.values(machines).forEach((m: any) => {
      m.ofs.sort((a: any, b: any) => {
        if (a.complementTissage && !b.complementTissage) return -1;
        if (!a.complementTissage && b.complementTissage) return 1;
        return a.ordrePlanification - b.ordrePlanification;
      });
    });
    return Object.values(machines);
  };

  const handleDemarrerOF = (of: any) => {
    setSelectedOF(of);
    setQuantiteRestante(of.compteurInitial.toString());
    setShowDebutPosteModal(true);
  };

  const handleConfirmerDemarrage = () => {
    if (!selectedOF || !quantiteRestante) return;
    const qteRestante = parseFloat(quantiteRestante);
    alert(`⚠️ PROGRAMMATION MACHINE\n\nCompteur à programmer sur la machine:\n${qteRestante} ${(selectedOF as any).typeCompteur === 'pieces' ? 'pièces' : 'mètres'}\n\nLe compteur est dégressif (diminue à chaque pièce/mètre produit)`);
    setMesOF((prev: any) => prev.map((o: any) => {
      if (o.numSousOF === (selectedOF as any).numSousOF) {
        return { ...o, etat: 'En cours', statut: o.complementTissage ? 'COMPLÉMENT EN COURS' : 'Fabrication en cours',
          dateHeureDebut: new Date().toISOString(), compteurInitial: qteRestante, compteurActuel: qteRestante, qtePieces: qteRestante };
      }
      return o;
    }));
    setShowDebutPosteModal(false);
  };

  const handleTerminerOF = (numSousOF: string) => {
    const of = mesOF.find((o: any) => o.numSousOF === numSousOF);
    if (of) {
      setSelectedOF({ ...of, typeEtiquette: 'fin' } as any);
      setShowEtiquetteModal(true);
    }
    setMesOF((prev: any) => prev.map((o: any) => {
      if (o.numSousOF === numSousOF) {
        return { ...o, etat: 'Terminé', statut: 'Fin de fabrication', piecesProduites: o.qtePieces };
      }
      return o;
    }));
  };

  const handleOpenFinPoste = (of: any) => {
    setSelectedOF(of);
    setCompteurMachine('');
    setShowFinPosteModal(true);
  };

  const handleSaveFinPoste = () => {
    if (!selectedOF || !compteurMachine) return;
    const compteurRestant = parseFloat(compteurMachine);
    setMesOF((prev: any) => prev.map((of: any) => {
      if (of.numSousOF === (selectedOF as any).numSousOF) {
        const quantiteTheoriqueProduite = (selectedOF as any).compteurInitial - compteurRestant;
        return { ...of, compteurActuel: compteurRestant, piecesProduites: quantiteTheoriqueProduite };
      }
      return of;
    }));
    setShowFinPosteModal(false);
    const quantiteTheoriqueProduite = (selectedOF as any).compteurInitial - compteurRestant;
    setSelectedOF({ ...(selectedOF as any), typeEtiquette: 'finposte', compteurActuel: compteurRestant, piecesProduites: quantiteTheoriqueProduite } as any);
    setShowEtiquetteModal(true);
  };

  const handleImprimerEtiquette = (of: any, type: string) => {
    setSelectedOF({ ...of, typeEtiquette: type } as any);
    setShowEtiquetteModal(true);
  };

  const handleDeclarerIncident = (numSousOF: string) => {
    setSelectedOF(mesOF.find((of: any) => of.numSousOF === numSousOF) as any);
    setIncidentType('');
    setSelecteurMP('');
    setShowIncidentModal(true);
  };

  const handleRefuserComplement = (of: any) => {
    setSelectedOF(of);
    setCauseRefus('');
    setShowRefuserComplementModal(true);
  };

  const handleConfirmerRefus = () => {
    if (!causeRefus) return;
    alert(`Refus envoyé pour l'OF ${(selectedOF as any)?.numSousOF}\nCause: ${causeRefus}`);
    setShowRefuserComplementModal(false);
    setCauseRefus('');
  };

  const handleVoirNotes = (of: any) => {
    setSelectedOF(of);
    setShowNotesModal(true);
  };

  const toggleOF = (numSousOF: string) => {
    setExpandedOF(expandedOF === numSousOF ? null : numSousOF);
  };

  // --- Derived data ---
  const machinesData = getOFByMachine();
  const filteredMachines = selectedMachine ? machinesData.filter((m: any) => m.machine === selectedMachine) : machinesData;
  const complementCount = mesOF.filter((o) => o.complementTissage).length;
  const enCoursCount = mesOF.filter((o) => o.etat === 'En cours').length;
  const enAttenteCount = mesOF.filter((o) => o.etat === 'En attente' || o.etat === 'Machine alimentée').length;

  // --- Badges ---
  const statutBadge = (etat: string, statut: string) => {
    const map: Record<string, { bg: string; c: string }> = {
      'Machine alimentée': { bg: 'var(--color-success-bg)', c: 'var(--color-success)' },
      'En cours':         { bg: 'var(--color-info-bg)',    c: 'var(--color-info)' },
      'Terminé':          { bg: 'var(--color-info-bg)',    c: 'var(--accent-indigo)' },
      'En attente':       { bg: 'var(--bg-hover)',         c: 'var(--fg-secondary)' },
    };
    const b = map[etat] || map['En attente'];
    return <span style={{ ...badgeBase, background: b.bg, color: b.c }}>{statut}</span>;
  };

  // --- Sub renders ---
  const renderMachines = () => (
    <>
      <div className="lp-metric-grid">
        <KpiCard label="Machines actives" value={machinesData.length} hint="Sous ma responsabilité" icon={<Box size={18} />} tone="terracotta" />
        <KpiCard label="Compléments urgents" value={complementCount} hint="Priorité coupeur" icon={<AlertTriangle size={18} />} tone="rose" />
        <KpiCard label="OF en cours" value={enCoursCount} hint="Fabrication active" icon={<Activity size={18} />} tone="sage" />
        <KpiCard label="En attente / alimentée" value={enAttenteCount} hint="Prêts au démarrage" icon={<Clock size={18} />} tone="gold" />
      </div>

      <div className="lp-grid-3">
        <SectionCard title="Mes machines" subtitle="Sélection du poste" icon={<Box size={16} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <button
              onClick={() => setSelectedMachine(null)}
              style={{ ...machineBtn, background: !selectedMachine ? 'var(--bg-hover)' : 'transparent',
                borderColor: !selectedMachine ? 'var(--accent-terracotta)' : 'var(--border-subtle)' }}
            >
              <span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>Toutes</span>
              <span style={countChip}>{machinesData.length}</span>
            </button>
            {machinesData.map((m: any) => {
              const complCount = m.ofs.filter((o: any) => o.complementTissage).length;
              const activeCount = m.ofs.filter((o: any) => o.etat === 'En cours').length;
              const isActive = selectedMachine === m.machine;
              return (
                <button
                  key={m.machine}
                  onClick={() => setSelectedMachine(m.machine)}
                  style={{ ...machineBtn, background: isActive ? 'var(--bg-hover)' : 'transparent',
                    borderColor: isActive ? 'var(--accent-terracotta)' : 'var(--border-subtle)' }}
                >
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: 'var(--fg-primary)' }}>{m.machine}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      {complCount > 0 && (
                        <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
                          {complCount} compl.
                        </span>
                      )}
                      {activeCount > 0 && (
                        <span style={{ ...badgeBase, background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                          {activeCount} en cours
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={countChip}>{m.ofs.length} OF</span>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
          {filteredMachines.map((m: any) => (
            <SectionCard
              key={m.machine}
              title={`Machine ${m.machine}`}
              subtitle={`${m.ofs.length} OF programmé(s)`}
              icon={<Box size={16} />}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                {m.ofs.map((of: any, idx: number) => {
                  const isExpanded = expandedOF === of.numSousOF;
                  const progression = of.qtePieces > 0 ? (of.piecesProduites / of.qtePieces) * 100 : 0;
                  const peutDemarrer = of.etat === 'Machine alimentée';
                  const enCours = of.etat === 'En cours';
                  const hasNotes = of.noteSpeciale || of.instructionSpeciale || of.noteTisseur;

                  return (
                    <div
                      key={of.numSousOF}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: `1px solid ${of.complementTissage ? 'var(--color-danger)' : isExpanded ? 'var(--accent-terracotta)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                      }}
                    >
                      <div onClick={() => toggleOF(of.numSousOF)} style={{ padding: 'var(--s-4)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                          {isExpanded ? <ChevronDown size={18} style={{ color: 'var(--fg-muted)' }} /> : <ChevronRight size={18} style={{ color: 'var(--fg-muted)' }} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, color: 'var(--fg-primary)' }}>{of.numSousOF}</span>
                              {of.complementTissage && (
                                <span style={{ ...badgeBase, background: 'var(--color-danger)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <AlertTriangle size={11} /> COMPLÉMENT {of.quantiteComplement} {of.uniteMesure}
                                </span>
                              )}
                              {idx === 0 && of.etat === 'Machine alimentée' && !of.complementTissage && (
                                <span style={{ ...badgeBase, background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>Prochain</span>
                              )}
                              {of.priorite === 'Urgent' && !of.complementTissage && (
                                <span style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>URGENT</span>
                              )}
                              {hasNotes && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleVoirNotes(of); }}
                                  style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)',
                                    border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                >
                                  <FileText size={11} /> Notes
                                </button>
                              )}
                            </div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>
                              {of.modele} — {of.qtePieces} {of.uniteMesure}
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                              {of.selecteurs.map((sel: any, i: number) => (
                                <span key={i} style={selChip}>S{sel.sel}: {sel.codeFab}</span>
                              ))}
                              {(of.etat === 'Machine alimentée' || of.etat === 'En attente') && (
                                <span style={{ ...badgeBase, background: 'var(--accent-terracotta)', color: '#fff' }}>
                                  Compteur: {of.compteurInitial}
                                </span>
                              )}
                            </div>
                          </div>
                          {statutBadge(of.etat, of.statut)}
                        </div>

                        {enCours && (
                          <div style={{ marginTop: 'var(--s-3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginBottom: 4 }}>
                              <span>Progression</span>
                              <span>{of.piecesProduites} / {of.qtePieces} {of.uniteMesure} ({progression.toFixed(0)}%)</span>
                            </div>
                            <div style={{ width: '100%', height: 6, background: 'var(--border-subtle)', borderRadius: 999 }}>
                              <div style={{ width: `${progression}%`, height: '100%',
                                background: of.complementTissage ? 'var(--color-danger)' : 'var(--accent-terracotta)',
                                borderRadius: 999 }} />
                            </div>
                            {of.compteurActuel != null && (
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginTop: 4 }}>
                                Compteur: <strong style={{ color: 'var(--fg-primary)' }}>{of.compteurActuel}</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-hover)', padding: 'var(--s-4)' }}>
                          {of.complementTissage && (
                            <div style={{ marginBottom: 'var(--s-3)', padding: 'var(--s-3)', background: 'var(--color-danger-bg)',
                              border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)' }}>
                              <p style={{ fontWeight: 700, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}>
                                <AlertTriangle size={14} /> Complément de tissage demandé par le coupeur
                              </p>
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginTop: 4 }}>
                                OF origine: {of.ofOrigine} — Quantité: {of.quantiteComplement} {of.uniteMesure}
                              </p>
                            </div>
                          )}

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-3)', marginBottom: 'var(--s-3)', fontSize: 'var(--text-sm)' }}>
                            <div><span style={dtLabel}>Client:</span> <strong>{of.client}</strong></div>
                            <div><span style={dtLabel}>Commande:</span> <strong>{of.numCommande}</strong></div>
                            <div><span style={dtLabel}>Référence:</span> <strong>{of.ref}</strong></div>
                            <div><span style={dtLabel}>Vitesse:</span> <strong>{of.vitesseDuites} duites/min</strong></div>
                            <div style={{ gridColumn: '1 / -1', padding: 'var(--s-3)', background: 'var(--bg-elevated)',
                              border: '1px solid var(--accent-terracotta)', borderRadius: 'var(--radius-sm)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: 'var(--fg-primary)' }}>Compteur à programmer:</span>
                                <span style={{ fontWeight: 700, color: 'var(--accent-terracotta)', fontSize: 'var(--text-xl)' }}>
                                  {of.compteurInitial} {of.typeCompteur === 'pieces' ? 'pcs' : 'm'}
                                </span>
                              </div>
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 4 }}>Compteur dégressif (diminue à chaque production)</p>
                            </div>
                            <div><span style={dtLabel}>Temps prévu:</span> <strong>{of.tempsPrevu}</strong></div>
                            {of.tempsReel && <div><span style={dtLabel}>Temps réel:</span> <strong style={{ color: 'var(--accent-indigo)' }}>{of.tempsReel}</strong></div>}
                            {of.dateHeureDebut && (
                              <div style={{ gridColumn: '1 / -1' }}>
                                <span style={dtLabel}>Démarré le:</span> <strong>{new Date(of.dateHeureDebut).toLocaleString('fr-FR')}</strong>
                              </div>
                            )}
                          </div>

                          <div style={{ marginBottom: 'var(--s-3)' }}>
                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 6 }}>Matières Premières (Code Fabrication):</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              {of.selecteurs.map((sel: any, i: number) => (
                                <div key={i} style={{ padding: 'var(--s-2) var(--s-3)', background: 'var(--bg-elevated)',
                                  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Sélecteur {sel.sel}</p>
                                  <p style={{ fontWeight: 700, color: 'var(--fg-primary)' }}>{sel.codeFab}</p>
                                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>{sel.couleur}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {enCours && (
                            <div style={{ padding: 'var(--s-3)', marginBottom: 'var(--s-3)',
                              background: 'var(--bg-elevated)',
                              border: `1px solid ${of.complementTissage ? 'var(--color-danger)' : 'var(--border-subtle)'}`,
                              borderRadius: 'var(--radius-sm)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Pièces produites (théorique)</p>
                                  <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700,
                                    color: of.complementTissage ? 'var(--color-danger)' : 'var(--accent-terracotta)' }}>{of.piecesProduites}</p>
                                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontStyle: 'italic' }}>Qté réelle après contrôle qualité</p>
                                </div>
                                <div>
                                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Compteur machine</p>
                                  <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700,
                                    color: of.complementTissage ? 'var(--color-danger)' : 'var(--accent-terracotta)' }}>{of.compteurActuel ?? '-'}</p>
                                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontStyle: 'italic' }}>Compteur restant</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {peutDemarrer && (
                              <>
                                <button onClick={() => handleDemarrerOF(of)} style={{ ...btnPrimary, background: of.complementTissage ? 'var(--color-danger)' : 'var(--accent-terracotta)', borderColor: of.complementTissage ? 'var(--color-danger)' : 'var(--accent-terracotta)' }}>
                                  <Play size={12} /> Démarrer OF
                                </button>
                                <button onClick={() => handleImprimerEtiquette(of, 'debut')} style={btnGhost}>
                                  <Printer size={12} /> Étiquette Début
                                </button>
                                {of.complementTissage && (
                                  <button onClick={() => handleRefuserComplement(of)} style={btnGhost}>
                                    Refuser complément
                                  </button>
                                )}
                              </>
                            )}
                            {enCours && (
                              <>
                                <button onClick={() => handleOpenFinPoste(of)} style={btnPrimary}>
                                  <Printer size={12} /> Fin Poste
                                </button>
                                <button onClick={() => handleDeclarerIncident(of.numSousOF)} style={{ ...btnGhost, color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                                  <AlertTriangle size={12} /> Incident
                                </button>
                                <button onClick={() => handleTerminerOF(of.numSousOF)} style={btnGhost}>
                                  <CheckCircle size={12} /> Terminer
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </>
  );

  const renderIncidents = () => (
    <SectionCard title="Mes incidents déclarés" subtitle="Historique et statut" icon={<AlertTriangle size={16} />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
        {incidents.map((incident) => (
          <div key={incident.id} style={{ padding: 'var(--s-4)', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--color-danger)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <h3 style={{ fontWeight: 700, color: 'var(--fg-primary)' }}>{incident.id}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>OF: {incident.numSousOF} — Machine: {incident.machine}</p>
              </div>
              <span style={{
                ...badgeBase,
                background: incident.statut === 'Résolu' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                color: incident.statut === 'Résolu' ? 'var(--color-success)' : 'var(--color-warning)',
              }}>{incident.statut}</span>
            </div>
            <p style={{ fontWeight: 500, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>{incident.type}</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>{incident.description}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 6 }}>
              {new Date(incident.date).toLocaleString('fr-FR')} — Durée: {incident.duree} min
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );

  const renderRendement = () => {
    const prixUnitaireTND = 2.5;
    return (
      <>
        <div className="lp-metric-grid">
          <KpiCard label="Rendement Aujourd'hui" value="85%" hint="Théorique: 90%" icon={<Activity size={18} />} tone="terracotta" />
          <KpiCard label="Rendement Semaine" value="87%" hint="Théorique: 90%" icon={<Activity size={18} />} tone="sage" />
          <KpiCard label="Rendement Mois" value="88%" hint="Théorique: 90%" icon={<Activity size={18} />} tone="indigo" />
          <KpiCard label="Perte 2ème choix (mois)" value="445 TND" hint="178 pcs" icon={<AlertTriangle size={18} />} tone="rose" />
        </div>

        <SectionCard title="Détail par OF" subtitle="Choix 1 / 2 / déchets" icon={<Activity size={16} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {mesOF.filter((of) => of.etat === 'En cours' || of.etat === 'Terminé').map((of) => {
              const premierChoix = of.piecesProduites - of.deuxiemeChoix - of.dechets;
              const pctDeuxieme = of.piecesProduites > 0 ? ((of.deuxiemeChoix / of.piecesProduites) * 100).toFixed(1) : '0';
              const valeurPerteTND = (of.deuxiemeChoix * prixUnitaireTND).toFixed(2);
              return (
                <div key={of.numSousOF} style={{ padding: 'var(--s-4)', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ marginBottom: 'var(--s-3)' }}>
                    <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--fg-primary)' }}>{of.numSousOF}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>{of.modele} — Machine {of.machine}</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {of.selecteurs.map((sel, i) => (
                        <span key={i} style={selChip}>S{sel.sel}: {sel.codeFab}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 'var(--s-3)' }}>
                    <div style={{ padding: 'var(--s-2) var(--s-3)', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>1er Choix</p>
                      <p style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: 'var(--text-lg)' }}>{premierChoix}</p>
                    </div>
                    <div style={{ padding: 'var(--s-2) var(--s-3)', background: 'var(--color-warning-bg)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>2ème Choix</p>
                      <p style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: 'var(--text-lg)' }}>{of.deuxiemeChoix}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', fontWeight: 600 }}>{pctDeuxieme}%</p>
                    </div>
                    <div style={{ padding: 'var(--s-2) var(--s-3)', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>Déchets</p>
                      <p style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: 'var(--text-lg)' }}>{of.dechets}</p>
                    </div>
                  </div>

                  <div style={{ padding: 'var(--s-2) var(--s-3)', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--s-3)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)' }}>Valeur perte 2ème choix</p>
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-warning)' }}>{valeurPerteTND} TND</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>({of.deuxiemeChoix} × {prixUnitaireTND} TND)</p>
                  </div>

                  {of.tempsReel && (
                    <div style={{ paddingTop: 'var(--s-3)', borderTop: '1px solid var(--border-subtle)',
                      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 'var(--text-xs)' }}>
                      <div>
                        <p style={{ color: 'var(--fg-muted)' }}>Temps réel</p>
                        <p style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{of.tempsReel}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--fg-muted)' }}>Arrêts exclus</p>
                        <p style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>{of.tempsArretsMecanique + of.tempsArretsMP + of.tempsPlanification} min</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--fg-muted)' }}>Rendement Temps</p>
                        <p style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>{of.rendementTemps}%</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Rendement Théorique vs Réel" subtitle="Récap par période" icon={<Activity size={16} />}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-hover)' }}>
                  {['Période', 'Théorique', 'Réel', 'Écart', '2ème Choix', 'Perte TND'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: "Aujourd'hui", t: '90%', r: '85%', e: '-5%', d: '8 pcs (7.3%)', perte: '20.00 TND' },
                  { p: 'Cette Semaine', t: '90%', r: '87%', e: '-3%', d: '45 pcs (6.5%)', perte: '112.50 TND' },
                  { p: 'Ce Mois', t: '90%', r: '88%', e: '-2%', d: '178 pcs (5.9%)', perte: '445.00 TND' },
                ].map((row) => (
                  <tr key={row.p} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={tdStyle}><strong>{row.p}</strong></td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--accent-indigo)', fontWeight: 600 }}>{row.t}</td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-success)', fontWeight: 600 }}>{row.r}</td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-warning)', fontWeight: 600 }}>{row.e}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{row.d}</td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-danger)', fontWeight: 600 }}>{row.perte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </>
    );
  };

  const tabs: { key: typeof activeSection; label: string }[] = [
    { key: 'machines', label: 'Machines & OF' },
    { key: 'incidents', label: 'Incidents' },
    { key: 'rendement', label: 'Rendement' },
  ];

  return (
    <>
      <DashboardShell
        eyebrow="Poste — Tisseur"
        title="Tableau de bord — Tisseur"
        subtitle="Suivi des tâches de tissage, machines assignées et cadence."
        headerRight={
          <>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{tisseurNom}</span>
            <button onClick={() => window.location.reload()} style={btnGhost} title="Actualiser">
              <RefreshCw size={14} /> Actualiser
            </button>
            <ThemeToggle />
          </>
        }
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveSection(t.key)}
              style={activeSection === t.key ? btnPrimary : btnGhost}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeSection === 'machines' && renderMachines()}
        {activeSection === 'incidents' && renderIncidents()}
        {activeSection === 'rendement' && renderRendement()}
      </DashboardShell>

      {/* Modal Début de Poste */}
      {showDebutPosteModal && selectedOF && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{ ...modalHeader, background: 'var(--color-success-bg)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-success)' }}>Début de Poste / Démarrage</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)', marginTop: 4 }}>OF: {(selectedOF as any)?.numSousOF}</p>
            </div>
            <div style={modalBody}>
              <div style={{ padding: 'var(--s-3)', background: 'var(--bg-hover)', border: '1px solid var(--accent-terracotta)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 6 }}>Compteur initial prévu:</p>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent-terracotta)' }}>
                  {(selectedOF as any)?.compteurInitial} {(selectedOF as any)?.typeCompteur === 'pieces' ? 'pièces' : 'mètres'}
                </p>
              </div>
              <div>
                <label style={labelStyle}>Quantité restante à fabriquer <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  type="number" step="0.1" value={quantiteRestante}
                  onChange={(e) => setQuantiteRestante(e.target.value)}
                  placeholder={`Ex: ${(selectedOF as any)?.compteurInitial}`}
                  style={{ ...inputStyle, fontSize: 'var(--text-lg)', fontWeight: 700 }}
                />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 4 }}>Recalculé selon la coupe et les données réelles</p>
              </div>
              <div style={{ padding: 'var(--s-3)', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning)' }}>
                  <strong>Important:</strong> Cette quantité sera programmée sur le compteur machine (dégressif)
                </p>
              </div>
            </div>
            <div style={modalFooter}>
              <button onClick={() => { setShowDebutPosteModal(false); setQuantiteRestante(''); }} style={btnGhost}>Annuler</button>
              <button onClick={handleConfirmerDemarrage} disabled={!quantiteRestante}
                style={{ ...btnPrimary, opacity: !quantiteRestante ? 0.5 : 1, cursor: !quantiteRestante ? 'not-allowed' : 'pointer' }}>
                Confirmer et Démarrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fin de Poste */}
      {showFinPosteModal && selectedOF && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--fg-primary)' }}>Fin de Poste</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)', marginTop: 4 }}>OF: {(selectedOF as any)?.numSousOF}</p>
            </div>
            <div style={modalBody}>
              <div>
                <label style={labelStyle}>Compteur machine restant <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  type="number" step="0.1" value={compteurMachine}
                  onChange={(e) => setCompteurMachine(e.target.value)}
                  placeholder={`Ex: ${(selectedOF as any)?.typeCompteur === 'pieces' ? '40 pièces' : '600 mètres'}`}
                  style={inputStyle}
                />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 4 }}>
                  Compteur dégressif — Indiquez le nombre restant ({(selectedOF as any)?.typeCompteur === 'pieces' ? 'pièces' : 'mètres'})
                </p>
              </div>
              <div style={{ padding: 'var(--s-3)', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-primary)' }}>
                  Compteur initial programmé: {(selectedOF as any)?.compteurInitial} {(selectedOF as any)?.typeCompteur === 'pieces' ? 'pièces' : 'mètres'}
                </p>
                {compteurMachine && (
                  <>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)', marginTop: 4 }}>
                      Production THÉORIQUE calculée: <strong>{(selectedOF as any)?.compteurInitial - parseFloat(compteurMachine)} {(selectedOF as any)?.uniteMesure}</strong>
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 4 }}>(Cette quantité sera indiquée sur l'étiquette)</p>
                  </>
                )}
              </div>
              <div style={{ padding: 'var(--s-3)', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning)' }}>
                  <strong>Note:</strong> La quantité théorique sera calculée automatiquement. La quantité réelle sera déterminée après le contrôle qualité.
                </p>
              </div>
            </div>
            <div style={modalFooter}>
              <button onClick={() => { setShowFinPosteModal(false); setCompteurMachine(''); }} style={btnGhost}>Annuler</button>
              <button onClick={handleSaveFinPoste} disabled={!compteurMachine}
                style={{ ...btnPrimary, opacity: !compteurMachine ? 0.5 : 1, cursor: !compteurMachine ? 'not-allowed' : 'pointer' }}>
                Valider et Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notes */}
      {showNotesModal && selectedOF && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, maxWidth: 560 }}>
            <div style={modalHeader}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--fg-primary)' }}>Notes & Instructions</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)', marginTop: 4 }}>OF: {(selectedOF as any)?.numSousOF}</p>
            </div>
            <div style={modalBody}>
              {(selectedOF as any)?.noteSpeciale && (
                <div style={{ padding: 'var(--s-3)', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase', marginBottom: 4 }}>Note Spéciale</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>{(selectedOF as any)?.noteSpeciale}</p>
                </div>
              )}
              {(selectedOF as any)?.instructionSpeciale && (
                <div style={{ padding: 'var(--s-3)', background: 'var(--color-info-bg)', border: '1px solid var(--color-info)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-info)', textTransform: 'uppercase', marginBottom: 4 }}>Instruction Spéciale</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)', fontWeight: 500 }}>{(selectedOF as any)?.instructionSpeciale}</p>
                </div>
              )}
              {(selectedOF as any)?.noteTisseur && (
                <div style={{ padding: 'var(--s-3)', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--fg-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Note Tisseur</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>{(selectedOF as any)?.noteTisseur}</p>
                </div>
              )}
            </div>
            <div style={modalFooter}>
              <button onClick={() => setShowNotesModal(false)} style={btnPrimary}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Incident */}
      {showIncidentModal && selectedOF && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--fg-primary)' }}>Déclarer un Incident</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)', marginTop: 4 }}>
                OF: {(selectedOF as any)?.numSousOF} — Machine: {(selectedOF as any)?.machine}
              </p>
            </div>
            <div style={modalBody}>
              <div>
                <label style={labelStyle}>Type d'incident</label>
                <select value={incidentType}
                  onChange={(e) => { setIncidentType(e.target.value); setSelecteurMP(''); }}
                  style={inputStyle}>
                  <option value="">Sélectionner...</option>
                  {typesIncident.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {incidentType && typesIncident.find((t) => t.value === incidentType)?.needsColor && (
                <div>
                  <label style={labelStyle}>Sélecteur concerné <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <select value={selecteurMP} onChange={(e) => setSelecteurMP(e.target.value)} style={inputStyle}>
                    <option value="">Sélectionner...</option>
                    {(selectedOF as any)?.selecteurs?.map((sel: any, i: number) => (
                      <option key={i} value={sel.sel}>Sélecteur {sel.sel} - {sel.codeFab} ({sel.couleur})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea rows={4} placeholder="Décrivez le problème..." style={{ ...inputStyle, minHeight: 80 }} />
              </div>
            </div>
            <div style={modalFooter}>
              <button onClick={() => { setShowIncidentModal(false); setIncidentType(''); setSelecteurMP(''); }} style={btnGhost}>Annuler</button>
              <button onClick={() => { setShowIncidentModal(false); setIncidentType(''); setSelecteurMP(''); }}
                style={{ ...btnPrimary, background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                Envoyer l'alerte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Refuser Complément */}
      {showRefuserComplementModal && selectedOF && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{ ...modalHeader, background: 'var(--color-danger-bg)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-danger)' }}>Refuser le Complément</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)', marginTop: 4 }}>OF: {(selectedOF as any)?.numSousOF}</p>
            </div>
            <div style={modalBody}>
              <div style={{ padding: 'var(--s-3)', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning)' }}>
                  <strong>Attention:</strong> Vous êtes sur le point de refuser un complément de tissage urgent.
                </p>
              </div>
              <div>
                <label style={labelStyle}>Cause du refus <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <select value={causeRefus} onChange={(e) => setCauseRefus(e.target.value)} style={inputStyle}>
                  <option value="">Sélectionner...</option>
                  <option value="matiere_manquante">Matière première manquante</option>
                  <option value="probleme_machine">Problème machine</option>
                  <option value="carton_manquant">Carton manquant</option>
                  <option value="programme_incorrect">Programme incorrect</option>
                  <option value="autre">Autre raison</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Détails (optionnel)</label>
                <textarea rows={3} placeholder="Précisez la raison du refus..." style={{ ...inputStyle, minHeight: 70 }} />
              </div>
            </div>
            <div style={modalFooter}>
              <button onClick={() => { setShowRefuserComplementModal(false); setCauseRefus(''); }} style={btnGhost}>Annuler</button>
              <button onClick={handleConfirmerRefus} disabled={!causeRefus}
                style={{ ...btnPrimary, background: 'var(--color-danger)', borderColor: 'var(--color-danger)',
                  opacity: !causeRefus ? 0.5 : 1, cursor: !causeRefus ? 'not-allowed' : 'pointer' }}>
                Confirmer le Refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Étiquette */}
      {showEtiquetteModal && selectedOF && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={modalHeader}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--fg-primary)' }}>
                Étiquette {(selectedOF as any)?.typeEtiquette === 'debut' ? 'Début de Poste' :
                  (selectedOF as any)?.typeEtiquette === 'finposte' ? 'Fin de Poste' : 'Fin de Fabrication'}
              </h3>
            </div>
            <div style={{ padding: 'var(--s-4)' }}>
              <div style={{ border: '2px dashed var(--border-default)', borderRadius: 'var(--radius-sm)',
                padding: 'var(--s-4)', background: 'var(--bg-hover)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--fg-primary)' }}>
                  {(selectedOF as any)?.numSousOF}
                </div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--fg-primary)', marginTop: 6 }}>
                  {(selectedOF as any)?.modele} — {(selectedOF as any)?.ref}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)', marginTop: 8 }}>
                  <div>Machine: {(selectedOF as any)?.machine}</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-terracotta)' }}>Tisseur: {tisseurNom}</div>
                  <div>Date: {new Date().toLocaleString('fr-FR')}</div>
                  {(selectedOF as any)?.typeEtiquette === 'finposte' && (
                    <>
                      <div style={{ fontWeight: 700, color: 'var(--color-success)', marginTop: 6 }}>
                        Produit THÉORIQUE: {(selectedOF as any)?.piecesProduites} pièces
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--color-warning)' }}>
                        Compteur restant: {(selectedOF as any)?.compteurActuel} {(selectedOF as any)?.typeCompteur === 'pieces' ? 'pcs' : 'm'}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontStyle: 'italic', marginTop: 4 }}>
                        Quantité réelle à déterminer après contrôle qualité
                      </div>
                    </>
                  )}
                  {(selectedOF as any)?.typeEtiquette === 'fin' && (
                    <>
                      <div style={{ fontWeight: 700, color: 'var(--color-success)', marginTop: 6 }}>
                        Total: {(selectedOF as any)?.qtePieces} {(selectedOF as any)?.uniteMesure}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>
                        Temps: {(selectedOF as any)?.tempsReel || (selectedOF as any)?.tempsPrevu}
                      </div>
                    </>
                  )}
                </div>
                <div style={{ marginTop: 12, padding: 'var(--s-3)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>QR CODE</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--fg-primary)' }}>████████</div>
                </div>
              </div>
            </div>
            <div style={modalFooter}>
              <button onClick={() => setShowEtiquetteModal(false)} style={btnGhost}>Fermer</button>
              <button style={btnPrimary}><Printer size={12} /> Imprimer</button>
            </div>
          </div>
        </div>
      )}

      <WhatsAppWidget dashboardName="Tisseur" position="bottom-right" />
    </>
  );
};

// --- Reusable styles ---
const badgeBase: React.CSSProperties = {
  padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600,
  display: 'inline-block', whiteSpace: 'nowrap',
};

const selChip: React.CSSProperties = {
  padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 500,
  background: 'var(--bg-hover)', color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)',
};

const countChip: React.CSSProperties = {
  padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600,
  background: 'var(--bg-hover)', color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)',
};

const machineBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  padding: 'var(--s-3) var(--s-4)', border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', width: '100%',
};

const dtLabel: React.CSSProperties = { color: 'var(--fg-muted)', marginRight: 4 };

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: 'var(--s-3) var(--s-4)',
  fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.04em',
};
const tdStyle: React.CSSProperties = { padding: 'var(--s-3) var(--s-4)', color: 'var(--fg-primary)' };

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
  color: 'var(--fg-secondary)', marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', background: 'var(--bg-elevated)',
  color: 'var(--fg-primary)', border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)',
};

const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 50, padding: 16,
};

const modalBox: React.CSSProperties = {
  background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-default)', width: '100%', maxWidth: 480,
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden',
};

const modalHeader: React.CSSProperties = {
  padding: 'var(--s-4)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-hover)',
};

const modalBody: React.CSSProperties = {
  padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-3)',
};

const modalFooter: React.CSSProperties = {
  padding: 'var(--s-4)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-hover)',
  display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-2)',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  background: 'var(--accent-terracotta)', color: '#fff',
  border: '1px solid var(--accent-terracotta)', borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  background: 'var(--bg-hover)', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
};

export default DashboardTisseur;
