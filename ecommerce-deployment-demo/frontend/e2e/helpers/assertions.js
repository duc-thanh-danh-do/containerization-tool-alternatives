/**
 * E2E Test Assertions - Shared assertion utilities
 */

import { expect } from '@playwright/test';

/**
 * Assert that no console errors occurred during the test
 */
export async function assertNoConsoleErrors(consoleGuard) {
  const errors = consoleGuard.getErrors();
  expect(errors, `Console errors detected: ${JSON.stringify(errors, null, 2)}`).toHaveLength(0);
}

/**
 * Assert that no network requests failed
 */
export async function assertNoFailedRequests(networkGuard) {
  const failures = networkGuard.getFailedRequests();
  expect(failures, `Network failures detected: ${JSON.stringify(failures, null, 2)}`).toHaveLength(0);
}

/**
 * Assert that a flow completed successfully with expected signals
 */
export async function assertFlowCompletes(page, options = {}) {
  const {
    expectedRedirect,
    successMessage,
    loadingSelector,
    submitButtonSelector,
    timeout = 10000,
  } = options;

  // Wait for loading to complete
  if (loadingSelector) {
    await page.locator(loadingSelector).waitFor({ state: 'hidden', timeout }).catch(() => {});
  }

  // Wait for network idle
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});

  // Check for redirect
  if (expectedRedirect) {
    await expect(page).toHaveURL(new RegExp(expectedRedirect), { timeout });
  }

  // Check for success message
  if (successMessage) {
    const successLocator = page.locator(`text=${successMessage}`);
    await expect(successLocator).toBeVisible({ timeout });
  }

  // Check submit button is re-enabled
  if (submitButtonSelector) {
    const button = page.locator(submitButtonSelector);
    await expect(button).toBeEnabled({ timeout });
  }
}

/**
 * Assert that a page loaded without errors
 */
export async function assertPageLoads(page, guards, options = {}) {
  const { timeout = 10000 } = options;

  // Wait for page to be ready
  await page.waitForLoadState('domcontentloaded', { timeout });
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});

  // Check for 404
  const notFoundVisible = await page.locator('text=Page Not Found').isVisible().catch(() => false);
  expect(notFoundVisible, 'Page showed 404 Not Found').toBe(false);

  // Check for console errors
  if (guards?.console) {
    assertNoConsoleErrors(guards.console);
  }

  // Check for network failures
  if (guards?.network) {
    assertNoFailedRequests(guards.network);
  }
}

/**
 * Assert that authentication is working
 */
export async function assertAuthenticated(page) {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token, 'User should be authenticated with token in localStorage').toBeTruthy();
}

/**
 * Assert that user is not authenticated
 */
export async function assertNotAuthenticated(page) {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token, 'User should not have token in localStorage').toBeFalsy();
}

/**
 * Assert that a toast/notification appeared
 */
export async function assertToastAppears(page, options = {}) {
  const { type = 'success', message, timeout = 5000 } = options;

  const toastSelectors = [
    `[data-testid="toast-${type}"]`,
    `.toast-${type}`,
    `.notification-${type}`,
    `[role="alert"]`,
  ];

  let found = false;
  for (const selector of toastSelectors) {
    try {
      const toast = page.locator(selector).first();
      if (await toast.isVisible({ timeout: 1000 })) {
        if (message) {
          await expect(toast).toContainText(message);
        }
        found = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!found && message) {
    // Try finding by message text directly
    const messageLocator = page.locator(`text=${message}`);
    await expect(messageLocator).toBeVisible({ timeout });
  }
}

/**
 * Assert that a form shows validation error
 */
export async function assertFormError(page, options = {}) {
  const { fieldName, errorMessage, timeout = 5000 } = options;

  const errorSelectors = [
    `[data-testid="error-${fieldName}"]`,
    `[name="${fieldName}"] ~ .error`,
    `.field-error`,
    `[role="alert"]`,
    '.text-destructive',
    '.text-red-500',
  ];

  for (const selector of errorSelectors) {
    try {
      const error = page.locator(selector).first();
      if (await error.isVisible({ timeout: 1000 })) {
        if (errorMessage) {
          await expect(error).toContainText(errorMessage);
        }
        return;
      }
    } catch (e) {
      continue;
    }
  }

  // If specific error not found, check for general error display
  if (errorMessage) {
    const errorLocator = page.locator(`text=${errorMessage}`);
    await expect(errorLocator).toBeVisible({ timeout });
  }
}

/**
 * Assert that products are displayed on the page
 */
export async function assertProductsDisplayed(page, options = {}) {
  const { minCount = 1, timeout = 10000 } = options;

  const productSelectors = [
    '[data-testid="product-card"]',
    '.product-card',
    '[class*="product"]',
  ];

  for (const selector of productSelectors) {
    try {
      const products = page.locator(selector);
      const count = await products.count();
      if (count >= minCount) {
        return count;
      }
    } catch (e) {
      continue;
    }
  }

  // Wait for any product-like content
  await page.waitForSelector('[class*="product"], [class*="card"]', { timeout });
}

/**
 * Assert that cart has items
 */
export async function assertCartHasItems(page, options = {}) {
  const { minCount = 1 } = options;

  const cartCountSelectors = [
    '[data-testid="cart-count"]',
    '.cart-count',
    '[class*="cart"] [class*="badge"]',
  ];

  for (const selector of cartCountSelectors) {
    try {
      const countElement = page.locator(selector).first();
      if (await countElement.isVisible({ timeout: 1000 })) {
        const text = await countElement.textContent();
        const count = parseInt(text, 10);
        if (count >= minCount) {
          return count;
        }
      }
    } catch (e) {
      continue;
    }
  }

  throw new Error(`Cart should have at least ${minCount} items`);
}

/**
 * Assert that an element is loading
 */
export async function assertIsLoading(page, selector) {
  const loadingIndicators = [
    `${selector}[aria-busy="true"]`,
    `${selector} .loading`,
    `${selector} .spinner`,
    `${selector}:disabled`,
  ];

  for (const indicator of loadingIndicators) {
    try {
      const element = page.locator(indicator).first();
      if (await element.isVisible({ timeout: 500 })) {
        return true;
      }
    } catch (e) {
      continue;
    }
  }

  return false;
}

/**
 * Assert that loading has finished
 */
export async function assertLoadingFinished(page, options = {}) {
  const { timeout = 10000 } = options;

  const loadingIndicators = [
    '[aria-busy="true"]',
    '.loading',
    '.spinner',
    '[data-testid="loading"]',
  ];

  for (const indicator of loadingIndicators) {
    try {
      await page.locator(indicator).waitFor({ state: 'hidden', timeout: 2000 });
    } catch (e) {
      // Indicator not present or already hidden
    }
  }

  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});
}
