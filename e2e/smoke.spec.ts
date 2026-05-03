import { test, expect } from '@playwright/test';

test.describe('Smoke Tests (no auth required)', () => {
  test('login page loads and shows auth options', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    // Check page heading is visible
    const heading = page.locator('h1, h2');
    await expect(heading.first()).toBeVisible();

    // Check for a sign-in button (Google OAuth or email/password)
    // The app uses "Continue with Google" OAuth — check for a sign-in button
    const signInButton = page.locator(
      'button:has-text("Google"), button:has-text("Sign in"), button:has-text("Login"), button:has-text("Continue"), a:has-text("Sign in")'
    );
    await expect(signInButton.first()).toBeVisible();
  });

  test('login page renders "Continue with Google" button (no raw UUIDs)', async ({ page }) => {
    await page.goto('/login');

    // The button should say "Continue with Google" (or similar)
    const googleButton = page.locator('button:has-text("Continue with Google")');
    await expect(googleButton).toBeVisible();

    // The page should NOT expose raw UUIDs in visible text
    const pageText = await page.locator('body').innerText();
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    expect(uuidPattern.test(pageText)).toBe(false);
  });

  test('login page subtitle says "Karla\'s Mission Control"', async ({ page }) => {
    await page.goto('/login');

    // Wait for the page to hydrate — look for a known stable element
    await page.waitForLoadState('networkidle');

    // Subtitle / tagline should reflect the correct app identity
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain("Karla's Mission Control");

    // Must NOT contain old branding
    expect(bodyText).not.toMatch(/Family Command Center/i);
    expect(bodyText).not.toMatch(/busy moms/i);
  });

  test('login page footer does NOT contain "busy moms"', async ({ page }) => {
    await page.goto('/login');

    // Check footer or bottom-of-page text
    const footerLocators = [
      page.locator('footer'),
      page.locator('[class*="footer"]'),
      page.locator('[class*="Footer"]'),
    ];

    for (const locator of footerLocators) {
      const count = await locator.count();
      if (count > 0) {
        const text = await locator.first().innerText();
        expect(text).not.toMatch(/busy moms/i);
      }
    }

    // Also check full page text
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/busy moms/i);
  });

  test('unauthenticated redirect: /tasks → /login', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated redirect: /projects → /login', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated redirect: /memory → /login', async ({ page }) => {
    await page.goto('/memory');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated redirect: /docs → /login', async ({ page }) => {
    await page.goto('/docs');
    await expect(page).toHaveURL(/\/login/);
  });
});
