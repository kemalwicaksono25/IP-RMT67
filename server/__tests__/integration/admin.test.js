const request = require('supertest');
const { app, db } = require('./setup');
const jwt = require('../../helpers/jwt');
const { BRIEF_DETAIL_STATUS } = require('../../helpers/enums');

describe('Admin Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwt.verifyToken.mockReturnValue({
      id: 1,
      email: 'admin@example.com',
      role: 'admin',
      ProjectId: 1,
      name: 'Admin User',
    });
    
    // Mock user for authentication middleware (uses findByPk)
    db.User.findByPk.mockResolvedValue({
      id: 1,
      email: 'admin@example.com',
      role: 'admin',
      ProjectId: 1,
      name: 'Admin User',
      project: { id: 1, name: 'Test Project' },
    });
  });

  describe('GET /admin/approvals', () => {
    it('should get pending approvals', async () => {
      const mockPendingDetails = [
        { BriefId: 1 },
        { BriefId: 2 },
      ];

      const mockBriefs = [
        {
          id: 1,
          ProjectId: 1,
          details: [
            { id: 1, status: BRIEF_DETAIL_STATUS.PENDING_APPROVAL },
          ],
          product: { id: 1 },
          user: { id: 1 },
        },
      ];

      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.findAll.mockResolvedValueOnce(mockPendingDetails);
      db.Brief.findAll.mockResolvedValue(mockBriefs);

      const response = await request(app)
        .get('/admin/approvals')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 403 when not admin', async () => {
      jwt.verifyToken.mockReturnValue({
        id: 1,
        email: 'staff@example.com',
        role: 'staff',
        ProjectId: 1,
        name: 'Staff User',
      });
      
      // Mock staff user for authentication
      db.User.findByPk.mockResolvedValue({
        id: 1,
        email: 'staff@example.com',
        role: 'staff',
        ProjectId: 1,
        name: 'Staff User',
        project: { id: 1, name: 'Test Project' },
      });

      const response = await request(app)
        .get('/admin/approvals')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(403);
    });
  });

  describe('GET /admin/approvals/count', () => {
    it('should get pending approvals count', async () => {
      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.count.mockResolvedValue(5);

      const response = await request(app)
        .get('/admin/approvals/count')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBe(5);
    });
  });

  describe('PUT /admin/approvals/:id/approve', () => {
    it('should approve brief successfully', async () => {
      const mockBrief = {
        id: 1,
        ProjectId: 1,
        reload: jest.fn().mockResolvedValue({
          id: 1,
          details: [],
          product: { id: 1 },
          user: { id: 1 },
        }),
      };

      const mockDetails = [
        {
          id: 1,
          scheduledAt: null,
          update: jest.fn().mockResolvedValue(),
        },
      ];

      // User.findByPk already mocked in beforeEach for auth
      db.Brief.findOne.mockResolvedValue(mockBrief);
      db.BriefDetail.findAll.mockResolvedValue(mockDetails);

      const response = await request(app)
        .put('/admin/approvals/1/approve')
        .set('Authorization', 'Bearer valid_token')
        .send({
          scheduledAt: '2025-12-25',
          scheduledTime: '14:30',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 when validation fails', async () => {
      db.User.findOne.mockResolvedValue({
        id: 1,
        ProjectId: 1,
      });
      db.Brief.findOne.mockResolvedValue({
        id: 1,
        ProjectId: 1,
      });

      const response = await request(app)
        .put('/admin/approvals/1/approve')
        .set('Authorization', 'Bearer valid_token')
        .send({
          scheduledAt: 'invalid-date',
          scheduledTime: 'invalid-time',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /admin/approvals/:id/reject', () => {
    it('should reject brief successfully', async () => {
      const mockBrief = {
        id: 1,
        ProjectId: 1,
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue({
          id: 1,
          details: [],
          product: { id: 1 },
          user: { id: 1 },
        }),
      };

      const mockDetails = [
        {
          id: 1,
          update: jest.fn().mockResolvedValue(),
        },
      ];

      // User.findByPk already mocked in beforeEach for auth
      db.Brief.findOne.mockResolvedValue(mockBrief);
      db.BriefDetail.findAll.mockResolvedValue(mockDetails);

      const response = await request(app)
        .put('/admin/approvals/1/reject')
        .set('Authorization', 'Bearer valid_token')
        .send({
          rejectionReason: 'Not suitable for our brand',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 when rejectionReason is missing', async () => {
      // User.findByPk already mocked in beforeEach for auth
      const response = await request(app)
        .put('/admin/approvals/1/reject')
        .set('Authorization', 'Bearer valid_token')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /admin/approvals/detail/:detailId/approve', () => {
    it('should approve detail successfully', async () => {
      const mockDetail = {
        id: 1,
        BriefId: 1,
        scheduledAt: null,
        update: jest.fn().mockResolvedValue(),
        brief: {
          id: 1,
          product: { id: 1 },
          user: { id: 1 },
        },
      };

      const mockBrief = {
        id: 1,
        details: [mockDetail],
        product: { id: 1 },
        user: { id: 1 },
      };

      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.findOne.mockResolvedValue(mockDetail);
      db.Brief.findByPk.mockResolvedValue(mockBrief);

      const response = await request(app)
        .put('/admin/approvals/detail/1/approve')
        .set('Authorization', 'Bearer valid_token')
        .send({
          scheduledAt: '2025-12-25',
          scheduledTime: '14:30',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('PUT /admin/approvals/detail/:detailId/reject', () => {
    it('should reject detail successfully', async () => {
      const mockDetail = {
        id: 1,
        BriefId: 1,
        update: jest.fn().mockResolvedValue(),
      };

      const mockBrief = {
        id: 1,
        details: [mockDetail],
        product: { id: 1 },
        user: { id: 1 },
      };

      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.findOne.mockResolvedValue(mockDetail);
      db.Brief.findByPk.mockResolvedValue(mockBrief);

      const response = await request(app)
        .put('/admin/approvals/detail/1/reject')
        .set('Authorization', 'Bearer valid_token')
        .send({
          rejectionReason: 'Not suitable',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /admin/calendar', () => {
    it('should get calendar data', async () => {
      const mockBriefDetails = [
        {
          id: 1,
          title: 'Content 1',
          platform: 'TikTok',
          scheduledAt: new Date('2025-12-25T14:30:00'),
          status: BRIEF_DETAIL_STATUS.SCHEDULED,
          brief: {
            id: 1,
            funnelStage: 'awareness',
            product: { id: 1 },
          },
        },
      ];

      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.findAll.mockResolvedValue(mockBriefDetails);

      const response = await request(app)
        .get('/admin/calendar')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /admin/team', () => {
    it('should get team members', async () => {
      const mockTeam = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          role: 'admin',
          ProjectId: 1,
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          role: 'staff',
          ProjectId: 1,
        },
      ];

      // User.findByPk already mocked in beforeEach for auth
      db.User.findAll.mockResolvedValue(mockTeam);

      const response = await request(app)
        .get('/admin/team')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('PUT /admin/project/name', () => {
    it('should update project name successfully', async () => {
      const mockProject = {
        id: 1,
        name: 'Old Project Name',
        update: jest.fn().mockResolvedValue(),
      };

      // User.findByPk already mocked in beforeEach for auth
      db.Project.findByPk.mockResolvedValue(mockProject);

      const response = await request(app)
        .put('/admin/project/name')
        .set('Authorization', 'Bearer valid_token')
        .send({
          projectName: 'New Project Name',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.message).toBe('Project name updated successfully');
    });

    it('should return 400 when validation fails', async () => {
      db.User.findOne.mockResolvedValue({
        id: 1,
        ProjectId: 1,
      });

      const response = await request(app)
        .put('/admin/project/name')
        .set('Authorization', 'Bearer valid_token')
        .send({
          projectName: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /calendar', () => {
    it('should get calendar data from root route', async () => {
      const mockBriefDetails = [
        {
          id: 1,
          title: 'Content 1',
          platform: 'TikTok',
          scheduledAt: new Date('2025-12-25T14:30:00'),
          status: BRIEF_DETAIL_STATUS.SCHEDULED,
          brief: {
            id: 1,
            funnelStage: 'awareness',
            product: { id: 1 },
          },
        },
      ];

      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.findAll.mockResolvedValue(mockBriefDetails);

      const response = await request(app)
        .get('/calendar')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

