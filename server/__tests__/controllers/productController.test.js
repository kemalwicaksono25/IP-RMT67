const ProductController = require('../../controllers/productController');
const db = require('../../models');
const AIService = require('../../services/aiService');
const AppError = require('../../errors/AppError');

// Mock dependencies
jest.mock('../../models');
jest.mock('../../services/aiService');

describe('ProductController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { ProjectId: 1 },
      params: {},
      body: {},
      file: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products for user project', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', ProjectId: 1 },
        { id: 2, name: 'Product 2', ProjectId: 1 },
      ];

      db.Product.findAll.mockResolvedValue(mockProducts);

      await ProductController.getAll(req, res, next);

      expect(db.Product.findAll).toHaveBeenCalledWith({
        where: { ProjectId: 1 },
        order: [['createdAt', 'DESC']],
      });
      expect(res.json).toHaveBeenCalledWith(mockProducts);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return empty array when no products', async () => {
      db.Product.findAll.mockResolvedValue([]);

      await ProductController.getAll(req, res, next);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database errors', async () => {
      db.Product.findAll.mockRejectedValue(new Error('Database error'));

      await ProductController.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getById', () => {
    it('should return product by ID', async () => {
      req.params.id = '1';
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        ProjectId: 1,
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.getById(req, res, next);

      expect(db.Product.findOne).toHaveBeenCalledWith({
        where: {
          id: '1',
          ProjectId: 1,
        },
      });
      expect(res.json).toHaveBeenCalledWith(mockProduct);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return error when product not found', async () => {
      req.params.id = '999';
      db.Product.findOne.mockResolvedValue(null);

      await ProductController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Produk tidak ditemukan');
      expect(error.statusCode).toBe(404);
    });

    it('should return error when product belongs to different project', async () => {
      req.params.id = '1';
      db.Product.findOne.mockResolvedValue(null);

      await ProductController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should handle database errors', async () => {
      req.params.id = '1';
      db.Product.findOne.mockRejectedValue(new Error('Database error'));

      await ProductController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('create', () => {
    it('should create product successfully without image', async () => {
      req.body = {
        name: 'New Product',
        description: 'Product description',
        link: 'https://example.com',
      };

      const mockProduct = {
        id: 1,
        name: 'New Product',
        description: 'Product description',
        link: 'https://example.com',
        imageUrl: null,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue(),
      };

      db.Product.create.mockResolvedValue(mockProduct);
      AIService.generatePGG.mockResolvedValue({
        pains: ['pain1'],
        gains: ['gain1'],
        goals: ['goal1'],
      });

      await ProductController.create(req, res, next);

      expect(db.Product.create).toHaveBeenCalledWith({
        name: 'New Product',
        description: 'Product description',
        link: 'https://example.com',
        imageUrl: null,
        ProjectId: 1,
      });
      expect(AIService.generatePGG).toHaveBeenCalledWith(mockProduct);
      expect(mockProduct.update).toHaveBeenCalledWith({
        pains: ['pain1'],
        gains: ['gain1'],
        goals: ['goal1'],
      });
      expect(mockProduct.reload).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should create product with image', async () => {
      req.body = {
        name: 'New Product',
      };
      req.file = {
        path: '/uploads/products/image.jpg',
      };

      const mockProduct = {
        id: 1,
        name: 'New Product',
        imageUrl: '/uploads/products/image.jpg',
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue(),
      };

      db.Product.create.mockResolvedValue(mockProduct);
      AIService.generatePGG.mockResolvedValue({
        pains: [],
        gains: [],
        goals: [],
      });

      await ProductController.create(req, res, next);

      expect(db.Product.create).toHaveBeenCalledWith({
        name: 'New Product',
        description: '',
        link: '',
        imageUrl: '/uploads/products/image.jpg',
        ProjectId: 1,
      });
    });

    it('should handle missing description and link', async () => {
      req.body = {
        name: 'New Product',
      };

      const mockProduct = {
        id: 1,
        name: 'New Product',
        description: '',
        link: '',
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue(),
      };

      db.Product.create.mockResolvedValue(mockProduct);
      AIService.generatePGG.mockResolvedValue({
        pains: [],
        gains: [],
        goals: [],
      });

      await ProductController.create(req, res, next);

      expect(db.Product.create).toHaveBeenCalledWith({
        name: 'New Product',
        description: '',
        link: '',
        imageUrl: null,
        ProjectId: 1,
      });
    });

    it('should handle AI service errors gracefully', async () => {
      req.body = {
        name: 'New Product',
      };

      const mockProduct = {
        id: 1,
        name: 'New Product',
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue(),
      };

      db.Product.create.mockResolvedValue(mockProduct);
      AIService.generatePGG.mockRejectedValue(new Error('AI service error'));

      const originalConsoleError = console.error;
      console.error = jest.fn();

      await ProductController.create(req, res, next);

      expect(console.error).toHaveBeenCalledWith('AI Generation Error:', expect.any(Error));
      expect(mockProduct.reload).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProduct);

      console.error = originalConsoleError;
    });

    it('should handle non-array PGG from AI service', async () => {
      req.body = {
        name: 'New Product',
      };

      const mockProduct = {
        id: 1,
        name: 'New Product',
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue(),
      };

      db.Product.create.mockResolvedValue(mockProduct);
      AIService.generatePGG.mockResolvedValue({
        pains: 'not-an-array',
        gains: null,
        goals: undefined,
      });

      await ProductController.create(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        pains: [],
        gains: [],
        goals: [],
      });
    });

    it('should handle database errors', async () => {
      req.body = {
        name: 'New Product',
      };

      db.Product.create.mockRejectedValue(new Error('Database error'));

      await ProductController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('update', () => {
    it('should update product successfully', async () => {
      req.params.id = '1';
      req.body = {
        name: 'Updated Product',
        description: 'Updated description',
      };

      const mockProduct = {
        id: 1,
        name: 'Old Product',
        description: 'Old description',
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(db.Product.findOne).toHaveBeenCalledWith({
        where: {
          id: '1',
          ProjectId: 1,
        },
      });
      expect(mockProduct.update).toHaveBeenCalledWith({
        name: 'Updated Product',
        description: 'Updated description',
      });
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should return error when product not found', async () => {
      req.params.id = '999';
      db.Product.findOne.mockResolvedValue(null);

      await ProductController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Produk tidak ditemukan');
      expect(error.statusCode).toBe(404);
    });

    it('should update only provided fields', async () => {
      req.params.id = '1';
      req.body = {
        name: 'Updated Name',
      };

      const mockProduct = {
        id: 1,
        name: 'Old Product',
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        name: 'Updated Name',
      });
    });

    it('should handle description as empty string', async () => {
      req.params.id = '1';
      req.body = {
        description: '',
      };

      const mockProduct = {
        id: 1,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        description: '',
      });
    });

    it('should handle link as empty string', async () => {
      req.params.id = '1';
      req.body = {
        link: '',
      };

      const mockProduct = {
        id: 1,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        link: '',
      });
    });

    it('should parse pains from JSON string', async () => {
      req.params.id = '1';
      req.body = {
        pains: '["pain1", "pain2"]',
      };

      const mockProduct = {
        id: 1,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        pains: ['pain1', 'pain2'],
      });
    });

    it('should handle invalid JSON string for pains', async () => {
      req.params.id = '1';
      req.body = {
        pains: 'invalid-json',
      };

      const mockProduct = {
        id: 1,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        pains: [],
      });
    });

    it('should handle non-array pains after JSON parse', async () => {
      req.params.id = '1';
      req.body = {
        pains: '{"not": "array"}',
      };

      const mockProduct = {
        id: 1,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        pains: [],
      });
    });

    it('should handle gains as array', async () => {
      req.params.id = '1';
      req.body = {
        gains: ['gain1', 'gain2'],
      };

      const mockProduct = {
        id: 1,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        gains: ['gain1', 'gain2'],
      });
    });

    it('should parse goals from JSON string', async () => {
      req.params.id = '1';
      req.body = {
        goals: '["goal1", "goal2"]',
      };

      const mockProduct = {
        id: 1,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        goals: ['goal1', 'goal2'],
      });
    });

    it('should handle invalid JSON string for goals', async () => {
      req.params.id = '1';
      req.body = {
        goals: 'invalid-json',
      };

      const mockProduct = {
        id: 1,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        goals: [],
      });
    });

    it('should update image when file is provided', async () => {
      req.params.id = '1';
      req.body = {
        name: 'Updated Product',
      };
      req.file = {
        path: '/uploads/products/new-image.jpg',
      };

      const mockProduct = {
        id: 1,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.update(req, res, next);

      expect(mockProduct.update).toHaveBeenCalledWith({
        name: 'Updated Product',
        imageUrl: '/uploads/products/new-image.jpg',
      });
    });

    it('should handle database errors', async () => {
      req.params.id = '1';
      req.body = {
        name: 'Updated Product',
      };

      db.Product.findOne.mockRejectedValue(new Error('Database error'));

      await ProductController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('delete', () => {
    it('should delete product successfully', async () => {
      req.params.id = '1';

      const mockProduct = {
        id: 1,
        name: 'Test Product',
        ProjectId: 1,
        destroy: jest.fn().mockResolvedValue(),
      };

      db.Product.findOne.mockResolvedValue(mockProduct);

      await ProductController.delete(req, res, next);

      expect(db.Product.findOne).toHaveBeenCalledWith({
        where: {
          id: '1',
          ProjectId: 1,
        },
      });
      expect(mockProduct.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product deleted successfully',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return error when product not found', async () => {
      req.params.id = '999';
      db.Product.findOne.mockResolvedValue(null);

      await ProductController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Produk tidak ditemukan');
      expect(error.statusCode).toBe(404);
    });

    it('should handle database errors', async () => {
      req.params.id = '1';
      db.Product.findOne.mockRejectedValue(new Error('Database error'));

      await ProductController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

