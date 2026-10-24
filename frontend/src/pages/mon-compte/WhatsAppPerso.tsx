import React, { useEffect, useState } from 'react';
import {
  MessageCircle,
  Phone,
  Key,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  PenLine as Signature,
  MessageSquare,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────
interface TemplateWA {
  id: number;
  code: string;
  libelle: string;
  contenu: string;
  actif: boolean;
}

interface ConfigWhatsAppPerso {
  numero_wa_business: string;
  token_api: string;
  api_provider: 'meta_cloud' | 'twilio' | 'custom';
  webhook_verify_token: string;
  signature: string;
  templates: TemplateWA[];
}

// ─── Mock ─────────────────────────────────────────────────────────────
const MOCK_CONFIG: ConfigWhatsAppPerso = {
  numero_wa_business: '+216 20 000 000',
  token_api: '',
  api_provider: 'meta_cloud',
  webhook_verify_token: '',
  signature: 'La Plume Artisanale — Sfax',
  templates: [
    {
      id: 1,
      code: 'commande_confirmation',
      libelle: 'Confirmation de commande',
      contenu:
        'Bonjour {client}, votre commande {numero} a bien été enregistrée. Livraison prévue le {date_livraison}. Merci !',
      actif: true,
    },
    {
      id: 2,
      code: 'devis_envoye',
      libelle: 'Envoi de devis',
      contenu:
        'Bonjour {client}, votre devis {numero} d’un montant de {montant} DT est disponible. Valable jusqu’au {date_validite}.',
      actif: true,
    },
    {
      id: 3,
      code: 'relance_paiement',
      libelle: 'Relance paiement',
      contenu:
        'Bonjour {client}, la facture {numero} de {montant} DT reste à régler. Merci de procéder au paiement.',
      actif: false,
    },
  ],
};

const pickObj = <T,>(res: PromiseSettledResult<any>, fb: T): T => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  return d && typeof d === 'object' && !Array.isArray(d) ? (d as T) : fb;
};

