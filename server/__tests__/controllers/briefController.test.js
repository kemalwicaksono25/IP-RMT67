const BriefController = require('../../controllers/briefController');
const db = require('../../models');
const AIService = require('../../services/aiService');
const AppError = require('../../errors/AppError');
const { BRIEF_STATUS, BRIEF_DETAIL_STATUS } = require('../../helpers/enums');

// Mock dependencies
jest.mock('../../models');
jest.mock('../../services/aiService');

describe('BriefController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 1, ProjectId: 1, role: 'staff' },
      params: {},
      body: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('generateBrief', () => {
    it('should handle briefType as comma-separated string', async () => {
      const mockProduct = { id: 1, name: 'Test Product', ProjectId: 1 };
      const mockBriefIdeas = [{ platform: 'TikTok', tag: 'video' }];
      const mockBrief = { id: 1, ProductId: 1, UserId: 1, ProjectId: 1 };
      const mockBriefWithDetails = { id: 1, details: [], product: mockProduct, user: { id: 1 } };

      db.Product.findOne.mockResolvedValue(mockProduct);
      AIService.generateBrief.mockResolvedValue(mockBriefIdeas);
      db.Brief.create.mockResolvedValue(mockBrief);
      db.BriefDetail.create.mockResolvedValue({ id: 1 });
      db.Brief.findByPk.mockResolvedValue(mockBriefWithDetails);

      req.body = {
        ProductId: 1,
        funnelStage: 'awareness',
        briefType: 'Problem-Agitate-Solve,Storytelling', // Comma-separated
        count: 1,
      };

      await BriefController.generateBrief(req, res, next);

      expect(AIService.generateBrief).toHaveBeenCalledWith(
        mockProduct,
        ['awareness'],
        'Friendly',
        ['Problem-Agitate-Solve', 'Storytelling'], // Should be split
        expect.any(Number)
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle funnelStage as comma-separated string', async () => {
      const mockProduct = { id: 1, name: 'Test Product', ProjectId: 1 };
      const mockBriefIdeas = [{ platform: 'TikTok', tag: 'video' }];
      const mockBrief = { id: 1, ProductId: 1, UserId: 1, ProjectId: 1 };
      const mockBriefWithDetails = { id: 1, details: [], product: mockProduct, user: { id: 1 } };

      db.Product.findOne.mockResolvedValue(mockProduct);
      AIService.generateBrief.mockResolvedValue(mockBriefIdeas);
      db.Brief.create.mockResolvedValue(mockBrief);
      db.BriefDetail.create.mockResolvedValue({ id: 1 });
      db.Brief.findByPk.mockResolvedValue(mockBriefWithDetails);

      req.body = {
        ProductId: 1,
        funnelStage: 'awareness,consideration', // Comma-separated
        briefType: 'Problem-Agitate-Solve',
        count: 1,
      };

      await BriefController.generateBrief(req, res, next);

      expect(AIService.generateBrief).toHaveBeenCalledWith(
        mockProduct,
        ['awareness', 'consideration'], // Should be split
        'Friendly',
        ['Problem-Agitate-Solve'],
        expect.any(Number)
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('generateDetail', () => {
    it('should return 404 when product not found', async () => {
      const mockBriefDetail = {
        id: 1,
        ProjectId: 1,
        brief: { id: 1, ProductId: 999, toneOfVoice: 'Friendly' },
      };

      db.BriefDetail.findOne.mockResolvedValue(mockBriefDetail);
      db.Product.findByPk.mockResolvedValue(null);

      req.params.id = '1';

      await BriefController.generateDetail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Produk tidak ditemukan');
      expect(error.statusCode).toBe(404);
    });

    it('should handle AI service error', async () => {
      const mockBriefDetail = {
        id: 1,
        ProjectId: 1,
        brief: { id: 1, ProductId: 1, toneOfVoice: 'Friendly' },
      };
      const mockProduct = { id: 1, name: 'Test Product' };

      db.BriefDetail.findOne.mockResolvedValue(mockBriefDetail);
      db.Product.findByPk.mockResolvedValue(mockProduct);
      AIService.generateDetail.mockRejectedValue(new Error('AI service error'));

      req.params.id = '1';

      await BriefController.generateDetail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('AI service error');
      expect(error.statusCode).toBe(500);
    });


    it('should handle query error', async () => {
      const mockBriefDetail = {
        id: 1,
        ProjectId: 1,
        detail: {},
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue({ id: 1 }),
        brief: { id: 1, ProductId: 1, toneOfVoice: 'Friendly' },
      };
      const mockProduct = { id: 1, name: 'Test Product' };

      const aiResult = {
        caption: 'Test caption',
        hashtags: ['#test'],
        detail: {},
      };

      db.BriefDetail.findOne.mockResolvedValue(mockBriefDetail);
      db.Product.findByPk.mockResolvedValue(mockProduct);
      AIService.generateDetail.mockResolvedValue(aiResult);
      db.Brief.findOne.mockRejectedValue(new Error('Database error'));

      req.params.id = '1';

      await BriefController.generateDetail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getAll', () => {
    it('should handle database errors', async () => {
      db.Brief.findAll.mockRejectedValue(new Error('Database error'));

      await BriefController.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateDetail', () => {
    it('should return 404 when briefDetail not found', async () => {
      db.BriefDetail.findOne.mockResolvedValue(null);

      req.params.id = '999';
      req.body = { title: 'Updated Title' };

      await BriefController.updateDetail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Detail brief tidak ditemukan');
      expect(error.statusCode).toBe(404);
    });


    it('should handle database errors', async () => {
      db.BriefDetail.findOne.mockRejectedValue(new Error('Database error'));

      req.params.id = '1';
      req.body = { title: 'Updated Title' };

      await BriefController.updateDetail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('submitDetailForApproval', () => {
    it('should return 404 when briefDetail not found', async () => {
      db.BriefDetail.findOne.mockResolvedValue(null);

      req.params.id = '999';
      req.body = {
        scheduledAt: '2024-12-25',
        scheduledTime: '10:00',
      };

      await BriefController.submitDetailForApproval(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Detail brief tidak ditemukan');
      expect(error.statusCode).toBe(404);
    });


    it('should handle database errors', async () => {
      db.BriefDetail.findOne.mockRejectedValue(new Error('Database error'));

      req.params.id = '1';
      req.body = {
        scheduledAt: '2024-12-25',
        scheduledTime: '10:00',
      };

      await BriefController.submitDetailForApproval(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteDetail', () => {
    it('should return 404 when briefDetail not found', async () => {
      db.BriefDetail.findOne.mockResolvedValue(null);

      req.params.id = '999';

      await BriefController.deleteDetail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Detail brief tidak ditemukan');
      expect(error.statusCode).toBe(404);
    });

    it('should handle database errors', async () => {
      db.BriefDetail.findOne.mockRejectedValue(new Error('Database error'));

      req.params.id = '1';

      await BriefController.deleteDetail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

