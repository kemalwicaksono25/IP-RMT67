const AppError = require('../../errors/AppError');

describe('AppError', () => {
  describe('Constructor', () => {
    it('should create an AppError with default status code 500', () => {
      const error = new AppError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.status).toBe('error');
      expect(error.isOperational).toBe(true);
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    it('should set status to "fail" for 4xx status codes', () => {
      const error400 = new AppError('Bad request', 400);
      const error401 = new AppError('Unauthorized', 401);
      const error404 = new AppError('Not found', 404);
      const error422 = new AppError('Validation error', 422);

      expect(error400.status).toBe('fail');
      expect(error401.status).toBe('fail');
      expect(error404.status).toBe('fail');
      expect(error422.status).toBe('fail');
    });

    it('should set status to "error" for 5xx status codes', () => {
      const error500 = new AppError('Server error', 500);
      const error503 = new AppError('Service unavailable', 503);

      expect(error500.status).toBe('error');
      expect(error503.status).toBe('error');
    });

    it('should set status to "error" for non-4xx/5xx status codes', () => {
      const error200 = new AppError('OK', 200);
      const error300 = new AppError('Redirect', 300);

      expect(error200.status).toBe('error');
      expect(error300.status).toBe('error');
    });

    it('should allow custom isOperational flag', () => {
      const operationalError = new AppError('Operational error', 400, true);
      const nonOperationalError = new AppError('Non-operational error', 500, false);

      expect(operationalError.isOperational).toBe(true);
      expect(nonOperationalError.isOperational).toBe(false);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 500);

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('AppError');
    });

    it('should handle empty message', () => {
      const error = new AppError('', 400);

      expect(error.message).toBe('');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('Inheritance', () => {
    it('should be throwable and catchable', () => {
      expect(() => {
        throw new AppError('Test error', 400);
      }).toThrow(AppError);

      try {
        throw new AppError('Test error', 400);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Test error');
        expect(error.statusCode).toBe(400);
      }
    });
  });
});

