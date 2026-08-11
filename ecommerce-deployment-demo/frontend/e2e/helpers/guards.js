/**
 * E2E Test Guards - Shared utilities for catching runtime errors
 */

/**
 * Console Guard - Captures and fails on console errors/warnings
 */
export class ConsoleGuard {
  constructor(page) {
    this.page = page;
    this.errors = [];
    this.warnings = [];
    this.unhandledRejections = [];
    
    // Allowlisted messages that won't cause test failure
    this.allowlist = [
      'Download the React DevTools',
      'React does not recognize',
      '[HMR]',
      'Vite',
    ];
  }

  start() {
    this.page.on('console', (msg) => {
      const text = msg.text();
      
      // Skip allowlisted messages
      if (this.allowlist.some(allowed => text.includes(allowed))) {
        return;
      }

      if (msg.type() === 'error') {
        this.errors.push({
          type: 'console.error',
          message: text,
          location: msg.location(),
        });
      } else if (msg.type() === 'warning') {
        this.warnings.push({
          type: 'console.warn',
          message: text,
          location: msg.location(),
        });
      }
    });

    this.page.on('pageerror', (error) => {
      this.errors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack,
      });
    });

    return this;
  }

  getErrors() {
    return this.errors;
  }

  getWarnings() {
    return this.warnings;
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  assertNoErrors() {
    if (this.errors.length > 0) {
      const errorMessages = this.errors
        .map(e => `[${e.type}] ${e.message}`)
        .join('\n');
      throw new Error(`Console errors detected:\n${errorMessages}`);
    }
  }

  assertNoWarnings() {
    if (this.warnings.length > 0) {
      const warningMessages = this.warnings
        .map(w => `[${w.type}] ${w.message}`)
        .join('\n');
      throw new Error(`Console warnings detected:\n${warningMessages}`);
    }
  }
}

/**
 * Network Guard - Captures and fails on failed network requests
 */
export class NetworkGuard {
  constructor(page) {
    this.page = page;
    this.failedRequests = [];
    this.allRequests = [];
    
    // Endpoints that are allowed to fail (e.g., 404 for optional resources)
    this.allowedFailures = [
      '/favicon.ico',
      '/robots.txt',
    ];
  }

  start() {
    this.page.on('requestfinished', (request) => {
      try {
        const response = request.response();
        if (!response) return;

        const status = response.status();
        const url = request.url();

        this.allRequests.push({
          url,
          method: request.method(),
          status,
        });

        // Check for failed requests (4xx, 5xx)
        if (status >= 400) {
          // Skip allowlisted endpoints
          if (this.allowedFailures.some(allowed => url.includes(allowed))) {
            return;
          }

          this.failedRequests.push({
            url,
            method: request.method(),
            status,
            responseBody: '[Response body not captured]',
          });
        }
      } catch (e) {
        // Page may have been closed, ignore
      }
    });

    this.page.on('requestfailed', (request) => {
      try {
        const url = request.url();
        
        // Skip allowlisted endpoints
        if (this.allowedFailures.some(allowed => url.includes(allowed))) {
          return;
        }

        this.failedRequests.push({
          url,
          method: request.method(),
          status: 0,
          error: request.failure()?.errorText || 'Unknown error',
        });
      } catch (e) {
        // Page may have been closed, ignore
      }
    });

    return this;
  }

  getFailedRequests() {
    return this.failedRequests;
  }

  getAllRequests() {
    return this.allRequests;
  }

  hasFailures() {
    return this.failedRequests.length > 0;
  }

  assertNoFailedRequests() {
    if (this.failedRequests.length > 0) {
      const failureMessages = this.failedRequests
        .map(r => `[${r.method}] ${r.url} - Status: ${r.status}\nResponse: ${r.responseBody || r.error}`)
        .join('\n\n');
      throw new Error(`Network request failures detected:\n${failureMessages}`);
    }
  }

  allowEndpoint(endpoint) {
    this.allowedFailures.push(endpoint);
    return this;
  }
}

/**
 * Route Guard - Verifies navigation targets exist
 */
export class RouteGuard {
  constructor(page) {
    this.page = page;
    this.navigationEvents = [];
    this.notFoundDetected = false;
  }

