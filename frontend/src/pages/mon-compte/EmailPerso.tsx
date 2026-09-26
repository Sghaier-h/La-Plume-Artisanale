import React, { useEffect, useState } from 'react';
import {
  Mail,
  Server,
  Lock,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  PenLine as Signature,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────
interface ConfigEmailPerso {
  adresse_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_tls: 'ssl' | 'starttls' | 'none';
  smtp_user: string;
  smtp_password: string;
  signature: string;
}

// ─── Mock ─────────────────────────────────────────────────────────────
const MOCK_CONFIG: ConfigEmailPerso = {
  adresse_email: 'allbyfouta@gmail.com',
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_tls: 'starttls',
  smtp_user: 'allbyfouta@gmail.com',
  smtp_password: '',
  signature:
    'Cordialement,\nFouta Sghaier\nLa Plume Artisanale — Sfax, Tunisie\nhttps://laplume-artisanale.tn',
};

const pickObj = <T,>(res: PromiseSettledResult<any>, fb: T): T => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  return d && typeof d === 'object' && !Array.isArray(d) ? (d as T) : fb;
};

const EmailPerso: React.FC = () => {
  const [config, setConfig] = useState<ConfigEmailPerso>(MOCK_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'ko'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        Promise.reject(new Error('service_mon_compte_email')),
      ]);
      if (cancelled) return;
      setConfig(pickObj<ConfigEmailPerso>(res, MOCK_CONFIG));
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
    // Simulate call
    await new Promise((r) => setTimeout(r, 900));
    if (!config.smtp_host || !config.smtp_port || !config.adresse_email) {
      setTestStatus('ko');
      setTestMessage('Configuration incomplète — vérifiez host, port et email.');
    } else {
      setTestStatus('ok');
      setTestMessage(`Email de test envoyé à ${config.adresse_email}.`);
    }
    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 3500);
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
      <div className="max-w-3xl mx-auto">
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
            <Mail className="w-8 h-8" style={{ color: 'var(--accent-terracotta)' }} />
            Email personnel (SMTP)
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
            Configurer votre serveur SMTP pour envoyer les emails depuis votre adresse.
          </p>
        </div>

        <form
          onSubmit={save}
          className="rounded-xl shadow-sm border p-6 space-y-6"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Adresse email */}
          <label className="block">
            <span
              className="text-[11px] uppercase tracking-wider"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
            >
              Adresse email d&apos;envoi
            </span>
            <input
              type="email"
              required
              value={config.adresse_email}
              onChange={(e) => setConfig({ ...config, adresse_email: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
              style={{
                background: 'var(--bg-app)',
                borderColor: 'var(--border-default)',
                color: 'var(--fg-primary)',
              }}
            />
          </label>

          {/* SMTP */}
          <div>
            <div
              className="text-[11px] uppercase tracking-wider mb-2 inline-flex items-center gap-1"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
            >
              <Server className="w-3 h-3" />
              Serveur SMTP
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="block md:col-span-2">
                <span
                  className="text-[11px] uppercase tracking-wider"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-muted)' }}
                >
                  Host
                </span>
                <input
                  type="text"
                  required
                  value={config.smtp_host}
                  onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
                  placeholder="smtp.gmail.com"
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
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-muted)' }}
                >
                  Port
                </span>
                <input
                  type="number"
                  required
                  value={config.smtp_port}
                  onChange={(e) =>
                    setConfig({ ...config, smtp_port: parseInt(e.target.value) || 0 })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {(['ssl', 'starttls', 'none'] as const).map((tls) => (
                <label
                  key={tls}
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 border rounded cursor-pointer"
                  style={{
                    borderColor:
                      config.smtp_tls === tls ? 'var(--accent-terracotta)' : 'var(--border-default)',
                    background:
                      config.smtp_tls === tls ? 'var(--color-warning-bg)' : 'var(--bg-app)',
                    color: 'var(--fg-primary)',
                  }}
                >
                  <input
                    type="radio"
                    name="tls"
                    value={tls}
                    checked={config.smtp_tls === tls}
                    onChange={() => setConfig({ ...config, smtp_tls: tls })}
                  />
                  {tls.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* User / mdp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                Utilisateur SMTP
              </span>
              <input
                type="text"
                value={config.smtp_user}
                onChange={(e) => setConfig({ ...config, smtp_user: e.target.value })}
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
                className="text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                <Lock className="w-3 h-3" />
                Mot de passe application
              </span>
              <input
                type="password"
                value={config.smtp_password}
                onChange={(e) => setConfig({ ...config, smtp_password: e.target.value })}
                placeholder="•••• •••• •••• ••••"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              />
            </label>
          </div>

          {/* Signature */}
          <label className="block">
            <span
              className="text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
            >
              <Signature className="w-3 h-3" />
              Signature
            </span>
            <textarea
              rows={5}
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

          {/* Actions */}
          <div
            className="pt-4 border-t flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
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
        </form>
      </div>
    </div>
  );
};

export default EmailPerso;
