import { Page, expect } from '@playwright/test';

/**
 * Page Object for the third-party Identity Provider login screen.
 *
 * The application under test (qa.mint360.in) does NOT render its own
 * credential form. Clicking "Sign In" redirects the browser to an AWS
 * Cognito Hosted UI on a completely different origin — confirmed live:
 * `https://<pool-domain>.auth.<region>.amazoncognito.com/login?...`.
 *
 * This is modeled as its own Page Object, separate from `LoginPage`,
 * because it is genuinely a different application on a different domain
 * with its own DOM — not a section of qa.mint360.in.
 *
 * Explicit cross-origin handling:
 *  - `waitUntilLoaded()` waits for the actual browser URL to match the IdP
 *    origin pattern before touching any locators. We never assume the
 *    hosted UI has "already loaded" just because `signInButton.click()`
 *    resolved, and we never assume it lives on the app's origin.
 *  - No method here uses `page.goto()` with a relative path. `baseURL`
 *    (configured in playwright.config.ts) points at the application's own
 *    origin and must never be applied to this page.
 *  - The Cognito domain itself is environment/tenant-specific, so the
 *    matcher is overridable via the `IDP_URL_PATTERN` env var instead of
 *    being hard-coded to one Cognito pool's exact hostname.
 */
export class CognitoLoginPage {
  /** Matches any AWS Cognito Hosted UI domain; override per-environment via IDP_URL_PATTERN. */
  static readonly IDP_URL_PATTERN: RegExp = process.env.IDP_URL_PATTERN
    ? new RegExp(process.env.IDP_URL_PATTERN)
    : /\.amazoncognito\.com\//;

  constructor(private readonly page: Page) {}

  private readonly emailInput = this.page.getByRole('textbox', { name: 'name@host.com' });
  private readonly passwordInput = this.page.getByRole('textbox', { name: 'Password' });
  private readonly submitButton = this.page.getByRole('button', { name: 'submit' });

  /**
   * Waits for the browser to actually navigate to the identity provider's
   * origin, then waits for its email field to render. This is the explicit
   * cross-origin handoff point — the app and the IdP are two separate
   * origins, and the redirect is not assumed to be instantaneous.
   */
  async waitUntilLoaded(): Promise<void> {
    await this.page.waitForURL(CognitoLoginPage.IDP_URL_PATTERN, { timeout: 30_000 });
    await expect(this.page).toHaveURL(CognitoLoginPage.IDP_URL_PATTERN);
    await expect(this.emailInput).toBeVisible();
  }

  /** Fills credentials and submits the third-party hosted login form. */
  async authenticate(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
