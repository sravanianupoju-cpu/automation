import { Page } from '@playwright/test';
import { CognitoLoginPage } from './CognitoLoginPage';

/**
 * Page Object for the application's own entry point
 * (https://qa.mint360.in/#/auth/signin).
 *
 * This application does NOT implement its own credential form — clicking
 * "Sign In" simply triggers a redirect to a third-party Identity Provider
 * (AWS Cognito Hosted UI) on a completely different origin. This class is
 * therefore deliberately scoped to what happens on the app's own origin
 * only: loading the landing page, clicking "Sign In", and confirming the
 * return trip back to the app's dashboard once the IdP hands control back.
 *
 * It never assumes the third-party page's origin, DOM, or locators — that
 * page is modeled explicitly and separately in CognitoLoginPage.ts, since
 * it is a genuinely different application on a different domain, not a
 * sub-section of this one.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  private readonly signInButton = this.page.getByRole('button', { name: /Sign In/i });

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /** Clicks "Sign In", which hands off control to the third-party Identity Provider on a different origin. */
  async clickSignIn(): Promise<void> {
    await this.signInButton.click();
  }

  /**
   * Full login flow across both origins:
   *  1. Trigger the handoff from the app's own origin to the third-party IdP.
   *  2. Explicitly wait for and authenticate on the IdP's page (CognitoLoginPage),
   *     never assuming it shares this app's domain or DOM.
   *  3. Wait for control to return to this app's own dashboard route.
   */
  async login(email: string, password: string): Promise<void> {
    await this.clickSignIn();

    const identityProviderLoginPage = new CognitoLoginPage(this.page);
    await identityProviderLoginPage.waitUntilLoaded();
    await identityProviderLoginPage.authenticate(email, password);

    // Control returns to the app's own origin here.
    await this.page.waitForURL(/#\/sales\/dashboard/, { timeout: 30_000 });
  }
}
