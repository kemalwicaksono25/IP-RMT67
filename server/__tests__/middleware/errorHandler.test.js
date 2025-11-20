const errorHandler = require('../../middleware/errorHandler');
const AppError = require('../../errors/AppError');

// Mock error handlers
jest.mock('../../errors/handlers/databaseErrorHandler');
jest.mock('../../errors/handlers/authErrorHandler');
jest.mock('../../errors/handlers/generalErrorHandler');

const {
  handleSequelizeValidationError,
  handleSequelizeUniqueConstraintError,
  handleSequelizeForeignKeyConstraintError,
  handleSequelizeDatabaseError,
} = require('../../errors/handlers/databaseErrorHandler');

const {
  handleJsonWebTokenError,
  handleTokenExpiredError,
} = require('../../errors/handlers/authErrorHandler');

const {
  handleCastError,
  handleMulterError,
  handleDefaultError,
} = require('../../errors/handlers/generalErrorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;
  const originalEnv = process.env.NODE_ENV;
  const originalConsoleError = console.error;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    console.error = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    console.error = originalConsoleError;
  });

  describe('AppError handling', () => {
    it('should handle AppError with status code and message', () => {
      const error = new AppError('Custom error', 400);
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Custom error' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle AppError with 500 status code', () => {
      const error = new AppError('Server error', 500);
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });

    it('should log error in console', () => {
      const error = new AppError('Test error', 400);
      errorHandler(error, req, res, next);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Sequelize Validation Error', () => {
    it('should handle SequelizeValidationError', () => {
      const error = {
        name: 'SequelizeValidationError',
        errors: [],
      };
      handleSequelizeValidationError.mockReturnValue({
        statusCode: 400,
        message: 'Validation error',
        errors: [],
      });

      errorHandler(error, req, res, next);

      expect(handleSequelizeValidationError).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Validation error', errors: [] });
    });
  });

  describe('Sequelize Unique Constraint Error', () => {
    it('should handle SequelizeUniqueConstraintError', () => {
      const error = {
        name: 'SequelizeUniqueConstraintError',
        errors: [],
      };
      handleSequelizeUniqueConstraintError.mockReturnValue({
        statusCode: 400,
        message: 'Unique constraint error',
        errors: [],
      });

      errorHandler(error, req, res, next);

      expect(handleSequelizeUniqueConstraintError).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unique constraint error', errors: [] });
    });
  });

  describe('Sequelize Foreign Key Constraint Error', () => {
    it('should handle SequelizeForeignKeyConstraintError', () => {
      const error = {
        name: 'SequelizeForeignKeyConstraintError',
      };
      handleSequelizeForeignKeyConstraintError.mockReturnValue({
        statusCode: 400,
        message: 'Foreign key error',
      });

      errorHandler(error, req, res, next);

      expect(handleSequelizeForeignKeyConstraintError).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Foreign key error' });
    });
  });

  describe('Sequelize Database Error', () => {
    it('should handle SequelizeDatabaseError', () => {
      const error = {
        name: 'SequelizeDatabaseError',
      };
      handleSequelizeDatabaseError.mockReturnValue({
        statusCode: 500,
        message: 'Database error',
      });

      errorHandler(error, req, res, next);

      expect(handleSequelizeDatabaseError).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('JWT Errors', () => {
    it('should handle JsonWebTokenError', () => {
      const error = {
        name: 'JsonWebTokenError',
      };
      handleJsonWebTokenError.mockReturnValue({
        statusCode: 401,
        message: 'Token tidak valid',
      });

      errorHandler(error, req, res, next);

      expect(handleJsonWebTokenError).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token tidak valid' });
    });

    it('should handle TokenExpiredError', () => {
      const error = {
        name: 'TokenExpiredError',
      };
      handleTokenExpiredError.mockReturnValue({
        statusCode: 401,
        message: 'Token telah kadaluarsa',
      });

      errorHandler(error, req, res, next);

      expect(handleTokenExpiredError).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token telah kadaluarsa' });
    });
  });

  describe('Multer Error', () => {
    it('should handle MulterError', () => {
      const error = {
        name: 'MulterError',
        code: 'LIMIT_FILE_SIZE',
      };
      handleMulterError.mockReturnValue({
        statusCode: 400,
        message: 'File too large',
      });

      errorHandler(error, req, res, next);

      expect(handleMulterError).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'File too large' });
    });
  });

  describe('Cast Error', () => {
    it('should handle CastError', () => {
      const error = {
        name: 'CastError',
        path: 'id',
      };
      handleCastError.mockReturnValue({
        statusCode: 400,
        message: 'Data id tidak valid',
      });

      errorHandler(error, req, res, next);

      expect(handleCastError).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Data id tidak valid' });
    });
  });

  describe('Default Error Handler', () => {
    it('should handle unknown error types', () => {
      const error = {
        name: 'UnknownError',
        message: 'Unknown error',
      };
      handleDefaultError.mockReturnValue({
        statusCode: 500,
        message: 'Terjadi kesalahan pada server',
      });

      errorHandler(error, req, res, next);

      expect(handleDefaultError).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Terjadi kesalahan pada server' });
    });
  });

  describe('Error response with additional fields', () => {
    it('should include errors array when present', () => {
      const error = {
        name: 'SequelizeValidationError',
      };
      handleSequelizeValidationError.mockReturnValue({
        statusCode: 400,
        message: 'Validation error',
        errors: [{ field: 'email', message: 'Invalid email' }],
      });

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: [{ field: 'email', message: 'Invalid email' }],
      });
    });

    it('should include empty errors array when present', () => {
      const error = {
        name: 'SequelizeValidationError',
      };
      handleSequelizeValidationError.mockReturnValue({
        statusCode: 400,
        message: 'Validation error',
        errors: [],
      });

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: [],
      });
    });

    it('should include error object when present', () => {
      const error = {
        name: 'SequelizeDatabaseError',
      };
      handleSequelizeDatabaseError.mockReturnValue({
        statusCode: 500,
        message: 'Database error',
        error: 'Detailed error message',
      });

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error',
        error: 'Detailed error message',
      });
    });

    it('should not include errors or error when not present', () => {
      const error = {
        name: 'CastError',
      };
      handleCastError.mockReturnValue({
        statusCode: 400,
        message: 'Data id tidak valid',
      });

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Data id tidak valid',
      });
    });

    it('should not include errors when it is false', () => {
      const error = {
        name: 'SequelizeValidationError',
      };
      handleSequelizeValidationError.mockReturnValue({
        statusCode: 400,
        message: 'Validation error',
        errors: false,
      });

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation error',
      });
    });

    it('should not include error when it is false', () => {
      const error = {
        name: 'SequelizeDatabaseError',
      };
      handleSequelizeDatabaseError.mockReturnValue({
        statusCode: 500,
        message: 'Database error',
        error: false,
      });

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });

    it('should include both errors and error when both are present', () => {
      const error = {
        name: 'SequelizeValidationError',
      };
      handleSequelizeValidationError.mockReturnValue({
        statusCode: 400,
        message: 'Validation error',
        errors: [{ field: 'email', message: 'Invalid email' }],
        error: 'Additional error info',
      });

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: [{ field: 'email', message: 'Invalid email' }],
        error: 'Additional error info',
      });
    });
  });

  describe('Environment-specific behavior', () => {
    it('should log stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new AppError('Test error', 500);
      error.stack = 'Error stack trace';

      errorHandler(error, req, res, next);

      expect(console.error).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          stack: 'Error stack trace',
        })
      );
    });

    it('should handle error without stack property in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new AppError('Test error', 500);
      delete error.stack;

      errorHandler(error, req, res, next);

      expect(console.error).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          stack: undefined,
        })
      );
    });

    it('should not log stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new AppError('Test error', 500);
      error.stack = 'Error stack trace';

      errorHandler(error, req, res, next);

      expect(console.error).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          stack: undefined,
        })
      );
    });
  });
});

