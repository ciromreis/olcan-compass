import { defineConfig, devices } from '@playwright/test';

/**
 * Simple Playwright configuration for verification tests.
 * Does NOT start a web server - just tests browser automation.
 */

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'https://example.com',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
