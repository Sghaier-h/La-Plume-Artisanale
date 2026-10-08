import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PlumeLogo from '../components/PlumeLogo';

type DevAccount = {
  email: string;
  label: string;
  role: string;
  category: 'Direction' | 'Production' | 'Magasins' | 'Ateliers' | 'Support';
};

const DEV_PASSWORD = 'DevLocal2024!';

// Miroir de backend/src/config/dev-users.js, regroupe par categorie metier.
const DEV_ACCOUNTS: DevAccount[] = [
  { email: 'admin@system.local', label: 'Admin Systeme', role: 'ADMIN', category: 'Direction' },
  { email: 'chef.production@entreprise.local', label: 'Chef de Production', role: 'CHEF_PRODUCTION', category: 'Direction' },
  { email: 'chef.atelier@entreprise.local', label: 'Chef d\'Atelier', role: 'CHEF_ATELIER', category: 'Direction' },
  { email: 'rh.manager@entreprise.local', label: 'RH Manager', role: 'RH_MANAGER', category: 'Direction' },

  { email: 'tisseur@entreprise.local', label: 'Tisseur', role: 'TISSEUR', category: 'Production' },
  { email: 'ourdisseur@entreprise.local', label: 'Ourdisseur', role: 'OURDISSEUR', category: 'Production' },
  { email: 'coupeur@entreprise.local', label: 'Coupeur (post-coupe)', role: 'COUPEUR', category: 'Production' },
  { email: 'controleur.qualite@entreprise.local', label: 'Controleur Qualite', role: 'CONTROLEUR_QUALITE', category: 'Production' },

  { email: 'magasinier.mp@entreprise.local', label: 'Magasinier MP', role: 'MAGASINIER', category: 'Magasins' },
  { email: 'magasinier.stock@entreprise.local', label: 'Magasinier Stock', role: 'MAGASINIER_STOCK', category: 'Magasins' },
  { email: 'magasinier.st@entreprise.local', label: 'Magasinier Sous-traitants', role: 'MAGASINIER_SOUSTRAITANTS', category: 'Magasins' },
  { email: 'magasinier.preparation@entreprise.local', label: 'Magasinier Preparation', role: 'MAGASINIER_PREPARATION', category: 'Magasins' },

  { email: 'mecanicien@entreprise.local', label: 'Mecanicien', role: 'MECANICIEN', category: 'Ateliers' },

  { email: 'commercial@entreprise.local', label: 'Commercial', role: 'COMMERCIAL', category: 'Support' },
  { email: 'comptable@entreprise.local', label: 'Comptable', role: 'COMPTABLE', category: 'Support' },
  { email: 'rh.assistant@entreprise.local', label: 'RH Assistant', role: 'RH_ASSISTANT', category: 'Support' },
  { email: 'marketing@entreprise.local', label: 'Marketing', role: 'MARKETING', category: 'Support' },
  { email: 'securite@entreprise.local', label: 'Responsable Securite', role: 'RESPONSABLE_SECURITE', category: 'Support' },
];

const CATEGORY_ORDER: DevAccount['category'][] = [
  'Direction',
  'Production',
  'Magasins',
  'Ateliers',
  'Support',
];

