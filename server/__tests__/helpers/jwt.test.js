const jwt = require('../../helpers/jwt');

describe('JWT Helper', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = { id: 1, email: 'test1@example.com' };
      const payload2 = { id: 2, email: 'test2@example.com' };

      const token1 = jwt.generateToken(payload1);
      const token2 = jwt.generateToken(payload2);

      expect(token1).not.toBe(token2);
    });

    it('should generate token with expiration', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.generateToken(payload);

      // Verify token can be decoded and has expiration
      const decoded = jwt.verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { id: 1, email: 'test@example.com', name: 'Test User' };
      const token = jwt.generateToken(payload);
      const decoded = jwt.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.name).toBe(payload.name);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for token signed with different secret', () => {
      // Generate token with different secret
      const jwtLib = require('jsonwebtoken');
      const wrongToken = jwtLib.sign({ id: 1 }, 'wrong-secret');

      expect(() => {
        jwt.verifyToken(wrongToken);
      }).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => {
        jwt.verifyToken('');
      }).toThrow();
    });

    it('should throw error for null token', () => {
      expect(() => {
        jwt.verifyToken(null);
      }).toThrow();
    });
  });
});

