/**
 * Global setup for E2E tests.
 * Creates test users and seeds test data.
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const baseURL = config.webServer?.url || 'http://localhost:3000';
  
  console.log('🔧 Setting up test environment...');
  console.log(`📍 Base URL: ${baseURL}`);
  
  // Create test users via API
  const testUsers = [
    {
      email: 'e2e-test-free@example.com',
      password: 'Test1234!',
      full_name: 'E2E Free User',
      plan: 'free',
    },
    {
      email: 'e2e-test-pro@example.com',
      password: 'Test1234!',
      full_name: 'E2E Pro User',
      plan: 'pro',
    },
    {
      email: 'e2e-test-premium@example.com',
      password: 'Test1234!',
      full_name: 'E2E Premium User',
      plan: 'premium',
    },
  ];
  
  // Register test users
  for (const user of testUsers) {
    try {
      const response = await fetch(`${baseURL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      
      if (response.ok || response.status === 400) {
        console.log(`✅ Test user ready: ${user.email}`);
      } else {
        console.warn(`⚠️  Failed to create test user: ${user.email}`);
      }
    } catch (error) {
      console.warn(`⚠️  Error creating test user ${user.email}:`, error);
    }
  }
  
  // Save test user credentials to environment
  process.env.E2E_TEST_USER_FREE = testUsers[0].email;
  process.env.E2E_TEST_USER_PRO = testUsers[1].email;
  process.env.E2E_TEST_USER_PREMIUM = testUsers[2].email;
  process.env.E2E_TEST_PASSWORD = 'Test1234!';
  
  console.log('✅ Test environment setup complete');
}

export default globalSetup;
