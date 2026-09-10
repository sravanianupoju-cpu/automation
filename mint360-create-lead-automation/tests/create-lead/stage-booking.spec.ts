import { test, expect } from '../../src/fixtures/fixtures';
import {
  LeadStage,
  PROJECT_NAME,
  LEAD_DETAILS_DEFAULTS,
  PERSONAL_DETAILS_DEFAULTS,
  PROFESSIONAL_DETAILS_DEFAULTS,
  BOOKING_DETAILS_DEFAULTS,
} from '../../src/utils/constants';
import { randomIndianMobileNumber, uniqueLeadName, randomAmount, randomUnitNo } from '../../src/utils/test-data';

/**
 * Verified flow (Stage = Booking):
 * Contact -> Next -> Lead -> Next -> Personal -> Next ->
 * Specifications ("Professional") -> Next -> Property -> Next ->
 * Booking -> Submit -> "Lead saved successfully".
 *
 * This is the only stage that surfaces the extra "Booking" tab
 * (Booking Name, Booking Mode, Booking Amount, Actual Size, Unit No).
 */
test.describe('Create Lead - Stage: Booking', () => {
  test('creates a lead with Stage = Booking using only mandatory fields', async ({ createLeadPage }) => {
    const mobileNumber = randomIndianMobileNumber();
    const leadName = uniqueLeadName('AutoBooking');

    await test.step('Navigate to Create Lead page', async () => {
      await createLeadPage.open();
    });

    await test.step('Fill mandatory Contact details and select Stage = Booking', async () => {
      await createLeadPage.fillContactDetails({
        name: leadName,
        mobileNumber,
        project: PROJECT_NAME,
        stage: LeadStage.Booking,
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

    await test.step('Proceed to the Property tab', async () => {
      await createLeadPage.clickNext();
    });

    await test.step('Proceed to the Booking tab (no mandatory Property fields)', async () => {
      await createLeadPage.clickNext();
    });

    await test.step('Fill mandatory Booking details', async () => {
      await createLeadPage.fillBookingDetails({
        bookingName: uniqueLeadName('AutoBookingUnit'),
        bookingAmount: randomAmount(),
        actualSize: '1200',
        unitNo: randomUnitNo(),
        ...BOOKING_DETAILS_DEFAULTS,
      });
    });

    await test.step('Submit the lead', async () => {
      await createLeadPage.clickSubmit();
    });

    await test.step('Verify the lead was saved successfully', async () => {
      await createLeadPage.expectLeadSavedSuccessfully();
      await createLeadPage.closeResultDialog();
    });
  });
});
