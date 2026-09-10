import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SidebarNav } from '../pages/SidebarNav';
import { CreateLeadPage } from '../pages/CreateLeadPage';

type Fixtures = {
  loginPage: LoginPage;
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

  sidebarNav: async ({ page }, use) => {
    await use(new SidebarNav(page));
  },

  createLeadPage: async ({ page }, use) => {
    await use(new CreateLeadPage(page));
  },
});

export { expect };
