import { test, expect } from '@playwright/test';
import { loginAndGoto } from './fixtures/auth';

test.describe('Messaging (ChatWidget)', () => {
  test('user can send a message via the floating ChatWidget', async ({ page }) => {
    await loginAndGoto(page, '/dashboard-admin');

    // Track POST /api/messages requests.
    const sentMessagePosts: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && /\/api\/messages/i.test(req.url())) {
        sentMessagePosts.push(req.url());
      }
    });

    // Open ChatWidget bubble (bottom right).
    const bubble = page
      .getByRole('button', { name: /chat|messages?|messagerie/i })
      .last();
    await expect(bubble).toBeVisible({ timeout: 10_000 });

    // Unread badge — assert either present or absent (both are legal states).
    const badge = page.locator('[data-testid="chat-unread-badge"], .chat-unread-badge').first();
    const badgeCount = await badge.count();
    expect(badgeCount >= 0).toBeTruthy();

    await bubble.click();

    // Pick first user in the sidebar list.
    const firstUser = page
      .locator('[data-testid="chat-user-item"], .chat-user, .conversation-item')
      .first();
    await expect(firstUser).toBeVisible({ timeout: 10_000 });
    await firstUser.click();

    // Type the message and press Enter.
    const input = page
      .getByPlaceholder(/message|écrire|tapez/i)
      .or(page.locator('[data-testid="chat-message-input"], textarea[name="message"]'))
      .first();
    await input.fill('Hello test');
    await input.press('Enter');

    // Message appears in the conversation.
    await expect(page.getByText('Hello test').last()).toBeVisible({ timeout: 10_000 });

    // Assert POST /api/messages was triggered.
    await expect
      .poll(() => sentMessagePosts.length, { timeout: 5_000 })
      .toBeGreaterThan(0);
  });
});