const WhatsAppPerso: React.FC = () => {
  const [config, setConfig] = useState<ConfigWhatsAppPerso>(MOCK_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'ko'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [testDestinataire, setTestDestinataire] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        Promise.reject(new Error('service_mon_compte_whatsapp')),
      ]);
      if (cancelled) return;
      setConfig(pickObj<ConfigWhatsAppPerso>(res, MOCK_CONFIG));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const testEnvoi = async () => {
    setTestStatus('testing');
    setTestMessage('');
    await new Promise((r) => setTimeout(r, 900));
    if (!config.numero_wa_business || !config.token_api) {
      setTestStatus('ko');
      setTestMessage('Configuration incomplète — vérifiez numéro et token API.');
    } else if (!testDestinataire) {
      setTestStatus('ko');
      setTestMessage('Indiquez un numéro de destinataire.');
    } else {
      setTestStatus('ok');
      setTestMessage(`Message de test envoyé à ${testDestinataire}.`);
    }
    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 3500);
  };

  const toggleTemplate = (id: number) => {
    setConfig({
      ...config,
      templates: config.templates.map((t) => (t.id === id ? { ...t, actif: !t.actif } : t)),
    });
  };

  const updateTemplate = (id: number, patch: Partial<TemplateWA>) => {
    setConfig({
      ...config,
      templates: config.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'var(--accent-terracotta)' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-app)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div
            className="text-[11px] uppercase tracking-widest mb-2"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-muted)' }}
          >
            §11.2 · Mon compte
          </div>
          <h1
            className="text-3xl italic flex items-center gap-3"
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontWeight: 500,
              color: 'var(--fg-primary)',
            }}
          >
            <MessageCircle className="w-8 h-8" style={{ color: 'var(--accent-terracotta)' }} />
            WhatsApp Business personnel
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
            Configurer votre numéro WA Business et les templates de messages.
          </p>
        </div>

        <form
          onSubmit={save}
          className="rounded-xl shadow-sm border p-6 space-y-6 mb-6"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Numero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                <Phone className="w-3 h-3" />
                Numéro WA Business
              </span>
              <input
                type="tel"
                required
                value={config.numero_wa_business}
                onChange={(e) => setConfig({ ...config, numero_wa_business: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
                placeholder="+216 20 000 000"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              />
            </label>
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                Fournisseur API
              </span>
              <select
                value={config.api_provider}
                onChange={(e) => setConfig({ ...config, api_provider: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="meta_cloud">Meta Cloud API</option>
                <option value="twilio">Twilio WhatsApp</option>
                <option value="custom">Custom / BSP</option>
              </select>
            </label>
          </div>

          {/* Token */}
          <label className="block">
            <span
              className="text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
            >
              <Key className="w-3 h-3" />
              Token API
            </span>
            <input
              type="password"
              value={config.token_api}
              onChange={(e) => setConfig({ ...config, token_api: e.target.value })}
              placeholder="•••• •••• ••••"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
              style={{
                background: 'var(--bg-app)',
                borderColor: 'var(--border-default)',
                color: 'var(--fg-primary)',
              }}
            />
          </label>

          <label className="block">
            <span
              className="text-[11px] uppercase tracking-wider"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
            >
              Webhook verify token
            </span>
            <input
              type="text"
              value={config.webhook_verify_token}
              onChange={(e) => setConfig({ ...config, webhook_verify_token: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
              style={{
                background: 'var(--bg-app)',
                borderColor: 'var(--border-default)',
                color: 'var(--fg-primary)',
              }}
            />
          </label>

          {/* Signature */}
          <label className="block">
            <span
              className="text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
            >
              <Signature className="w-3 h-3" />
              Signature (ajoutée en pied de chaque message)
            </span>
            <input
              type="text"
              value={config.signature}
              onChange={(e) => setConfig({ ...config, signature: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              style={{
                background: 'var(--bg-app)',
                borderColor: 'var(--border-default)',
                color: 'var(--fg-primary)',
              }}
            />
          </label>

          {/* Test destinataire */}
          <div
            className="pt-4 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <label className="block mb-3">
              <span
                className="text-[11px] uppercase tracking-wider"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                Numéro pour test d&apos;envoi
              </span>
              <input
                type="tel"
                value={testDestinataire}
                onChange={(e) => setTestDestinataire(e.target.value)}
                placeholder="+216 XX XXX XXX"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                {testStatus === 'ok' && (
                  <div
                    className="inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: 'var(--color-success)' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {testMessage}
                  </div>
                )}
                {testStatus === 'ko' && (
                  <div
                    className="inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {testMessage}
                  </div>
                )}
                {testStatus === 'idle' && saveStatus === 'saved' && (
                  <div
                    className="inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: 'var(--color-success)' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Configuration enregistrée
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={testEnvoi}
                  disabled={testStatus === 'testing'}
                  className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
                  style={{
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-secondary)',
                    background: 'var(--bg-app)',
                  }}
                >
                  <Send className="w-4 h-4" />
                  {testStatus === 'testing' ? 'Envoi…' : 'Test envoi'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium shadow-sm hover:opacity-90"
                  style={{ background: 'var(--accent-terracotta)' }}
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Templates */}
        <div
          className="rounded-xl shadow-sm border p-6"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
            borderLeft: '4px solid var(--accent-sage)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5" style={{ color: 'var(--accent-sage)' }} />
            <h3
              className="italic"
              style={{
                fontFamily: 'Fraunces, serif',
                fontWeight: 500,
                color: 'var(--fg-primary)',
              }}
            >
              Templates de messages
            </h3>
          </div>
          <div className="space-y-4">
            {config.templates.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border p-4"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                }}
              >
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span
                    className="text-xs font-mono font-semibold px-2 py-0.5 rounded border"
                    style={{
                      color: 'var(--accent-indigo)',
                      background: 'var(--bg-app)',
                      borderColor: 'var(--border-default)',
                    }}
                  >
                    {t.code}
                  </span>
                  <input
                    type="text"
                    value={t.libelle}
                    onChange={(e) => updateTemplate(t.id, { libelle: e.target.value })}
                    className="flex-1 min-w-[160px] px-2 py-1 border rounded text-sm"
                    style={{
                      background: 'var(--bg-app)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--fg-primary)',
                    }}
                  />
                  <label
                    className="inline-flex items-center gap-1 text-xs"
                    style={{ color: 'var(--fg-primary)' }}
                  >
                    <input
                      type="checkbox"
                      checked={t.actif}
                      onChange={() => toggleTemplate(t.id)}
                    />
                    Actif
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={t.contenu}
                  onChange={(e) => updateTemplate(t.id, { contenu: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                />
                <div
                  className="mt-1 text-[11px]"
                  style={{ color: 'var(--fg-muted)', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  Variables : {'{client}'} {'{numero}'} {'{montant}'} {'{date_livraison}'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPerso;
