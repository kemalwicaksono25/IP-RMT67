const {
  handleJsonWebTokenError,
  handleTokenExpiredError
} = require('../../../errors/handlers/authErrorHandler');

describe('Auth Error Handlers', () => {
  describe('handleJsonWebTokenError', () => {
    it('should return 401 status with invalid token message', () => {
      const result = handleJsonWebTokenError();

      expect(result).toEqual({
        statusCode: 401,
        message: 'Token tidak valid'
      });
    });

    it('should always return the same response', () => {
      const result1 = handleJsonWebTokenError();
      const result2 = handleJsonWebTokenError();

      expect(result1).toEqual(result2);
    });
  });

  describe('handleTokenExpiredError', () => {
    it('should return 401 status with expired token message', () => {
      const result = handleTokenExpiredError();

      expect(result).toEqual({
        statusCode: 401,
        message: 'Token telah kadaluarsa'
      });
    });

    it('should always return the same response', () => {
      const result1 = handleTokenExpiredError();
      const result2 = handleTokenExpiredError();

      expect(result1).toEqual(result2);
    });
  });
});

