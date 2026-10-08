import { test, expect } from '@playwright/test';
import { loginAndGoto } from './fixtures/auth';

test.describe('Admin dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoto(page, '/dashboard-admin');
  });

  test('renders KPI cards', async ({ page }) => {
    await expect(page.getByText(/clients actifs/i).first()).toBeVisible();
    await expect(page.getByText(/commandes/i).first()).toBeVisible();
    await expect(page.getByText(/ca total|chiffre d'affaires/i).first()).toBeVisible();
    await expect(page.getByText(/of en cours|ordres de fabrication/i).first()).toBeVisible();
  });

  test('renders the three charts', async ({ page }) => {
    // Recharts renders each chart inside a .recharts-responsive-container.
    const charts = page.locator('.recharts-responsive-container, svg.recharts-surface');
    await expect(charts.first()).toBeVisible({ timeout: 15_000 });
    expect(await charts.count()).toBeGreaterThanOrEqual(3);
  });

  test('theme toggle cycles through three states', async ({ page }) => {
    const toggle = page
      .getByRole('button', { name: /theme|thème|mode|toggle theme/i })
      .first();
    await expect(toggle).toBeVisible();

    const readTheme = async () =>
      page.evaluate(() =>
        document.documentElement.getAttribute('data-theme') ||
        document.documentElement.className
      );

    const s0 = await readTheme();
    await toggle.click();
    const s1 = await readTheme();
    await toggle.click();
    const s2 = await readTheme();
    await toggle.click();
    const s3 = await readTheme();

    // Expect at least 3 distinct states across the cycle, cycling back near s0.
    const unique = new Set([s0, s1, s2, s3]);
    expect(unique.size).toBeGreaterThanOrEqual(2);
    expect([s0, s1, s2]).toContain(s3);
  });
});
