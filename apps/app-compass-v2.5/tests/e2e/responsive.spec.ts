import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Responsive Design
 * Tests UI across different screen sizes
 */

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

test.describe('Responsive Design', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport });

      test('should render dashboard correctly', async ({ page }) => {
        await page.goto('/dashboard');
        
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
        
        // Take screenshot for visual regression
        await page.screenshot({ 
          path: `test-results/screenshots/dashboard-${viewport.name}.png`,
          fullPage: true 
        });
      });

      test('should render archetype page correctly', async ({ page }) => {
        await page.goto('/onboarding/archetypes');
        
        await expect(page.locator('[data-testid="archetype-card"]')).toHaveCount(12);
        
        await page.screenshot({ 
          path: `test-results/screenshots/archetypes-${viewport.name}.png`,
          fullPage: true 
        });
      });

      test('should render route builder correctly', async ({ page }) => {
        await page.goto('/routes/builder');
        
        await expect(page.locator('[data-testid="category-selector"]')).toBeVisible();
        
        await page.screenshot({ 
          path: `test-results/screenshots/route-builder-${viewport.name}.png`,
          fullPage: true 
        });
      });

      test('should render companion page correctly', async ({ page }) => {
        await page.goto('/companion');
        
        await expect(page.locator('[data-testid="companion-stats"]')).toBeVisible();
        
        await page.screenshot({ 
          path: `test-results/screenshots/companion-${viewport.name}.png`,
          fullPage: true 
        });
      });

      test('should handle navigation', async ({ page }) => {
        await page.goto('/dashboard');
        
        if (viewport.width < 768) {
          // Mobile: hamburger menu
          const menuButton = page.locator('[data-testid="mobile-menu"]');
          if (await menuButton.isVisible()) {
            await menuButton.click();
            await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
          }
        } else {
          // Desktop: sidebar
          await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
        }
      });

      test('should handle text overflow', async ({ page }) => {
        await page.goto('/onboarding/archetypes');
        
        const cards = page.locator('[data-testid="archetype-card"]');
        const firstCard = cards.first();
        
        // Check that text doesn't overflow
        const boundingBox = await firstCard.boundingBox();
        expect(boundingBox).toBeTruthy();
        
        if (boundingBox) {
          expect(boundingBox.width).toBeLessThanOrEqual(viewport.width);
        }
      });

      test('should handle images correctly', async ({ page }) => {
        await page.goto('/dashboard');
        
        const images = page.locator('img');
        const count = await images.count();
        
        for (let i = 0; i < count; i++) {
          const img = images.nth(i);
          await expect(img).toBeVisible();
          
          // Check that images are loaded
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          expect(naturalWidth).toBeGreaterThan(0);
        }
      });
    });
  }

  test('should support orientation changes', async ({ page, browserName }) => {
    if (browserName !== 'webkit') return; // iOS specific
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    
    // Rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });

  test('should handle zoom levels', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test different zoom levels
    const zoomLevels = [0.5, 1, 1.5, 2];
    
    for (const zoom of zoomLevels) {
      await page.evaluate((z) => {
        document.body.style.zoom = String(z);
      }, zoom);
      
      await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    }
  });
});
