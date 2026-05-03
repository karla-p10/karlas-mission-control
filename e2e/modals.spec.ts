import { test, expect } from '@playwright/test';

/**
 * Modal UX flow tests — auth-gated.
 *
 * These tests require an authenticated session. They are skipped by default
 * and should be enabled in a CI environment that can provide auth credentials
 * (e.g. via storageState or cookie injection).
 */
test.describe.skip('Modal UX flows (auth required)', () => {
  // ---------------------------------------------------------------------------
  // Add Task modal
  // ---------------------------------------------------------------------------

  test('Add Task modal opens when "Add Task" button is clicked', async ({ page }) => {
    await page.goto('/tasks');

    const addTaskButton = page.locator('button:has-text("Add Task"), button:has-text("New Task"), button[aria-label*="Add Task"]').first();
    await expect(addTaskButton).toBeVisible();
    await addTaskButton.click();

    // Modal should appear
    const modal = page.locator('[role="dialog"], [data-testid="task-modal"], .modal').first();
    await expect(modal).toBeVisible();
  });

  test('Task modal contains all required fields', async ({ page }) => {
    await page.goto('/tasks');

    const addTaskButton = page.locator('button:has-text("Add Task"), button:has-text("New Task"), button[aria-label*="Add Task"]').first();
    await addTaskButton.click();

    const modal = page.locator('[role="dialog"], [data-testid="task-modal"], .modal').first();
    await expect(modal).toBeVisible();

    // Title input
    const titleInput = modal.locator('input[name="title"], input[placeholder*="title" i], input[placeholder*="Title"]').first();
    await expect(titleInput).toBeVisible();

    // Notes / description textarea
    const notesTextarea = modal.locator('textarea[name="notes"], textarea[name="description"], textarea[placeholder*="note" i], textarea[placeholder*="description" i]').first();
    await expect(notesTextarea).toBeVisible();

    // Category / project dropdown
    const categoryDropdown = modal.locator('select[name="category"], select[name="project"], [data-testid*="category"], [data-testid*="project"], button[aria-label*="category" i], button[aria-label*="project" i]').first();
    await expect(categoryDropdown).toBeVisible();

    // Status dropdown
    const statusDropdown = modal.locator('select[name="status"], [data-testid*="status"], button[aria-label*="status" i]').first();
    await expect(statusDropdown).toBeVisible();

    // Priority dropdown
    const priorityDropdown = modal.locator('select[name="priority"], [data-testid*="priority"], button[aria-label*="priority" i]').first();
    await expect(priorityDropdown).toBeVisible();

    // Due date input
    const dueDateInput = modal.locator('input[type="date"], input[name*="due" i], input[placeholder*="due" i], [data-testid*="due-date"]').first();
    await expect(dueDateInput).toBeVisible();

    // Assignee dropdown
    const assigneeDropdown = modal.locator('select[name="assignee"], [data-testid*="assignee"], button[aria-label*="assignee" i]').first();
    await expect(assigneeDropdown).toBeVisible();
  });

  test('Category dropdown shows project names, not raw UUIDs', async ({ page }) => {
    await page.goto('/tasks');

    const addTaskButton = page.locator('button:has-text("Add Task"), button:has-text("New Task"), button[aria-label*="Add Task"]').first();
    await addTaskButton.click();

    const modal = page.locator('[role="dialog"], [data-testid="task-modal"], .modal').first();
    await expect(modal).toBeVisible();

    // Open the category/project dropdown
    const categoryTrigger = modal.locator('[data-testid*="category"], [data-testid*="project"], select[name="category"], select[name="project"], button[aria-label*="category" i], button[aria-label*="project" i]').first();
    await categoryTrigger.click();

    // Wait for dropdown options to appear
    const dropdownOptions = page.locator('[role="option"], [role="listbox"] li, select option');
    await expect(dropdownOptions.first()).toBeVisible();

    // Get visible text from all dropdown options
    const optionsText = await dropdownOptions.allInnerTexts();
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}/i;

    for (const optionText of optionsText) {
      expect(uuidPattern.test(optionText)).toBe(false);
    }
  });

  test('Cancel button closes the modal without saving', async ({ page }) => {
    await page.goto('/tasks');

    const addTaskButton = page.locator('button:has-text("Add Task"), button:has-text("New Task"), button[aria-label*="Add Task"]').first();
    await addTaskButton.click();

    const modal = page.locator('[role="dialog"], [data-testid="task-modal"], .modal').first();
    await expect(modal).toBeVisible();

    // Click Cancel
    const cancelButton = modal.locator('button:has-text("Cancel"), button:has-text("Discard"), button[aria-label*="cancel" i]').first();
    await cancelButton.click();

    // Modal should be gone
    await expect(modal).not.toBeVisible();
  });

  test('Save button is disabled (or shows validation error) when title is empty', async ({ page }) => {
    await page.goto('/tasks');

    const addTaskButton = page.locator('button:has-text("Add Task"), button:has-text("New Task"), button[aria-label*="Add Task"]').first();
    await addTaskButton.click();

    const modal = page.locator('[role="dialog"], [data-testid="task-modal"], .modal').first();
    await expect(modal).toBeVisible();

    // Ensure title is empty (clear if needed)
    const titleInput = modal.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('');

    // Save button should be disabled OR clicking it shows a validation error
    const saveButton = modal.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();

    const isDisabled = await saveButton.isDisabled();
    if (!isDisabled) {
      // If not disabled, clicking should show a validation error
      await saveButton.click();
      const validationError = modal.locator('[role="alert"], .error, [data-testid*="error"], :has-text("required"), :has-text("Title is required")');
      await expect(validationError.first()).toBeVisible();
    } else {
      expect(isDisabled).toBe(true);
    }
  });

  // ---------------------------------------------------------------------------
  // New Project inline form
  // ---------------------------------------------------------------------------

  test('Clicking folder+ icon on /projects opens inline new-project form', async ({ page }) => {
    await page.goto('/projects');

    // Find the "new project" trigger — could be a folder+ icon button or "New Project" button
    const newProjectTrigger = page.locator(
      'button[aria-label*="new project" i], button[aria-label*="add project" i], button[title*="new project" i], button:has-text("New Project"), [data-testid*="new-project"]'
    ).first();
    await expect(newProjectTrigger).toBeVisible();
    await newProjectTrigger.click();

    // Inline form should appear
    const inlineForm = page.locator('form, [data-testid*="project-form"], [role="dialog"]').first();
    await expect(inlineForm).toBeVisible();

    // Project name input
    const nameInput = inlineForm.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="project" i]').first();
    await expect(nameInput).toBeVisible();

    // Emoji picker
    const emojiPicker = inlineForm.locator('[data-testid*="emoji"], button[aria-label*="emoji" i], input[name="emoji"], [class*="emoji"]').first();
    await expect(emojiPicker).toBeVisible();

    // Color picker
    const colorPicker = inlineForm.locator('[data-testid*="color"], input[type="color"], input[name="color"], button[aria-label*="color" i], [class*="color-picker"]').first();
    await expect(colorPicker).toBeVisible();

    // Create button
    const createButton = inlineForm.locator('button:has-text("Create"), button[type="submit"]').first();
    await expect(createButton).toBeVisible();
  });
});
