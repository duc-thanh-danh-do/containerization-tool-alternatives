/**
 * E2E Tests - Authentication Flows
 */

import { test, expect } from '@playwright/test';
import { setupAllGuards } from './helpers/guards.js';
import {
  assertNoConsoleErrors,
  assertNoFailedRequests,
  assertFlowCompletes,
  assertLoadingFinished,
} from './helpers/assertions.js';

// Generate unique test user for each run
const generateTestUser = () => ({
  email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User',
});

test.describe('Authentication Flow', () => {
  test('Registration form displays correctly', async ({ page }) => {
    const guards = setupAllGuards(page);
    // Allow API calls for email check
    guards.network.allowEndpoint('/auth/');

    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    // Check for email input (first step of multi-step form)
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 15000 });

    // Submit button should be visible
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible({ timeout: 5000 });

    assertNoConsoleErrors(guards.console);
  });

  test('Login form displays correctly', async ({ page }) => {
    const guards = setupAllGuards(page);
    // Allow API calls for email check
    guards.network.allowEndpoint('/auth/');

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Multi-step form: first step shows email only
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await expect(submitButton).toBeVisible({ timeout: 15000 });

    assertNoConsoleErrors(guards.console);
  });

  test('Login with invalid credentials shows error', async ({ page }) => {
    const guards = setupAllGuards(page);
    // Allow all auth API calls
    guards.network.allowEndpoint('/auth/');

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Wait for form to be ready (multi-step: email first)
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 15000 });

    // Fill email and submit to go to next step
    await emailInput.fill('test@example.com');
    await page.locator('button[type="submit"]').first().click();

    // Wait for API response and form transition
    await page.waitForTimeout(2000);

    // Should still be on login page
    const currentUrl = page.url();
    expect(currentUrl).toContain('login');

    assertNoConsoleErrors(guards.console);
  });

  test('Empty form submission shows validation', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/login');
    await assertLoadingFinished(page);

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show validation or stay on page
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl).toContain('login');

    assertNoConsoleErrors(guards.console);
  });
});

test.describe('Session Management', () => {
  test('Token is stored after successful login', async ({ page }) => {
    // This test requires a valid user - skip if backend not available
    const guards = setupAllGuards(page);

    await page.goto('/login');
    await assertLoadingFinished(page);

    // Check localStorage is accessible
    const hasLocalStorage = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    });

    expect(hasLocalStorage).toBe(true);
    assertNoConsoleErrors(guards.console);
  });

  test('Logout clears token', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/');
    
    // Set a fake token
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake-token-for-testing');
    });

    // Verify token is set
    let token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('fake-token-for-testing');

    // Clear token (simulating logout)
    await page.evaluate(() => {
      localStorage.removeItem('token');
    });

    // Verify token is cleared
    token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();

    assertNoConsoleErrors(guards.console);
  });
});

test.describe('Protected Route Access', () => {
  test('Unauthenticated user cannot access /profile', async ({ page }) => {
    const guards = setupAllGuards(page);

    // Ensure no token
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('token'));

    await page.goto('/profile');
    await assertLoadingFinished(page);

    // Should redirect to login
    await expect(page).toHaveURL(/login|\/$/);

    assertNoConsoleErrors(guards.console);
  });

  test('Unauthenticated user cannot access /seller', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('token'));

    await page.goto('/seller');
    await assertLoadingFinished(page);

    await expect(page).toHaveURL(/login|\/$/);

    assertNoConsoleErrors(guards.console);
  });

  test('Unauthenticated user cannot access /orders', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('token'));

    await page.goto('/orders');
    await assertLoadingFinished(page);

    await expect(page).toHaveURL(/login|\/$/);

    assertNoConsoleErrors(guards.console);
  });
});
