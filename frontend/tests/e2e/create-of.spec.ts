import { test, expect } from '@playwright/test';
import { loginAndGoto } from './fixtures/auth';

test.describe('Ordres de Fabrication', () => {
  test('admin can create a new OF and see it in the list', async ({ page }) => {
    await loginAndGoto(page, '/of');

    // Open the create form.
    await page
      .getByRole('button', { name: /nouveau of|nouvel of|créer|ajouter|new/i })
      .first()
      .click();

    // Fill form fields — selectors are permissive to survive minor label changes.
    const articleInput = page.getByLabel(/article|produit/i).first();
    await articleInput.fill('Article Test E2E');

    await page.getByLabel(/quantit/i).first().fill('100');

    const today = new Date().toISOString().slice(0, 10);
    const inTenDays = new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10);
    await page.getByLabel(/date.*d[ée]but.*pr[ée]vue/i).first().fill(today);
    await page.getByLabel(/date.*fin.*pr[ée]vue/i).first().fill(inTenDays);

    // Priority = haute (dropdown or radio).
    const priorite = page.getByLabel(/priorit[ée]/i).first();
    if ((await priorite.getAttribute('role')) === 'combobox' || (await priorite.evaluate((n) => n.tagName)) === 'SELECT') {
      await priorite.selectOption({ label: /haute/i as unknown as string }).catch(async () => {
        await priorite.selectOption('haute');
      });
    } else {
      await priorite.fill('haute');
    }

    // Submit and wait for the create request.
    const [createResp] = await Promise.all([
      page.waitForResponse(
        (r) => /\/api\/(of|ordres[-_]fabrication)/i.test(r.url()) && r.request().method() === 'POST',
        { timeout: 15_000 }
      ),
      page.getByRole('button', { name: /enregistrer|cr[ée]er|submit|valider/i }).first().click(),
    ]);
    expect(createResp.ok()).toBeTruthy();

    // New row visible with statut = planifié.
    await expect(page.getByText('Article Test E2E').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/planifi[ée]/i).first()).toBeVisible();
  });
});
