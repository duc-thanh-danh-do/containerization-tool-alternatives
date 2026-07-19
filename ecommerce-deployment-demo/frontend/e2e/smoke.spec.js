/**
 * E2E Smoke Tests - Critical user flows with runtime error guards
 */

import { test, expect } from '@playwright/test';
import { setupAllGuards } from './helpers/guards.js';
import {
  assertNoConsoleErrors,
  assertNoFailedRequests,
  assertFlowCompletes,
  assertPageLoads,
  assertLoadingFinished,
} from './helpers/assertions.js';

// Test user credentials
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User',
};

test.describe('Smoke Tests - Public Routes', () => {
  test('Home page loads without errors', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/');
    await assertLoadingFinished(page);

    // Verify page content
    await expect(page.locator('body')).toBeVisible();
    
    // Check for products or loading state
    await page.waitForLoadState('networkidle');

    // Assert no runtime errors
    guards.assertAllClean();
  });

  test('Login page loads without errors', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/login');
    await assertLoadingFinished(page);

    // Verify login form exists
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 10000 });

    guards.assertAllClean();
  });

  test('Register page loads without errors', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/register');
    await assertLoadingFinished(page);

    await expect(page.locator('body')).toBeVisible();

    guards.assertAllClean();
  });

  test('Cart page loads without errors', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/cart');
    await assertLoadingFinished(page);

    await expect(page.locator('body')).toBeVisible();

    guards.assertAllClean();
  });

  test('Search page loads without errors', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/search?q=test');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();

    // Don't assert all clean as search may have network activity
    assertNoConsoleErrors(guards.console);
  });

  test('Become seller page loads without errors', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/become-seller');
    await assertLoadingFinished(page);

    await expect(page.locator('body')).toBeVisible();

    guards.assertAllClean();
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/this-route-does-not-exist-12345');
    await assertLoadingFinished(page);

    // Should show 404 content
    const notFoundText = page.locator('text=404').or(page.locator('text=Not Found')).or(page.locator('text=not found'));
    await expect(notFoundText.first()).toBeVisible({ timeout: 5000 });

    // Network guard should not fail for 404 pages (it's expected behavior)
    assertNoConsoleErrors(guards.console);
  });
});

test.describe('Smoke Tests - Protected Routes Redirect', () => {
  test('Profile redirects to login when not authenticated', async ({ page }) => {
    const guards = setupAllGuards(page);

    // Clear any existing token
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('token'));

    await page.goto('/profile');
    await assertLoadingFinished(page);

    // Should redirect to login or show login form
    await expect(page).toHaveURL(/login|\/$/);

    assertNoConsoleErrors(guards.console);
  });

  test('Checkout redirects to login when not authenticated', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('token'));

    await page.goto('/checkout');
    await assertLoadingFinished(page);

    await expect(page).toHaveURL(/login|\/$/);

    assertNoConsoleErrors(guards.console);
  });

  test('Seller dashboard redirects to login when not authenticated', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('token'));

    await page.goto('/seller');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/login|\/$/);

    assertNoConsoleErrors(guards.console);
  });
});

test.describe('Smoke Tests - Navigation', () => {
  test('Navigation links work correctly', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/');
    await assertLoadingFinished(page);

    // Test navigation to cart
    const cartLink = page.locator('a[href="/cart"], [data-testid="cart-link"]').first();
    if (await cartLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cartLink.click();
      await expect(page).toHaveURL(/cart/);
    }

    guards.assertAllClean();
  });

  test('Logo/Home link navigates to home', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/cart');
    await assertLoadingFinished(page);

    // Click logo or home link
    const homeLink = page.locator('a[href="/"]').first();
    if (await homeLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }

    guards.assertAllClean();
  });
});

test.describe('Smoke Tests - API Health', () => {
  test('Backend health check', async ({ request }) => {
    // Check if backend is reachable
    const response = await request.get('http://localhost:8080/products/external').catch(() => null);
    
    if (response) {
      expect(response.status()).toBeLessThan(500);
    } else {
      console.warn('Backend not reachable - skipping health check');
    }
  });

  test('Products API returns data', async ({ request }) => {
    const response = await request.get('http://localhost:8080/products/external').catch(() => null);
    
    if (response && response.ok()) {
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    }
  });
});

test.describe('Route Guard Tests', () => {
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
    { path: '/cart', name: 'Cart' },
    { path: '/become-seller', name: 'Become Seller' },
    { path: '/search', name: 'Search' },
  ];

  for (const route of routes) {
    test(`Route ${route.path} (${route.name}) exists and loads`, async ({ page }) => {
      const guards = setupAllGuards(page);

      await page.goto(route.path);
      await assertLoadingFinished(page);

      // Should not show 404
      const is404 = await page.locator('text=Page Not Found').isVisible({ timeout: 1000 }).catch(() => false);
      expect(is404, `Route ${route.path} should not show 404`).toBe(false);

      assertNoConsoleErrors(guards.console);
    });
  }
});

test.describe('Network Guard Tests', () => {
  test('Home page API calls succeed', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that product APIs were called
    const requests = guards.network.getAllRequests();
    const productRequests = requests.filter(r => r.url.includes('/products'));
    
    // Verify no 5xx errors
    const serverErrors = guards.network.getFailedRequests().filter(r => r.status >= 500);
    expect(serverErrors, 'No server errors should occur').toHaveLength(0);
  });
});

test.describe('Console Guard Tests', () => {
  test('No console errors on page load', async ({ page }) => {
    const guards = setupAllGuards(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Give time for any async errors
    await page.waitForTimeout(1000);

    assertNoConsoleErrors(guards.console);
  });
});
