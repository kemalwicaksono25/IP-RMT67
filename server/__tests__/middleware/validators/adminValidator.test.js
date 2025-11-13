const {
  validateProjectName,
  validateApprovalId,
  validateRejectBrief,
  validateApproveBrief,
} = require('../../../middleware/validators/adminValidator');

describe('Admin Validator', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('validateProjectName', () => {
    it('should call next() with valid project name', () => {
      req.body = {
        projectName: 'My Project',
      };

      validateProjectName(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return error when projectName is missing', () => {
      req.body = {};

      validateProjectName(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project name is required',
        })
      );
    });

    it('should return error when projectName is empty string', () => {
      req.body = {
        projectName: '',
      };

      validateProjectName(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project name is required',
        })
      );
    });

    it('should return error when projectName is only whitespace', () => {
      req.body = {
        projectName: '   ',
      };

      validateProjectName(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project name is required',
        })
      );
    });

    it('should return error when projectName is too short', () => {
      req.body = {
        projectName: 'A',
      };

      validateProjectName(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project name must be at least 2 characters',
        })
      );
    });

    it('should return error when projectName is too long', () => {
      req.body = {
        projectName: 'A'.repeat(101),
      };

      validateProjectName(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Project name must be less than 100 characters',
        })
      );
    });

    it('should accept project name with exactly 2 characters', () => {
      req.body = {
        projectName: 'AB',
      };

      validateProjectName(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept project name with exactly 100 characters', () => {
      req.body = {
        projectName: 'A'.repeat(100),
      };

      validateProjectName(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateApprovalId', () => {
    it('should call next() with valid numeric ID', () => {
      req.params.id = '123';

      validateApprovalId(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return error when ID is missing', () => {
      req.params.id = undefined;

      validateApprovalId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'ID approval tidak valid',
      });
    });

    it('should return error when ID is not a number', () => {
      req.params.id = 'abc';

      validateApprovalId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'ID approval tidak valid',
      });
    });
  });

  describe('validateRejectBrief', () => {
    it('should call next() with valid rejection reason', () => {
      req.body = {
        rejectionReason: 'Content tidak sesuai dengan brand guidelines',
      };

      validateRejectBrief(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return error when rejectionReason is missing', () => {
      req.body = {};

      validateRejectBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Rejection reason is required',
        })
      );
    });

    it('should return error when rejectionReason is empty string', () => {
      req.body = {
        rejectionReason: '',
      };

      validateRejectBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Rejection reason is required',
        })
      );
    });

    it('should return error when rejectionReason is only whitespace', () => {
      req.body = {
        rejectionReason: '   ',
      };

      validateRejectBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Rejection reason is required',
        })
      );
    });

    it('should return error when rejectionReason is too short', () => {
      req.body = {
        rejectionReason: '1234',
      };

      validateRejectBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Rejection reason must be at least 5 characters',
        })
      );
    });

    it('should return error when rejectionReason is too long', () => {
      req.body = {
        rejectionReason: 'A'.repeat(501),
      };

      validateRejectBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Rejection reason must be less than 500 characters',
        })
      );
    });

    it('should accept rejection reason with exactly 5 characters', () => {
      req.body = {
        rejectionReason: '12345',
      };

      validateRejectBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept rejection reason with exactly 500 characters', () => {
      req.body = {
        rejectionReason: 'A'.repeat(500),
      };

      validateRejectBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateApproveBrief', () => {
    it('should call next() with no scheduledAt and scheduledTime', () => {
      req.body = {};

      validateApproveBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next() with valid scheduledAt only', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      req.body = {
        scheduledAt: futureDate.toISOString().split('T')[0],
      };

      validateApproveBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next() with valid scheduledTime only', () => {
      req.body = {
        scheduledTime: '14:30',
      };

      validateApproveBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next() with valid scheduledAt and scheduledTime', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      req.body = {
        scheduledAt: futureDate.toISOString().split('T')[0],
        scheduledTime: '14:30',
      };

      validateApproveBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when scheduledAt is not a string', () => {
      req.body = {
        scheduledAt: 123,
      };

      validateApproveBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ScheduledAt must be a string',
        })
      );
    });

    it('should return error when scheduledAt is invalid date', () => {
      req.body = {
        scheduledAt: 'invalid-date',
      };

      validateApproveBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ScheduledAt must be a valid date',
        })
      );
    });

    it('should return error when scheduledTime is not a string', () => {
      req.body = {
        scheduledTime: 123,
      };

      validateApproveBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ScheduledTime must be a string',
        })
      );
    });

    it('should return error when scheduledTime is invalid format', () => {
      req.body = {
        scheduledTime: '25:00',
      };

      validateApproveBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ScheduledTime must be in HH:MM format',
        })
      );
    });

    it('should return error when scheduledTime is not in HH:MM format', () => {
      req.body = {
        scheduledTime: '14:30:00',
      };

      validateApproveBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ScheduledTime must be in HH:MM format',
        })
      );
    });

    it('should accept valid time format', () => {
      req.body = {
        scheduledTime: '23:59',
      };

      validateApproveBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept valid time format with leading zero', () => {
      req.body = {
        scheduledTime: '09:05',
      };

      validateApproveBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error when scheduled date is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      req.body = {
        scheduledAt: pastDate.toISOString().split('T')[0],
        scheduledTime: '14:30',
      };

      validateApproveBrief(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Tanggal dan waktu posting tidak boleh di masa lalu',
        })
      );
    });

    it('should accept null scheduledAt', () => {
      req.body = {
        scheduledAt: null,
      };

      validateApproveBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept empty string scheduledAt', () => {
      req.body = {
        scheduledAt: '',
      };

      validateApproveBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept null scheduledTime', () => {
      req.body = {
        scheduledTime: null,
      };

      validateApproveBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept empty string scheduledTime', () => {
      req.body = {
        scheduledTime: '',
      };

      validateApproveBrief(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

