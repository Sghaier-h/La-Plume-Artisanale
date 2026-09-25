import React, { useEffect, useState } from 'react';
import {
  UserCircle,
  Camera,
  Save,
  Globe,
  Clock,
  Palette,
  Layers,
  CheckCircle2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────
interface ProfilUtilisateur {
  nom: string;
  prenom: string;
  email: string;
  photo_url: string;
  langue: 'fr' | 'en' | 'ar';
  fuseau_horaire: string;
  theme: 'auto' | 'light' | 'dark';
  densite: 'confort' | 'compact';
}

// ─── Mock ─────────────────────────────────────────────────────────────
const MOCK_PROFIL: ProfilUtilisateur = {
  nom: 'Sghaier',
  prenom: 'Fouta',
  email: 'allbyfouta@gmail.com',
  photo_url: '',
  langue: 'fr',
  fuseau_horaire: 'Africa/Tunis',
  theme: 'auto',
  densite: 'confort',
};

// ─── Fallback ─────────────────────────────────────────────────────────
const pickObj = <T,>(res: PromiseSettledResult<any>, fb: T): T => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  return d && typeof d === 'object' && !Array.isArray(d) ? (d as T) : fb;
};

// ─── Composant ────────────────────────────────────────────────────────
const Profil: React.FC = () => {
  const [profil, setProfil] = useState<ProfilUtilisateur>(MOCK_PROFIL);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        Promise.reject(new Error('service_mon_compte_profil')),
      ]);
      if (cancelled) return;
      setProfil(pickObj<ProfilUtilisateur>(res, MOCK_PROFIL));
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

  const initials = `${profil.prenom.charAt(0)}${profil.nom.charAt(0)}`.toUpperCase();

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
            §Mon compte
          </div>
          <h1
            className="text-3xl italic flex items-center gap-3"
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontWeight: 500,
              color: 'var(--fg-primary)',
            }}
          >
            <UserCircle className="w-8 h-8" style={{ color: 'var(--accent-terracotta)' }} />
            Profil utilisateur
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
            Édition de votre identité, préférences de langue et interface.
          </p>
        </div>

        <form
          onSubmit={save}
          className="rounded-xl shadow-sm border p-6 space-y-6"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-2"
              style={{
                background: 'var(--accent-terracotta)',
                color: 'var(--fg-inverse)',
                borderColor: 'var(--border-default)',
              }}
            >
              {profil.photo_url ? (
                <img
                  src={profil.photo_url}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <label className="cursor-pointer">
              <div
                className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-secondary)',
                  background: 'var(--bg-app)',
                }}
              >
                <Camera className="w-4 h-4" />
                Changer la photo
              </div>
              <input
                type="text"
                value={profil.photo_url}
                onChange={(e) => setProfil({ ...profil, photo_url: e.target.value })}
                className="mt-1 w-full px-2 py-1 border rounded text-xs font-mono"
                placeholder="URL image"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              />
            </label>
          </div>

          {/* Nom / prenom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                Prénom
              </span>
              <input
                type="text"
                required
                value={profil.prenom}
                onChange={(e) => setProfil({ ...profil, prenom: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
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
                Nom
              </span>
              <input
                type="text"
                required
                value={profil.nom}
                onChange={(e) => setProfil({ ...profil, nom: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              />
            </label>
          </div>

          {/* Email */}
          <label className="block">
            <span
              className="text-[11px] uppercase tracking-wider"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
            >
              Adresse email
            </span>
            <input
              type="email"
              required
              value={profil.email}
              onChange={(e) => setProfil({ ...profil, email: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
              style={{
                background: 'var(--bg-app)',
                borderColor: 'var(--border-default)',
                color: 'var(--fg-primary)',
              }}
            />
          </label>

          {/* Langue / fuseau */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                <Globe className="w-3 h-3" />
                Langue
              </span>
              <select
                value={profil.langue}
                onChange={(e) => setProfil({ ...profil, langue: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </label>
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                <Clock className="w-3 h-3" />
                Fuseau horaire
              </span>
              <select
                value={profil.fuseau_horaire}
                onChange={(e) => setProfil({ ...profil, fuseau_horaire: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="Africa/Tunis">Africa/Tunis (UTC+1)</option>
                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="Africa/Casablanca">Africa/Casablanca (UTC+1)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
              </select>
            </label>
          </div>

          {/* Thème / densité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                <Palette className="w-3 h-3" />
                Thème
              </span>
              <select
                value={profil.theme}
                onChange={(e) => setProfil({ ...profil, theme: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="auto">Auto (système)</option>
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </label>
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                <Layers className="w-3 h-3" />
                Densité UI
              </span>
              <select
                value={profil.densite}
                onChange={(e) => setProfil({ ...profil, densite: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              >
                <option value="confort">Confort</option>
                <option value="compact">Compact</option>
              </select>
            </label>
          </div>

          {/* Actions */}
          <div
            className="flex items-center justify-between pt-4 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {saveStatus === 'saved' ? (
              <div
                className="inline-flex items-center gap-1 text-sm font-medium"
                style={{ color: 'var(--color-success)' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Modifications enregistrées
              </div>
            ) : (
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Les changements sont appliqués après enregistrement.
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium shadow-sm hover:opacity-90"
              style={{ background: 'var(--accent-terracotta)' }}
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profil;
