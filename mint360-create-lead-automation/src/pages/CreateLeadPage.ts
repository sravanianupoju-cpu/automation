import { Page, Locator, expect } from '@playwright/test';
import { LeadStage } from '../utils/constants';

export interface ContactDetails {
  name: string;
  /** Defaults to 'India' if not supplied. */
  country?: string;
  mobileNumber: string;
  project: string;
  /** Optional field — not marked mandatory on the form. */
  email?: string;
  stage: LeadStage;
}

export interface LeadDetails {
  baseLeadSource: string;
  /** Options are populated dynamically based on baseLeadSource — pick a value that exists for the chosen source. */
  leadSource: string;
  leadType: string;
  buyReason: string;
}

export interface PersonalDetails {
  ageGroup: string;
  city: string;
  fund: string;
}

export interface ProfessionalDetails {
  currentLocation: string;
  residentialStatus: string;
  industry: string;
  company: string;
  occupation: string;
}

export interface BookingDetails {
  bookingName: string;
  bookingMode: string;
  bookingAmount: string;
  actualSize: string;
  unitNo: string;
}

/**
 * Page Object for the multi-step "Create Lead" wizard
 * (#/sales/create-lead).
 *
 * ---------------------------------------------------------------------
 * Locator strategy note (read before adding new locators):
 *
 * This application does not expose `data-testid` attributes anywhere on
 * the Create Lead form, and every field's visible label is a plain
 * sibling <div>/<p> rather than a real <label for="..."> element — so
 * `getByLabel()` cannot reliably target these inputs either.
 *
 * Live DOM inspection (via Playwright MCP) confirmed that every form
 * control instead carries a unique, stable Angular reactive-forms
 * `formcontrolname` attribute (e.g. `formcontrolname="name"`). That
 * attribute is used here as the primary locator strategy, as the closest
 * available equivalent to a `data-testid` hook. Buttons and dialogs, which
 * DO have accessible roles/text, use `getByRole` / `getByText` as
 * preferred.
 * ---------------------------------------------------------------------
 */
export class CreateLeadPage {
  constructor(private readonly page: Page) {}

  // ---- Contact tab ----
  private readonly nameInput: Locator = this.page.locator('[formcontrolname="name"]');
  private readonly countrySelect: Locator = this.page.locator('[formcontrolname="country"]');
  private readonly mobileInput: Locator = this.page.locator('[formcontrolname="contact"]');
  private readonly projectSelect: Locator = this.page.locator('[formcontrolname="project"]');
  private readonly emailInput: Locator = this.page.locator('[formcontrolname="email"]');
  private readonly stageSelect: Locator = this.page.locator('[formcontrolname="stage"]');

  // ---- Lead tab ----
  private readonly baseLeadSourceSelect: Locator = this.page.locator('[formcontrolname="base_lead_source"]');
  private readonly leadSourceSelect: Locator = this.page.locator('[formcontrolname="lead_source"]');
  private readonly leadTypeSelect: Locator = this.page.locator('[formcontrolname="lead_type"]');
  private readonly buyReasonSelect: Locator = this.page.locator('[formcontrolname="buy_reason"]');

  // ---- Personal tab ----
  private readonly ageGroupSelect: Locator = this.page.locator('[formcontrolname="age_group"]');
  private readonly citySelect: Locator = this.page.locator('[formcontrolname="city"]');
  private readonly fundSelect: Locator = this.page.locator('[formcontrolname="fund"]');

  // ---- Specifications / "Professional" tab ----
  // Note: the sidebar list item's accessible name is "Specifications" but
  // its rendered/visible label text is "Professional" — confirmed mismatch.
  private readonly currentLocationInput: Locator = this.page.locator('[formcontrolname="current_location"]');
  private readonly residentialStatusSelect: Locator = this.page.locator(
    '[formcontrolname="current_residential_status"]'
  );
  private readonly industryInput: Locator = this.page.locator('[formcontrolname="industry"]');
  private readonly companyInput: Locator = this.page.locator('[formcontrolname="company"]');
  private readonly occupationSelect: Locator = this.page.locator('[formcontrolname="occupation"]');

  // ---- Booking tab (Stage = Booking only) ----
  private readonly bookingNameInput: Locator = this.page.locator('[formcontrolname="booking_name"]');
  private readonly bookingModeSelect: Locator = this.page.locator('[formcontrolname="booking_mode"]');
  private readonly bookingAmountInput: Locator = this.page.locator('[formcontrolname="booking_amount"]');
  private readonly actualSizeInput: Locator = this.page.locator('[formcontrolname="actual_size"]');
  private readonly unitNoInput: Locator = this.page.locator('[formcontrolname="unit_no"]');

