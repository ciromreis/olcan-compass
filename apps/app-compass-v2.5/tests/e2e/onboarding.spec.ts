import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Onboarding Flow
 * Tests archetype selection and companion initialization
 */

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding/archetypes');
  });

  test('should display archetype discovery page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Discover Your Archetype');
    await expect(page.locator('[data-testid="archetype-card"]')).toHaveCount(12);
  });

  test('should filter archetypes by search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Entrepreneur');
    
    await expect(page.locator('[data-testid="archetype-card"]')).toHaveCount(1);
    await expect(page.locator('text=Entrepreneur')).toBeVisible();
  });

  test('should select an archetype', async ({ page }) => {
    const firstCard = page.locator('[data-testid="archetype-card"]').first();
    await firstCard.click();
    
    await expect(firstCard).toHaveClass(/selected/);
    await expect(page.locator('button:has-text("Continue")')).toBeEnabled();
  });

  test('should compare two archetypes', async ({ page }) => {
    const cards = page.locator('[data-testid="archetype-card"]');
    await cards.nth(0).click();
    await cards.nth(1).click();
    
    await page.locator('button:has-text("Compare")').click();
    
    await expect(page.locator('[data-testid="comparison-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="archetype-comparison"]')).toHaveCount(2);
  });

  test('should complete archetype selection and proceed to companion', async ({ page }) => {
    await page.locator('[data-testid="archetype-card"]').first().click();
    await page.locator('button:has-text("Continue")').click();
    
    await expect(page).toHaveURL(/\/onboarding\/companion/);
    await expect(page.locator('h1')).toContainText('Initialize Your Companion');
  });

  test('should initialize companion with custom name', async ({ page }) => {
    // Select archetype first
    await page.locator('[data-testid="archetype-card"]').first().click();
    await page.locator('button:has-text("Continue")').click();
    
    // Initialize companion
    const nameInput = page.locator('input[name="companionName"]');
    await nameInput.fill('TestCompanion');
    
    await page.locator('button:has-text("Create Companion")').click();
    
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=TestCompanion')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) return;
    
    await expect(page.locator('[data-testid="archetype-card"]')).toBeVisible();
    
    // Test mobile navigation
    const menuButton = page.locator('[data-testid="mobile-menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    }
  });

  test('should support dark mode', async ({ page }) => {
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    await darkModeToggle.click();
    
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
