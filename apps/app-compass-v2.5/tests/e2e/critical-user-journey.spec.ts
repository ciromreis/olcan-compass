/**
 * Critical User Journey Tests
 * 
 * Tests the complete end-to-end user experience:
 * 1. Landing page → Registration
 * 2. OIOS Quiz → Archetype assignment
 * 3. Forge document creation
 * 4. Profile management
 * 
 * These tests simulate real user behavior and provide insights
 * into UX issues before actual users encounter them.
 */

import { test, expect } from '@playwright/test';

test.describe('Critical User Journey - Complete Flow', () => {
  test('should complete full user journey from signup to first document', async ({ page }) => {
    const journeyStartTime = Date.now();
    const journeySteps: { step: string; time: number }[] = [];
    
    // Helper to track journey steps
    const trackStep = (step: string) => {
      journeySteps.push({
        step,
        time: Date.now() - journeyStartTime,
      });
      console.log(`📍 Step: ${step} (${Date.now() - journeyStartTime}ms)`);
    };

    // ============================================================
    // STEP 1: Landing Page
    // ============================================================
    trackStep('Navigate to homepage');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify landing page loads
    await expect(page).toHaveTitle(/Olcan Compass/);
    await expect(page.locator('text=Get Started')).toBeVisible();
    
    const landingLoadTime = Date.now() - journeyStartTime;
    expect(landingLoadTime).toBeLessThan(3000); // < 3 seconds
    
    trackStep('Landing page loaded');

    // ============================================================
    // STEP 2: Registration
    // ============================================================
    trackStep('Start registration');
    await page.click('text=Get Started');
    await page.waitForURL(/.*register/);
    
    // Fill registration form
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="full_name"]', 'E2E Test User');
    
    trackStep('Submit registration');
    await page.click('button[type="submit"]');
    
    // Wait for successful registration
    await page.waitForURL(/.*dashboard|.*verify-email|.*quiz/, { timeout: 10000 });
    
    const registrationTime = Date.now() - journeyStartTime;
    expect(registrationTime).toBeLessThan(120000); // < 2 minutes
    
    trackStep('Registration complete');

    // ============================================================
    // STEP 3: OIOS Quiz
    // ============================================================
    trackStep('Navigate to quiz');
    
    // If on verify-email page, skip to quiz (assuming email auto-verified in test mode)
    if (page.url().includes('verify-email')) {
      await page.goto('/quiz');
    }
    
    await page.waitForURL(/.*quiz/);
    await expect(page.locator('[data-testid="quiz-question"]')).toBeVisible();
    
    // Answer all 12 questions
    trackStep('Start answering quiz questions');
    for (let i = 1; i <= 12; i++) {
      // Select answer (vary answers to test different paths)
      const answer = ((i - 1) % 5) + 1;
      await page.click(`[data-testid="question-${i}-option-${answer}"]`);
      
      // Verify answer is selected
      await expect(page.locator(`[data-testid="question-${i}-option-${answer}"]`)).toHaveClass(/selected/);
      
      // Click next (except for last question)
      if (i < 12) {
        await page.click('text=Next');
        await page.waitForTimeout(300);
      }
    }
    
    // Submit quiz
    trackStep('Submit quiz');
    await page.click('text=Submit');
    
    // Wait for results
    await page.waitForURL(/.*results|.*archetype|.*dashboard/, { timeout: 15000 });
    
    // Verify archetype assigned
    const archetypeElement = page.locator('[data-testid="archetype-result"], [data-testid="archetype-name"]');
    await expect(archetypeElement).toBeVisible({ timeout: 10000 });
    
    const archetypeName = await archetypeElement.textContent();
    console.log(`🎯 Assigned archetype: ${archetypeName}`);
    
    const quizTime = Date.now() - journeyStartTime;
    expect(quizTime).toBeLessThan(300000); // < 5 minutes
    
    trackStep('Quiz complete - Archetype assigned');

    // ============================================================
    // STEP 4: Dashboard Exploration
    // ============================================================
    trackStep('Navigate to dashboard');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify dashboard elements
    await expect(page.locator('text=Welcome')).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    
    trackStep('Dashboard loaded');

    // ============================================================
    // STEP 5: Create First Forge Document
    // ============================================================
    trackStep('Navigate to Forge');
    await page.click('text=Forge');
    await page.waitForURL(/.*forge/);
    
    // Create new document
    await page.click('text=Create Document');
    await page.waitForURL(/.*forge.*new|.*forge.*create/);
    
    // Fill document content
    await page.fill('textarea[name="content"], [data-testid="document-content"]', 
      'This is a test document for the OIOS career development platform. ' +
      'I want to improve my career trajectory and discover my professional archetype.'
    );
    
    trackStep('Submit document for polishing');
    await page.click('button[type="submit"], text=Polish');
    
    // Wait for polish to complete
    await page.waitForSelector('[data-testid="polish-complete"], text=Polish Complete', { timeout: 30000 });
    
    // Verify polished content
    const polishedContent = await page.locator('[data-testid="polished-content"]').textContent();
    expect(polishedContent).toBeTruthy();
    expect(polishedContent?.length).toBeGreaterThan(50);
    
    const forgeTime = Date.now() - journeyStartTime;
    expect(forgeTime).toBeLessThan(180000); // < 3 minutes
    
    trackStep('Document polished successfully');

    // ============================================================
    // STEP 6: Profile Management
    // ============================================================
    trackStep('Navigate to profile');
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Profile');
    await page.waitForURL(/.*profile/);
    
    // Verify profile information
    await expect(page.locator('text=E2E Test User')).toBeVisible();
    await expect(page.locator(`text=${testEmail}`)).toBeVisible();
    
    trackStep('Profile verified');

    // ============================================================
    // JOURNEY COMPLETE
    // ============================================================
    const totalJourneyTime = Date.now() - journeyStartTime;
    
    console.log('\n🎉 User Journey Complete!');
    console.log('📊 Journey Summary:');
    journeySteps.forEach(step => {
      console.log(`  ${step.step}: ${step.time}ms`);
    });
    console.log(`\n⏱️  Total time: ${totalJourneyTime}ms (${(totalJourneyTime / 1000).toFixed(1)}s)`);
    
    // Assertions
    expect(totalJourneyTime).toBeLessThan(600000); // < 10 minutes total
    
    // Take final screenshot
    await page.screenshot({ 
      path: `screenshots/journey-complete-${Date.now()}.png`,
      fullPage: true,
    });
  });

  test('should handle errors gracefully during registration', async ({ page }) => {
    await page.goto('/register');
    
    // Test invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="full_name"]', 'Test User');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid email')).toBeVisible({ timeout: 5000 });
    
    // Test weak password
    await page.fill('input[name="email"]', 'valid@example.com');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Password')).toBeVisible({ timeout: 5000 });
    
    // Test empty fields
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="password"]', '');
    await page.fill('input[name="full_name"]', '');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Required')).toBeVisible({ timeout: 5000 });
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Start registration
    await page.goto('/register');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="full_name"]', 'Test User');
    
    // Navigate away
    await page.goto('/');
    
    // Return to registration
    await page.goto('/register');
    
    // Form should be cleared (security best practice)
    const emailValue = await page.inputValue('input[name="email"]');
    expect(emailValue).toBe('');
  });
});
