# E2E Test Suite — Rosie App

Playwright end-to-end tests for [rosie-app-henna.vercel.app](https://rosie-app-henna.vercel.app).

## Running Tests

```bash
# Run all tests (headless)
npx playwright test

# Or via npm script
npm run test:e2e

# Run with interactive UI
npx playwright test --ui
npm run test:e2e:ui

# Run a specific file
npx playwright test e2e/smoke.spec.ts

# Run with verbose output
npx playwright test --reporter=line
```

## Test Credentials

Auth-dependent tests (navigation, tasks) require real Supabase credentials:

```bash
export TEST_EMAIL=your@email.com
export TEST_PASSWORD=yourpassword
npx playwright test
```

Without credentials, auth-gated tests are automatically **skipped** — smoke and visual tests still run.

You can also create a `.env.test` file (gitignored):
```
TEST_EMAIL=your@email.com
TEST_PASSWORD=yourpassword
```

## Test Files

| File | Auth required | Description |
|------|--------------|-------------|
| `smoke.spec.ts` | ❌ No | Login page loads, unauthenticated redirects work |
| `navigation.spec.ts` | ✅ Yes (skipped without creds) | Sidebar nav links, page headings |
| `tasks.spec.ts` | ✅ Yes (skipped without creds) | Kanban board columns, add task, task cards |
| `visual.spec.ts` | ❌ No | Light theme, no dark background |

## The QA Loop

Run these tests **before and after every deploy** to catch regressions:

```bash
# Pre-deploy: run against production
npx playwright test --reporter=line

# After deploy: same command — any new failures = regression caught 🚨
npx playwright test --reporter=line
```

Integrate with CI (GitHub Actions):
```yaml
- run: npx playwright install --with-deps chromium
- run: npx playwright test
  env:
    TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
    TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

## Viewing Reports

After a test run, open the HTML report:
```bash
npx playwright show-report
```

Screenshots on failure are saved to `test-results/`.
