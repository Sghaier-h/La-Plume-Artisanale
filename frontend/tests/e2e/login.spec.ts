import { test, expect } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './fixtures/auth';

test.describe('Login flow', () => {
  test('admin can log in and lands on dashboard-admin', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/mot de passe|password/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /se connecter|login|connexion/i }).click();

    await expect(page).toHaveURL(/\/dashboard-admin/i, { timeout: 15_000 });
    await expect(page.getByText(/tableau de bord/i).first()).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('nobody@example.com');
    await page.getByLabel(/mot de passe|password/i).fill('wrongpass');
    await page.getByRole('button', { name: /se connecter|login|connexion/i }).click();

    // Should NOT reach dashboard.
    await expect(page).not.toHaveURL(/\/dashboard-admin/i, { timeout: 5_000 });
  });
});
