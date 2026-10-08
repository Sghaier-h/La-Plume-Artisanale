import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'lp_theme';

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === 'auto') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', t);
  }
}

function getInitial(): Theme {
  try {
    const s = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (s === 'light' || s === 'dark' || s === 'auto') return s;
  } catch {}
  return 'auto';
}

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }, [theme]);

  const cycle = () => {
    setTheme((t) => (t === 'light' ? 'dark' : t === 'dark' ? 'auto' : 'light'));
  };

  const icon = theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🌓';
  const label = theme === 'light' ? 'Mode clair' : theme === 'dark' ? 'Mode sombre' : 'Mode auto';

  return (
    <button
      onClick={cycle}
      title={label}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: 'var(--bg-hover)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        color: 'var(--fg-secondary)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background var(--duration) var(--ease)',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-sunken)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default ThemeToggle;
