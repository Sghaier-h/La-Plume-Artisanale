import { Page, expect, APIRequestContext, request } from '@playwright/test';

export const ADMIN_EMAIL = 'admin@system.local';
export const ADMIN_PASSWORD = 'DevLocal2024!';
export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * Perform a real UI login via /login form. Ends on /dashboard-admin.
 */
export async function loginViaUI(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/mot de passe|password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /se connecter|login|connexion/i }).click();
  await page.waitForURL(/\/dashboard-admin/i, { timeout: 15_000 });
}

/**
 * Seed a JWT token via API and inject it into localStorage before the app boots.
 * Faster than UI login for tests 2-5.
 */
export async function loginViaAPI(page: Page): Promise<{ token: string; user: any }> {
  const api = await request.newContext();
  const res = await api.post(`${BACKEND_URL}/api/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(res.ok(), `login API failed: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  const token: string = body.token || body.access_token || body.accessToken;
  const user = body.user || body.data?.user || body;

  await page.addInitScript(
    ({ token, user }) => {
      try {
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('auth_token', token);
        window.localStorage.setItem('user', JSON.stringify(user));
      } catch {
        /* noop */
      }
    },
    { token, user }
  );
  return { token, user };
}

/**
 * Convenience: login then navigate to a route with the seeded token.
 */
export async function loginAndGoto(page: Page, path = '/dashboard-admin'): Promise<void> {
  await loginViaAPI(page);
  await page.goto(path);
}
