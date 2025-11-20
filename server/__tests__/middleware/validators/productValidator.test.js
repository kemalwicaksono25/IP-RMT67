const {
  validateProductCreate,
  validateProductUpdate,
  validateProductId,
} = require('../../../middleware/validators/productValidator');

describe('Product Validator', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateProductCreate', () => {
    it('should call next() with valid data', () => {
      req.body = {
        name: 'Test Product',
        description: 'Test description',
        link: 'https://example.com',
      };

      validateProductCreate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() with only name (description and link optional)', () => {
      req.body = {
        name: 'Test Product',
      };

      validateProductCreate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when name is missing', () => {
      req.body = {};

      validateProductCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product name is required',
        })
      );
    });

    it('should return error when name is empty string', () => {
      req.body = {
        name: '',
      };

      validateProductCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product name is required',
        })
      );
    });

    it('should return error when name is only whitespace', () => {
      req.body = {
        name: '   ',
      };

      validateProductCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product name is required',
        })
      );
    });

    it('should return error when name is not a string', () => {
      req.body = {
        name: 123,
      };

      validateProductCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product name is required',
        })
      );
    });

    it('should return error when name is too long', () => {
      req.body = {
        name: 'A'.repeat(256),
      };

      validateProductCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product name must be less than 255 characters',
        })
      );
    });

    it('should return error when description is not a string', () => {
      req.body = {
        name: 'Test Product',
        description: 123,
      };

      validateProductCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Description must be a string',
        })
      );
    });

    it('should accept null description', () => {
      req.body = {
        name: 'Test Product',
        description: null,
      };

      validateProductCreate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept undefined description', () => {
      req.body = {
        name: 'Test Product',
        description: undefined,
      };

      validateProductCreate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when link is not a string', () => {
      req.body = {
        name: 'Test Product',
        link: 123,
      };

      validateProductCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Link must be a string',
        })
      );
    });

    it('should return error when link is invalid URL', () => {
      req.body = {
        name: 'Test Product',
        link: 'not-a-valid-url',
      };

      validateProductCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Link must be a valid URL',
        })
      );
    });

    it('should accept valid HTTP URL', () => {
      req.body = {
        name: 'Test Product',
        link: 'http://example.com',
      };

      validateProductCreate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept valid HTTPS URL', () => {
      req.body = {
        name: 'Test Product',
        link: 'https://example.com/product',
      };

      validateProductCreate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept null link', () => {
      req.body = {
        name: 'Test Product',
        link: null,
      };

      validateProductCreate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept empty string link', () => {
      req.body = {
        name: 'Test Product',
        link: '',
      };

      validateProductCreate(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateProductUpdate', () => {
    it('should call next() with valid data', () => {
      req.body = {
        name: 'Updated Product',
        description: 'Updated description',
        link: 'https://example.com/updated',
      };

      validateProductUpdate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next() with empty body (all fields optional)', () => {
      req.body = {};

      validateProductUpdate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when name is empty string', () => {
      req.body = {
        name: '',
      };

      validateProductUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product name cannot be empty',
        })
      );
    });

    it('should return error when name is only whitespace', () => {
      req.body = {
        name: '   ',
      };

      validateProductUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product name cannot be empty',
        })
      );
    });

    it('should return error when name is not a string', () => {
      req.body = {
        name: 123,
      };

      validateProductUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product name cannot be empty',
        })
      );
    });

    it('should return error when name is too long', () => {
      req.body = {
        name: 'A'.repeat(256),
      };

      validateProductUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Product name must be less than 255 characters',
        })
      );
    });

    it('should accept valid name update', () => {
      req.body = {
        name: 'Updated Name',
      };

      validateProductUpdate(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when description is not a string', () => {
      req.body = {
        description: 123,
      };

      validateProductUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Description must be a string',
        })
      );
    });

    it('should return error when link is not a string', () => {
      req.body = {
        link: 123,
      };

      validateProductUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Link must be a string',
        })
      );
    });

    it('should return error when link is invalid URL', () => {
      req.body = {
        link: 'invalid-url',
      };

      validateProductUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Link must be a valid URL',
        })
      );
    });

    it('should accept valid link update', () => {
      req.body = {
        link: 'https://example.com/new-link',
      };

      validateProductUpdate(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateProductId', () => {
    it('should call next() with valid numeric ID', () => {
      req.params.id = '123';

      validateProductId(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() with valid numeric ID as number', () => {
      req.params.id = 123;

      validateProductId(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when ID is missing', () => {
      req.params.id = undefined;

      validateProductId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'ID produk tidak valid',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return error when ID is null', () => {
      req.params.id = null;

      validateProductId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'ID produk tidak valid',
      });
    });

    it('should return error when ID is not a number', () => {
      req.params.id = 'abc';

      validateProductId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'ID produk tidak valid',
      });
    });

    it('should return error when ID is empty string', () => {
      req.params.id = '';

      validateProductId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'ID produk tidak valid',
      });
    });

    it('should accept zero as valid ID', () => {
      req.params.id = '0';

      validateProductId(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept negative number as valid ID (parsing works)', () => {
      req.params.id = '-1';

      validateProductId(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

