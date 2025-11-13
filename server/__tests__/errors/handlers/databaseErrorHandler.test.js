const {
  handleSequelizeValidationError,
  handleSequelizeUniqueConstraintError,
  handleSequelizeForeignKeyConstraintError,
  handleSequelizeDatabaseError
} = require('../../../errors/handlers/databaseErrorHandler');

describe('Database Error Handlers', () => {
  describe('handleSequelizeValidationError', () => {
    it('should handle validation error with single error', () => {
      const error = {
        errors: [{
          path: 'email',
          message: 'Email tidak valid',
          value: 'invalid-email'
        }]
      };

      const result = handleSequelizeValidationError(error);

      expect(result).toEqual({
        statusCode: 400,
        message: 'Email tidak valid',
        errors: [{
          field: 'email',
          message: 'Email tidak valid',
          value: 'invalid-email'
        }]
      });
    });

    it('should handle validation error with multiple errors', () => {
      const error = {
        errors: [
          { path: 'email', message: 'Email tidak valid', value: 'invalid' },
          { path: 'password', message: 'Password terlalu pendek', value: '123' }
        ]
      };

      const result = handleSequelizeValidationError(error);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Email tidak valid'); // First error message
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[1].field).toBe('password');
    });

    it('should handle validation error with empty errors array', () => {
      const error = {
        errors: []
      };

      const result = handleSequelizeValidationError(error);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Data tidak valid');
      expect(result.errors).toEqual([]);
    });

    it('should handle validation error with null value', () => {
      const error = {
        errors: [{
          path: 'email',
          message: 'Email wajib diisi',
          value: null
        }]
      };

      const result = handleSequelizeValidationError(error);

      expect(result.errors[0].value).toBeNull();
    });
  });

  describe('handleSequelizeUniqueConstraintError', () => {
    it('should handle unique constraint error', () => {
      const error = {
        errors: [{
          path: 'email',
          message: 'email must be unique',
          value: 'existing@example.com'
        }]
      };

      const result = handleSequelizeUniqueConstraintError(error);

      expect(result).toEqual({
        statusCode: 400,
        message: 'email must be unique',
        errors: [{
          field: 'email',
          message: 'email must be unique',
          value: 'existing@example.com'
        }]
      });
    });

    it('should handle unique constraint error with multiple fields', () => {
      const error = {
        errors: [
          { path: 'email', message: 'email must be unique', value: 'test@example.com' },
          { path: 'username', message: 'username must be unique', value: 'testuser' }
        ]
      };

      const result = handleSequelizeUniqueConstraintError(error);

      expect(result.statusCode).toBe(400);
      expect(result.errors).toHaveLength(2);
    });

    it('should use default message when errors array is empty', () => {
      const error = {
        errors: []
      };

      const result = handleSequelizeUniqueConstraintError(error);

      expect(result.message).toBe('Data sudah ada');
    });
  });

  describe('handleSequelizeForeignKeyConstraintError', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle foreign key constraint error in development', () => {
      process.env.NODE_ENV = 'development';
      const error = {
        message: 'Foreign key constraint failed'
      };

      const result = handleSequelizeForeignKeyConstraintError(error);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Data tidak dapat dihapus karena masih digunakan');
      expect(result.error).toBe('Foreign key constraint failed');
    });

    it('should handle foreign key constraint error in production', () => {
      process.env.NODE_ENV = 'production';
      const error = {
        message: 'Foreign key constraint failed'
      };

      const result = handleSequelizeForeignKeyConstraintError(error);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Data tidak dapat dihapus karena masih digunakan');
      expect(result.error).toBeUndefined();
    });

    it('should handle foreign key constraint error in test environment', () => {
      process.env.NODE_ENV = 'test';
      const error = {
        message: 'Foreign key constraint failed'
      };

      const result = handleSequelizeForeignKeyConstraintError(error);

      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Data tidak dapat dihapus karena masih digunakan');
      expect(result.error).toBeUndefined();
    });
  });

  describe('handleSequelizeDatabaseError', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle database error in development', () => {
      process.env.NODE_ENV = 'development';
      const error = {
        message: 'Connection timeout'
      };

      const result = handleSequelizeDatabaseError(error);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Terjadi kesalahan pada database');
      expect(result.error).toBe('Connection timeout');
    });

    it('should handle database error in production', () => {
      process.env.NODE_ENV = 'production';
      const error = {
        message: 'Connection timeout'
      };

      const result = handleSequelizeDatabaseError(error);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Terjadi kesalahan pada database');
      expect(result.error).toBeUndefined();
    });

    it('should handle database error without message', () => {
      process.env.NODE_ENV = 'development';
      const error = {};

      const result = handleSequelizeDatabaseError(error);

      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Terjadi kesalahan pada database');
    });
  });
});

