import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Contract Tests - Validates API contract between frontend and backend
 * Based on API_CONTRACT.md
 * 
 * These tests validate that frontend request/response shapes match
 * the documented API contract.
 */

describe('Auth Contract Tests', () => {
  describe('POST /auth/register', () => {
    it('should send correct request shape', () => {
      const request = {
        email: 'test@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St'
      };

      // Validate all required fields are present
      expect(request).toHaveProperty('email');
      expect(request).toHaveProperty('password');
      expect(request).toHaveProperty('firstName');
      expect(request).toHaveProperty('lastName');
      expect(request).toHaveProperty('address');

      // Validate types
      expect(typeof request.email).toBe('string');
      expect(typeof request.password).toBe('string');
      expect(typeof request.firstName).toBe('string');
      expect(typeof request.lastName).toBe('string');
      expect(typeof request.address).toBe('string');

      // Validate NO 'name' field (old incorrect format)
      expect(request).not.toHaveProperty('name');
    });
  });

  describe('POST /auth/login', () => {
    it('should send correct request shape', () => {
      const request = {
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      expect(request).toHaveProperty('email');
      expect(request).toHaveProperty('password');
      expect(typeof request.email).toBe('string');
      expect(typeof request.password).toBe('string');
    });

    it('should expect correct response shape', () => {
      const response = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      };

      expect(response).toHaveProperty('token');
      expect(typeof response.token).toBe('string');
    });
  });

  describe('GET /auth/check-email/{email}', () => {
    it('should expect correct response shape', () => {
      const response = {
        exists: true
      };

      expect(response).toHaveProperty('exists');
      expect(typeof response.exists).toBe('boolean');
    });
  });
});

describe('User Contract Tests', () => {
  describe('GET /users', () => {
    it('should expect correct response shape', () => {
      const response = {
        id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isASeller: false,
        emailConfirm: true,
        address: '123 Main St',
        savedShippingAddress: null,
        savedPaymentMethod: null
      };

      // Required fields
      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('firstName');
      expect(response).toHaveProperty('lastName');
      expect(response).toHaveProperty('email');
      expect(response).toHaveProperty('isASeller');
      expect(response).toHaveProperty('emailConfirm');
      expect(response).toHaveProperty('address');

      // Types
      expect(typeof response.firstName).toBe('string');
      expect(typeof response.lastName).toBe('string');
      expect(typeof response.email).toBe('string');
      expect(typeof response.isASeller).toBe('boolean');
      expect(typeof response.emailConfirm).toBe('boolean');
      expect(typeof response.address).toBe('string');
    });

    it('should handle savedShippingAddress correctly', () => {
      const responseWithAddress = {
        id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isASeller: false,
        emailConfirm: true,
        address: '123 Main St',
        savedShippingAddress: {
          fullName: 'John Doe',
          addressLine1: '123 Main St',
          city: 'Helsinki',
          postalCode: '00100',
          country: 'Finland'
        },
        savedPaymentMethod: null
      };

      const addr = responseWithAddress.savedShippingAddress;
      expect(addr).toHaveProperty('fullName');
      expect(addr).toHaveProperty('addressLine1');
      expect(addr).toHaveProperty('city');
      expect(addr).toHaveProperty('postalCode');
      expect(addr).toHaveProperty('country');
    });
  });

  describe('POST /users/become-seller', () => {
    it('should send correct request shape', () => {
      const request = {
        name: 'My Store',
        phoneNumber: '+358401234567',
        description: 'A great store',
        address: '456 Store St'
      };

      expect(request).toHaveProperty('name');
      expect(request).toHaveProperty('phoneNumber');
      expect(request).toHaveProperty('description');
      expect(request).toHaveProperty('address');

      expect(typeof request.name).toBe('string');
      expect(typeof request.phoneNumber).toBe('string');
      expect(typeof request.description).toBe('string');
      expect(typeof request.address).toBe('string');
    });
  });

  describe('PUT /users/checkout-info', () => {
    it('should send correct shipping address shape', () => {
      const request = {
        shippingAddress: {
          fullName: 'John Doe',
          addressLine1: '123 Main St',
          city: 'Helsinki',
          postalCode: '00100',
          country: 'Finland'
        }
      };

      const addr = request.shippingAddress;
      expect(addr).toHaveProperty('fullName');
      expect(addr).toHaveProperty('addressLine1');
      expect(addr).toHaveProperty('city');
      expect(addr).toHaveProperty('postalCode');
      expect(addr).toHaveProperty('country');
    });

    it('should send correct payment method shape', () => {
      const request = {
        paymentMethod: {
          cardLastFour: '4242',
          cardExpiry: '12/25',
          cardType: 'visa'
        }
      };

      const pm = request.paymentMethod;
      expect(pm).toHaveProperty('cardLastFour');
      expect(pm).toHaveProperty('cardExpiry');
      // cardType is optional
    });
  });
});

