const authentication = require('../../middleware/authentication');
const jwt = require('../../helpers/jwt');
const db = require('../../models');

// Mock dependencies
jest.mock('../../helpers/jwt');
jest.mock('../../models');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Missing or invalid authorization header', () => {
    it('should return 401 when authorization header is missing', async () => {
      await authentication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token tidak valid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', async () => {
      req.headers.authorization = 'Invalid token';

      await authentication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token tidak valid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty', async () => {
      req.headers.authorization = '';

      await authentication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token tidak valid' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Invalid token', () => {
    it('should return 401 when token verification fails', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authentication(req, res, next);

      expect(jwt.verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token tidak valid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not found in database', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verifyToken.mockReturnValue({ id: 1 });
      db.User.findByPk.mockResolvedValue(null);

      await authentication(req, res, next);

      expect(db.User.findByPk).toHaveBeenCalledWith(1, {
        include: [{ model: db.Project, as: 'project' }],
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token tidak valid' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Valid authentication', () => {
    it('should set req.user and call next() when token is valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        ProjectId: 1,
      };

      req.headers.authorization = 'Bearer valid-token';
      jwt.verifyToken.mockReturnValue({ id: 1 });
      db.User.findByPk.mockResolvedValue(mockUser);

      await authentication(req, res, next);

      expect(jwt.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(db.User.findByPk).toHaveBeenCalledWith(1, {
        include: [{ model: db.Project, as: 'project' }],
      });
      expect(req.user).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        ProjectId: 1,
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle token with extra spaces (split behavior)', async () => {
      // Note: split(" ")[1] on "Bearer  token" returns empty string
      // Implementation uses split(" ")[1], so extra spaces cause empty token
      req.headers.authorization = 'Bearer  token-with-spaces';
      
      // Mock verifyToken to throw error when called with empty string
      jwt.verifyToken.mockImplementation((token) => {
        if (!token || token === '') {
          throw new Error('Invalid token');
        }
        return { id: 2 };
      });

      await authentication(req, res, next);

      // Implementation uses split(" ")[1], so with double space, it gets empty string
      // This will cause verifyToken to be called with empty string, which will throw error
      expect(jwt.verifyToken).toHaveBeenCalledWith('');
      // Since empty token will throw error, we should get 401
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token tidak valid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should extract token correctly from Bearer header', async () => {
      const mockUser = {
        id: 3,
        email: 'test3@example.com',
        name: 'Test 3',
        role: 'admin',
        ProjectId: 3,
      };

      req.headers.authorization = 'Bearer my-secret-token-123';
      jwt.verifyToken.mockReturnValue({ id: 3 });
      db.User.findByPk.mockResolvedValue(mockUser);

      await authentication(req, res, next);

      expect(jwt.verifyToken).toHaveBeenCalledWith('my-secret-token-123');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should return 401 when database query throws error', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verifyToken.mockReturnValue({ id: 1 });
      db.User.findByPk.mockRejectedValue(new Error('Database error'));

      await authentication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token tidak valid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when verifyToken throws JsonWebTokenError', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      jwt.verifyToken.mockImplementation(() => {
        throw jwtError;
      });

      await authentication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token tidak valid' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

