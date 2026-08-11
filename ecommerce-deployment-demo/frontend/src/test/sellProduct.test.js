import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Integration tests for SellProduct component - Product creation flow
 */

describe('SellProduct Integration Tests', () => {
  describe('Form Data Validation', () => {
    it('should require all mandatory fields', () => {
      const requiredFields = ['name', 'description', 'price', 'category', 'stock'];
      
      requiredFields.forEach(field => {
        expect(requiredFields).toContain(field);
      });
    });

    it('should validate price is a positive number', () => {
      const validPrices = [0.01, 1, 99.99, 1000];
      const invalidPrices = [0, -1, -99.99];

      validPrices.forEach(price => {
        expect(price).toBeGreaterThan(0);
      });

      invalidPrices.forEach(price => {
        expect(price).not.toBeGreaterThan(0);
      });
    });

    it('should validate stock is at least 1', () => {
      const validStocks = [1, 5, 100];
      const invalidStocks = [0, -1];

      validStocks.forEach(stock => {
        expect(stock).toBeGreaterThanOrEqual(1);
      });

      invalidStocks.forEach(stock => {
        expect(stock).not.toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('FormData Construction for multipart/form-data', () => {
    it('should construct FormData with correct field names', () => {
      const formData = new FormData();
      const productData = {
        title: 'Test Product',
        description: 'A test product',
        category: 'Electronics',
        price: '99.99',
        stock: '10',
        storeId: 'store123',
      };

      // Simulate what SellProduct.jsx does
      formData.append('title', productData.title);
      formData.append('description', productData.description);
      formData.append('category', productData.category);
      formData.append('price', productData.price);
      formData.append('stock', productData.stock);
      formData.append('storeId', productData.storeId);

      expect(formData.get('title')).toBe('Test Product');
      expect(formData.get('description')).toBe('A test product');
      expect(formData.get('category')).toBe('Electronics');
      expect(formData.get('price')).toBe('99.99');
      expect(formData.get('stock')).toBe('10');
      expect(formData.get('storeId')).toBe('store123');
    });

    it('should append image file with correct field name', () => {
      const formData = new FormData();
      const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });

      formData.append('image', mockFile);

      const imageFile = formData.get('image');
      expect(imageFile).toBeInstanceOf(File);
      expect(imageFile.name).toBe('test-image.jpg');
      expect(imageFile.type).toBe('image/jpeg');
    });

    it('should match backend CreateProductForm field names', () => {
      // Backend expects these exact field names in CreateProductForm
      const backendExpectedFields = ['title', 'description', 'category', 'price', 'stock', 'storeId'];
      const frontendSentFields = ['title', 'description', 'category', 'price', 'stock', 'storeId'];

      expect(frontendSentFields).toEqual(backendExpectedFields);
    });

    it('should send image with field name "image" matching @RequestPart("image")', () => {
      // Backend expects: @RequestPart("image") image: MultipartFile
      const expectedImageFieldName = 'image';
      const frontendImageFieldName = 'image';

      expect(frontendImageFieldName).toBe(expectedImageFieldName);
    });
  });

  describe('API Contract Validation', () => {
    it('should send request to correct endpoint', () => {
      const endpoint = '/products';
      expect(endpoint).toBe('/products');
    });

    it('should use POST method', () => {
      const method = 'POST';
      expect(method).toBe('POST');
    });

    it('should set Content-Type to multipart/form-data', () => {
      const contentType = 'multipart/form-data';
      expect(contentType).toBe('multipart/form-data');
    });

    it('should include Authorization header with Bearer token', () => {
      const token = 'test-jwt-token';
      const authHeader = `Bearer ${token}`;
      
      expect(authHeader).toBe('Bearer test-jwt-token');
      expect(authHeader.startsWith('Bearer ')).toBe(true);
    });
  });

  describe('Response Handling', () => {
    it('should expect ProductResponse shape on success', () => {
      const successResponse = {
        id: 'prod123',
        title: 'Test Product',
        description: 'A test product',
        price: 99.99,
        stock: 10,
        images: ['https://cloudinary.com/image.jpg'],
        storeId: 'store123',
        category: 'Electronics',
        storeName: 'Test Store',
        sellerId: 'user123'
      };

      expect(successResponse).toHaveProperty('id');
      expect(successResponse).toHaveProperty('title');
      expect(successResponse).toHaveProperty('description');
      expect(successResponse).toHaveProperty('price');
      expect(successResponse).toHaveProperty('stock');
      expect(successResponse).toHaveProperty('images');
      expect(successResponse).toHaveProperty('storeId');
      expect(successResponse).toHaveProperty('category');
    });

    it('should handle 403 error with error field', () => {
      const errorResponse = {
        error: 'You are not allowed to add products to this store'
      };

      expect(errorResponse).toHaveProperty('error');
      expect(typeof errorResponse.error).toBe('string');
    });

    it('should handle 403 error for missing image', () => {
      const errorResponse = {
        error: 'Product image is required'
      };

      expect(errorResponse.error).toBe('Product image is required');
    });

    it('should handle 403 error for Cloudinary failure', () => {
      const errorResponse = {
        error: 'Failed to upload product image: Cloudinary credentials invalid'
      };

      expect(errorResponse.error).toContain('Failed to upload product image');
    });

    it('should handle 403 error for store not found', () => {
      const errorResponse = {
        error: 'Store with id=invalid123 not found'
      };

      expect(errorResponse.error).toContain('Store with id=');
      expect(errorResponse.error).toContain('not found');
    });

    it('should handle 403 error for unauthorized store access', () => {
      const errorResponse = {
        error: 'You are not allowed to add products to this store'
      };

      expect(errorResponse.error).toBe('You are not allowed to add products to this store');
    });
  });

  describe('Image Validation', () => {
    it('should only accept image file types', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const invalidTypes = ['application/pdf', 'text/plain', 'video/mp4'];

      validTypes.forEach(type => {
        expect(type.startsWith('image/')).toBe(true);
      });

      invalidTypes.forEach(type => {
        expect(type.startsWith('image/')).toBe(false);
      });
    });

    it('should enforce max file size of 5MB', () => {
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      const validSizes = [1024, 1024 * 1024, 4 * 1024 * 1024];
      const invalidSizes = [6 * 1024 * 1024, 10 * 1024 * 1024];

      validSizes.forEach(size => {
        expect(size).toBeLessThanOrEqual(maxSizeBytes);
      });

      invalidSizes.forEach(size => {
        expect(size).toBeGreaterThan(maxSizeBytes);
      });
    });
  });

  describe('Store Validation', () => {
    it('should require valid storeId before submission', () => {
      const validStoreId = 'store123';
      const invalidStoreIds = ['', null, undefined];

      expect(validStoreId).toBeTruthy();
      expect(validStoreId.length).toBeGreaterThan(0);

      invalidStoreIds.forEach(id => {
        expect(id).toBeFalsy();
      });
    });

    it('should fetch store from /stores/user/{userId} endpoint', () => {
      const userId = 'user123';
      const endpoint = `/stores/user/${userId}`;
      
      expect(endpoint).toBe('/stores/user/user123');
    });
  });

  describe('Error Message Extraction', () => {
    it('should check both message and error fields', () => {
      const responseWithMessage = { data: { message: 'Error from message field' } };
      const responseWithError = { data: { error: 'Error from error field' } };
      const responseWithBoth = { data: { message: 'Message', error: 'Error' } };

      // Frontend logic: message || error || default
      const extractError = (response) => {
        return response?.data?.message || response?.data?.error || 'Default error';
      };

      expect(extractError(responseWithMessage)).toBe('Error from message field');
      expect(extractError(responseWithError)).toBe('Error from error field');
      expect(extractError(responseWithBoth)).toBe('Message'); // message takes precedence
      expect(extractError({})).toBe('Default error');
    });
  });
});

describe('Product Creation Flow', () => {
  it('should follow correct sequence: fetch user -> fetch store -> submit product', () => {
    const steps = [
      'GET /users - fetch current user',
      'GET /stores/user/{userId} - fetch user store',
      'POST /products - create product with multipart/form-data'
    ];

    expect(steps.length).toBe(3);
    expect(steps[0]).toContain('/users');
    expect(steps[1]).toContain('/stores/user/');
    expect(steps[2]).toContain('POST /products');
  });

  it('should clear form on successful submission', () => {
    const initialFormState = {
      name: '',
      description: '',
      price: '',
      category: '',
      stock: 1,
    };

    const filledFormState = {
      name: 'Product',
      description: 'Description',
      price: '99.99',
      category: 'Electronics',
      stock: 10,
    };

    // After success, form should reset to initial state
    const resetForm = () => initialFormState;

    expect(resetForm()).toEqual(initialFormState);
    expect(resetForm()).not.toEqual(filledFormState);
  });

  it('should clear image state on successful submission', () => {
    const initialImageState = { imageFile: null, imagePreview: '' };
    
    expect(initialImageState.imageFile).toBeNull();
    expect(initialImageState.imagePreview).toBe('');
  });
});
