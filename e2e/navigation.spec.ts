import { test, expect, Page } from '@playwright/test';

// Note: The app uses Google OAuth — email/password login is not available.
// Auth-gated tests require TEST_EMAIL/TEST_PASSWORD only if a custom login flow is added.
// Currently these tests are all skipped unless credentials are provided.
async function loginIfCredentials(page: Page) {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  if (!email || !password) return false;

  // Attempt email/password login if inputs exist (future: may add email login option)
  await page.goto('/login');
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  if (await emailInput.count() > 0) {
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(tasks|projects|memory|docs|calendar|settings|dump)/, { timeout: 10000 });
    return true;
  }
  return false;
}

test.describe('Navigation structure', () => {
  test.skip(
    !process.env.TEST_EMAIL || !process.env.TEST_PASSWORD,
    'Requires TEST_EMAIL and TEST_PASSWORD env vars'
  );

  test('sidebar contains all nav links', async ({ page }) => {
    const loggedIn = await loginIfCredentials(page);
    if (!loggedIn) return;

    const navLabels = ['Tasks', 'Projects', 'Memory', 'Docs', 'Calendar', 'Settings'];
    for (const label of navLabels) {
      const link = page.locator(`nav a:has-text("${label}"), aside a:has-text("${label}"), [role="navigation"] a:has-text("${label}")`);
      await expect(link.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Tasks page has visible heading', async ({ page }) => {
    const loggedIn = await loginIfCredentials(page);
    if (!loggedIn) return;

    await page.goto('/tasks');
    const heading = page.locator('h1, h2, [data-testid="page-title"]');
    await expect(heading.first()).toBeVisible();
  });

  test('Projects page has visible heading', async ({ page }) => {
    const loggedIn = await loginIfCredentials(page);
    if (!loggedIn) return;

    await page.goto('/projects');
    const heading = page.locator('h1, h2, [data-testid="page-title"]');
    await expect(heading.first()).toBeVisible();
  });

  test('Memory page has visible heading', async ({ page }) => {
    const loggedIn = await loginIfCredentials(page);
    if (!loggedIn) return;

    await page.goto('/memory');
    const heading = page.locator('h1, h2, [data-testid="page-title"]');
    await expect(heading.first()).toBeVisible();
  });

  test('Docs page has visible heading', async ({ page }) => {
    const loggedIn = await loginIfCredentials(page);
    if (!loggedIn) return;

    await page.goto('/docs');
    const heading = page.locator('h1, h2, [data-testid="page-title"]');
    await expect(heading.first()).toBeVisible();
  });

  test('Calendar page has visible heading', async ({ page }) => {
    const loggedIn = await loginIfCredentials(page);
    if (!loggedIn) return;

    await page.goto('/calendar');
    const heading = page.locator('h1, h2, [data-testid="page-title"]');
    await expect(heading.first()).toBeVisible();
  });

  test('Settings page has visible heading', async ({ page }) => {
    const loggedIn = await loginIfCredentials(page);
    if (!loggedIn) return;

    await page.goto('/settings');
    const heading = page.locator('h1, h2, [data-testid="page-title"]');
    await expect(heading.first()).toBeVisible();
  });
});
