/**
 * Quick Playwright verification test.
 * 
 * This test verifies that Playwright is correctly installed
 * and can launch a browser. Run this before running full E2E tests.
 * 
 * Usage:
 *   npx playwright test quick-verify.spec.ts
 */

import { test, expect } from '@playwright/test';

test('Playwright is working - can open browser', async ({ page }) => {
  // Navigate to a simple external site to verify browser works
  await page.goto('https://example.com');
  
  // Verify page loaded
  await expect(page).toHaveTitle(/Example Domain/);
  
  // Take screenshot to prove it worked
  await page.screenshot({ path: 'screenshots/verify-playwright.png' });
  
  console.log('✅ Playwright is working correctly!');
  console.log('📸 Screenshot saved to: screenshots/verify-playwright.png');
});

test('Can navigate to localhost if app is running', async ({ page }) => {
  // Try to connect to local app
  try {
    await page.goto('http://localhost:3000', { 
      timeout: 5000,
      waitUntil: 'domcontentloaded' 
    });
    
    // If we get here, app is running
    const title = await page.title();
    console.log(`✅ App is running with title: ${title}`);
    
    await page.screenshot({ path: 'screenshots/app-running.png' });
  } catch (error) {
    // App not running - that's ok for verification
    console.log('⚠️  App is not running on localhost:3000 (this is ok)');
    console.log('   Start app with: npm run dev');
  }
});