const CATEGORY_ACCENT: Record<DevAccount['category'], string> = {
  Direction: 'var(--accent-indigo)',
  Production: 'var(--accent-terracotta)',
  Magasins: 'var(--accent-gold)',
  Ateliers: 'var(--accent-sage)',
  Support: 'var(--accent-rose)',
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDevAccounts, setShowDevAccounts] = useState(false);
  const navigate = useNavigate();

  const isDev = process.env.NODE_ENV !== 'production';

  const groupedAccounts = useMemo(() => {
    const groups: Record<string, DevAccount[]> = {};
    for (const account of DEV_ACCOUNTS) {
      if (!groups[account.category]) groups[account.category] = [];
      groups[account.category].push(account);
    }
    return CATEGORY_ORDER
      .filter((c) => groups[c] && groups[c].length > 0)
      .map((c) => ({ category: c, accounts: groups[c] }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL ||
        (process.env.NODE_ENV === 'production'
          ? 'https://fabrication.laplume-artisanale.tn/api'
          : 'http://localhost:5000/api');

      const response = await axios.post(
        `${apiUrl}/auth/login`,
        { email, password }
      );

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        const userData = {
          ...response.data.data.user,
          role: response.data.data.user.role?.toUpperCase() || response.data.data.user.role
        };
        localStorage.setItem('user', JSON.stringify(userData));

        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;

        const userRole = userData.role?.toUpperCase() || '';
        const dashboardsAttribues = userData.dashboardsAttribues || [];

        const dashboardPaths: { [key: string]: string } = {
          'dashboard': '/dashboard-admin',
          'admin': '/dashboard-admin',
          'tisseur': '/dashboard-tisseur',
          'chef-production': '/dashboard-chef-production',
          'magasinier-mp': '/dashboard-magasinier-mp',
          'controle-central': '/dashboard-controle-central',
          'post-coupe': '/dashboard-post-coupe',
          'chef-atelier': '/chef-atelier-dashboard',
          'magasinier-soustraitants': '/dashboard-magasinier-soustraitants',
          'gpao': '/dashboard-admin',
          'mecanicien': '/mecanicien',
          'magasin-pf': '/magasin-pf',
        };

        if (userRole === 'ADMIN') {
          navigate('/dashboard-admin');
          return;
        }

        if (dashboardsAttribues.length > 0) {
          const firstDashboard = dashboardPaths[dashboardsAttribues[0]];
          if (firstDashboard) {
            navigate(firstDashboard);
            return;
          }
        }

        const roleToDashboard: { [key: string]: string } = {
          'TISSEUR': '/dashboard-tisseur',
          'CHEF_PRODUCTION': '/dashboard-chef-production',
          'CHEF_PRODUCT': '/dashboard-chef-production',
          'MAGASINIER': '/dashboard-magasinier-mp',
          'COUPEUR': '/dashboard-post-coupe',
          'CONTROLEUR': '/dashboard-controle-central',
          'CONTROLEUR_QUALITE': '/dashboard-controle-central',
          'QUALITE': '/dashboard-controle-central',
          'CHEF_ATELIER': '/chef-atelier-dashboard',
          'MAGASINIER_SOUSTRAITANTS': '/dashboard-magasinier-soustraitants',
          'GPAO': '/dashboard-admin',
          'MECANICIEN': '/mecanicien',
          'MAGASIN_PF': '/magasin-pf',
        };

        const defaultDashboard = roleToDashboard[userRole];
        if (defaultDashboard) {
          navigate(defaultDashboard);
          return;
        }

        navigate('/dashboard-admin');
      }
    } catch (err: any) {
      let errorMessage = 'Erreur de connexion';

      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' || !err.response) {
        errorMessage = process.env.NODE_ENV === 'production'
          ? 'Impossible de se connecter au serveur. Verifiez que le backend est accessible.'
          : 'Impossible de se connecter au serveur. Verifiez que le backend est demarre sur http://localhost:5000';
      } else if (err.message?.includes('fermee') || err.message?.includes('interrompue')) {
        errorMessage = 'La connexion au serveur a ete interrompue. Verifiez que le backend est bien demarre et accessible.';
      } else if (err.response?.status === 401) {
        errorMessage = err.response?.data?.error?.message || 'Email ou mot de passe incorrect';
      } else if (err.response?.status === 429) {
        const retryAfter = err.response.headers['retry-after'];
        errorMessage = err.response?.data?.error?.message ||
          (retryAfter
            ? `Trop de tentatives de connexion. Veuillez patienter ${retryAfter} secondes avant de reessayer.`
            : 'Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de reessayer.');
      } else if (err.response?.status === 500) {
        errorMessage = 'Erreur serveur. Verifiez les logs du backend.';
      } else if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Erreur de connexion:', err);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account: DevAccount) => {
    setEmail(account.email);
    setPassword(DEV_PASSWORD);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--s-6) var(--s-4)',
        background:
          'linear-gradient(135deg, #FBF8F3 0%, #F5EFE5 55%, #EBE2CE 100%)',
        color: 'var(--fg-primary)',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
    >
      {/* Motif fouta decoratif : rayures diagonales tres discretes */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.05,
          pointerEvents: 'none',
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="fouta-diag"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(35)"
          >
            <rect x="0" y="0" width="6" height="60" fill="var(--accent-indigo)" />
            <rect x="14" y="0" width="2" height="60" fill="var(--accent-terracotta)" />
            <rect x="22" y="0" width="4" height="60" fill="var(--accent-indigo)" />
            <rect x="34" y="0" width="1.5" height="60" fill="var(--accent-gold)" />
            <rect x="42" y="0" width="3" height="60" fill="var(--accent-terracotta)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fouta-diag)" />
      </svg>

      {/* Ornement coin haut-droit : quart de trame fouta */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 30%, rgba(200, 102, 61, 0.14), transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 460,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          padding: 'var(--s-8) var(--s-8) var(--s-6) var(--s-8)',
          zIndex: 1,
        }}
      >
        {/* Filet decoratif haut de card */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 'var(--s-8)',
            right: 'var(--s-8)',
            height: 3,
            background:
              'linear-gradient(90deg, var(--accent-terracotta) 0%, var(--accent-gold) 45%, var(--accent-indigo) 100%)',
            borderRadius: '0 0 3px 3px',
          }}
        />

        {/* Header : logo + titre */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--s-3)',
            marginBottom: 'var(--s-6)',
          }}
        >
          <PlumeLogo size={68} />
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'var(--text-2xl)',
                color: 'var(--fg-primary)',
                letterSpacing: '-0.015em',
              }}
            >
              La Plume Artisanale
            </h1>
            <div
              style={{
                marginTop: 4,
                fontSize: 'var(--text-xs)',
                color: 'var(--fg-secondary)',
                letterSpacing: '0.04em',
              }}
            >
              ERP · Fabrication artisanale de foutas · Tunisie
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
          {error && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--s-2)',
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                color: 'var(--color-danger)',
                padding: 'var(--s-3) var(--s-3)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-snug)',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--color-danger)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                !
              </span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                marginBottom: 6,
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--fg-muted)',
              }}
            >
              Adresse e-mail
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="prenom@entreprise.local"
              style={{
                width: '100%',
                padding: 'var(--s-3) var(--s-4)',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--fg-primary)',
                outline: 'none',
                transition: 'border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-terracotta)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200, 102, 61, 0.18)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                marginBottom: 6,
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--fg-muted)',
              }}
            >
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: 'var(--s-3) var(--s-4)',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                color: 'var(--fg-primary)',
                outline: 'none',
                transition: 'border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-terracotta)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200, 102, 61, 0.18)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 'var(--s-3) var(--s-4)',
              marginTop: 'var(--s-2)',
              background: loading ? 'var(--fg-muted)' : 'var(--accent-terracotta)',
              color: '#FBF8F3',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              letterSpacing: '0.01em',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(200, 102, 61, 0.28)',
              transition:
                'background var(--duration) var(--ease), box-shadow var(--duration) var(--ease), transform var(--duration) var(--ease)',
            }}
            onMouseEnter={(e) => {
              if (loading) return;
              e.currentTarget.style.background = '#A8552E';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(200, 102, 61, 0.38)';
            }}
            onMouseLeave={(e) => {
              if (loading) return;
              e.currentTarget.style.background = 'var(--accent-terracotta)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(200, 102, 61, 0.28)';
            }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {isDev && (
          <div style={{ marginTop: 'var(--s-6)' }}>
            <button
              type="button"
              onClick={() => setShowDevAccounts((v) => !v)}
              aria-expanded={showDevAccounts}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--s-2) var(--s-3)',
                background: 'var(--bg-canvas)',
                border: '1px dashed var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                color: 'var(--fg-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <span>Comptes de demonstration</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>
                {showDevAccounts ? '−' : '+'}
              </span>
            </button>

            {showDevAccounts && (
              <div
                style={{
                  marginTop: 'var(--s-3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--s-3)',
                  maxHeight: 320,
                  overflowY: 'auto',
                  padding: 'var(--s-3)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--fg-muted)',
                    lineHeight: 'var(--leading-snug)',
                  }}
                >
                  Mode developpement · Mot de passe unique :{' '}
                  <code
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--fg-secondary)',
                      background: 'var(--bg-canvas)',
                      padding: '1px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {DEV_PASSWORD}
                  </code>
                </div>
                {groupedAccounts.map(({ category, accounts }) => (
                  <div key={category}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--s-2)',
                        marginBottom: 6,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: CATEGORY_ACCENT[category],
                          display: 'inline-block',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: 'var(--fg-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {accounts.map((acc) => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => fillDemo(acc)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 'var(--s-2)',
                            padding: 'var(--s-2) var(--s-3)',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-xs)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition:
                              'border-color var(--duration-fast) var(--ease), background var(--duration-fast) var(--ease)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = CATEGORY_ACCENT[category];
                            e.currentTarget.style.background = 'var(--bg-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.background = 'var(--bg-elevated)';
                          }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 500,
                                color: 'var(--fg-primary)',
                              }}
                            >
                              {acc.label}
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 11,
                                color: 'var(--fg-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {acc.email}
                            </span>
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 10,
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--bg-canvas)',
                              color: CATEGORY_ACCENT[category],
                              border: `1px solid ${CATEGORY_ACCENT[category]}`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {acc.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            marginTop: 'var(--s-6)',
            paddingTop: 'var(--s-4)',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 11,
              color: 'var(--fg-secondary)',
              letterSpacing: '0.02em',
            }}
          >
            Convention Textile Tunisie · JORT N° 49 · 2024
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
            }}
          >
            © {new Date().getFullYear()} La Plume Artisanale · Tissage & finition
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
