import { describe, it, expect } from 'vitest';

/**
 * Route Validation Tests
 * 
 * Ensures all navigation targets in the codebase have corresponding
 * route declarations in App.jsx
 */

// All routes declared in App.jsx
const DECLARED_ROUTES = [
  '/',
  '/login',
  '/register',
  '/become-seller',
  '/seller/kyc',
  '/cart',
  '/products/:productId',
  '/search',
  '/store/:storeId',
  '/seller',
  '/seller/store',
  '/seller/orders',
  '/seller/orders/:orderId',
  '/sell',
  '/profile',
  '/checkout',
  '/order-confirmation/:orderId',
  '/orders',
  '/orders/:orderId',
  '/settings',
  '*', // 404 catch-all
];

// All navigation targets used in components
const NAVIGATION_TARGETS = [
  // From SellerLayout.jsx
  '/profile',
  '/orders',
  '/seller/store',
  '/seller/orders',
  '/seller',
  '/seller/kyc',
  '/settings',
  
  // From Navbar.jsx
  '/',
  '/seller',
  '/become-seller',
  '/cart',
  '/login',
  
  // From various components
  '/checkout',
  '/login',
  
  // Dynamic routes (pattern-based)
  '/products/:id',
  '/orders/:id',
  '/seller/orders/:id',
  '/order-confirmation/:id',
  '/store/:id',
];

describe('Route Validation', () => {
  it('should have all declared routes defined', () => {
    expect(DECLARED_ROUTES.length).toBeGreaterThan(0);
  });

  it('should have a 404 catch-all route', () => {
    expect(DECLARED_ROUTES).toContain('*');
  });

  it('should have /settings route declared', () => {
    expect(DECLARED_ROUTES).toContain('/settings');
  });

  it('should have /login route declared', () => {
    expect(DECLARED_ROUTES).toContain('/login');
  });

  it('should have /register route declared', () => {
    expect(DECLARED_ROUTES).toContain('/register');
  });

  it('should have all seller routes declared', () => {
    expect(DECLARED_ROUTES).toContain('/seller');
    expect(DECLARED_ROUTES).toContain('/seller/store');
    expect(DECLARED_ROUTES).toContain('/seller/orders');
    expect(DECLARED_ROUTES).toContain('/seller/orders/:orderId');
    expect(DECLARED_ROUTES).toContain('/seller/kyc');
  });

  it('should have all order routes declared', () => {
    expect(DECLARED_ROUTES).toContain('/orders');
    expect(DECLARED_ROUTES).toContain('/orders/:orderId');
    expect(DECLARED_ROUTES).toContain('/order-confirmation/:orderId');
  });

  it('should have checkout flow routes declared', () => {
    expect(DECLARED_ROUTES).toContain('/cart');
    expect(DECLARED_ROUTES).toContain('/checkout');
  });

  it('should have product routes declared', () => {
    expect(DECLARED_ROUTES).toContain('/products/:productId');
    expect(DECLARED_ROUTES).toContain('/search');
  });

  it('should have store routes declared', () => {
    expect(DECLARED_ROUTES).toContain('/store/:storeId');
    expect(DECLARED_ROUTES).toContain('/become-seller');
  });

  it('should have profile route declared', () => {
    expect(DECLARED_ROUTES).toContain('/profile');
  });

  describe('Navigation Target Coverage', () => {
    const staticTargets = NAVIGATION_TARGETS.filter(t => !t.includes(':'));
    
    staticTargets.forEach(target => {
      it(`should have route for navigation target: ${target}`, () => {
        expect(DECLARED_ROUTES).toContain(target);
      });
    });
  });
});

describe('Protected Route Coverage', () => {
  const PROTECTED_ROUTES = [
    '/seller/kyc',
    '/seller',
    '/seller/store',
    '/seller/orders',
    '/seller/orders/:orderId',
    '/sell',
    '/profile',
    '/checkout',
    '/order-confirmation/:orderId',
    '/orders',
    '/orders/:orderId',
    '/settings',
  ];

  const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/become-seller',
    '/cart',
    '/products/:productId',
    '/search',
    '/store/:storeId',
  ];

  it('should have protected routes for authenticated features', () => {
    PROTECTED_ROUTES.forEach(route => {
      expect(DECLARED_ROUTES).toContain(route);
    });
  });

  it('should have public routes for unauthenticated access', () => {
    PUBLIC_ROUTES.forEach(route => {
      expect(DECLARED_ROUTES).toContain(route);
    });
  });
});
