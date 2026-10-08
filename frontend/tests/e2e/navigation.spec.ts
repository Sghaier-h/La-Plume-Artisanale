import { test, expect, Page } from '@playwright/test';
import { loginAndGoto } from './fixtures/auth';

const ROUTES: Array<{ label: RegExp; expectUrl: RegExp }> = [
  { label: /accueil|home/i, expectUrl: /\/(dashboard-admin|accueil|home)/i },
  { label: /commandes/i, expectUrl: /\/commandes/i },
  { label: /^of$|ordres de fabrication|fabrication/i, expectUrl: /\/of/i },
  { label: /^stock$|stocks/i, expectUrl: /\/stock/i },
  { label: /produits.*services|produits/i, expectUrl: /\/produits/i },
];

async function openSidebarGroup(page: Page, groupLabel: RegExp): Promise<void> {
  const group = page.getByRole('button', { name: groupLabel }).first();
  if ((await group.count()) > 0) {
    const expanded = await group.getAttribute('aria-expanded');
    if (expanded !== 'true') await group.click().catch(() => {});
  }
}

test.describe('Sidebar navigation', () => {
  test('key pages render without console errors or ErrorBoundary', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const t = msg.text();
        // Filter out well-known noisy warnings unrelated to app health.
        if (!/favicon|source-map|ResizeObserver loop/i.test(t)) {
          consoleErrors.push(t);
        }
      }
    });

    await loginAndGoto(page, '/dashboard-admin');

    // Expand Vente and Fabrication groups if the sidebar uses collapsible sections.
    await openSidebarGroup(page, /vente/i);
    await openSidebarGroup(page, /fabrication/i);

    for (const { label, expectUrl } of ROUTES) {
      const link = page.getByRole('link', { name: label }).first();
      if ((await link.count()) === 0) {
        // Fallback: sometimes items are buttons.
        await page.getByRole('button', { name: label }).first().click();
      } else {
        await link.click();
      }
      await expect(page).toHaveURL(expectUrl, { timeout: 10_000 });

      // ErrorBoundary fallback should not be present.
      const boundary = page.getByText(/quelque chose s'est mal pass|something went wrong|erreur inattendue/i);
      await expect(boundary).toHaveCount(0);
    }

    expect(consoleErrors, `console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
  });
});
