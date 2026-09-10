import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CognitoLoginPage } from '../pages/CognitoLoginPage';
import { SidebarNav } from '../pages/SidebarNav';
import { CreateLeadPage } from '../pages/CreateLeadPage';

type Fixtures = {
  loginPage: LoginPage;
  /** Page Object for the third-party AWS Cognito Hosted UI (separate origin). Exposed for tests that need to interact with the IdP directly (e.g. negative-auth scenarios). */
  cognitoLoginPage: CognitoLoginPage;
  sidebarNav: SidebarNav;
  createLeadPage: CreateLeadPage;
};

/**
 * Extends the base Playwright test with ready-to-use Page Object instances,
 * so spec files never have to instantiate page objects manually.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  cognitoLoginPage: async ({ page }, use) => {
    await use(new CognitoLoginPage(page));
  },

  sidebarNav: async ({ page }, use) => {
    await use(new SidebarNav(page));
  },

  createLeadPage: async ({ page }, use) => {
    await use(new CreateLeadPage(page));
  },
});

export { expect };
