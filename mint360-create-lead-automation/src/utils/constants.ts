/**
 * Verified application constants.
 *
 * IMPORTANT: The "Stage" <select> on the Create Lead > Contact tab renders
 * its <option> elements with an empty visible/accessible label in the DOM
 * (confirmed by live inspection with Playwright MCP — the accessibility
 * snapshot showed blank option text for every stage). The real, selectable
 * `value` attributes below were extracted directly from the DOM via
 * `element.options` and confirmed by submitting a lead end-to-end for each
 * stage. Do NOT rely on the visible option text for these — use these exact
 * value strings with `selectOption(value)`.
 */
export enum LeadStage {
  Leads = '12:Leads',
  SiteVisitAssigned = '8:Site Visit Assigned',
  BookingOpportunity = '9:Booking Opportunity',
  Booking = '10:Booking',
  BookingDrop = '11:Booking Drop',
}

/** Human-readable label shown in the Stage dropdown, used only for test titles/logging. */
export const LEAD_STAGE_LABEL: Record<LeadStage, string> = {
  [LeadStage.Leads]: 'Leads',
  [LeadStage.SiteVisitAssigned]: 'SV Assigned',
  [LeadStage.BookingOpportunity]: 'Booking Opportunity',
  [LeadStage.Booking]: 'Booking',
  [LeadStage.BookingDrop]: 'Booking Drop',
};

export const ROUTES = {
  createLead: '#/sales/create-lead',
  dashboard: '#/sales/dashboard',
};

/**
 * A project that was confirmed present in the "Project" dropdown during
 * inspection. TODO: verify this project remains present/active in the QA
 * environment's master data if this suite starts failing at the Contact
 * step — project lists are environment/master-data-driven.
 */
export const PROJECT_NAME = 'Red Field';

/** Values confirmed present in the "Lead" tab dropdowns for the above project. */
export const LEAD_DETAILS_DEFAULTS = {
  baseLeadSource: 'Online',
  leadSource: 'Affiliate',
  leadType: 'Calls',
  buyReason: 'End Use',
};

/** Values confirmed present in the "Personal" tab dropdowns. */
export const PERSONAL_DETAILS_DEFAULTS = {
  ageGroup: '25-30',
  city: 'Chennai',
  fund: 'Loan',
};

/** Values confirmed present in the "Specifications / Professional" tab. */
export const PROFESSIONAL_DETAILS_DEFAULTS = {
  residentialStatus: 'Own House',
  occupation: 'Private Job',
};

/** Values confirmed present in the "Booking" tab (Stage = Booking only). */
export const BOOKING_DETAILS_DEFAULTS = {
  bookingMode: 'Online',
};
