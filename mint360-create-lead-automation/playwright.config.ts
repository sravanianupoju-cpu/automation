import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL ?? 'https://qa.mint360.in/';
const AUTH_FILE = 'playwright/.auth/user.json';

export default defineConfig({
  testDir: './tests',

  // Test cases must remain independent (each creates its own lead with fresh
  // random data), but they share one authenticated session and the app's
  // "create-lead" flow is stateful/sequential in the UI, so we keep a single
  // worker by default to avoid flakiness from concurrent form state.
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    // Capture diagnostics only on failure, as required.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      // Runs once, logs in via the real UI (including the cross-origin AWS
      // Cognito Hosted UI redirect) and persists storage state to disk so
      // the other projects/tests can reuse the authenticated session
      // instead of logging in for every test.
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
      testMatch: /.*\.spec\.ts/,
    },
  ],
});
