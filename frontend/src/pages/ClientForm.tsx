import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2, Users, MapPin, CreditCard, ArrowLeft, Plus, Trash2, Save, X,
} from 'lucide-react';
import { DashboardShell, SectionCard } from '../components/dashboard';
import { comptesApi, paramCrmApi } from '../services/crmApi';

type TabKey = 'societe' | 'contacts' | 'adresses' | 'conditions';

interface ClientFormProps { mode: 'create' | 'edit'; }

interface Contact {
  id_contact?: number;
  role: string;
  nom: string;
  prenom?: string;
  civilite?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  whatsapp?: string;
  est_principal: boolean;
}

interface Adresse {
  id_adresse?: number;
  libelle?: string;
  type_facturation: boolean;
  type_livraison: boolean;
  type_siege: boolean;
  rue?: string;
  complement?: string;
  code_postal?: string;
  ville?: string;
  region?: string;
  pays: string;
  contact_livraison_nom?: string;
  contact_livraison_telephone?: string;
  est_defaut_facturation: boolean;
  est_defaut_livraison: boolean;
}

const emptyContact = (principal = false): Contact => ({
  role: 'responsable', nom: '', prenom: '', email: '', telephone: '', est_principal: principal,
});

const emptyAdresse = (): Adresse => ({
  libelle: 'Siège',
  type_facturation: true, type_livraison: true, type_siege: true,
  pays: 'TN',
  est_defaut_facturation: true, est_defaut_livraison: true,
});

