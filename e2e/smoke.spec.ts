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
