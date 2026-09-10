import { test, expect } from '../../src/fixtures/fixtures';
import { LeadStage, PROJECT_NAME, LEAD_DETAILS_DEFAULTS } from '../../src/utils/constants';
import { randomIndianMobileNumber, uniqueLeadName } from '../../src/utils/test-data';

/**
 * Verified flow (Stage = Leads):
 * Contact tab -> Next -> Lead tab -> Next -> Follow-up tab (no mandatory
 * fields) -> Submit -> "Lead saved successfully".
 */
test.describe('Create Lead - Stage: Leads', () => {
  test('creates a lead with Stage = Leads using only mandatory fields', async ({ createLeadPage }) => {
    const mobileNumber = randomIndianMobileNumber();
    const leadName = uniqueLeadName('AutoLeadsTC1');

    await test.step('Navigate to Create Lead page', async () => {
      await createLeadPage.open();
    });

    await test.step('Fill mandatory Contact details and select Stage = Leads', async () => {
      await createLeadPage.fillContactDetails({
        name: leadName,
        mobileNumber,
        project: PROJECT_NAME,
        stage: LeadStage.Leads,
      });
      await createLeadPage.assertNoDuplicateLeadWarning();
    });

    await test.step('Proceed to the Lead tab', async () => {
      await createLeadPage.clickNext();
    });

    await test.step('Fill mandatory Lead details', async () => {
      await createLeadPage.fillLeadDetails(LEAD_DETAILS_DEFAULTS);
    });

    await test.step('Proceed to the Follow-up tab and submit the lead', async () => {
      await createLeadPage.clickNext();
      await createLeadPage.clickSubmit();
    });

    await test.step('Verify the lead was saved successfully', async () => {
      await createLeadPage.expectLeadSavedSuccessfully();
      await createLeadPage.closeResultDialog();
    });
  });
});
