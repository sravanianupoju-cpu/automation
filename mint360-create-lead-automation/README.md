# Mint360 QA — Create Lead Automation (Playwright + TypeScript)

Playwright Test automation, built with the Page Object Model, covering the
"Create Lead" wizard on `https://qa.mint360.in/` for all five lead Stages:

1. **Leads**
2. **SV Assigned**
3. **Booking Opportunity**
4. **Booking**
5. **Booking Drop**

All locators and business rules below were confirmed by live inspection of
the application (via Playwright MCP) before this code was written — nothing
was guessed. See "Verified findings" for details and any remaining
assumptions.

## Project structure

```
mint360-create-lead-automation/
├── playwright.config.ts        # Config: baseURL, trace/video/screenshot on failure, auth setup project
├── tsconfig.json
├── package.json
├── .env.example                 # Copy to .env — never commit real credentials
├── src/
│   ├── pages/
│   │   ├── LoginPage.ts          # App's own origin only: clicks "Sign In", waits for return to dashboard
│   │   ├── CognitoLoginPage.ts   # Third-party AWS Cognito Hosted UI, modeled as its own Page Object (separate origin)
│   │   ├── SidebarNav.ts         # Left navigation menu
│   │   └── CreateLeadPage.ts     # Multi-step Create Lead wizard (all tabs)
│   ├── utils/
│   │   ├── constants.ts          # Verified Stage values, default field values
│   │   └── test-data.ts          # Random mobile number / name / email / amount generators
│   └── fixtures/
│       └── fixtures.ts           # Custom test fixture exposing page objects
└── tests/
    ├── setup/
    │   └── auth.setup.ts         # Logs in once, saves storageState for reuse
    └── create-lead/
        ├── stage-leads.spec.ts
        ├── stage-sv-assigned.spec.ts
        ├── stage-booking-opportunity.spec.ts
        ├── stage-booking.spec.ts
        └── stage-booking-drop.spec.ts
```

## Setup

```bash
npm install
npx playwright install --with-deps chromium
cp .env.example .env   # then fill in BASE_URL / LOGIN_EMAIL / LOGIN_PASSWORD
```

## Running the tests

```bash
npx playwright test                 # all 5 stage tests (auth setup runs first automatically)
npx playwright test --headed        # watch it run
npx playwright test --ui            # interactive UI mode
npx playwright test stage-booking.spec.ts   # a single stage
npx playwright show-report          # open the HTML report after a run
```

The `setup` project (`tests/setup/auth.setup.ts`) always runs first (declared
as a dependency of the `chromium` project in `playwright.config.ts`), logs in
through the real UI — including the cross-origin AWS Cognito Hosted UI
redirect — and saves the authenticated session to
`playwright/.auth/user.json`. Every spec then reuses that session instead of
logging in again, while remaining independent: each test creates its own
lead with freshly randomized data (name, mobile number) so tests can run in
any order or in isolation.

## Third-party authentication (AWS Cognito) — explicit handling

`qa.mint360.in` does not host its own login form. Clicking "Sign In"
redirects the browser to an **AWS Cognito Hosted UI on a completely
different origin** (confirmed live:
`https://<pool-domain>.auth.<region>.amazoncognito.com/login?...`), which
then redirects back to `qa.mint360.in/#/sales/dashboard` on success. This is
modeled explicitly rather than assumed away:

- **`LoginPage.ts`** only knows about the app's own origin — it loads the
  landing page, clicks "Sign In", and waits for control to return to
  `#/sales/dashboard`. It never touches the IdP's locators directly.
- **`CognitoLoginPage.ts`** is a separate Page Object for the third-party
  IdP screen. It never uses `baseURL`-relative navigation (`baseURL` in
  `playwright.config.ts` points at the app's origin, not the IdP's), and it
  explicitly waits for `page.waitForURL(IDP_URL_PATTERN)` — matching the
  real Cognito hostname — before interacting with any field, rather than
  assuming the redirect already landed.
- The Cognito domain is environment/tenant-specific, so the matcher is
  overridable via an `IDP_URL_PATTERN` env var instead of being hard-coded
  to one exact hostname.
- `LoginPage.login()` orchestrates both legs: trigger the handoff → hand
  control to `CognitoLoginPage` on its own origin → wait for the return
  trip. Both classes are also exposed independently via
  `src/fixtures/fixtures.ts` (`loginPage`, `cognitoLoginPage`) for tests
  that need to interact with either origin directly (e.g. future
  negative-authentication test cases).

## Verified findings (from live MCP inspection)
- **Stage dropdown values are opaque IDs**, not the visible label text — the
  `<option>` elements render with an empty accessible/visible label in this
  build. Confirmed by reading `element.options` directly:
  | Stage (visible) | `<option value="...">` |
  |---|---|
  | Leads | `12:Leads` |
  | SV Assigned | `8:Site Visit Assigned` |
  | Booking Opportunity | `9:Booking Opportunity` |
  | Booking | `10:Booking` |
  | Booking Drop | `11:Booking Drop` |
- **No `data-testid` attributes exist anywhere on the form**, and field
  labels are not real `<label for>` elements, so `getByLabel()` is not viable
  for form fields. Every field does carry a stable Angular `formcontrolname`
  attribute, confirmed unique per field — this is used as the primary
  locator strategy for inputs/selects (see the locator-strategy comment at
  the top of `CreateLeadPage.ts`). Buttons and dialogs use `getByRole`.
- **The "Project" dropdown is disabled until "Country" is explicitly
  selected**, even though "India" already appears pre-selected by default.
- **Duplicate mobile numbers are rejected** with a blocking "Lead Already
  exists!" dialog — every test therefore generates a fresh random 10-digit
  mobile number (`randomIndianMobileNumber()`).
- **"Buy Reason" must be explicitly selected on every stage.** Its apparent
  default was observed to not always "stick" — leaving it untouched
  triggered a "Please select buy reason" validation error on at least one
  flow (SV Assigned) during inspection, so all specs select it explicitly.
- **Tab sequence differs by Stage** (all confirmed end-to-end with a real
  "Lead saved successfully" result):
  | Stage | Tabs (in order) |
  |---|---|
  | Leads | Contact → Lead → Follow-up |
  | SV Assigned | Contact → Lead → Site Visit detail |
  | Booking Opportunity | Contact → Lead → Personal → Specifications → Property |
  | Booking | Contact → Lead → Personal → Specifications → Property → Booking |
  | Booking Drop | Contact → Lead → Personal → Specifications → Property |
- **Name field constraints (Contact tab):** `maxlength=20`, and a keydown
  handler restricts input to letters/spaces only. `uniqueLeadName()` in
  `test-data.ts` respects both constraints.
- **The sidebar tab labeled "Specifications"** (accessible name) visibly
  renders as **"Professional"** — a confirmed mismatch worth knowing if you
  extend locators for that tab's heading.

### Known assumption / recommend re-verifying periodically

- `PROJECT_NAME = 'Red Field'` and the specific dropdown option values used
  as test data (e.g. `'Chennai'`, `'Affiliate'`, `'Own House'`) were all
  confirmed present in the QA environment at inspection time. These are
  environment/master-data-driven and could change if QA data is reset —
  if a test starts failing at a `selectOption` step with an "option not
  found" style error, check that the referenced option is still present in
  that environment before assuming a locator regression.

## Notes on failure diagnostics

Per `playwright.config.ts`, on any test failure Playwright automatically
captures a trace, a screenshot, and a video, and the HTML report
(`npx playwright show-report`) lets you step through the trace to see
exactly what happened.
