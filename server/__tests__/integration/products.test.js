const request = require('supertest');
const { app, db } = require('./setup');
const AIService = require('../../services/aiService');
const jwt = require('../../helpers/jwt');

describe('Product Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwt.verifyToken.mockReturnValue({
      id: 1,
      email: 'test@example.com',
      role: 'admin',
      ProjectId: 1,
      name: 'Test User',
    });
    
    // Mock user for authentication middleware (uses findByPk)
    db.User.findByPk.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      role: 'admin',
      ProjectId: 1,
      name: 'Test User',
      project: { id: 1, name: 'Test Project' },
    });
  });

  describe('GET /products', () => {
    it('should get all products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', ProjectId: 1 },
        { id: 2, name: 'Product 2', ProjectId: 1 },
      ];

      // User.findOne already mocked in beforeEach for auth
      db.Product.findAll.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/products')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/products');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /products/:id', () => {
    it('should get product by ID', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        ProjectId: 1,
      };

      // User.findOne already mocked in beforeEach for auth
      db.Product.findOne.mockResolvedValue(mockProduct);

      const response = await request(app)
        .get('/products/1')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Test Product');
    });

    it('should return 404 when product not found', async () => {
      db.User.findOne.mockResolvedValue({
        id: 1,
        ProjectId: 1,
      });
      db.Product.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/products/999')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Produk tidak ditemukan');
    });

    it('should return 400 when ID is invalid', async () => {
      // User.findOne already mocked in beforeEach for auth
      const response = await request(app)
        .get('/products/invalid')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /products', () => {
    it('should create product successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'New Product',
        description: 'Product Description',
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue(),
      };

      // User.findOne already mocked in beforeEach for auth
      db.Product.create.mockResolvedValue(mockProduct);
      AIService.generatePGG.mockResolvedValue({
        pains: ['pain1'],
        gains: ['gain1'],
        goals: ['goal1'],
      });

      const response = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer valid_token')
        .send({
          name: 'New Product',
          description: 'Product Description',
          link: 'https://example.com',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('New Product');
    });

    it('should return 400 when validation fails', async () => {
      // User.findOne already mocked in beforeEach for auth
      const response = await request(app)
        .post('/products')
        .set('Authorization', 'Bearer valid_token')
        .send({
          name: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update product successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Old Product',
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      // User.findByPk already mocked in beforeEach for auth
      db.Product.findOne.mockResolvedValue(mockProduct);

      const response = await request(app)
        .put('/products/1')
        .set('Authorization', 'Bearer valid_token')
        .send({
          name: 'Updated Product',
        });

      expect(response.status).toBe(200);
      expect(mockProduct.update).toHaveBeenCalled();
    });

    it('should return 404 when product not found', async () => {
      db.User.findOne.mockResolvedValue({
        id: 1,
        ProjectId: 1,
      });
      db.Product.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put('/products/999')
        .set('Authorization', 'Bearer valid_token')
        .send({
          name: 'Updated Product',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete product successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        ProjectId: 1,
        destroy: jest.fn().mockResolvedValue(),
      };

      // User.findByPk already mocked in beforeEach for auth
      db.Product.findOne.mockResolvedValue(mockProduct);

      const response = await request(app)
        .delete('/products/1')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Product deleted successfully');
      expect(mockProduct.destroy).toHaveBeenCalled();
    });

    it('should return 404 when product not found', async () => {
      db.User.findOne.mockResolvedValue({
        id: 1,
        ProjectId: 1,
      });
      db.Product.findOne.mockResolvedValue(null);

      const response = await request(app)
        .delete('/products/999')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(404);
    });
  });
});