const ClientForm: React.FC<ClientFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const params = useParams();
  const [tab, setTab] = useState<TabKey>('societe');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorsByTab, setErrorsByTab] = useState<Record<TabKey, string[]>>({
    societe: [], contacts: [], adresses: [], conditions: [],
  });

  // Onglet 1 — société
  const [compte, setCompte] = useState<any>({
    type_compte: 'societe', statut_crm: 'lead',
    raison_sociale: '', nom: '', prenom: '', pays: 'TN',
    matricule_fiscal: '', numero_tva_intracom: '', siret: '',
    source_lead: '', canal_prefere: 'email',
    notes: '', code_client: '',
    consent_marketing_email: false, consent_marketing_whatsapp: false, consent_marketing_telegram: false,
  });

  // Onglet 2/3 — collections
  const [contacts, setContacts] = useState<Contact[]>([emptyContact(true)]);
  const [adresses, setAdresses] = useState<Adresse[]>([emptyAdresse()]);

  // Onglet 4 — conditions
  const [conditions, setConditions] = useState<any>({
    devise: 'TND', taux_remise: 0, plafond_credit: '', id_grille_tarif: '',
    id_commercial: '', delai_paiement: 30, mode_paiement_prefere: 'virement',
    conditions_paiement: '', escompte_regl_anticipe: 0, penalites_retard: 0,
    notes_commerciales: '',
  });

  // Référentiels chargés
  const [sources, setSources] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [devises, setDevises] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, c, d] = await Promise.all([
          paramCrmApi.list('sources-leads').catch(() => ({ data: { data: [] } })),
          paramCrmApi.list('categories-clients').catch(() => ({ data: { data: [] } })),
          paramCrmApi.list('devises').catch(() => ({ data: { data: [] } })),
        ]);
        setSources((s.data as any).data || []);
        setCategories((c.data as any).data || []);
        setDevises((d.data as any).data || []);
      } catch { /* silent */ }
    })();
  }, []);

  useEffect(() => {
    if (mode !== 'edit' || !params.id) return;
    (async () => {
      try {
        const res = await comptesApi.get(Number(params.id));
        const c = res.data.data;
        setCompte({
          ...compte,
          ...c,
          consent_marketing_email:    !!c.consent_marketing_email,
          consent_marketing_whatsapp: !!c.consent_marketing_whatsapp,
          consent_marketing_telegram: !!c.consent_marketing_telegram,
        });
        setConditions({
          devise: c.devise || 'TND',
          taux_remise: c.taux_remise ?? 0,
          plafond_credit: c.plafond_credit ?? '',
          id_grille_tarif: c.id_grille_tarif ?? '',
          id_commercial: c.id_commercial ?? '',
          delai_paiement: c.delai_paiement ?? 30,
          mode_paiement_prefere: c.mode_paiement_prefere || 'virement',
          conditions_paiement: c.conditions_paiement || '',
          escompte_regl_anticipe: c.escompte_regl_anticipe ?? 0,
          penalites_retard: c.penalites_retard ?? 0,
          notes_commerciales: c.notes_commerciales || '',
        });
        if (Array.isArray(c.contacts) && c.contacts.length) setContacts(c.contacts);
        if (Array.isArray(c.adresses) && c.adresses.length) setAdresses(c.adresses);
      } catch (e: any) {
        setError(e?.response?.data?.error?.message || e.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, params.id]);

  // Contrainte unique-principal (contacts)
  const setContactPrincipal = (idx: number) => {
    setContacts(contacts.map((c, i) => ({ ...c, est_principal: i === idx })));
  };

  const validate = (): boolean => {
    const errs: Record<TabKey, string[]> = { societe: [], contacts: [], adresses: [], conditions: [] };
    if (compte.type_compte === 'societe' && !compte.raison_sociale) errs.societe.push('Raison sociale requise');
    if (compte.type_compte === 'particulier' && !compte.nom) errs.societe.push('Nom requis');
    if (!contacts.length) errs.contacts.push('Au moins un contact requis');
    contacts.forEach((c, i) => { if (!c.nom) errs.contacts.push(`Contact #${i + 1} : nom requis`); });
    if (contacts.filter((c) => c.est_principal).length !== 1) errs.contacts.push('Un contact principal requis (exactement 1)');
    if (!adresses.length) errs.adresses.push('Au moins une adresse requise');
    adresses.forEach((a, i) => { if (!a.pays) errs.adresses.push(`Adresse #${i + 1} : pays requis`); });
    setErrorsByTab(errs);
    return Object.values(errs).every((a) => a.length === 0);
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...compte,
        ...conditions,
        // Marquer consentements horodatés côté back — on peut ajouter les dates ici :
        date_consent_email:    compte.consent_marketing_email    ? new Date().toISOString() : null,
        date_consent_whatsapp: compte.consent_marketing_whatsapp ? new Date().toISOString() : null,
        date_consent_telegram: compte.consent_marketing_telegram ? new Date().toISOString() : null,
        contacts, adresses,
      };
      if (mode === 'create') {
        const res = await comptesApi.create(payload);
        const id = res.data?.data?.id_client;
        navigate(id ? `/clients/${id}` : '/clients');
      } else {
        await comptesApi.update(Number(params.id), payload);
        navigate(`/clients/${params.id}`);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e.message);
    } finally { setSaving(false); }
  };

  const tabsInfo: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'societe',    label: 'Société',    icon: <Building2 size={14} /> },
    { key: 'contacts',   label: 'Contacts',   icon: <Users size={14} /> },
    { key: 'adresses',   label: 'Adresses',   icon: <MapPin size={14} /> },
    { key: 'conditions', label: 'Conditions', icon: <CreditCard size={14} /> },
  ];

  return (
    <DashboardShell
      eyebrow="CRM · CLIENTS"
      title={mode === 'create' ? 'Nouveau client' : `Modifier · ${compte.raison_sociale || compte.nom || ''}`}
      subtitle="Wizard 4 onglets — société, contacts, adresses et conditions commerciales."
      headerRight={
        <>
          <button onClick={() => navigate(-1)} style={btnGhost}>
            <ArrowLeft size={14} style={{ marginRight: 4 }} /> Retour
          </button>
          <button onClick={submit} disabled={saving} style={btnPrimary}>
            <Save size={14} style={{ marginRight: 4 }} />
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </>
      }
    >
      {error && (
        <div style={{ padding: 'var(--s-3)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--s-1)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
        {tabsInfo.map((t) => {
          const errCount = errorsByTab[t.key].length;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: active ? '2px solid var(--accent-indigo)' : '2px solid transparent',
              color: active ? 'var(--accent-indigo)' : 'var(--fg-secondary)',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              transition: 'all var(--duration) var(--ease)',
            }}>
              {t.icon} {t.label}
              {errCount > 0 && <span style={{
                display: 'inline-flex', width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-danger)', color: 'var(--fg-inverse)', borderRadius: 999,
                fontSize: 10, fontWeight: 700,
              }}>{errCount}</span>}
            </button>
          );
        })}
      </div>

      {/* Contenu onglets */}
      {tab === 'societe' && (
        <SectionCard title="Informations société" icon={<Building2 size={16} />}>
          <div style={grid2}>
            <Field label="Code client (auto si vide)" mono>
              <input value={compte.code_client} onChange={(e) => setCompte({ ...compte, code_client: e.target.value })} style={input} />
            </Field>
            <Field label="Type de compte">
              <select value={compte.type_compte} onChange={(e) => setCompte({ ...compte, type_compte: e.target.value })} style={input}>
                <option value="societe">Société</option>
                <option value="particulier">Particulier</option>
              </select>
            </Field>
            {compte.type_compte === 'societe' ? (
              <Field label="Raison sociale *" wide>
                <input value={compte.raison_sociale || ''} onChange={(e) => setCompte({ ...compte, raison_sociale: e.target.value })} style={input} />
              </Field>
            ) : (
              <>
                <Field label="Nom *"><input value={compte.nom || ''} onChange={(e) => setCompte({ ...compte, nom: e.target.value })} style={input} /></Field>
                <Field label="Prénom"><input value={compte.prenom || ''} onChange={(e) => setCompte({ ...compte, prenom: e.target.value })} style={input} /></Field>
              </>
            )}
            <Field label="Statut CRM">
              <select value={compte.statut_crm} onChange={(e) => setCompte({ ...compte, statut_crm: e.target.value })} style={input}>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
                <option value="archive">Archive</option>
              </select>
            </Field>
            <Field label="Pays">
              <input value={compte.pays} onChange={(e) => setCompte({ ...compte, pays: e.target.value.toUpperCase().slice(0, 2) })} style={input} maxLength={2} />
            </Field>
            <Field label="Matricule fiscal (TN)"><input value={compte.matricule_fiscal || ''} onChange={(e) => setCompte({ ...compte, matricule_fiscal: e.target.value })} style={input} /></Field>
            <Field label="N° TVA intracom (UE)"><input value={compte.numero_tva_intracom || ''} onChange={(e) => setCompte({ ...compte, numero_tva_intracom: e.target.value })} style={input} /></Field>
            <Field label="SIRET (FR)"><input value={compte.siret || ''} onChange={(e) => setCompte({ ...compte, siret: e.target.value })} style={input} /></Field>
            <Field label="Source lead">
              <select value={compte.source_lead || ''} onChange={(e) => setCompte({ ...compte, source_lead: e.target.value })} style={input}>
                <option value="">—</option>
                {sources.map((s) => <option key={s.code} value={s.code}>{s.libelle}</option>)}
              </select>
            </Field>
            <Field label="Canal préféré">
              <select value={compte.canal_prefere || ''} onChange={(e) => setCompte({ ...compte, canal_prefere: e.target.value })} style={input}>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="telephone">Téléphone</option>
              </select>
            </Field>
            <Field label="Notes" wide>
              <textarea value={compte.notes || ''} onChange={(e) => setCompte({ ...compte, notes: e.target.value })} style={{ ...input, minHeight: 80 }} />
            </Field>
          </div>

          <div style={{ marginTop: 'var(--s-4)', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 600, marginBottom: 8 }}>RGPD — Consentements marketing</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(['email', 'whatsapp', 'telegram'] as const).map((k) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={!!compte[`consent_marketing_${k}`]}
                         onChange={(e) => setCompte({ ...compte, [`consent_marketing_${k}`]: e.target.checked })} />
                  Consentement marketing {k}
                </label>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {tab === 'contacts' && (
        <SectionCard
          title="Contacts"
          icon={<Users size={16} />}
          actions={<button style={btnGhost} onClick={() => setContacts([...contacts, emptyContact()])}><Plus size={14} /> Ajouter</button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            {contacts.map((c, idx) => (
              <div key={idx} style={{ padding: 'var(--s-3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="radio" name="principal" checked={c.est_principal} onChange={() => setContactPrincipal(idx)} />
                    Contact principal
                  </label>
                  <button onClick={() => setContacts(contacts.filter((_, i) => i !== idx))} style={btnDanger}><Trash2 size={14} /></button>
                </div>
                <div style={grid2}>
                  <Field label="Nom *"><input value={c.nom} onChange={(e) => setContacts(contacts.map((x, i) => i === idx ? { ...x, nom: e.target.value } : x))} style={input} /></Field>
                  <Field label="Prénom"><input value={c.prenom || ''} onChange={(e) => setContacts(contacts.map((x, i) => i === idx ? { ...x, prenom: e.target.value } : x))} style={input} /></Field>
                  <Field label="Rôle">
                    <select value={c.role} onChange={(e) => setContacts(contacts.map((x, i) => i === idx ? { ...x, role: e.target.value } : x))} style={input}>
                      <option value="responsable">Responsable</option>
                      <option value="acheteur">Acheteur</option>
                      <option value="commercial_client">Commercial client</option>
                      <option value="technique">Technique</option>
                      <option value="comptabilite">Comptabilité</option>
                      <option value="autre">Autre</option>
                    </select>
                  </Field>
                  <Field label="Fonction"><input value={c.fonction || ''} onChange={(e) => setContacts(contacts.map((x, i) => i === idx ? { ...x, fonction: e.target.value } : x))} style={input} /></Field>
                  <Field label="Email"><input type="email" value={c.email || ''} onChange={(e) => setContacts(contacts.map((x, i) => i === idx ? { ...x, email: e.target.value } : x))} style={input} /></Field>
                  <Field label="Téléphone"><input value={c.telephone || ''} onChange={(e) => setContacts(contacts.map((x, i) => i === idx ? { ...x, telephone: e.target.value } : x))} style={input} /></Field>
                  <Field label="WhatsApp"><input value={c.whatsapp || ''} onChange={(e) => setContacts(contacts.map((x, i) => i === idx ? { ...x, whatsapp: e.target.value } : x))} style={input} /></Field>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === 'adresses' && (
        <SectionCard
          title="Adresses"
          icon={<MapPin size={16} />}
          actions={<button style={btnGhost} onClick={() => setAdresses([...adresses, emptyAdresse()])}><Plus size={14} /> Ajouter</button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            {adresses.map((a, idx) => (
              <div key={idx} style={{ padding: 'var(--s-3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                  <input placeholder="Libellé (Siège, Entrepôt Sfax…)" value={a.libelle || ''}
                         onChange={(e) => setAdresses(adresses.map((x, i) => i === idx ? { ...x, libelle: e.target.value } : x))}
                         style={{ ...input, flex: 1, minWidth: 200 }} />
                  <button onClick={() => setAdresses(adresses.filter((_, i) => i !== idx))} style={btnDanger}><Trash2 size={14} /></button>
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                  {(['type_facturation', 'type_livraison', 'type_siege'] as const).map((k) => (
                    <label key={k} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                      <input type="checkbox" checked={a[k]} onChange={(e) => setAdresses(adresses.map((x, i) => i === idx ? { ...x, [k]: e.target.checked } : x))} />
                      {k.replace('type_', '')}
                    </label>
                  ))}
                  <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                    <input type="checkbox" checked={a.est_defaut_facturation}
                           onChange={(e) => setAdresses(adresses.map((x, i) => ({ ...x, est_defaut_facturation: i === idx ? e.target.checked : false })))} />
                    Défaut facturation
                  </label>
                  <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                    <input type="checkbox" checked={a.est_defaut_livraison}
                           onChange={(e) => setAdresses(adresses.map((x, i) => ({ ...x, est_defaut_livraison: i === idx ? e.target.checked : false })))} />
                    Défaut livraison
                  </label>
                </div>
                <div style={grid2}>
                  <Field label="Rue"><input value={a.rue || ''} onChange={(e) => setAdresses(adresses.map((x, i) => i === idx ? { ...x, rue: e.target.value } : x))} style={input} /></Field>
                  <Field label="Complément"><input value={a.complement || ''} onChange={(e) => setAdresses(adresses.map((x, i) => i === idx ? { ...x, complement: e.target.value } : x))} style={input} /></Field>
                  <Field label="Code postal"><input value={a.code_postal || ''} onChange={(e) => setAdresses(adresses.map((x, i) => i === idx ? { ...x, code_postal: e.target.value } : x))} style={input} /></Field>
                  <Field label="Ville"><input value={a.ville || ''} onChange={(e) => setAdresses(adresses.map((x, i) => i === idx ? { ...x, ville: e.target.value } : x))} style={input} /></Field>
                  <Field label="Région"><input value={a.region || ''} onChange={(e) => setAdresses(adresses.map((x, i) => i === idx ? { ...x, region: e.target.value } : x))} style={input} /></Field>
                  <Field label="Pays (ISO 2)"><input value={a.pays} maxLength={2} onChange={(e) => setAdresses(adresses.map((x, i) => i === idx ? { ...x, pays: e.target.value.toUpperCase() } : x))} style={input} /></Field>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === 'conditions' && (
        <SectionCard title="Conditions commerciales" icon={<CreditCard size={16} />}>
          <div style={grid2}>
            <Field label="Devise">
              <select value={conditions.devise} onChange={(e) => setConditions({ ...conditions, devise: e.target.value })} style={input}>
                {devises.length ? devises.map((d) => (
                  <option key={d.code} value={d.code}>{d.code} — {d.libelle} {d.symbole ? `(${d.symbole})` : ''}</option>
                )) : (
                  <>
                    <option value="TND">TND</option><option value="EUR">EUR</option><option value="USD">USD</option>
                  </>
                )}
              </select>
            </Field>
            <Field label="Taux remise (%)">
              <input type="number" value={conditions.taux_remise} onChange={(e) => setConditions({ ...conditions, taux_remise: Number(e.target.value) })} style={input} />
            </Field>
            <Field label="Plafond crédit">
              <input type="number" value={conditions.plafond_credit} onChange={(e) => setConditions({ ...conditions, plafond_credit: e.target.value })} style={input} />
            </Field>
            <Field label="Délai paiement (jours)">
              <input type="number" value={conditions.delai_paiement} onChange={(e) => setConditions({ ...conditions, delai_paiement: Number(e.target.value) })} style={input} />
            </Field>
            <Field label="Mode paiement">
              <select value={conditions.mode_paiement_prefere} onChange={(e) => setConditions({ ...conditions, mode_paiement_prefere: e.target.value })} style={input}>
                <option value="virement">Virement</option><option value="cheque">Chèque</option>
                <option value="especes">Espèces</option><option value="cb">Carte bancaire</option>
              </select>
            </Field>
            <Field label="Escompte règlement anticipé (%)">
              <input type="number" value={conditions.escompte_regl_anticipe} onChange={(e) => setConditions({ ...conditions, escompte_regl_anticipe: Number(e.target.value) })} style={input} />
            </Field>
            <Field label="Pénalités retard (%)">
              <input type="number" value={conditions.penalites_retard} onChange={(e) => setConditions({ ...conditions, penalites_retard: Number(e.target.value) })} style={input} />
            </Field>
            <Field label="Conditions paiement (texte)">
              <input value={conditions.conditions_paiement} onChange={(e) => setConditions({ ...conditions, conditions_paiement: e.target.value })} style={input} />
            </Field>
            <Field label="Notes commerciales" wide>
              <textarea value={conditions.notes_commerciales} onChange={(e) => setConditions({ ...conditions, notes_commerciales: e.target.value })} style={{ ...input, minHeight: 80 }} />
            </Field>
          </div>
        </SectionCard>
      )}
    </DashboardShell>
  );
};

const Field: React.FC<{ label: string; wide?: boolean; mono?: boolean; children: React.ReactNode }> = ({ label, wide, mono, children }) => (
  <div style={{ gridColumn: wide ? '1 / -1' : 'auto' }}>
    <label style={{
      display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
      color: 'var(--fg-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
    }}>{label}</label>
    {children}
  </div>
);

const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--s-3)' };
const input: React.CSSProperties = {
  width: '100%', padding: '8px 12px',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-canvas)', color: 'var(--fg-primary)',
  fontSize: 'var(--text-sm)',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
  background: 'var(--accent-terracotta)', color: 'var(--fg-inverse)',
  border: '1px solid var(--accent-terracotta)', borderRadius: 999,
  fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
  background: 'var(--bg-canvas)', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontSize: 'var(--text-sm)', cursor: 'pointer',
};
const btnDanger: React.CSSProperties = {
  padding: 6, background: 'transparent', border: 'none',
  color: 'var(--color-danger)', cursor: 'pointer',
};

export default ClientForm;
