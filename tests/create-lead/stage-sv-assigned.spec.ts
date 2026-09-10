import { test, expect } from '../../src/fixtures/fixtures';
import { LeadStage, PROJECT_NAME, LEAD_DETAILS_DEFAULTS } from '../../src/utils/constants';
import { randomIndianMobileNumber, uniqueLeadName } from '../../src/utils/test-data';

/**
 * Verified flow (Stage = SV Assigned):
 * Contact tab -> Next -> Lead tab -> Next -> Site Visit detail tab (no
 * mandatory fields) -> Submit -> "Lead saved successfully".
 */
test.describe('Create Lead - Stage: SV Assigned', () => {
  test('creates a lead with Stage = SV Assigned using only mandatory fields', async ({ createLeadPage }) => {
    const mobileNumber = randomIndianMobileNumber();
    const leadName = uniqueLeadName('AutoSVAssign');

    await test.step('Navigate to Create Lead page', async () => {
      await createLeadPage.open();
    });

    await test.step('Fill mandatory Contact details and select Stage = SV Assigned', async () => {
      await createLeadPage.fillContactDetails({
        name: leadName,
        mobileNumber,
        project: PROJECT_NAME,
        stage: LeadStage.SiteVisitAssigned,
      });
      await createLeadPage.assertNoDuplicateLeadWarning();
    });

    await test.step('Proceed to the Lead tab', async () => {
      await createLeadPage.clickNext();
    });

    await test.step('Fill mandatory Lead details (Buy Reason must be selected explicitly)', async () => {
      await createLeadPage.fillLeadDetails(LEAD_DETAILS_DEFAULTS);
    });

    await test.step('Proceed to the Site Visit detail tab and submit the lead', async () => {
      await createLeadPage.clickNext();
      await createLeadPage.clickSubmit();
    });

    await test.step('Verify the lead was saved successfully', async () => {
      await createLeadPage.expectLeadSavedSuccessfully();
      await createLeadPage.closeResultDialog();
    });
  });
});
