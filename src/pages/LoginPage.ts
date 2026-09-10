import { Page } from '@playwright/test';

/**
 * Page Object for authentication.
 *
 * Confirmed via live inspection: clicking "Sign In" on qa.mint360.in
 * redirects the browser to a different origin — an AWS Cognito Hosted UI
 * (*.amazoncognito.com) — where the actual email/password form lives.
 * After successful submission, Cognito redirects back to
 * qa.mint360.in/#/sales/dashboard. Playwright follows cross-origin
 * navigations within the same page/tab automatically, so a single Page
 * object can drive both steps.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  // ---- qa.mint360.in landing page ----
  private readonly signInButton = this.page.getByRole('button', { name: /Sign In/i });

  // ---- AWS Cognito Hosted UI (cross-origin) ----
  private readonly cognitoEmailInput = this.page.getByRole('textbox', { name: 'name@host.com' });
  private readonly cognitoPasswordInput = this.page.getByRole('textbox', { name: 'Password' });
  private readonly cognitoSubmitButton = this.page.getByRole('button', { name: 'submit' });

  async goto() {
    await this.page.goto('/');
  }

  async login(email: string, password: string) {
    await this.signInButton.click();

    // Cross-origin redirect to the Cognito Hosted UI happens here.
    await this.cognitoEmailInput.waitFor({ state: 'visible' });
    await this.cognitoEmailInput.fill(email);
    await this.cognitoPasswordInput.fill(password);
    await this.cognitoSubmitButton.click();

    // Cognito redirects back to the app's dashboard route on success.
    await this.page.waitForURL(/#\/sales\/dashboard/, { timeout: 30_000 });
  }
}