  // ---- Wizard navigation ----
  private readonly nextButton: Locator = this.page.getByRole('button', { name: 'Next' });
  private readonly submitButton: Locator = this.page.getByRole('button', { name: 'Submit' });

  // ---- Result dialogs ----
  private readonly resultDialog: Locator = this.page.getByRole('dialog');
  private readonly successHeading: Locator = this.resultDialog.getByRole('heading', { name: 'SUCCESS' });
  private readonly successMessage: Locator = this.resultDialog.getByText('Lead saved successfully');
  private readonly duplicateWarningHeading: Locator = this.resultDialog.getByRole('heading', { name: 'WARNING!' });
  private readonly dialogCloseButton: Locator = this.resultDialog.locator('.close');

  async open() {
    await this.page.goto('#/sales/create-lead');
    await expect(this.nameInput).toBeVisible();
  }

  async fillContactDetails(details: ContactDetails): Promise<void> {
    await this.nameInput.fill(details.name);

    // Country must be selected explicitly: the Project dropdown stays
    // disabled until Country has an explicit user selection, even though
    // "India" already appears pre-selected (confirmed live).
    await this.countrySelect.selectOption({ label: details.country ?? 'India' });

    await this.mobileInput.fill(details.mobileNumber);
    await this.projectSelect.selectOption({ label: details.project });

    if (details.email) {
      await this.emailInput.fill(details.email);
    }

    // Stage values are opaque IDs (e.g. "12:Leads") confirmed via DOM
    // inspection — see LeadStage in src/utils/constants.ts.
    await this.stageSelect.selectOption(details.stage);
  }

  /** Throws a descriptive error if the "Lead Already exists!" dialog appeared after filling Contact details. */
  async assertNoDuplicateLeadWarning(): Promise<void> {
    const isDuplicateWarningVisible = await this.duplicateWarningHeading.isVisible().catch(() => false);
    if (isDuplicateWarningVisible) {
      const mobile = await this.mobileInput.inputValue();
      throw new Error(
        `"Lead Already exists!" warning appeared for mobile number "${mobile}". ` +
          'The generated mobile number collided with existing QA data — rerun the test to generate a new one.'
      );
    }
  }

  async fillLeadDetails(details: LeadDetails): Promise<void> {
    await this.baseLeadSourceSelect.selectOption({ label: details.baseLeadSource });
    await this.leadSourceSelect.selectOption({ label: details.leadSource });
    await this.leadTypeSelect.selectOption({ label: details.leadType });

    // Buy Reason must be selected explicitly on every stage. Confirmed live:
    // its apparent default pre-selection is not reliably applied, and
    // leaving it untouched can block the "Next" transition with a
    // "Please select buy reason" validation error.
    await this.buyReasonSelect.selectOption({ label: details.buyReason });
  }

  async fillPersonalDetails(details: PersonalDetails): Promise<void> {
    await this.ageGroupSelect.selectOption({ label: details.ageGroup });
    await this.citySelect.selectOption({ label: details.city });
    await this.fundSelect.selectOption({ label: details.fund });
  }

  async fillProfessionalDetails(details: ProfessionalDetails): Promise<void> {
    await this.currentLocationInput.fill(details.currentLocation);
    await this.residentialStatusSelect.selectOption({ label: details.residentialStatus });
    await this.industryInput.fill(details.industry);
    await this.companyInput.fill(details.company);
    await this.occupationSelect.selectOption({ label: details.occupation });
  }

  async fillBookingDetails(details: BookingDetails): Promise<void> {
    await this.bookingNameInput.fill(details.bookingName);
    await this.bookingModeSelect.selectOption({ label: details.bookingMode });
    await this.bookingAmountInput.fill(details.bookingAmount);
    await this.actualSizeInput.fill(details.actualSize);
    await this.unitNoInput.fill(details.unitNo);
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async expectLeadSavedSuccessfully(): Promise<void> {
    await expect(this.successHeading).toBeVisible();
    await expect(this.successMessage).toBeVisible();
  }

  async closeResultDialog(): Promise<void> {
    await this.dialogCloseButton.click();
    await expect(this.resultDialog).toBeHidden();
  }
}
