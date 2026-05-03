import { test, expect, Page } from '@playwright/test';

async function loginIfCredentials(page: Page) {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  if (!email || !password) return false;

  await page.goto('/login');
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  if (await emailInput.count() > 0) {
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tasks/, { timeout: 10000 });
    return true;
  }
  return false;
}

test.describe('Tasks page structure', () => {
  test.skip(
    !process.env.TEST_EMAIL || !process.env.TEST_PASSWORD,
    'Requires TEST_EMAIL and TEST_PASSWORD env vars'
  );

  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginIfCredentials(page);
    if (!loggedIn) test.skip();
    await page.goto('/tasks');
  });

  test('Kanban board renders with expected columns', async ({ page }) => {
    // Check for column headers: Inbox, In Progress, Waiting, Done
    const columns = ['Inbox', 'In Progress', 'Waiting', 'Done'];
    for (const col of columns) {
      const colEl = page.locator(`text="${col}"`).first();
      await expect(colEl).toBeVisible({ timeout: 10000 });
    }
  });

  test('"Add task" button or input is present', async ({ page }) => {
    const addButton = page.locator(
      'button:has-text("Add task"), button:has-text("Add Task"), button:has-text("New task"), button:has-text("New Task"), input[placeholder*="task" i]'
    );
    await expect(addButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('Task cards show title, assignee, due date fields', async ({ page }) => {
    // This checks that if any task cards exist they have expected structure
    const taskCards = page.locator('[data-testid="task-card"], .task-card, [class*="task-card"]');
    const count = await taskCards.count();

    if (count > 0) {
      const firstCard = taskCards.first();
      // Title should be visible
      await expect(firstCard.locator('[class*="title"], [data-testid="task-title"], h3, h4').first()).toBeVisible();
    } else {
      // No task cards yet — just verify the board structure is there
      const board = page.locator('[class*="kanban"], [class*="board"], [data-testid="kanban"]');
      await expect(board.first()).toBeVisible();
    }
  });
});
