import React, { useEffect, useState } from 'react';
import { Building2, Save, Upload, MapPin, CreditCard, Mail, Phone, FileText } from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// §16 — Paramètres société
// ═══════════════════════════════════════════════════════════════════

interface Societe {
  raison_sociale: string;
  forme_juridique: string;
  matricule_fiscal: string;
  code_tva: string;
  registre_commerce: string;
  adresse_rue: string;
  code_postal: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  site_web: string;
  logo_url: string | null;
  rib_iban: string;
  rib_bic: string;
  banque_nom: string;
  capital_social: number;
  devise: string;
}

const MOCK_SOCIETE: Societe = {
  raison_sociale: 'La Plume Artisanale SARL',
  forme_juridique: 'SARL',
  matricule_fiscal: '1234567/A/M/000',
  code_tva: 'TN 1234567',
  registre_commerce: 'B0123456789',
  adresse_rue: 'Route de Gremda km 5, Zone industrielle Poudrière',
  code_postal: '3002',
  ville: 'Sfax',
  pays: 'Tunisie',
  telephone: '+216 74 456 789',
  email: 'contact@laplumeartisanale.tn',
  site_web: 'https://laplumeartisanale.tn',
  logo_url: null,
  rib_iban: 'TN59 08 010 000 1234567890 12',
  rib_bic: 'BIATTNTT',
  banque_nom: 'BIAT Sfax Centre',
  capital_social: 250_000,
  devise: 'DT',
};

const ParamSociete: React.FC = () => {
  const [societe, setSociete] = useState<Societe>(MOCK_SOCIETE);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([api.get('/api/v2/parametres/societe')]);
      if (cancelled) return;
      if (r[0].status === 'fulfilled') {
        const d = r[0].value?.data?.data ?? r[0].value?.data;
        if (d && typeof d === 'object' && d.raison_sociale) setSociete(d);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = <K extends keyof Societe>(k: K, v: Societe[K]) => {
    setSociete((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  const save = () => {
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cancel = () => {
    setSociete(MOCK_SOCIETE);
    setDirty(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const inputCls = 'w-full border rounded px-3 py-2 text-sm';
  const inputStyle: React.CSSProperties = { borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' };
  const labelCls = 'text-xs font-mono uppercase mb-1 block';
  const labelStyle: React.CSSProperties = { color: 'var(--fg-muted, #8A6E4A)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                §16 · Paramètres
              </div>
              <h1
                className="text-3xl italic mb-1"
                style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}
              >
                Société
              </h1>
              <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
                Identité légale, coordonnées bancaires, logo
              </p>
            </div>
            {(dirty || saved) && (
              <div className="flex gap-2">
                {saved && <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700">Enregistré ✓</span>}
                {dirty && (
                  <>
                    <button
                      onClick={cancel}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm border"
                      style={{ backgroundColor: 'var(--bg-app, #FBF8F3)', borderColor: '#E8DCC8', color: 'var(--fg-secondary, #5D4E42)' }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={save}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white"
                      style={{ backgroundColor: '#C8663D' }}
                    >
                      <Save className="w-4 h-4" /> Enregistrer
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Section : Identité légale */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]">
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}>
                <Building2 className="w-5 h-5" style={{ color: '#C8663D' }} /> Identité légale
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls} style={labelStyle}>Raison sociale</label>
                  <input value={societe.raison_sociale} onChange={(e) => patch('raison_sociale', e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Forme juridique</label>
                  <select value={societe.forme_juridique} onChange={(e) => patch('forme_juridique', e.target.value)} className={inputCls} style={inputStyle}>
                    <option>SARL</option>
                    <option>SUARL</option>
                    <option>SA</option>
                    <option>SAS</option>
                    <option>EI</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Capital social (DT)</label>
                  <input type="number" value={societe.capital_social} onChange={(e) => patch('capital_social', Number(e.target.value))} className={`${inputCls} font-mono`} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Matricule fiscal</label>
                  <input value={societe.matricule_fiscal} onChange={(e) => patch('matricule_fiscal', e.target.value)} className={`${inputCls} font-mono`} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Code TVA</label>
                  <input value={societe.code_tva} onChange={(e) => patch('code_tva', e.target.value)} className={`${inputCls} font-mono`} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}><FileText className="w-3 h-3 inline mr-1" />Registre commerce</label>
                  <input value={societe.registre_commerce} onChange={(e) => patch('registre_commerce', e.target.value)} className={`${inputCls} font-mono`} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Section : Adresse */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]">
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}>
                <MapPin className="w-5 h-5" style={{ color: '#C8663D' }} /> Adresse du siège
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-4">
                  <label className={labelCls} style={labelStyle}>Rue / route</label>
                  <input value={societe.adresse_rue} onChange={(e) => patch('adresse_rue', e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Code postal</label>
                  <input value={societe.code_postal} onChange={(e) => patch('code_postal', e.target.value)} className={`${inputCls} font-mono`} style={inputStyle} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls} style={labelStyle}>Ville</label>
                  <input value={societe.ville} onChange={(e) => patch('ville', e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Pays</label>
                  <input value={societe.pays} onChange={(e) => patch('pays', e.target.value)} className={inputCls} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Section : Contact */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]">
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}>
                <Mail className="w-5 h-5" style={{ color: '#C8663D' }} /> Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls} style={labelStyle}><Phone className="w-3 h-3 inline mr-1" />Téléphone</label>
                  <input value={societe.telephone} onChange={(e) => patch('telephone', e.target.value)} className={`${inputCls} font-mono`} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Email</label>
                  <input type="email" value={societe.email} onChange={(e) => patch('email', e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Site web</label>
                  <input value={societe.site_web} onChange={(e) => patch('site_web', e.target.value)} className={inputCls} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Section : Bancaire */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]">
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}>
                <CreditCard className="w-5 h-5" style={{ color: '#C8663D' }} /> Coordonnées bancaires
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls} style={labelStyle}>Banque</label>
                  <input value={societe.banque_nom} onChange={(e) => patch('banque_nom', e.target.value)} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>RIB / IBAN</label>
                  <input value={societe.rib_iban} onChange={(e) => patch('rib_iban', e.target.value)} className={`${inputCls} font-mono`} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>BIC / SWIFT</label>
                  <input value={societe.rib_bic} onChange={(e) => patch('rib_bic', e.target.value)} className={`${inputCls} font-mono`} style={inputStyle} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Devise principale</label>
                  <select value={societe.devise} onChange={(e) => patch('devise', e.target.value)} className={inputCls} style={inputStyle}>
                    <option>DT</option>
                    <option>EUR</option>
                    <option>USD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section : Logo */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]">
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}>
                <Upload className="w-5 h-5" style={{ color: '#C8663D' }} /> Logo
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded border flex items-center justify-center" style={{ borderColor: '#E8DCC8', backgroundColor: '#F5EFE4', color: '#8A6E4A' }}>
                  {societe.logo_url ? <img src={societe.logo_url} alt="logo" className="max-w-full max-h-full" /> : 'LOGO'}
                </div>
                <button
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm border"
                  style={{ backgroundColor: 'var(--bg-app, #FBF8F3)', borderColor: '#E8DCC8', color: 'var(--fg-secondary, #5D4E42)' }}
                >
                  <Upload className="w-4 h-4" /> Téléverser un logo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParamSociete;
