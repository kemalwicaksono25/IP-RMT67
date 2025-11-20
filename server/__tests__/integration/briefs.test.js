const request = require('supertest');
const { app, db } = require('./setup');
const AIService = require('../../services/aiService');
const jwt = require('../../helpers/jwt');
const { BRIEF_STATUS, BRIEF_DETAIL_STATUS } = require('../../helpers/enums');

describe('Brief Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwt.verifyToken.mockReturnValue({
      id: 1,
      email: 'test@example.com',
      role: 'admin',
      ProjectId: 1,
      name: 'Test User',
    });
    
    // Mock user for authentication middleware (uses findByPk)
    db.User.findByPk.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      role: 'admin',
      ProjectId: 1,
      name: 'Test User',
      project: { id: 1, name: 'Test Project' },
    });
  });

  describe('GET /briefs', () => {
    it('should get all briefs', async () => {
      const mockBriefs = [
        {
          id: 1,
          ProductId: 1,
          ProjectId: 1,
          details: [],
          product: { id: 1 },
          user: { id: 1 },
        },
      ];

      // User.findByPk already mocked in beforeEach for auth
      db.Brief.findAll.mockResolvedValue(mockBriefs);

      const response = await request(app)
        .get('/briefs')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter briefs by productId', async () => {
      const mockBriefs = [
        {
          id: 1,
          ProductId: 1,
          ProjectId: 1,
          details: [],
          product: { id: 1 },
          user: { id: 1 },
        },
      ];

      // User.findByPk already mocked in beforeEach for auth
      db.Brief.findAll.mockResolvedValue(mockBriefs);

      const response = await request(app)
        .get('/briefs?productId=1')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(db.Brief.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ProductId: '1',
          }),
        })
      );
    });
  });

  describe('GET /briefs/:id', () => {
    it('should get brief by ID', async () => {
      const mockBrief = {
        id: 1,
        ProductId: 1,
        ProjectId: 1,
        details: [],
        comments: [],
        product: { id: 1 },
        user: { id: 1 },
      };

      // User.findByPk already mocked in beforeEach for auth
      db.Brief.findOne.mockResolvedValue(mockBrief);

      const response = await request(app)
        .get('/briefs/1')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
    });

    it('should return 404 when brief not found', async () => {
      // User.findByPk already mocked in beforeEach for auth
      db.Brief.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/briefs/999')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /briefs', () => {
    it('should generate brief successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        ProjectId: 1,
      };

      const mockBriefIdeas = [
        {
          platform: 'TikTok',
          tag: 'video',
          title: 'Idea 1',
          funnel: 'awareness',
          objectiveCampaign: 'Objective 1',
          decisionTrigger: 'Trigger 1',
          productValueHighlight: 'Value 1',
          communicationApproach: 'Approach 1',
          hookOpening: 'Hook 1',
          mainContentPoints: ['Point 1'],
          cta: 'BELI SEKARANG',
          breakdownDetail: 'Breakdown 1',
          visualIdentityNote: 'Visual 1',
        },
      ];

      const mockBrief = {
        id: 1,
        ProductId: 1,
        UserId: 1,
        ProjectId: 1,
        status: BRIEF_STATUS.DRAFT,
      };

      const mockBriefDetail = {
        id: 1,
        BriefId: 1,
      };

      const mockBriefWithDetails = {
        id: 1,
        details: [mockBriefDetail],
        product: mockProduct,
        user: { id: 1 },
      };

      // User.findByPk already mocked in beforeEach for auth
      db.Product.findOne.mockResolvedValue(mockProduct);
      AIService.generateBrief.mockResolvedValue(mockBriefIdeas);
      db.Brief.create.mockResolvedValue(mockBrief);
      db.BriefDetail.create.mockResolvedValue(mockBriefDetail);
      db.Brief.findByPk.mockResolvedValue(mockBriefWithDetails);

      const response = await request(app)
        .post('/briefs')
        .set('Authorization', 'Bearer valid_token')
        .send({
          ProductId: 1,
          funnelStage: 'awareness',
          briefType: 'Problem-Agitate-Solve',
          toneOfVoice: 'Friendly',
          count: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('details');
    });

    it('should return 404 when product not found', async () => {
      db.User.findOne.mockResolvedValue({
        id: 1,
        ProjectId: 1,
      });
      db.Product.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/briefs')
        .set('Authorization', 'Bearer valid_token')
        .send({
          ProductId: 999,
          funnelStage: 'awareness',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /briefs/:id/detail', () => {
    it('should generate detail successfully', async () => {
      const mockBrief = {
        id: 1,
        ProductId: 1,
        toneOfVoice: 'Friendly',
      };

      const mockBriefDetail = {
        id: 1,
        BriefId: 1,
        detail: {},
        brief: mockBrief,
        update: jest.fn().mockResolvedValue(undefined),
        reload: jest.fn().mockResolvedValue(undefined),
      };

      const mockProduct = {
        id: 1,
        name: 'Test Product',
      };

      const mockAIResult = {
        detail: {
          type: 'video',
          scenes: [
            {
              scene: 1,
              description: 'Scene 1',
              duration: 3,
            },
          ],
          visual: 'Visual description',
        },
        caption: 'Test caption',
        hashtags: ['#tag1'],
      };

      const mockUpdatedBrief = {
        id: 1,
        details: [mockBriefDetail],
        product: mockProduct,
      };

      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.findOne.mockResolvedValue(mockBriefDetail);
      db.Product.findByPk.mockResolvedValue(mockProduct);
      AIService.generateDetail.mockResolvedValue(mockAIResult);
      db.Brief.findOne.mockResolvedValue(mockUpdatedBrief);

      const response = await request(app)
        .post('/briefs/1/detail')
        .set('Authorization', 'Bearer valid_token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('brief');
    });

    it('should return 404 when briefDetail not found', async () => {
      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/briefs/999/detail')
        .set('Authorization', 'Bearer valid_token')
        .send({});

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /briefs/:id/detail', () => {
    it('should update brief detail successfully', async () => {
      const mockBriefDetail = {
        id: 1,
        BriefId: 1,
        update: jest.fn().mockResolvedValue(undefined),
      };

      const mockUpdatedBrief = {
        id: 1,
        details: [mockBriefDetail],
        product: { id: 1 },
        user: { id: 1 },
      };

      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.findOne.mockResolvedValue(mockBriefDetail);
      db.Brief.findOne.mockResolvedValue(mockUpdatedBrief);

      const response = await request(app)
        .put('/briefs/1/detail')
        .set('Authorization', 'Bearer valid_token')
        .send({
          platform: 'Instagram',
          title: 'Updated Title',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('brief');
      expect(response.body).toHaveProperty('briefDetail');
    });
  });

  describe('POST /briefs/:id/detail/submit', () => {
    it('should submit detail for approval as staff', async () => {
      jwt.verifyToken.mockReturnValue({
        id: 1,
        email: 'staff@example.com',
        role: 'staff',
        ProjectId: 1,
      });

      const mockBriefDetail = {
        id: 1,
        BriefId: 1,
        rejectionReason: null,
        update: jest.fn().mockResolvedValue(undefined),
        reload: jest.fn().mockResolvedValue(undefined),
      };

      const mockUpdatedBrief = {
        id: 1,
        details: [mockBriefDetail],
        product: { id: 1 },
        user: { id: 1 },
      };

      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.findOne.mockResolvedValue(mockBriefDetail);
      db.Brief.findOne.mockResolvedValue(mockUpdatedBrief);

      const response = await request(app)
        .post('/briefs/1/detail/submit')
        .set('Authorization', 'Bearer valid_token')
        .send({
          scheduledAt: '2025-12-25',
          scheduledTime: '14:30',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('brief');
    });

    it('should return 400 when validation fails', async () => {
      // User.findByPk already mocked in beforeEach for auth
      const response = await request(app)
        .post('/briefs/1/detail/submit')
        .set('Authorization', 'Bearer valid_token')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /briefs/:id/detail', () => {
    it('should delete brief detail successfully', async () => {
      const mockBriefDetail = {
        id: 1,
        BriefId: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      const mockUpdatedBrief = {
        id: 1,
        details: [],
        product: { id: 1 },
        user: { id: 1 },
      };

      // User.findByPk already mocked in beforeEach for auth
      db.BriefDetail.findOne.mockResolvedValue(mockBriefDetail);
      db.Brief.findOne.mockResolvedValue(mockUpdatedBrief);

      const response = await request(app)
        .delete('/briefs/1/detail')
        .set('Authorization', 'Bearer valid_token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('brief');
      expect(response.body.message).toBe('Brief detail deleted successfully');
    });
  });
});