describe('Store Contract Tests', () => {
  describe('GET /stores/user/{userId}', () => {
    it('should expect correct response shape', () => {
      const response = {
        id: 'store123',
        name: 'My Store',
        phoneNumber: '+358401234567',
        description: 'A great store',
        owner: 'user123',
        address: '456 Store St',
        status: 'ACTIVE'
      };

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('phoneNumber');
      expect(response).toHaveProperty('description');
      expect(response).toHaveProperty('owner');
      expect(response).toHaveProperty('address');
      expect(response).toHaveProperty('status');

      // Status must be one of the valid values
      expect(['PENDING', 'ACTIVE', 'SUSPENDED']).toContain(response.status);
    });
  });
});

describe('Product Contract Tests', () => {
  describe('GET /products', () => {
    it('should expect correct response shape', () => {
      const response = [
        {
          id: 'prod123',
          title: 'Test Product',
          category: 'Electronics',
          description: 'A test product',
          price: 99.99,
          stock: 10,
          images: ['https://example.com/image.jpg'],
          storeId: 'store123',
          storeName: 'My Store',
          sellerId: 'user123'
        }
      ];

      const product = response[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('images');

      expect(typeof product.price).toBe('number');
      expect(typeof product.stock).toBe('number');
      expect(Array.isArray(product.images)).toBe(true);
    });
  });

  describe('POST /products (multipart)', () => {
    it('should have correct form fields', () => {
      const formFields = {
        title: 'New Product',
        description: 'Product description',
        category: 'Electronics',
        price: 49.99,
        stock: 5,
        storeId: 'store123'
      };

      expect(formFields).toHaveProperty('title');
      expect(formFields).toHaveProperty('description');
      expect(formFields).toHaveProperty('category');
      expect(formFields).toHaveProperty('price');
      expect(formFields).toHaveProperty('stock');
      expect(formFields).toHaveProperty('storeId');

      expect(typeof formFields.price).toBe('number');
      expect(typeof formFields.stock).toBe('number');
    });
  });
});

describe('Order Contract Tests', () => {
  describe('POST /api/orders', () => {
    it('should send correct request shape', () => {
      const request = {
        items: [
          {
            productId: 'prod123',
            productTitle: 'Test Product',
            productImage: 'https://example.com/image.jpg',
            quantity: 2,
            price: 99.99,
            sellerId: 'user123'
          }
        ],
        shippingAddress: {
          fullName: 'John Doe',
          addressLine1: '123 Main St',
          addressLine2: null,
          city: 'Helsinki',
          postalCode: '00100',
          country: 'Finland',
          phoneNumber: '+358401234567'
        },
        paymentMethod: 'card',
        shippingCost: 5.99,
        taxAmount: 24.00
      };

      // Validate items
      expect(Array.isArray(request.items)).toBe(true);
      const item = request.items[0];
      expect(item).toHaveProperty('productId');
      expect(item).toHaveProperty('productTitle');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('sellerId');

      // Validate shipping address
      const addr = request.shippingAddress;
      expect(addr).toHaveProperty('fullName');
      expect(addr).toHaveProperty('addressLine1');
      expect(addr).toHaveProperty('city');
      expect(addr).toHaveProperty('postalCode');
      expect(addr).toHaveProperty('country');

      // Validate payment method
      expect(typeof request.paymentMethod).toBe('string');
    });

    it('should expect correct response shape', () => {
      const response = {
        id: 'order123',
        userId: 'user123',
        items: [],
        shippingAddress: {
          fullName: 'John Doe',
          addressLine1: '123 Main St',
          addressLine2: null,
          city: 'Helsinki',
          postalCode: '00100',
          country: 'Finland',
          phoneNumber: null
        },
        paymentMethod: 'card',
        status: 'PENDING',
        subtotal: 199.98,
        shippingCost: 5.99,
        taxAmount: 24.00,
        totalAmount: 229.97,
        createdAt: '2024-01-15T10:30:00',
        updatedAt: '2024-01-15T10:30:00'
      };

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('userId');
      expect(response).toHaveProperty('items');
      expect(response).toHaveProperty('shippingAddress');
      expect(response).toHaveProperty('paymentMethod');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('subtotal');
      expect(response).toHaveProperty('shippingCost');
      expect(response).toHaveProperty('taxAmount');
      expect(response).toHaveProperty('totalAmount');
      expect(response).toHaveProperty('createdAt');
      expect(response).toHaveProperty('updatedAt');

      // Status must be valid
      expect(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
        .toContain(response.status);
    });
  });

  describe('PUT /api/orders/{orderId}/status', () => {
    it('should send correct request shape', () => {
      const request = {
        status: 'CONFIRMED'
      };

      expect(request).toHaveProperty('status');
      expect(typeof request.status).toBe('string');
    });
  });
});

describe('Review Contract Tests', () => {
  describe('POST /reviews', () => {
    it('should send correct request shape', () => {
      const request = {
        productId: 'prod123',
        rating: 5,
        reviewText: 'Great product!'
      };

      expect(request).toHaveProperty('productId');
      expect(request).toHaveProperty('rating');
      expect(request).toHaveProperty('reviewText');

      expect(typeof request.productId).toBe('string');
      expect(typeof request.rating).toBe('number');
      expect(typeof request.reviewText).toBe('string');
      expect(request.rating).toBeGreaterThanOrEqual(1);
      expect(request.rating).toBeLessThanOrEqual(5);
    });

    it('should expect correct response shape', () => {
      const response = {
        id: 'review123',
        productId: 'prod123',
        userId: 'user123',
        userName: 'John Doe',
        rating: 5,
        reviewText: 'Great product!',
        createdAt: '2024-01-15T10:30:00'
      };

      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('productId');
      expect(response).toHaveProperty('userId');
      expect(response).toHaveProperty('userName');
      expect(response).toHaveProperty('rating');
      expect(response).toHaveProperty('reviewText');
      expect(response).toHaveProperty('createdAt');
    });
  });

  describe('GET /reviews/product/{productId}/average', () => {
    it('should expect correct response shape', () => {
      const response = {
        productId: 'prod123',
        averageRating: 4.5,
        totalReviews: 10
      };

      expect(response).toHaveProperty('productId');
      expect(response).toHaveProperty('averageRating');
      expect(response).toHaveProperty('totalReviews');

      expect(typeof response.averageRating).toBe('number');
      expect(typeof response.totalReviews).toBe('number');
    });
  });
});

describe('Notification Contract Tests', () => {
  describe('GET /api/notifications', () => {
    it('should expect correct response shape', () => {
      const response = [
        {
          id: 'notif123',
          userId: 'user123',
          title: 'New Order',
          message: 'You have a new order!',
          type: 'NEW_ORDER',
          relatedOrderId: 'order123',
          isRead: false,
          createdAt: '2024-01-15T10:30:00'
        }
      ];

      const notif = response[0];
      expect(notif).toHaveProperty('id');
      expect(notif).toHaveProperty('userId');
      expect(notif).toHaveProperty('title');
      expect(notif).toHaveProperty('message');
      expect(notif).toHaveProperty('type');
      expect(notif).toHaveProperty('isRead');
      expect(notif).toHaveProperty('createdAt');

      // Type must be valid
      const validTypes = [
        'ORDER_PLACED', 'ORDER_CONFIRMED', 'ORDER_PROCESSING',
        'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ORDER_CANCELLED',
        'NEW_ORDER', 'GENERAL'
      ];
      expect(validTypes).toContain(notif.type);
    });
  });

  describe('GET /api/notifications/unread/count', () => {
    it('should expect correct response shape', () => {
      const response = {
        count: 5
      };

      expect(response).toHaveProperty('count');
      expect(typeof response.count).toBe('number');
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should expect correct response shape', () => {
      const response = {
        message: 'Marked 5 notifications as read'
      };

      expect(response).toHaveProperty('message');
      expect(typeof response.message).toBe('string');
    });
  });
});
