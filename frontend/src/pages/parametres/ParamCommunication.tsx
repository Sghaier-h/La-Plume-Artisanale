import React, { useEffect, useState } from 'react';
import { Mail, MessageSquare, Send, Pencil, Trash2, Plus, ChevronDown, Zap } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres Communication

type CanalType = 'email' | 'whatsapp' | 'sms';

interface Template {
  id: number;
  canal: CanalType;
  code: string;
  nom: string;
  sujet: string;
  corps: string;
}

interface Signature { id: number; nom: string; email_html: string; }

interface RegleCanal {
  evenement: string;
  canaux: CanalType[];
  template_code: string;
}

const MOCK_TEMPLATES: Template[] = [
  { id: 1, canal: 'email', code: 'NEW_ORDER', nom: 'Nouvelle commande', sujet: 'Confirmation commande #{numero}', corps: 'Bonjour {nom},\n\nMerci pour votre commande #{numero}. Elle sera expédiée sous {delai} jours.\n\nCordialement,\nLa Plume Artisanale' },
  { id: 2, canal: 'email', code: 'INVOICE', nom: 'Facture envoyée', sujet: 'Facture #{numero} — {montant} DT', corps: 'Bonjour {nom},\n\nVeuillez trouver ci-joint votre facture #{numero} d\'un montant de {montant} DT, échéance {echeance}.\n\nCordialement.' },
  { id: 3, canal: 'email', code: 'PAY_LATE', nom: 'Retard paiement', sujet: 'Relance facture #{numero}', corps: 'Bonjour {nom},\n\nVotre facture #{numero} arrive à échéance le {echeance}. Merci de procéder au règlement.\n\nCordialement.' },
  { id: 4, canal: 'whatsapp', code: 'DELIVERY', nom: 'Livraison en cours', sujet: '—', corps: 'Bonjour {nom}, votre commande #{numero} vient d\'être expédiée. Suivi : {tracking}. Merci !' },
  { id: 5, canal: 'sms', code: 'OTP', nom: 'Code de connexion', sujet: '—', corps: 'Votre code La Plume : {code}. Valide 5 min.' },
  { id: 6, canal: 'whatsapp', code: 'DEVIS_READY', nom: 'Devis prêt', sujet: '—', corps: 'Bonjour {nom}, votre devis #{numero} est prêt. Consultation ici : {lien}' },
];

const MOCK_SIGNATURES: Signature[] = [
  { id: 1, nom: 'Signature commerciale FR', email_html: 'Hedi Sghaier · Directeur commercial\nLa Plume Artisanale · Sfax\n+216 74 456 789 · contact@laplumeartisanale.tn' },
  { id: 2, nom: 'Signature comptabilité', email_html: 'Fatma Ben Salah · Comptable\nLa Plume Artisanale · Sfax\ncompta@laplumeartisanale.tn' },
];

const MOCK_REGLES: RegleCanal[] = [
  { evenement: 'Nouvelle commande', canaux: ['email'], template_code: 'NEW_ORDER' },
  { evenement: 'Livraison expédiée', canaux: ['email', 'whatsapp'], template_code: 'DELIVERY' },
  { evenement: 'Facture émise', canaux: ['email'], template_code: 'INVOICE' },
  { evenement: 'Retard paiement J+7', canaux: ['email'], template_code: 'PAY_LATE' },
  { evenement: 'Retard paiement J+30', canaux: ['email', 'sms'], template_code: 'PAY_LATE' },
  { evenement: 'Devis émis', canaux: ['email', 'whatsapp'], template_code: 'DEVIS_READY' },
];

const CANAL_CFG: Record<CanalType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  email: { label: 'Email', icon: <Mail className="w-3 h-3" />, color: '#3B4E68', bg: '#EDF0F5' },
  whatsapp: { label: 'WhatsApp', icon: <MessageSquare className="w-3 h-3" />, color: '#4A6C5B', bg: '#EEF4F0' },
  sms: { label: 'SMS', icon: <Send className="w-3 h-3" />, color: '#C8663D', bg: '#FDF2ED' },
};

