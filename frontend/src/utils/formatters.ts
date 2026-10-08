/**
 * formatters.ts — Fonctions d'affichage partagées (montants, dates, texte).
 */

// Symbole ISO 4217 fallback minimal (le vrai catalogue vient de /v2/crm/parametres/devises)
const DEVISE_META: Record<string, { symbol: string; decimals: number }> = {
  TND: { symbol: 'د.ت', decimals: 3 },
  EUR: { symbol: '€',    decimals: 2 },
  USD: { symbol: '$',    decimals: 2 },
  GBP: { symbol: '£',    decimals: 2 },
  CHF: { symbol: 'CHF',  decimals: 2 },
  MAD: { symbol: 'DH',   decimals: 2 },
};

/**
 * fmtMoney(1250.5, 'EUR')  →  '1 250,50 €'
 * fmtMoney(1250.5)         →  '1 250,500 TND'
 */
export function fmtMoney(
  montant: number | string | null | undefined,
  devise: string = 'TND',
): string {
  const n = typeof montant === 'number' ? montant : parseFloat(String(montant ?? ''));
  if (!Number.isFinite(n)) return '-';
  const meta = DEVISE_META[devise?.toUpperCase()] || { symbol: devise, decimals: 2 };
  const formatted = n.toLocaleString('fr-FR', {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  });
  // Convention La Plume : TND à droite, € à droite, $ à droite (uniforme)
  return `${formatted} ${meta.symbol}`;
}

export function fmtInt(n: number | string | null | undefined): string {
  const v = typeof n === 'number' ? n : parseFloat(String(n ?? ''));
  return Number.isFinite(v) ? v.toLocaleString('fr-FR') : '-';
}

export function fmtDate(d?: string | Date | null): string {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('fr-FR');
  } catch { return String(d); }
}

export function fmtDateTime(d?: string | Date | null): string {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return String(d); }
}

export function fmtRelative(iso?: string | null): string {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    const days = Math.round((Date.now() - d.getTime()) / 86400000);
    if (days === 0)  return "aujourd'hui";
    if (days === 1)  return 'hier';
    if (days < 30)   return `il y a ${days} j`;
    return d.toLocaleDateString('fr-FR');
  } catch { return '-'; }
}
