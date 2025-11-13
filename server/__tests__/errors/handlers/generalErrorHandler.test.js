const {
  handleCastError,
  handleMulterError,
  handleDefaultError
} = require('../../../errors/handlers/generalErrorHandler');

describe('General Error Handlers', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('handleCastError', () => {
    it('should handle cast error with path', () => {
      const error = {
        path: 'id',
        message: 'Cast to ObjectId failed'
      };

      const result = handleCastError(error);

      expect(result).toEqual({
        statusCode: 400,
        message: 'Data id tidak valid'
      });
    });

    it('should handle cast error with different paths', () => {
      const error1 = { path: 'userId' };
      const error2 = { path: 'productId' };

      const result1 = handleCastError(error1);
      const result2 = handleCastError(error2);

      expect(result1.message).toBe('Data userId tidak valid');
      expect(result2.message).toBe('Data productId tidak valid');
    });
  });

  describe('handleMulterError', () => {
    it('should handle LIMIT_FILE_SIZE error', () => {
      const error = {
        code: 'LIMIT_FILE_SIZE',
        message: 'File too large'
      };

      const result = handleMulterError(error);

      expect(result).toEqual({
        statusCode: 400,
        message: 'Ukuran file terlalu besar'
      });
    });

    it('should handle LIMIT_FILE_COUNT error', () => {
      const error = {
        code: 'LIMIT_FILE_COUNT',
        message: 'Too many files'
      };

      const result = handleMulterError(error);

      expect(result).toEqual({
        statusCode: 400,
        message: 'Terlalu banyak file'
      });
    });

    it('should handle other multer errors in development', () => {
      process.env.NODE_ENV = 'development';
      const error = {
        code: 'UNKNOWN_ERROR',
        message: 'Unknown multer error'
      };

      const result = handleMulterError(error);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Gagal mengupload file');
      expect(result.error).toBe('Unknown multer error');
    });

    it('should handle other multer errors in production', () => {
      process.env.NODE_ENV = 'production';
      const error = {
        code: 'UNKNOWN_ERROR',
        message: 'Unknown multer error'
      };

      const result = handleMulterError(error);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Gagal mengupload file');
      expect(result.error).toBeUndefined();
    });
  });

  describe('handleDefaultError', () => {
    it('should handle error with message', () => {
      const error = {
        message: 'Custom error message',
        statusCode: 500
      };

      const result = handleDefaultError(error);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Custom error message');
    });

    it('should use default message when error message is missing', () => {
      const error = {};

      const result = handleDefaultError(error);

      expect(result.message).toBe('Terjadi kesalahan pada server');
    });

    it('should sanitize Sequelize error messages', () => {
      const error = {
        message: 'SequelizeConnectionError: Connection failed',
        statusCode: 500
      };

      const result = handleDefaultError(error);

      expect(result.message).toBe('Terjadi kesalahan pada database');
    });

    it('should sanitize SQL error messages', () => {
      const error = {
        message: 'SQL Error: Syntax error',
        statusCode: 500
      };

      const result = handleDefaultError(error);

      expect(result.message).toBe('Terjadi kesalahan pada database');
    });

    it('should sanitize database error messages (case-sensitive check)', () => {
      // Note: Implementation checks for lowercase "database", so we test with lowercase
      const error = {
        message: 'database connection timeout',
        statusCode: 500
      };

      const result = handleDefaultError(error);

      expect(result.message).toBe('Terjadi kesalahan pada database');
    });

    it('should not sanitize Database with capital D (case-sensitive)', () => {
      // Implementation is case-sensitive, so "Database" won't match
      const error = {
        message: 'Database connection timeout',
        statusCode: 500
      };

      const result = handleDefaultError(error);

      // Should keep original message since "Database" doesn't match lowercase "database"
      expect(result.message).toBe('Database connection timeout');
    });

    it('should sanitize JSON parse error messages', () => {
      const error = {
        message: 'JSON parse error: Unexpected token',
        statusCode: 400
      };

      const result = handleDefaultError(error);

      expect(result.message).toBe('Format data tidak valid');
    });

    it('should sanitize parse error messages', () => {
      // Implementation checks for "parse" (lowercase) in message
      const error = {
        message: 'parse error in request body',
        statusCode: 400
      };

      const result = handleDefaultError(error);

      expect(result.message).toBe('Format data tidak valid');
    });

    it('should sanitize JSON error messages', () => {
      const error = {
        message: 'JSON parse error in request',
        statusCode: 400
      };

      const result = handleDefaultError(error);

      expect(result.message).toBe('Format data tidak valid');
    });

    it('should sanitize network error messages', () => {
      const error = {
        message: 'Network error: ECONNREFUSED',
        statusCode: 500
      };

      const result = handleDefaultError(error);

      expect(result.message).toBe('Tidak dapat terhubung ke server');
    });

    it('should sanitize ECONNREFUSED error messages', () => {
      const error = {
        message: 'ECONNREFUSED 127.0.0.1:3000',
        statusCode: 500
      };

      const result = handleDefaultError(error);

      expect(result.message).toBe('Tidak dapat terhubung ke server');
    });

    it('should include error details in development', () => {
      process.env.NODE_ENV = 'development';
      const error = {
        message: 'Test error',
        stack: 'Error stack trace',
        name: 'TestError',
        details: 'Error details'
      };

      const result = handleDefaultError(error);

      expect(result.error).toBeDefined();
      expect(result.error.stack).toBe('Error stack trace');
      expect(result.error.name).toBe('TestError');
      expect(result.error.details).toBe('Error details');
    });

    it('should not include error details in production', () => {
      process.env.NODE_ENV = 'production';
      const error = {
        message: 'Test error',
        stack: 'Error stack trace',
        name: 'TestError'
      };

      const result = handleDefaultError(error);

      expect(result.error).toBeUndefined();
    });

    it('should use statusCode from error if available', () => {
      const error = {
        message: 'Not found',
        statusCode: 404
      };

      const result = handleDefaultError(error);

      expect(result.statusCode).toBe(404);
    });

    it('should use status from error if statusCode not available', () => {
      const error = {
        message: 'Not found',
        status: 404
      };

      const result = handleDefaultError(error);

      expect(result.statusCode).toBe(404);
    });

    it('should default to 500 if no status code or status', () => {
      const error = {
        message: 'Server error'
      };

      const result = handleDefaultError(error);

      expect(result.statusCode).toBe(500);
    });

    it('should handle error with toString method', () => {
      process.env.NODE_ENV = 'development';
      const error = {
        message: 'Test error',
        toString: () => 'String representation'
      };

      const result = handleDefaultError(error);

      expect(result.error.details).toBe('String representation');
    });
  });
});

