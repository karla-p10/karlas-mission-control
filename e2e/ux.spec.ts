import { test, expect } from '@playwright/test';

/**
 * UX / navigation flow tests — auth-gated.
 *
 * These tests require an authenticated session. They are skipped by default
 * and should be enabled in a CI environment that can provide auth credentials
 * (e.g. via storageState or cookie injection).
 */
test.describe.skip('UX / navigation flows (auth required)', () => {
  // ---------------------------------------------------------------------------
  // Sidebar navigation
  // ---------------------------------------------------------------------------

  test('Sidebar contains all expected nav links', async ({ page }) => {
    await page.goto('/tasks');

    const sidebar = page.locator('nav, aside, [data-testid*="sidebar"], [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();

    const expectedLinks = ['Dashboard', 'Tasks', 'Projects', 'Memory', 'Docs', 'Settings'];
    for (const linkText of expectedLinks) {
      const link = sidebar.locator(`a:has-text("${linkText}"), button:has-text("${linkText}")`).first();
      await expect(link).toBeVisible({ timeout: 5000 });
    }
  });

  test('Sidebar does NOT contain "Brain Dump" or "Calendar" links', async ({ page }) => {
    await page.goto('/tasks');

    const sidebar = page.locator('nav, aside, [data-testid*="sidebar"], [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();

    const sidebarText = await sidebar.innerText();
    expect(sidebarText).not.toMatch(/Brain Dump/i);
    expect(sidebarText).not.toMatch(/\bCalendar\b/i);
  });

  test('Sidebar does NOT contain "Home Base" text', async ({ page }) => {
    await page.goto('/tasks');

    const sidebar = page.locator('nav, aside, [data-testid*="sidebar"], [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();

    const sidebarText = await sidebar.innerText();
    expect(sidebarText).not.toMatch(/Home Base/i);
  });

  // ---------------------------------------------------------------------------
  // Projects page
  // ---------------------------------------------------------------------------

  test('Projects page has "New Project" button or folder+ icon', async ({ page }) => {
    await page.goto('/projects');

    const newProjectButton = page.locator(
      'button:has-text("New Project"), button[aria-label*="new project" i], button[aria-label*="add project" i], button[title*="new project" i], [data-testid*="new-project"]'
    ).first();
    await expect(newProjectButton).toBeVisible();
  });

  test('Projects page sidebar shows project list or empty state', async ({ page }) => {
    await page.goto('/projects');

    // Either there are project items listed, or an empty state is shown
    const projectList = page.locator('[data-testid*="project-list"], [class*="project-list"], ul[class*="project"]');
    const emptyState = page.locator('[data-testid*="empty"], [class*="empty"], :has-text("No projects"), :has-text("Create your first project")');

    const projectListCount = await projectList.count();
    const emptyStateCount = await emptyState.count();

    // At least one of: a project list container or an empty state message should exist
    expect(projectListCount + emptyStateCount).toBeGreaterThan(0);
  });

  // ---------------------------------------------------------------------------
  // Tasks page — kanban columns
  // ---------------------------------------------------------------------------

  test('Tasks page has kanban columns: Inbox, In Progress, Waiting, Done', async ({ page }) => {
    await page.goto('/tasks');

    const expectedColumns = ['Inbox', 'In Progress', 'Waiting', 'Done'];
    for (const columnTitle of expectedColumns) {
      const column = page.locator(
        `[data-testid*="column"]:has-text("${columnTitle}"), [class*="column"]:has-text("${columnTitle}"), h2:has-text("${columnTitle}"), h3:has-text("${columnTitle}"), [class*="kanban"]:has-text("${columnTitle}")`
      ).first();
      await expect(column).toBeVisible({ timeout: 5000 });
    }
  });
});