const ParamCommunication: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [signatures, setSignatures] = useState<Signature[]>(MOCK_SIGNATURES);
  const [regles, setRegles] = useState<RegleCanal[]>(MOCK_REGLES);
  const [expanded, setExpanded] = useState<'templates' | 'signatures' | 'regles'>('templates');
  const [loading, setLoading] = useState(true);
  const [filterCanal, setFilterCanal] = useState<CanalType | 'all'>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([
        api.get('/api/v2/parametres/communication/templates'),
        api.get('/api/v2/parametres/communication/signatures'),
        api.get('/api/v2/parametres/communication/regles'),
      ]);
      if (cancelled) return;
      const pick = <T,>(res: PromiseSettledResult<any>, fb: T[]): T[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        return Array.isArray(d) ? d : fb;
      };
      setTemplates(pick(r[0], MOCK_TEMPLATES));
      setSignatures(pick(r[1], MOCK_SIGNATURES));
      setRegles(pick(r[2], MOCK_REGLES));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const filteredTpl = filterCanal === 'all' ? templates : templates.filter(t => t.canal === filterCanal);
  const h2Style: React.CSSProperties = { fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' };

  const sections: { key: 'templates' | 'signatures' | 'regles'; label: string; icon: React.ReactNode }[] = [
    { key: 'templates', label: 'Templates messages', icon: <Mail className="w-5 h-5" /> },
    { key: 'signatures', label: 'Signatures email', icon: <Pencil className="w-5 h-5" /> },
    { key: 'regles', label: 'Canaux par événement', icon: <Zap className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>§15 · Paramètres</div>
            <h1 className="text-3xl italic mb-1" style={h2Style}>Communication</h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>Templates email/WhatsApp/SMS, signatures, canaux par événement</p>
          </div>

          <div className="space-y-3">
            {sections.map(sec => {
              const isOpen = expanded === sec.key;
              return (
                <div key={sec.key} className="bg-white rounded-xl shadow-sm border border-[#E8DCC8] overflow-hidden">
                  <button onClick={() => setExpanded(sec.key)} className="w-full flex items-center justify-between p-4 hover:bg-[#FDF2ED]/30">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2" style={{ backgroundColor: '#FDF2ED', color: '#C8663D' }}>{sec.icon}</div>
                      <div className="text-left font-semibold" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{sec.label}</div>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--fg-muted, #8A6E4A)' }} />
                  </button>

                  {isOpen && sec.key === 'templates' && (
                    <div className="p-5 border-t space-y-3" style={{ borderColor: '#E8DCC8' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <select value={filterCanal} onChange={e => setFilterCanal(e.target.value as any)} className="text-sm border rounded px-2 py-1.5" style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
                          <option value="all">Tous canaux</option>
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                        </select>
                        <button className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouveau</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredTpl.map(t => {
                          const cc = CANAL_CFG[t.canal];
                          return (
                            <div key={t.id} className="rounded border p-3" style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: cc.bg, color: cc.color }}>
                                  {cc.icon} {cc.label}
                                </span>
                                <div className="flex gap-1">
                                  <button className="p-1 rounded hover:bg-white" style={{ color: 'var(--fg-secondary, #5D4E42)' }}><Pencil className="w-3 h-3" /></button>
                                  <button onClick={() => setTemplates(templates.filter(x => x.id !== t.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{t.nom}</div>
                              {t.sujet !== '—' && <div className="text-xs mb-1" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Sujet : {t.sujet}</div>}
                              <div className="text-xs italic whitespace-pre-wrap max-h-20 overflow-hidden" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>{t.corps}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isOpen && sec.key === 'signatures' && (
                    <div className="p-5 border-t space-y-3" style={{ borderColor: '#E8DCC8' }}>
                      {signatures.map(s => (
                        <div key={s.id} className="rounded border p-3" style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-sm">{s.nom}</div>
                            <button onClick={() => setSignatures(signatures.filter(x => x.id !== s.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <pre className="text-xs whitespace-pre-wrap" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>{s.email_html}</pre>
                        </div>
                      ))}
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouvelle signature</button>
                    </div>
                  )}

                  {isOpen && sec.key === 'regles' && (
                    <div className="p-5 border-t" style={{ borderColor: '#E8DCC8' }}>
                      <table className="min-w-full text-sm">
                        <thead><tr>
                          <th className="text-left pb-2 text-xs font-mono uppercase" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Événement</th>
                          <th className="text-left pb-2 text-xs font-mono uppercase" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Canaux</th>
                          <th className="text-left pb-2 text-xs font-mono uppercase" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Template</th>
                        </tr></thead>
                        <tbody>{regles.map((r, i) => (
                          <tr key={i} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                            <td className="py-2">{r.evenement}</td>
                            <td className="py-2">
                              <div className="flex gap-1 flex-wrap">{r.canaux.map(c => {
                                const cc = CANAL_CFG[c];
                                return (
                                  <span key={c} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: cc.bg, color: cc.color }}>
                                    {cc.icon} {cc.label}
                                  </span>
                                );
                              })}</div>
                            </td>
                            <td className="py-2 font-mono text-xs">{r.template_code}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParamCommunication;
