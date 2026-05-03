import { test, expect } from '@playwright/test';

test.describe('Visual / theme checks', () => {
  test('login page does NOT have dark background (#0d0d1a)', async ({ page }) => {
    await page.goto('/login');

    const bodyBg = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);
      return style.backgroundColor;
    });

    // #0d0d1a in rgb is roughly rgb(13, 13, 26)
    const isDarkBg = bodyBg === 'rgb(13, 13, 26)' || bodyBg === '#0d0d1a';
    expect(isDarkBg).toBe(false);
  });

  test('login page uses light/cream colors (not pitch-dark)', async ({ page }) => {
    await page.goto('/login');

    const { bodyBg, htmlBg } = await page.evaluate(() => {
      const bodyCss = window.getComputedStyle(document.body).backgroundColor;
      const htmlCss = window.getComputedStyle(document.documentElement).backgroundColor;
      return { bodyBg: bodyCss, htmlBg: htmlCss };
    });

    // Parse RGB values and check none are too dark (all channels < 30 = very dark)
    function isTooDark(rgb: string): boolean {
      const match = rgb.match(/\d+/g);
      if (!match) return false;
      const [r, g, b] = match.map(Number);
      return r < 30 && g < 30 && b < 30;
    }

    // Body or html should not be near-black
    const bodyIsDark = isTooDark(bodyBg);
    const htmlIsDark = isTooDark(htmlBg);

    // At least one of them should not be dark
    expect(bodyIsDark && htmlIsDark).toBe(false);
  });

  test('login page has a visible auth container (card or panel)', async ({ page }) => {
    await page.goto('/login');

    // The auth card/panel — could be a div or section, not necessarily a <form>
    // (App uses Google OAuth button without a traditional form element)
    const container = page.locator('button:has-text("Google"), button:has-text("Continue"), button:has-text("Sign in")').first();
    await expect(container).toBeVisible();

    // Verify page root background is not pitch-black
    const rootBg = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).backgroundColor;
    });

    expect(rootBg).not.toBe('rgb(0, 0, 0)');
    expect(rootBg).not.toBe('rgb(13, 13, 26)');
  });
});
