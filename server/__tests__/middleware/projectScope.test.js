const projectScope = require('../../middleware/projectScope');

describe('Project Scope Middleware', () => {
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

  describe('Missing user or ProjectId', () => {
    it('should return 401 when req.user is missing', () => {
      projectScope(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tidak memiliki akses' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user is null', () => {
      req.user = null;
      projectScope(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tidak memiliki akses' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user.ProjectId is missing', () => {
      req.user = { id: 1, email: 'test@example.com' };
      projectScope(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tidak memiliki akses' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user.ProjectId is null', () => {
      req.user = { id: 1, ProjectId: null };
      projectScope(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tidak memiliki akses' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user.ProjectId is undefined', () => {
      req.user = { id: 1, ProjectId: undefined };
      projectScope(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tidak memiliki akses' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Valid ProjectId', () => {
    it('should set req.projectScope and call next() when ProjectId is valid', () => {
      req.user = { id: 1, ProjectId: 123 };
      projectScope(req, res, next);

      expect(req.projectScope).toEqual({ ProjectId: 123 });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle ProjectId as number', () => {
      req.user = { id: 1, ProjectId: 456 };
      projectScope(req, res, next);

      expect(req.projectScope.ProjectId).toBe(456);
      expect(next).toHaveBeenCalled();
    });

    it('should handle ProjectId as string', () => {
      req.user = { id: 1, ProjectId: '789' };
      projectScope(req, res, next);

      expect(req.projectScope.ProjectId).toBe('789');
      expect(next).toHaveBeenCalled();
    });

    it('should preserve other user properties', () => {
      req.user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        ProjectId: 999,
      };
      projectScope(req, res, next);

      expect(req.user).toHaveProperty('id', 1);
      expect(req.user).toHaveProperty('email', 'test@example.com');
      expect(req.projectScope).toEqual({ ProjectId: 999 });
      expect(next).toHaveBeenCalled();
    });

    it('should overwrite existing projectScope', () => {
      req.user = { id: 1, ProjectId: 111 };
      req.projectScope = { ProjectId: 999 };
      projectScope(req, res, next);

      expect(req.projectScope).toEqual({ ProjectId: 111 });
      expect(next).toHaveBeenCalled();
    });
  });
});