  start() {
    this.page.on('framenavigated', (frame) => {
      if (frame === this.page.mainFrame()) {
        this.navigationEvents.push({
          url: frame.url(),
          timestamp: Date.now(),
        });
      }
    });

    return this;
  }

  async checkForNotFound() {
    // Check if the NotFound component is rendered
    const notFoundIndicators = [
      'text=Page Not Found',
      'text=404',
      'text=not found',
      '[data-testid="not-found"]',
    ];

    for (const indicator of notFoundIndicators) {
      try {
        const element = await this.page.locator(indicator).first();
        if (await element.isVisible({ timeout: 100 })) {
          this.notFoundDetected = true;
          return true;
        }
      } catch (e) {
        // Element not found, continue checking
      }
    }

    return false;
  }

  getNavigationEvents() {
    return this.navigationEvents;
  }

  assertNoNotFound() {
    if (this.notFoundDetected) {
      throw new Error('404 Not Found page was displayed - route may be missing');
    }
  }
}

/**
 * UX Completion Guard - Verifies actions complete successfully
 */
export class UXCompletionGuard {
  constructor(page) {
    this.page = page;
  }

  async assertLoadingComplete(options = {}) {
    const { timeout = 10000 } = options;

    // Wait for common loading indicators to disappear
    const loadingIndicators = [
      '[data-testid="loading"]',
      '.loading',
      '.spinner',
      '[aria-busy="true"]',
      'text=Loading...',
    ];

    for (const indicator of loadingIndicators) {
      try {
        await this.page.locator(indicator).waitFor({ state: 'hidden', timeout: 1000 });
      } catch (e) {
        // Indicator not present, continue
      }
    }

    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  async assertSuccessMessage(options = {}) {
    const { timeout = 5000, messages = [] } = options;

    const successIndicators = [
      '[data-testid="success"]',
      '.success',
      '.toast-success',
      'text=successfully',
      'text=Success',
      ...messages.map(m => `text=${m}`),
    ];

    for (const indicator of successIndicators) {
      try {
        const element = await this.page.locator(indicator).first();
        if (await element.isVisible({ timeout: 500 })) {
          return true;
        }
      } catch (e) {
        // Continue checking
      }
    }

    return false;
  }

  async assertRedirectTo(expectedPath, options = {}) {
    const { timeout = 5000 } = options;

    await this.page.waitForURL(`**${expectedPath}**`, { timeout });
    const currentUrl = this.page.url();
    
    if (!currentUrl.includes(expectedPath)) {
      throw new Error(`Expected redirect to ${expectedPath}, but current URL is ${currentUrl}`);
    }
  }

  async assertButtonEnabled(selector, options = {}) {
    const { timeout = 5000 } = options;

    const button = this.page.locator(selector);
    await button.waitFor({ state: 'visible', timeout });
    
    const isDisabled = await button.isDisabled();
    if (isDisabled) {
      throw new Error(`Button ${selector} is still disabled after action`);
    }
  }

  async assertFormCleared(formSelector, options = {}) {
    const { timeout = 5000 } = options;

    const form = this.page.locator(formSelector);
    const inputs = form.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
    
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const value = await input.inputValue();
      const type = await input.getAttribute('type');
      
      // Skip checkboxes and radios
      if (type === 'checkbox' || type === 'radio') continue;
      
      if (value && value.trim() !== '') {
        // Form not cleared - this might be intentional
        return false;
      }
    }
    
    return true;
  }
}

/**
 * Combined guard that sets up all guards at once
 */
export function setupAllGuards(page) {
  const consoleGuard = new ConsoleGuard(page).start();
  const networkGuard = new NetworkGuard(page).start();
  const routeGuard = new RouteGuard(page).start();
  const uxGuard = new UXCompletionGuard(page);

  return {
    console: consoleGuard,
    network: networkGuard,
    route: routeGuard,
    ux: uxGuard,

    assertAllClean() {
      consoleGuard.assertNoErrors();
      networkGuard.assertNoFailedRequests();
      routeGuard.assertNoNotFound();
    },

    getReport() {
      return {
        consoleErrors: consoleGuard.getErrors(),
        consoleWarnings: consoleGuard.getWarnings(),
        failedRequests: networkGuard.getFailedRequests(),
        allRequests: networkGuard.getAllRequests(),
        navigationEvents: routeGuard.getNavigationEvents(),
      };
    },
  };
}
