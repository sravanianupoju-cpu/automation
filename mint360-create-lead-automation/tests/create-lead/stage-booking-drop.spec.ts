import { test, expect } from '../../src/fixtures/fixtures';
import {
  LeadStage,
  PROJECT_NAME,
  LEAD_DETAILS_DEFAULTS,
  PERSONAL_DETAILS_DEFAULTS,
  PROFESSIONAL_DETAILS_DEFAULTS,
} from '../../src/utils/constants';
import { randomIndianMobileNumber, uniqueLeadName } from '../../src/utils/test-data';

/**
 * Verified flow (Stage = Booking Drop):
 * Contact -> Next -> Lead -> Next -> Personal -> Next ->
 * Specifications ("Professional") -> Next -> Property (no mandatory
 * fields) -> Submit -> "Lead saved successfully".
 *
 * Confirmed identical tab sequence and mandatory-field set to Booking
 * Opportunity (no separate "Booking Drop" tab appears).
 */
test.describe('Create Lead - Stage: Booking Drop', () => {
  test('creates a lead with Stage = Booking Drop using only mandatory fields', async ({ createLeadPage }) => {
    const mobileNumber = randomIndianMobileNumber();
    const leadName = uniqueLeadName('AutoBookDrop');

    await test.step('Navigate to Create Lead page', async () => {
      await createLeadPage.open();
    });

    await test.step('Fill mandatory Contact details and select Stage = Booking Drop', async () => {
      await createLeadPage.fillContactDetails({
        name: leadName,
        mobileNumber,
        project: PROJECT_NAME,
        stage: LeadStage.BookingDrop,
      });
      await createLeadPage.assertNoDuplicateLeadWarning();
    });

    await test.step('Proceed to the Lead tab', async () => {
      await createLeadPage.clickNext();
    });

    await test.step('Fill mandatory Lead details', async () => {
      await createLeadPage.fillLeadDetails(LEAD_DETAILS_DEFAULTS);
    });

    await test.step('Proceed to the Personal tab', async () => {
      await createLeadPage.clickNext();
    });

    await test.step('Fill mandatory Personal details (Age Group, City, Fund)', async () => {
      await createLeadPage.fillPersonalDetails(PERSONAL_DETAILS_DEFAULTS);
    });

    await test.step('Proceed to the Specifications (Professional) tab', async () => {
      await createLeadPage.clickNext();
    });

    await test.step('Fill mandatory Professional details', async () => {
      await createLeadPage.fillProfessionalDetails({
        currentLocation: 'Chennai',
        industry: 'IT Services',
        company: 'Adglobal360',
        ...PROFESSIONAL_DETAILS_DEFAULTS,
      });
    });

    await test.step('Proceed to the Property tab and submit the lead', async () => {
      await createLeadPage.clickNext();
      await createLeadPage.clickSubmit();
    });

    await test.step('Verify the lead was saved successfully', async () => {
      await createLeadPage.expectLeadSavedSuccessfully();
      await createLeadPage.closeResultDialog();
    });
  });
});
