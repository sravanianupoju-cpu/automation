import { Page } from '@playwright/test';

/**
 * Page Object for the persistent left sidebar navigation, present on every
 * authenticated /sales/* route.
 */
export class SidebarNav {
  constructor(private readonly page: Page) {}

  private readonly createLeadLink = this.page.getByRole('link', { name: 'Create lead' });
  private readonly overviewLink = this.page.getByRole('link', { name: 'Overview' });
  private readonly myLeadsLink = this.page.getByRole('link', { name: 'My Leads' });

  async goToCreateLead() {
    await this.createLeadLink.click();
    await this.page.waitForURL(/#\/sales\/create-lead/);
  }

  async goToOverview() {
    await this.overviewLink.click();
    await this.page.waitForURL(/#\/sales\/dashboard/);
  }

  async goToMyLeads() {
    await this.myLeadsLink.click();
    await this.page.waitForURL(/#\/sales\/lead-list/);
  }
}
