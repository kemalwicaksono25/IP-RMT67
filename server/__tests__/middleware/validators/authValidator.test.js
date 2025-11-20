const { validateRegister, validateLogin, validateAddStaff } = require('../../../middleware/validators/authValidator');

describe('Auth Validator', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateRegister', () => {
    it('should call next() with valid data', () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return error when name is missing', () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Name is required',
        errors: ['Name is required'],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return error when name is too short', () => {
      req.body = {
        name: 'A',
        email: 'test@example.com',
        password: 'password123',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Name must be at least 2 characters',
        })
      );
    });

    it('should return error when name is too long', () => {
      req.body = {
        name: 'A'.repeat(101),
        email: 'test@example.com',
        password: 'password123',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Name must be less than 100 characters',
        })
      );
    });

    it('should return error when name is empty string', () => {
      req.body = {
        name: '',
        email: 'test@example.com',
        password: 'password123',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Name is required',
        })
      );
    });

    it('should return error when name is only whitespace', () => {
      req.body = {
        name: '   ',
        email: 'test@example.com',
        password: 'password123',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Name is required',
        })
      );
    });

    it('should return error when email is missing', () => {
      req.body = {
        name: 'Test User',
        password: 'password123',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email is required',
        })
      );
    });

    it('should return error when email is invalid', () => {
      req.body = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email must be a valid email address',
        })
      );
    });

    it('should return error when email is too long', () => {
      req.body = {
        name: 'Test User',
        email: 'a'.repeat(250) + '@example.com',
        password: 'password123',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email must be less than 255 characters',
        })
      );
    });

    it('should return error when password is missing', () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Password is required',
        })
      );
    });

    it('should return error when password is too short', () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Password must be at least 6 characters',
        })
      );
    });

    it('should return error when projectName is missing', () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project name is required',
        })
      );
    });

    it('should return error when projectName is too short', () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        projectName: 'A',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project name must be at least 2 characters',
        })
      );
    });

    it('should return error when projectName is too long', () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        projectName: 'A'.repeat(101),
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project name must be less than 100 characters',
        })
      );
    });

    it('should return multiple errors when multiple fields are invalid', () => {
      req.body = {
        name: '',
        email: 'invalid',
        password: '123',
        projectName: '',
      };

      validateRegister(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            'Name is required',
            'Email must be a valid email address',
            'Password must be at least 6 characters',
            'Project name is required',
          ]),
        })
      );
    });

    it('should trim name and email before validation', () => {
      req.body = {
        name: '  Test User  ',
        email: '  test@example.com  ',
        password: 'password123',
        projectName: 'Test Project',
      };

      validateRegister(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateLogin', () => {
    it('should call next() with valid data', () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return error when email is missing', () => {
      req.body = {
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email is required',
        })
      );
    });

    it('should return error when email is invalid', () => {
      req.body = {
        email: 'invalid-email',
        password: 'password123',
      };

      validateLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email must be a valid email address',
        })
      );
    });

    it('should return error when password is missing', () => {
      req.body = {
        email: 'test@example.com',
      };

      validateLogin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Password is required',
        })
      );
    });

    it('should accept any password length for login', () => {
      req.body = {
        email: 'test@example.com',
        password: '123', // Short password is OK for login
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateAddStaff', () => {
    it('should call next() with valid data', () => {
      req.body = {
        name: 'Staff User',
        email: 'staff@example.com',
        password: 'password123',
      };

      validateAddStaff(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return error when name is missing', () => {
      req.body = {
        email: 'staff@example.com',
        password: 'password123',
      };

      validateAddStaff(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Name is required',
        })
      );
    });

    it('should return error when email is missing', () => {
      req.body = {
        name: 'Staff User',
        password: 'password123',
      };

      validateAddStaff(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email is required',
        })
      );
    });

    it('should return error when password is missing', () => {
      req.body = {
        name: 'Staff User',
        email: 'staff@example.com',
      };

      validateAddStaff(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Password is required',
        })
      );
    });

    it('should return error when password is too short', () => {
      req.body = {
        name: 'Staff User',
        email: 'staff@example.com',
        password: '12345',
      };

      validateAddStaff(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Password must be at least 6 characters',
        })
      );
    });

    it('should return error when name is too short (less than 2 characters)', () => {
      req.body = {
        name: 'A',
        email: 'staff@example.com',
        password: 'password123',
      };

      validateAddStaff(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Name must be at least 2 characters',
        })
      );
    });

    it('should return error when name is too long (more than 100 characters)', () => {
      req.body = {
        name: 'A'.repeat(101),
        email: 'staff@example.com',
        password: 'password123',
      };

      validateAddStaff(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Name must be less than 100 characters',
        })
      );
    });

    it('should return error when email is invalid format', () => {
      req.body = {
        name: 'Staff User',
        email: 'invalid-email-format',
        password: 'password123',
      };

      validateAddStaff(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email must be a valid email address',
        })
      );
    });

    it('should return error when email is too long (more than 255 characters)', () => {
      req.body = {
        name: 'Staff User',
        email: 'a'.repeat(250) + '@example.com',
        password: 'password123',
      };

      validateAddStaff(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email must be less than 255 characters',
        })
      );
    });
  });
});

