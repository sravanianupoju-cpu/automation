// @ts-ignore Playwright is provided by the test runner in the execution environment.
import { test as setup, expect, type Page } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

const AUTH_FILE = 'playwright/.auth/user.json';

/**
 * Runs once before the "chromium" project's tests (see playwright.config.ts
 * `dependencies`). Performs a real login — including the cross-origin
 * redirect to the AWS Cognito Hosted UI — and persists the resulting
 * storage state (cookies + localStorage on qa.mint360.in) to disk, so every
 * test reuses the authenticated session instead of logging in again.
 *
 * Credentials are read from environment variables (see .env.example) and
 * are never hard-coded.
 */
setup('authenticate', async ({ page }: { page: Page }) => {
  const email = process.env.LOGIN_EMAIL;
  const password = process.env.LOGIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'LOGIN_EMAIL and LOGIN_PASSWORD environment variables must be set. ' +
        'Copy .env.example to .env and fill in valid QA credentials.'
    );
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);

  await expect(page).toHaveURL(/#\/sales\/dashboard/);

  await page.context().storageState({ path: AUTH_FILE });
});
