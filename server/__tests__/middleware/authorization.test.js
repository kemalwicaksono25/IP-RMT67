const authorization = require('../../middleware/authorization');
const { USER_ROLE } = require('../../helpers/enums');

describe('Authorization Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Missing user', () => {
    it('should return 401 when req.user is missing', () => {
      const middleware = authorization(USER_ROLE.ADMIN);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tidak memiliki akses' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user is null', () => {
      req.user = null;
      const middleware = authorization(USER_ROLE.ADMIN);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tidak memiliki akses' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user is undefined', () => {
      req.user = undefined;
      const middleware = authorization(USER_ROLE.ADMIN);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Role-based access control', () => {
    it('should allow access when user role is in allowed roles (single role)', () => {
      req.user = { role: USER_ROLE.ADMIN };
      const middleware = authorization(USER_ROLE.ADMIN);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access when user role is in allowed roles (multiple roles)', () => {
      req.user = { role: USER_ROLE.STAFF };
      const middleware = authorization(USER_ROLE.ADMIN, USER_ROLE.STAFF);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access when user role is not in allowed roles', () => {
      req.user = { role: USER_ROLE.STAFF };
      const middleware = authorization(USER_ROLE.ADMIN);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Akses ditolak' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access when user role is not in any allowed roles', () => {
      req.user = { role: 'guest' };
      const middleware = authorization(USER_ROLE.ADMIN, USER_ROLE.STAFF);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Akses ditolak' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow admin access to admin-only routes', () => {
      req.user = { role: USER_ROLE.ADMIN };
      const middleware = authorization(USER_ROLE.ADMIN);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow staff access to staff-allowed routes', () => {
      req.user = { role: USER_ROLE.STAFF };
      const middleware = authorization(USER_ROLE.STAFF);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny staff access to admin-only routes', () => {
      req.user = { role: USER_ROLE.STAFF };
      const middleware = authorization(USER_ROLE.ADMIN);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty allowed roles array', () => {
      req.user = { role: USER_ROLE.ADMIN };
      const middleware = authorization();
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Akses ditolak' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle user with additional properties', () => {
      req.user = {
        id: 1,
        email: 'test@example.com',
        role: USER_ROLE.ADMIN,
        ProjectId: 1,
      };
      const middleware = authorization(USER_ROLE.ADMIN);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

